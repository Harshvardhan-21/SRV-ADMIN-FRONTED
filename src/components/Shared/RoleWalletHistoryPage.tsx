'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Eye, Pencil, Wallet } from 'lucide-react';
import ExportModal from '@/components/Shared/ExportModal';
import { redemptionApi, walletApi } from '@/lib/api';
import { useThemePalette } from '@/lib/theme';

type SupportedRole = 'electrician' | 'dealer' | 'user' | 'counterboy';

type UserMeta = {
  userName: string;
  userPhone: string;
  userCode: string;
  bankLinked?: boolean;
  upiId?: string;
  bankAccount?: string;
  ifsc?: string;
  bankName?: string;
  accountHolderName?: string;
};

type RedemptionRecord = {
  id: string;
  userId: string;
  userName?: string;
  type: string;
  points?: number;
  amount?: number;
  status: string;
  rejectionReason?: string | null;
  requestedAt?: string;
  processedAt?: string;
  accountHolderName?: string | null;
  bankAccount?: string | null;
  ifsc?: string | null;
  upiId?: string | null;
};

type WalletTransaction = {
  id: string;
  userId: string;
  userRole: SupportedRole;
  type: string;
  source: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string | null;
  referenceId?: string | null;
  referenceType?: string | null;
  createdAt: string;
  userName?: string;
  userPhone?: string;
  userCode?: string;
  bankLinked?: boolean;
  upiId?: string;
  bankAccount?: string;
  ifsc?: string;
  bankName?: string;
  accountHolderName?: string;
  linkedRedemption?: RedemptionRecord;
};

type RoleWalletHistoryPageProps = {
  role: SupportedRole;
  title: string;
  subtitle: string;
  exportTitle: string;
  exportFileName: string;
  fetchUserMeta: (userId: string) => Promise<UserMeta>;
  showHeader?: boolean;
};

