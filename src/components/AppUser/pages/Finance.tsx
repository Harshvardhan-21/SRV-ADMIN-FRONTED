'use client';
import { useEffect, useState } from 'react';
import { CreditCard, Wallet, Banknote } from 'lucide-react';
import { walletApi, redemptionApi } from '@/lib/api';
import { useThemePalette } from '@/lib/theme';
import ExportModal from '@/components/Shared/ExportModal';

type Tab = 'wallet' | 'redemptions';

function WalletTab() {
  const C = useThemePalette();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExport, setShowExport] = useState(false);
  useEffect(() => {
    walletApi.getTransactions({ userRole: 'user', limit: '500' }).then(res => setRows(Array.isArray(res) ? res : (res as any).data ?? [])).catch(console.error).finally(() => setLoading(false));
  }, []);
  return (
    <>
      <ExportModal show={showExport} onClose={() => setShowExport(false)} title="User Wallet" fileName="user-finance-wallet" getData={() => rows.map(row => ({ UserId: row.userId, Type: row.type, Source: row.source, Amount: row.amount, BalanceAfter: row.balanceAfter, Date: row.createdAt }))} />
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}><button onClick={() => setShowExport(true)} style={{ background: C.red, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Export</button></div>
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>{loading ? <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>Loading...</div> : <table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>{['User ID', 'Type', 'Source', 'Amount', 'Balance After', 'Date'].map(head => <th key={head} style={{ padding: '13px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase' }}>{head}</th>)}</tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: C.muted }}>No wallet transactions found</td></tr> : rows.map(row => <tr key={row.id} style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '12px 16px', fontSize: 12, color: C.muted, fontFamily: 'monospace' }}>{row.userId?.slice(0, 8)}…</td><td style={{ padding: '12px 16px', fontSize: 12, color: C.text }}>{row.type}</td><td style={{ padding: '12px 16px', fontSize: 12, color: C.muted }}>{row.source}</td><td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 800, color: C.text }}>₹{Number(row.amount).toLocaleString('en-IN')}</td><td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: C.text }}>₹{Number(row.balanceAfter).toLocaleString('en-IN')}</td><td style={{ padding: '12px 16px', fontSize: 12, color: C.muted }}>{new Date(row.createdAt).toLocaleDateString('en-IN')}</td></tr>)}</tbody></table>}</div>
    </>
  );
}

function RedemptionTab() {
  const C = useThemePalette();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExport, setShowExport] = useState(false);
  useEffect(() => {
    redemptionApi.getAll({ role: 'user', limit: '500' }).then(res => setRows(Array.isArray(res) ? res : (res as any).data ?? [])).catch(console.error).finally(() => setLoading(false));
  }, []);
  return (
    <>
      <ExportModal show={showExport} onClose={() => setShowExport(false)} title="User Redemptions" fileName="user-redemptions" getData={() => rows.map(row => ({ UserId: row.userId, UserName: row.userName, Type: row.type, Amount: row.amount, Status: row.status, Date: row.requestedAt }))} />
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}><button onClick={() => setShowExport(true)} style={{ background: C.red, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Export</button></div>
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>{loading ? <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>Loading...</div> : <table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>{['User', 'Type', 'Amount', 'Status', 'Date'].map(head => <th key={head} style={{ padding: '13px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase' }}>{head}</th>)}</tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: C.muted }}>No redemptions found</td></tr> : rows.map(row => <tr key={row.id} style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: C.text }}>{row.userName || row.userId?.slice(0, 8)}</td><td style={{ padding: '12px 16px', fontSize: 12, color: C.muted }}>{row.type}</td><td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 800, color: C.text }}>₹{Number(row.amount ?? 0).toLocaleString('en-IN')}</td><td style={{ padding: '12px 16px', fontSize: 12, color: C.muted }}>{row.status}</td><td style={{ padding: '12px 16px', fontSize: 12, color: C.muted }}>{new Date(row.requestedAt).toLocaleDateString('en-IN')}</td></tr>)}</tbody></table>}</div>
    </>
  );
}

export default function UserFinance() {
  const C = useThemePalette();
  const [tab, setTab] = useState<Tab>('wallet');
  const btn = (id: Tab): React.CSSProperties => ({ padding: '7px 20px', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: tab === id ? 'none' : `1px solid ${C.border}`, background: tab === id ? C.red : C.surface, color: tab === id ? '#fff' : C.muted });
  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400 }}>
      <div style={{ background: 'linear-gradient(135deg,#064E3B,#065F46)', borderRadius: 16, padding: '22px 28px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CreditCard size={26} color="#fff" /></div>
        <div><h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0 }}>Finance</h1><p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>Wallet history and redemption requests</p></div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}><button style={btn('wallet')} onClick={() => setTab('wallet')}><Wallet size={15} /> Wallet</button><button style={btn('redemptions')} onClick={() => setTab('redemptions')}><Banknote size={15} /> Redemptions</button></div>
      {tab === 'wallet' ? <WalletTab /> : <RedemptionTab />}
    </div>
  );
}
