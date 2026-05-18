'use client';
import { useEffect, useState } from 'react';
import { FileCheck, Eye, Check, X, Pencil } from 'lucide-react';
import { appUserApi } from '@/lib/api';
import { useThemePalette } from '@/lib/theme';
import type { AppUser } from '@/lib/types';
import ConfirmDialog from '@/components/Shared/ConfirmDialog';
import ExportModal from '@/components/Shared/ExportModal';

export default function UserKYC() {
  const C = useThemePalette();
  const [rows, setRows] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState<AppUser | null>(null);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [confirmState, setConfirmState] = useState<{ show: boolean; title: string; message: string; type: 'success' | 'danger'; onConfirm: () => void }>({ show: false, title: '', message: '', type: 'success', onConfirm: () => {} });

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
    return (row.name.toLowerCase().includes(q) || row.userCode.toLowerCase().includes(q)) && (filterStatus === 'all' || row.kycStatus === filterStatus);
  });

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await appUserApi.update(editing.id, {
        aadharNumber: editing.aadharNumber ?? null,
        panNumber: editing.panNumber ?? null,
        aadharDocument: editing.aadharDocument ?? null,
        panDocument: editing.panDocument ?? null,
        kycStatus: editing.kycStatus,
        kycRejectionReason: editing.kycRejectionReason ?? null,
      });
      setRows(prev => prev.map(row => row.id === editing.id ? editing : row));
      setEditing(null);
    } catch (err) {
      console.error('Failed to save KYC:', err);
    }
  };

  const updateStatus = (row: AppUser, status: string) => {
    setConfirmState({
      show: true,
      title: status === 'verified' ? 'Verify KYC' : 'Reject KYC',
      message: `${status === 'verified' ? 'Verify' : 'Reject'} KYC for ${row.name}?`,
      type: status === 'verified' ? 'success' : 'danger',
      onConfirm: async () => {
        try {
          await appUserApi.update(row.id, { kycStatus: status });
          setRows(prev => prev.map(item => item.id === row.id ? { ...item, kycStatus: status } : item));
        } catch (err) {
          console.error('Failed to update KYC status:', err);
        }
        setConfirmState(prev => ({ ...prev, show: false }));
      },
    });
  };

  const statusMap: Record<string, { bg: string; color: string; label: string }> = {
    verified: { bg: '#D1FAE5', color: '#065F46', label: 'Verified' },
    pending: { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
    rejected: { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' },
    not_submitted: { bg: '#F1F5F9', color: '#475569', label: 'Not Submitted' },
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: 'none', background: C.surface, color: C.text, boxSizing: 'border-box' };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400 }}>
      <ConfirmDialog show={confirmState.show} title={confirmState.title} message={confirmState.message} onConfirm={confirmState.onConfirm} onCancel={() => setConfirmState(prev => ({ ...prev, show: false }))} type={confirmState.type} />
      <ExportModal show={showExport} onClose={() => setShowExport(false)} title="User KYC" fileName="user-kyc" getData={() => rows.map(row => ({ Name: row.name, Code: row.userCode, KYCStatus: row.kycStatus, Aadhar: row.aadharNumber ?? '', PAN: row.panNumber ?? '' }))} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><FileCheck size={24} style={{ color: C.red }} /> KYC Management</h1>
          <p style={{ color: C.muted, fontSize: 14 }}>Verify and manage customer KYC documents</p>
        </div>
        <button onClick={() => setShowExport(true)} style={{ background: C.red, color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Export</button>
      </div>
      <div style={{ background: C.card, borderRadius: 14, padding: '14px 18px', border: `1px solid ${C.border}`, marginBottom: 18, display: 'flex', gap: 12, alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search user..." style={{ ...inputStyle, flex: 1 }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="all">All Status</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="not_submitted">Not Submitted</option>
        </select>
      </div>
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>Loading...</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>{['User', 'Code', 'Aadhar', 'PAN', 'Status', 'Actions'].map(head => <th key={head} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase' }}>{head}</th>)}</tr></thead>
            <tbody>{filtered.length === 0 ? <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: C.muted }}>No users found</td></tr> : filtered.map(row => { const status = statusMap[row.kycStatus] ?? statusMap.not_submitted; return <tr key={row.id} style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 700, color: C.text }}>{row.name}</td><td style={{ padding: '13px 16px', fontSize: 12, color: C.muted, fontFamily: 'monospace' }}>{row.userCode}</td><td style={{ padding: '13px 16px', fontSize: 12, color: C.muted }}>{row.aadharNumber ?? '—'}</td><td style={{ padding: '13px 16px', fontSize: 12, color: C.muted }}>{row.panNumber ?? '—'}</td><td style={{ padding: '13px 16px' }}><span style={{ background: status.bg, color: status.color, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>{status.label}</span></td><td style={{ padding: '13px 16px' }}><div style={{ display: 'flex', gap: 6 }}><button onClick={() => setSelected(row)} style={{ background: '#EFF6FF', color: '#1D4ED8', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer' }}><Eye size={13} /></button><button onClick={() => setEditing({ ...row })} style={{ background: '#FFF7ED', color: '#C2410C', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer' }}><Pencil size={13} /></button>{row.kycStatus === 'pending' && <><button onClick={() => updateStatus(row, 'verified')} style={{ background: '#D1FAE5', color: '#065F46', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer' }}><Check size={13} /></button><button onClick={() => updateStatus(row, 'rejected')} style={{ background: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer' }}><X size={13} /></button></>}</div></td></tr>; })}</tbody>
          </table>
        )}
      </div>
      {selected && <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 1000 }} onClick={() => setSelected(null)}><div style={{ background: C.card, borderRadius: 16, width: 520, maxWidth: '95vw', padding: 22 }} onClick={e => e.stopPropagation()}>{[['Code', selected.userCode], ['Status', selected.kycStatus], ['Aadhar', selected.aadharNumber ?? '—'], ['PAN', selected.panNumber ?? '—'], ['Rejection Reason', selected.kycRejectionReason ?? '—']].map(([key, value]) => <div key={String(key)} style={{ background: C.bg, borderRadius: 10, padding: 12, fontSize: 13, marginBottom: 8 }}><strong>{key}:</strong> {value}</div>)}</div></div>}
      {editing && <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 1000 }} onClick={() => setEditing(null)}><div style={{ background: C.card, borderRadius: 16, width: 520, maxWidth: '95vw', padding: 22, display: 'grid', gap: 12 }} onClick={e => e.stopPropagation()}><div style={{ fontSize: 17, fontWeight: 800, color: C.text }}>Edit KYC - {editing.name}</div><input value={editing.aadharNumber ?? ''} onChange={e => setEditing(prev => prev ? { ...prev, aadharNumber: e.target.value } : prev)} placeholder="Aadhar number" style={inputStyle} /><input value={editing.panNumber ?? ''} onChange={e => setEditing(prev => prev ? { ...prev, panNumber: e.target.value.toUpperCase() } : prev)} placeholder="PAN number" style={inputStyle} /><select value={editing.kycStatus} onChange={e => setEditing(prev => prev ? { ...prev, kycStatus: e.target.value } : prev)} style={inputStyle}><option value="not_submitted">Not Submitted</option><option value="pending">Pending</option><option value="verified">Verified</option><option value="rejected">Rejected</option></select><input value={editing.kycRejectionReason ?? ''} onChange={e => setEditing(prev => prev ? { ...prev, kycRejectionReason: e.target.value } : prev)} placeholder="Rejection reason" style={inputStyle} /><div style={{ display: 'flex', gap: 10 }}><button onClick={saveEdit} style={{ flex: 1, background: C.red, color: 'white', border: 'none', borderRadius: 10, padding: '11px 16px', cursor: 'pointer', fontWeight: 700 }}>Save</button><button onClick={() => setEditing(null)} style={{ flex: 1, background: C.bg, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, padding: '11px 16px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button></div></div></div>}
    </div>
  );
}