const WITHDRAWAL_TYPES = new Set([
  'bank_transfer',
  'dealer_bonus_bank_transfer',
  'bonus_withdrawal',
]);

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  approved: { bg: '#D1FAE5', color: '#065F46', label: 'Approved' },
  pending: { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
  rejected: { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' },
  refunded: { bg: '#EFF6FF', color: '#1D4ED8', label: 'Refunded' },
};

const FALLBACK_USER_META: UserMeta = {
  userName: 'N/A',
  userPhone: 'N/A',
  userCode: 'N/A',
};

function isWithdrawalRequest(row: WalletTransaction) {
  return (
    row.type === 'debit' &&
    row.source === 'redemption' &&
    row.referenceType === 'redemption' &&
    !!row.linkedRedemption &&
    WITHDRAWAL_TYPES.has(row.linkedRedemption.type)
  );
}

function getStatusConfig(row: WalletTransaction) {
  if (isWithdrawalRequest(row) && row.linkedRedemption) {
    return STATUS_STYLES[row.linkedRedemption.status] ?? STATUS_STYLES.pending;
  }

  if (row.source === 'refund') {
    return STATUS_STYLES.refunded;
  }

  return null;
}

export default function RoleWalletHistoryPage({
  role,
  title,
  subtitle,
  exportTitle,
  exportFileName,
  fetchUserMeta,
  showHeader = true,
}: RoleWalletHistoryPageProps) {
  const C = useThemePalette();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExport, setShowExport] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewItem, setViewItem] = useState<WalletTransaction | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [editState, setEditState] = useState<{ open: boolean; row: WalletTransaction | null }>({
    open: false,
    row: null,
  });
  const [editStatus, setEditStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [editReason, setEditReason] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [walletResponse, redemptionResponse] = await Promise.all([
        walletApi.getTransactions({ userRole: role, limit: '500' }),
        redemptionApi.getAll({ role, limit: '500' }),
      ]);

      const walletRows = Array.isArray(walletResponse)
        ? walletResponse
        : (walletResponse as { data?: WalletTransaction[] }).data ?? [];
      const redemptions = Array.isArray(redemptionResponse)
        ? redemptionResponse
        : (redemptionResponse as { data?: RedemptionRecord[] }).data ?? [];

      const redemptionMap = new Map(redemptions.map((item) => [item.id, item]));
      const uniqueUserIds = Array.from(
        new Set(
          walletRows
            .map((row) => String(row.userId ?? '').trim())
            .filter(Boolean),
        ),
      );

      const userEntries = await Promise.all(
        uniqueUserIds.map(async (userId) => {
          try {
            return [userId, await fetchUserMeta(userId)] as const;
          } catch {
            return [userId, FALLBACK_USER_META] as const;
          }
        }),
      );

      const userMap = new Map(userEntries);

      setTransactions(
        walletRows.map((row) => ({
          ...row,
          ...(userMap.get(String(row.userId ?? '').trim()) ?? FALLBACK_USER_META),
          linkedRedemption:
            row.referenceType === 'redemption' && row.referenceId
              ? redemptionMap.get(row.referenceId) ?? undefined
              : undefined,
        })),
      );
      setFeedback(null);
    } catch (error) {
      console.error(error);
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to load wallet history.',
      });
    } finally {
      setLoading(false);
    }
  }, [fetchUserMeta, role]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filtered = useMemo(
    () =>
      transactions.filter((row) => {
        const query = search.toLowerCase();
        const matchesSearch =
          (row.userId ?? '').toLowerCase().includes(query) ||
          (row.description ?? '').toLowerCase().includes(query) ||
          (row.userName ?? '').toLowerCase().includes(query) ||
          (row.userPhone ?? '').toLowerCase().includes(query) ||
          (row.userCode ?? '').toLowerCase().includes(query) ||
          (row.linkedRedemption?.rejectionReason ?? '').toLowerCase().includes(query);
        const matchesType = filterType === 'all' || row.type === filterType;
        return matchesSearch && matchesType;
      }),
    [filterType, search, transactions],
  );

  const totalCredits = transactions
    .filter((row) => row.type === 'credit')
    .reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
  const totalDebits = transactions
    .filter((row) => row.type === 'debit')
    .reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

  const openEditModal = (row: WalletTransaction) => {
    setEditState({ open: true, row });
    setEditStatus((row.linkedRedemption?.status as 'pending' | 'approved' | 'rejected') ?? 'pending');
    setEditReason(row.linkedRedemption?.rejectionReason ?? '');
  };

  const closeEditModal = () => {
    setEditState({ open: false, row: null });
    setEditStatus('pending');
    setEditReason('');
  };

  const handleSaveEdit = async () => {
    if (!editState.row?.linkedRedemption) return;
    const reason = editReason.trim();

    if (editStatus === 'rejected' && !reason) {
      setFeedback({ type: 'error', message: 'Reject karne ke liye reason dena zaroori hai.' });
      return;
    }

    setSubmittingId(editState.row.id);
    try {
      await redemptionApi.updateStatus(
        editState.row.linkedRedemption.id,
        editStatus,
        editStatus === 'rejected' ? reason : undefined,
      );
      closeEditModal();
      setFeedback({
        type: 'success',
        message:
          editStatus === 'rejected'
            ? 'Withdrawal reject ho gaya aur points wallet me refund ho gaye.'
            : editStatus === 'approved'
              ? 'Withdrawal request approve ho gayi.'
              : 'Withdrawal request pending me move ho gayi.',
      });
      await loadData();
    } catch (error) {
      console.error(error);
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update withdrawal request.',
      });
    } finally {
      setSubmittingId(null);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    border: `1.5px solid ${C.border}`,
    borderRadius: 8,
    fontSize: 13.5,
    outline: 'none',
    background: C.surface,
    color: C.text,
    boxSizing: 'border-box',
  };

  return (
    <div style={{ padding: showHeader ? '28px 32px' : 0, maxWidth: 1400 }}>
      {showHeader && (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wallet size={24} style={{ color: C.red }} /> {title}
            </h1>
            <p style={{ color: C.muted, fontSize: 14 }}>{subtitle}</p>
          </div>
          <button
            onClick={() => setShowExport(true)}
            style={{ background: C.red, color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Export
          </button>
        </div>
      )}

      <ExportModal
        show={showExport}
        onClose={() => setShowExport(false)}
        title={exportTitle}
        fileName={exportFileName}
        getData={() =>
          transactions.map((row) => ({
            Name: row.userName,
            Phone: row.userPhone,
            Code: row.userCode,
            UserId: row.userId,
            Type: row.type,
            Source: row.source,
            Description: row.description,
            Status: getStatusConfig(row)?.label ?? '',
            RejectionReason: row.linkedRedemption?.rejectionReason ?? '',
            BankLinked: row.bankLinked ? 'Yes' : 'No',
            AccountHolder: row.accountHolderName || row.linkedRedemption?.accountHolderName || '',
            BankAccount: row.bankAccount || row.linkedRedemption?.bankAccount || '',
            IFSC: row.ifsc || row.linkedRedemption?.ifsc || '',
            UPI: row.upiId || row.linkedRedemption?.upiId || '',
            Amount: row.amount,
            BalanceBefore: row.balanceBefore,
            BalanceAfter: row.balanceAfter,
            Date: row.createdAt,
          }))
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Total Credits', value: totalCredits, color: '#065F46', bg: '#D1FAE5', Icon: ArrowDownLeft },
          { label: 'Total Debits', value: totalDebits, color: '#991B1B', bg: '#FEE2E2', Icon: ArrowUpRight },
          { label: 'Net Balance', value: totalCredits - totalDebits, color: '#1D4ED8', bg: '#EFF6FF', Icon: Wallet },
        ].map((card) => (
          <div key={card.label} style={{ background: C.card, borderRadius: 14, padding: '16px 18px', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
              <card.Icon size={20} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>₹{card.value.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: 12, color: card.color, fontWeight: 700 }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {feedback && (
        <div
          style={{
            background: feedback.type === 'error' ? C.dangerBg : '#D1FAE5',
            border: `1px solid ${feedback.type === 'error' ? C.dangerBorder : '#A7F3D0'}`,
            color: feedback.type === 'error' ? C.dangerText : '#065F46',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 16,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {feedback.message}
        </div>
      )}

      <div style={{ background: C.card, borderRadius: 14, padding: '14px 18px', border: `1px solid ${C.border}`, marginBottom: 18, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, phone, code, user ID, reason..."
          style={{ ...inputStyle, flex: 1, minWidth: 220 }}
        />
        <select value={filterType} onChange={(event) => setFilterType(event.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="all">All Types</option>
          <option value="credit">Credit</option>
          <option value="debit">Debit</option>
        </select>
        {!showHeader && (
          <button
            onClick={() => setShowExport(true)}
            style={{ background: C.red, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Export
          </button>
        )}
        <span style={{ fontSize: 13, color: C.muted, marginLeft: 'auto' }}>{filtered.length} results</span>
      </div>

      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: C.muted }}>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                {['Name', 'Phone', 'Code', 'Type', 'Source', 'Description', 'Status', 'Amount', 'Balance After', 'Date', 'Action'].map((header) => (
                  <th key={header} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase' }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: '40px', textAlign: 'center', color: C.muted }}>
                    No transactions found
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const statusConfig = getStatusConfig(row);
                  const withdrawalRequest = isWithdrawalRequest(row);

                  return (
                    <tr
                      key={row.id}
                      style={{ borderBottom: `1px solid ${C.border}` }}
                      onMouseEnter={(event) => ((event.currentTarget as HTMLTableRowElement).style.background = C.hoverRow)}
                      onMouseLeave={(event) => ((event.currentTarget as HTMLTableRowElement).style.background = 'transparent')}
                    >
                      <td style={{ padding: '13px 16px', fontSize: 13, color: C.text, fontWeight: 600 }}>{row.userName || 'N/A'}</td>
                      <td style={{ padding: '13px 16px', fontSize: 12, color: C.muted, fontFamily: 'monospace' }}>{row.userPhone || 'N/A'}</td>
                      <td style={{ padding: '13px 16px', fontSize: 12, color: C.muted, fontWeight: 600 }}>{row.userCode || 'N/A'}</td>
                      <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                        <span style={{ background: row.type === 'credit' ? '#D1FAE5' : '#FEE2E2', color: row.type === 'credit' ? '#065F46' : '#991B1B', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {row.type === 'credit' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                          {row.type === 'credit' ? 'Credit' : 'Debit'}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 12, color: C.muted }}>{row.source}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: C.text, maxWidth: 280 }}>
                        <div>{row.description || '—'}</div>
                        {row.linkedRedemption?.rejectionReason && (
                          <div style={{ fontSize: 11, color: '#991B1B', marginTop: 4, fontWeight: 600 }}>
                            Reason: {row.linkedRedemption.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        {statusConfig ? (
                          <span style={{ background: statusConfig.bg, color: statusConfig.color, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>
                            {statusConfig.label}
                          </span>
                        ) : (
                          <span style={{ color: C.muted, fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '13px 16px', textAlign: 'right', fontSize: 14, fontWeight: 800, color: row.type === 'credit' ? '#10B981' : '#EF4444' }}>
                        {row.type === 'credit' ? '+' : '-'}₹{Number(row.amount ?? 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '13px 16px', textAlign: 'right', fontSize: 14, fontWeight: 700, color: C.text }}>
                        ₹{Number(row.balanceAfter ?? 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 12, color: C.muted }}>
                        {new Date(row.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {withdrawalRequest && (
                            <button
                              onClick={() => openEditModal(row)}
                              disabled={submittingId === row.id}
                              style={{ background: '#EFF6FF', color: '#1D4ED8', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 700, cursor: submittingId === row.id ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            >
                              <Pencil size={13} /> Edit
                            </button>
                          )}
                          <button
                            onClick={() => setViewItem(row)}
                            style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 10px', cursor: 'pointer', color: C.muted, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                          >
                            <Eye size={13} /> View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {viewItem && (
        <div style={{ position: 'fixed', inset: 0, background: C.overlay, backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setViewItem(null)}>
          <div style={{ background: C.card, borderRadius: 18, width: 'min(960px, 96vw)', maxHeight: '88vh', boxShadow: '0 25px 70px rgba(0,0,0,0.2)', border: `1px solid ${C.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={(event) => event.stopPropagation()}>
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Transaction Details</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Compact view with user, wallet and payment details.</div>
              </div>
              <button onClick={() => setViewItem(null)} style={{ background: C.bg, border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', color: C.muted, fontSize: 15 }}>
                ×
              </button>
            </div>
            <div style={{ padding: 22, overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                <div style={{ background: C.bg, borderRadius: 14, padding: 16, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: 'uppercase', marginBottom: 12 }}>User Info</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {[
                      ['Name', viewItem.userName || 'N/A'],
                      ['Phone', viewItem.userPhone || 'N/A'],
                      ['Code', viewItem.userCode || 'N/A'],
                      ['Date', new Date(viewItem.createdAt).toLocaleDateString('en-IN')],
                    ].map(([label, value]) => (
                      <div key={label} style={{ background: C.card, borderRadius: 10, padding: '10px 12px', fontSize: 13, color: C.text }}>
                        <span style={{ color: C.muted, fontWeight: 700 }}>{label}: </span>
                        {value}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: C.bg, borderRadius: 14, padding: 16, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: 'uppercase', marginBottom: 12 }}>Transaction Summary</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {[
                      ['Type', viewItem.type],
                      ['Source', viewItem.source],
                      ['Status', getStatusConfig(viewItem)?.label ?? '—'],
                      ['Amount', `₹${Number(viewItem.amount ?? 0).toLocaleString('en-IN')}`],
                      ['Balance Before', `₹${Number(viewItem.balanceBefore ?? 0).toLocaleString('en-IN')}`],
                      ['Balance After', `₹${Number(viewItem.balanceAfter ?? 0).toLocaleString('en-IN')}`],
                    ].map(([label, value]) => (
                      <div key={label} style={{ background: C.card, borderRadius: 10, padding: '10px 12px', fontSize: 13, color: C.text }}>
                        <span style={{ color: C.muted, fontWeight: 700 }}>{label}: </span>
                        {value}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: C.bg, borderRadius: 14, padding: 16, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: 'uppercase', marginBottom: 12 }}>Payment Details</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {[
                      ['Bank Linked', viewItem.bankLinked ? 'Yes' : 'No'],
                      ['Account Holder', viewItem.accountHolderName || viewItem.linkedRedemption?.accountHolderName || '—'],
                      ['Bank Account', viewItem.bankAccount || viewItem.linkedRedemption?.bankAccount || '—'],
                      ['IFSC', viewItem.ifsc || viewItem.linkedRedemption?.ifsc || '—'],
                      ['UPI ID', viewItem.upiId || viewItem.linkedRedemption?.upiId || '—'],
                    ].map(([label, value]) => (
                      <div key={label} style={{ background: C.card, borderRadius: 10, padding: '10px 12px', fontSize: 13, color: C.text, wordBreak: 'break-word' }}>
                        <span style={{ color: C.muted, fontWeight: 700 }}>{label}: </span>
                        {value}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: C.bg, borderRadius: 14, padding: 16, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: 'uppercase', marginBottom: 12 }}>Admin Notes</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div style={{ background: C.card, borderRadius: 10, padding: '10px 12px', fontSize: 13, color: C.text, minHeight: 72, wordBreak: 'break-word' }}>
                      <div style={{ color: C.muted, fontWeight: 700, marginBottom: 6 }}>Description</div>
                      {viewItem.description || '—'}
                    </div>
                    <div style={{ background: C.card, borderRadius: 10, padding: '10px 12px', fontSize: 13, color: C.text, minHeight: 72, wordBreak: 'break-word' }}>
                      <div style={{ color: C.muted, fontWeight: 700, marginBottom: 6 }}>Rejection Reason</div>
                      {viewItem.linkedRedemption?.rejectionReason || '—'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editState.open && (
        <div style={{ position: 'fixed', inset: 0, background: C.overlay, backdropFilter: 'blur(6px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={closeEditModal}>
          <div style={{ background: C.card, borderRadius: 16, width: 520, maxWidth: '95vw', boxShadow: '0 25px 70px rgba(0,0,0,0.2)', border: `1px solid ${C.border}` }} onClick={(event) => event.stopPropagation()}>
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Edit Withdrawal Status</div>
              <button onClick={closeEditModal} style={{ background: C.bg, border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', color: C.muted, fontSize: 15 }}>
                ×
              </button>
            </div>
            <div style={{ padding: 22 }}>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
                Status baad me bhi change kar sakte ho. Agar rejected se approved ya pending par le jaoge to refunded points dobara hold honge. Agar approved ya pending se rejected karoge to points wallet me refund honge.
              </div>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Status
              </label>
              <select
                value={editStatus}
                onChange={(event) => setEditStatus(event.target.value as 'pending' | 'approved' | 'rejected')}
                style={{ ...inputStyle, marginBottom: 14 }}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Rejection Reason
              </label>
              <textarea
                value={editReason}
                onChange={(event) => setEditReason(event.target.value)}
                placeholder="Reason for rejection or admin note"
                style={{ ...inputStyle, minHeight: 110, resize: 'vertical' }}
              />
            </div>
            <div style={{ padding: '0 22px 22px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={closeEditModal} style={{ background: C.surface, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => void handleSaveEdit()} disabled={submittingId === editState.row?.id} style={{ background: C.red, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: submittingId === editState.row?.id ? 'wait' : 'pointer' }}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
