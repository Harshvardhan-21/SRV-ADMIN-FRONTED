'use client';
import { useEffect, useState } from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { walletApi } from '@/lib/api';
import { useThemePalette } from '@/lib/theme';
import ExportModal from '@/components/Shared/ExportModal';

export default function UserWallet() {
  const C = useThemePalette();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await walletApi.getTransactions({ userRole: 'user', limit: '500' });
        const txns = Array.isArray(res) ? res : (res as any).data ?? [];
        
        // Fetch user details for each transaction
        const enrichedTxns = await Promise.all(
          txns.map(async (t: any) => {
            try {
              const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${t.userId}`);
              if (userRes.ok) {
                const userData = await userRes.json();
                return {
                  ...t,
                  userName: userData.name || userData.fullName || 'N/A',
                  userPhone: userData.phone || userData.mobile || 'N/A',
                  userCode: userData.userCode || userData.code || 'N/A'
                };
              }
            } catch (err) {
              console.error('Error fetching user:', err);
            }
            return { ...t, userName: 'N/A', userPhone: 'N/A', userCode: 'N/A' };
          })
        );
        
        setRows(enrichedTxns);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filtered = rows.filter(row => {
    const matchSearch = 
      (row.userId ?? '').toLowerCase().includes(search.toLowerCase()) || 
      (row.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (row.userName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (row.userPhone ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (row.userCode ?? '').toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || row.type === filterType;
    return matchSearch && matchType;
  });
  const credits = rows.filter(row => row.type === 'credit').reduce((sum, row) => sum + Number(row.amount), 0);
  const debits = rows.filter(row => row.type === 'debit').reduce((sum, row) => sum + Number(row.amount), 0);
  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: 'none', background: C.surface, color: C.text, boxSizing: 'border-box' };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400 }}>
      <ExportModal show={showExport} onClose={() => setShowExport(false)} title="User Wallet" fileName="user-wallet" getData={() => rows.map(row => ({ Name: row.userName, Phone: row.userPhone, Code: row.userCode, UserId: row.userId, Type: row.type, Source: row.source, Description: row.description, Amount: row.amount, BalanceAfter: row.balanceAfter, Date: row.createdAt }))} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div><h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><Wallet size={24} style={{ color: C.red }} /> Wallet History</h1><p style={{ color: C.muted, fontSize: 14 }}>Track customer wallet transactions</p></div>
        <button onClick={() => setShowExport(true)} style={{ background: C.red, color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Export</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 22 }}>
        {[{ label: 'Total Credits', value: credits, color: '#065F46', bg: '#D1FAE5', Icon: ArrowDownLeft }, { label: 'Total Debits', value: debits, color: '#991B1B', bg: '#FEE2E2', Icon: ArrowUpRight }, { label: 'Net Balance', value: credits - debits, color: '#1D4ED8', bg: '#EFF6FF', Icon: Wallet }].map(card => <div key={card.label} style={{ background: C.card, borderRadius: 14, padding: '16px 18px', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 42, height: 42, borderRadius: 12, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}><card.Icon size={20} /></div><div><div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>₹{card.value.toLocaleString('en-IN')}</div><div style={{ fontSize: 12, color: card.color, fontWeight: 700 }}>{card.label}</div></div></div>)}
      </div>
      <div style={{ background: C.card, borderRadius: 14, padding: '14px 18px', border: `1px solid ${C.border}`, marginBottom: 18, display: 'flex', gap: 12, alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, code, user ID..." style={{ ...inputStyle, flex: 1 }} />
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...inputStyle, width: 'auto' }}><option value="all">All Types</option><option value="credit">Credit</option><option value="debit">Debit</option></select>
      </div>
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>Loading...</div> : <table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>{['Name', 'Phone', 'Code', 'Type', 'Source', 'Description', 'Amount', 'Balance After', 'Date'].map(head => <th key={head} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase' }}>{head}</th>)}</tr></thead><tbody>{filtered.length === 0 ? <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: C.muted }}>No transactions found</td></tr> : filtered.map(row => <tr key={row.id} style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '13px 16px', fontSize: 13, color: C.text, fontWeight: 600 }}>{row.userName || 'N/A'}</td><td style={{ padding: '13px 16px', fontSize: 12, color: C.muted, fontFamily: 'monospace' }}>{row.userPhone || 'N/A'}</td><td style={{ padding: '13px 16px', fontSize: 12, color: C.muted, fontWeight: 600 }}>{row.userCode || 'N/A'}</td><td style={{ padding: '13px 16px' }}><span style={{ background: row.type === 'credit' ? '#D1FAE5' : '#FEE2E2', color: row.type === 'credit' ? '#065F46' : '#991B1B', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>{row.type}</span></td><td style={{ padding: '13px 16px', fontSize: 12, color: C.muted }}>{row.source}</td><td style={{ padding: '13px 16px', fontSize: 12, color: C.muted }}>{row.description || '—'}</td><td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 800, color: row.type === 'credit' ? '#10B981' : '#EF4444' }}>{row.type === 'credit' ? '+' : '-'}₹{Number(row.amount).toLocaleString('en-IN')}</td><td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: C.text }}>₹{Number(row.balanceAfter).toLocaleString('en-IN')}</td><td style={{ padding: '13px 16px', fontSize: 12, color: C.muted }}>{new Date(row.createdAt).toLocaleDateString('en-IN')}</td></tr>)}</tbody></table>}
      </div>
    </div>
  );
}
