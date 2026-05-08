'use client';
import { useEffect, useState } from 'react';
import { Landmark, Eye, Pencil, Check, X } from 'lucide-react';
import { appUserApi } from '@/lib/api';
import { useThemePalette } from '@/lib/theme';
import type { AppUser } from '@/lib/types';
import ConfirmDialog from '@/components/Shared/ConfirmDialog';
import ExportModal from '@/components/Shared/ExportModal';

export default function UserBankLinked() {
  const C = useThemePalette();
  const [rows, setRows] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [viewing, setViewing] = useState<AppUser | null>(null);
  const [confirmState, setConfirmState] = useState<{ show: boolean; row: AppUser | null }>({ show: false, row: null });
  const [showExport, setShowExport] = useState(false);

  const load = async () => {
    try {
      const res = await appUserApi.getAll({ limit: '500' });
      setRows(Array.isArray(res) ? res : (res as any).data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter(row => {
    const q = search.toLowerCase();
    return row.name.toLowerCase().includes(q) || row.phone.includes(q) || row.userCode.toLowerCase().includes(q);
  });

  const linkedCount = rows.filter(row => row.bankLinked).length;
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 13, outline: 'none', background: C.surface, color: C.text, boxSizing: 'border-box' };

  const saveEdit = async () => {
    if (!editing) return;
    await appUserApi.update(editing.id, {
      bankLinked: editing.bankLinked,
      upiId: editing.upiId ?? null,
      bankAccount: editing.bankAccount ?? null,
      ifsc: editing.ifsc ?? null,
      bankName: editing.bankName ?? null,
      accountHolderName: editing.accountHolderName ?? null,
      walletBalance: editing.walletBalance ?? 0,
      totalPoints: editing.totalPoints ?? 0,
    });
    setRows(prev => prev.map(row => row.id === editing.id ? editing : row));
    setEditing(null);
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400 }}>
      <ConfirmDialog show={confirmState.show} title={confirmState.row?.bankLinked ? 'Unlink Bank Account' : 'Link Bank Account'} message={`Are you sure you want to ${confirmState.row?.bankLinked ? 'unlink' : 'link'} this user bank account?`} onConfirm={async () => { if (confirmState.row) { const next = !confirmState.row.bankLinked; await appUserApi.update(confirmState.row.id, { bankLinked: next }); setRows(prev => prev.map(row => row.id === confirmState.row?.id ? { ...row, bankLinked: next } : row)); } setConfirmState({ show: false, row: null }); }} onCancel={() => setConfirmState({ show: false, row: null })} type={confirmState.row?.bankLinked ? 'danger' : 'success'} />
      <ExportModal show={showExport} onClose={() => setShowExport(false)} title="User Bank Details" fileName="user-bank" getData={() => filtered.map(row => ({ Name: row.name, Code: row.userCode, Phone: row.phone, BankLinked: row.bankLinked ? 'Yes' : 'No', UPI: row.upiId ?? '', BankAccount: row.bankAccount ?? '', IFSC: row.ifsc ?? '' }))} />
      <div style={{ background: 'linear-gradient(135deg,#0284C7,#0369A1)', borderRadius: 18, padding: '22px 28px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div><div style={{ fontSize: 22, fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: 10 }}><Landmark size={26} /> Bank Linked</div><div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>Manage customer bank account and UPI details</div></div>
        <div style={{ display: 'flex', gap: 10 }}>{[{ label: 'Total', value: rows.length }, { label: 'Linked', value: linkedCount }, { label: 'Not Linked', value: rows.length - linkedCount }].map(card => <div key={card.label} style={{ textAlign: 'center', padding: '10px 16px', background: 'rgba(255,255,255,0.12)', borderRadius: 12 }}><div style={{ fontSize: 20, fontWeight: 900, color: 'white' }}>{card.value}</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{card.label}</div></div>)}</div>
      </div>
      <div style={{ background: C.card, borderRadius: 14, padding: '12px 16px', border: `1px solid ${C.border}`, marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, phone, code..." style={{ ...inputStyle, flex: 1 }} /><button onClick={() => setShowExport(true)} style={{ background: C.red, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Export</button></div>
      <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>{loading ? <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>Loading...</div> : <table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>{['User', 'Code', 'Phone', 'Bank Status', 'UPI / Account', 'Actions'].map(head => <th key={head} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase' }}>{head}</th>)}</tr></thead><tbody>{filtered.length === 0 ? <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: C.muted }}>No results found</td></tr> : filtered.map(row => <tr key={row.id} style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: C.text }}>{row.name}</td><td style={{ padding: '14px 16px', fontSize: 12, color: C.muted, fontFamily: 'monospace' }}>{row.userCode}</td><td style={{ padding: '14px 16px', fontSize: 13, color: C.text }}>{row.phone}</td><td style={{ padding: '14px 16px' }}><button onClick={() => setConfirmState({ show: true, row })} style={{ background: row.bankLinked ? '#D1FAE5' : '#FEE2E2', color: row.bankLinked ? '#065F46' : '#991B1B', border: 'none', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>{row.bankLinked ? <><Check size={12} /> Linked</> : <><X size={12} /> Not Linked</>}</button></td><td style={{ padding: '14px 16px', fontSize: 12, color: C.text }}>{row.upiId ?? row.bankAccount ?? '—'}</td><td style={{ padding: '14px 16px' }}><div style={{ display: 'flex', gap: 6 }}><button onClick={() => setViewing(row)} style={{ background: '#EFF6FF', color: '#1D4ED8', border: 'none', borderRadius: 7, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={14} /></button><button onClick={() => setEditing({ ...row })} style={{ background: '#FFF7ED', color: '#C2410C', border: 'none', borderRadius: 7, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Pencil size={14} /></button></div></td></tr>)}</tbody></table>}</div>
      {viewing && <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 1000 }} onClick={() => setViewing(null)}><div style={{ background: C.card, borderRadius: 16, width: 520, maxWidth: '95vw', padding: 22 }} onClick={e => e.stopPropagation()}>{[['Name', viewing.name], ['Code', viewing.userCode], ['Phone', viewing.phone], ['Bank Linked', viewing.bankLinked ? 'Yes' : 'No'], ['UPI ID', viewing.upiId ?? '—'], ['Bank Account', viewing.bankAccount ?? '—'], ['IFSC', viewing.ifsc ?? '—'], ['Wallet Balance', `₹${(viewing.walletBalance ?? 0).toLocaleString('en-IN')}`]].map(([key, value]) => <div key={String(key)} style={{ background: C.bg, borderRadius: 10, padding: 12, fontSize: 13, marginBottom: 8 }}><strong>{key}:</strong> {value}</div>)}</div></div>}
      {editing && <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 1000 }} onClick={() => setEditing(null)}><div style={{ background: C.card, borderRadius: 16, width: 560, maxWidth: '95vw', padding: 22, display: 'grid', gap: 12 }} onClick={e => e.stopPropagation()}><div style={{ fontSize: 17, fontWeight: 800, color: C.text }}>Edit Bank Details - {editing.name}</div><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><input type="checkbox" checked={editing.bankLinked} onChange={e => setEditing(prev => prev ? { ...prev, bankLinked: e.target.checked } : prev)} /><span style={{ fontSize: 14, color: C.text }}>Bank linked</span></div><input value={editing.upiId ?? ''} onChange={e => setEditing(prev => prev ? { ...prev, upiId: e.target.value } : prev)} placeholder="UPI ID" style={inputStyle} /><input value={editing.bankName ?? ''} onChange={e => setEditing(prev => prev ? { ...prev, bankName: e.target.value } : prev)} placeholder="Bank name" style={inputStyle} /><input value={editing.bankAccount ?? ''} onChange={e => setEditing(prev => prev ? { ...prev, bankAccount: e.target.value } : prev)} placeholder="Bank account" style={inputStyle} /><input value={editing.ifsc ?? ''} onChange={e => setEditing(prev => prev ? { ...prev, ifsc: e.target.value } : prev)} placeholder="IFSC" style={inputStyle} /><input value={editing.accountHolderName ?? ''} onChange={e => setEditing(prev => prev ? { ...prev, accountHolderName: e.target.value } : prev)} placeholder="Account holder name" style={inputStyle} /><input type="number" value={editing.walletBalance ?? 0} onChange={e => setEditing(prev => prev ? { ...prev, walletBalance: Number(e.target.value) } : prev)} placeholder="Wallet balance" style={inputStyle} /><div style={{ display: 'flex', gap: 10 }}><button onClick={saveEdit} style={{ flex: 1, background: C.red, color: 'white', border: 'none', borderRadius: 10, padding: '11px 16px', cursor: 'pointer', fontWeight: 700 }}>Save</button><button onClick={() => setEditing(null)} style={{ flex: 1, background: C.bg, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, padding: '11px 16px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button></div></div></div>}
    </div>
  );
}
