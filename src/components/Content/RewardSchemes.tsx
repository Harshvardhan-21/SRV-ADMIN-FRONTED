'use client';

import { useEffect, useState } from 'react';
import { Gift, Pencil, Plus, Trash2 } from 'lucide-react';
import { rewardSchemeApi } from '@/lib/api';
import { useThemePalette } from '@/lib/theme';

const EMPTY_FORM = {
  name: '',
  description: '',
  pointsCost: 0,
  category: '',
  storeCategory: '',
  imageUrl: '',
  mrp: '',
  targetRole: '',
  sortOrder: 0,
  active: true,
};

export default function RewardSchemes() {
  const C = useThemePalette();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);

  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.inputBg, color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, display: 'block', textTransform: 'uppercase' };

  const loadRows = async () => {
    try {
      setLoading(true);
      setRows(await rewardSchemeApi.getAll());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRows(); }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const save = async () => {
    if (!form.name.trim() || !form.category.trim()) return;
    const payload = {
      ...form,
      pointsCost: Number(form.pointsCost || 0),
      sortOrder: Number(form.sortOrder || 0),
      mrp: form.mrp === '' ? null : Number(form.mrp),
      targetRole: form.targetRole || null,
      storeCategory: form.storeCategory || null,
      imageUrl: form.imageUrl || null,
    };
    if (editingId) await rewardSchemeApi.update(editingId, payload);
    else await rewardSchemeApi.create(payload);
    resetForm();
    await loadRows();
  };

  const edit = (row: any) => {
    setEditingId(String(row.id));
    setForm({
      name: row.name ?? '',
      description: row.description ?? '',
      pointsCost: row.pointsCost ?? 0,
      category: row.category ?? '',
      storeCategory: row.storeCategory ?? '',
      imageUrl: row.imageUrl ?? '',
      mrp: row.mrp ?? '',
      targetRole: row.targetRole ?? '',
      sortOrder: row.sortOrder ?? 0,
      active: row.active ?? true,
    });
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400 }}>
      <div style={{ background: 'linear-gradient(135deg, #0F766E, #14B8A6)', borderRadius: 16, padding: '22px 28px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, fontWeight: 900, color: '#fff' }}><Gift size={24} /> Reward Schemes</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>Manage live reward store items used by the app</div>
        </div>
        <button onClick={resetForm} style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> New Scheme
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, alignItems: 'start' }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 16 }}>{editingId ? 'Edit Reward Scheme' : 'Create Reward Scheme'}</div>
          <div style={{ display: 'grid', gap: 12 }}>
            <div><label style={labelStyle}>Name</label><input style={inputStyle} value={form.name} onChange={e => setForm((p: any) => ({ ...p, name: e.target.value }))} /></div>
            <div><label style={labelStyle}>Description</label><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 72 } as React.CSSProperties} value={form.description} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>Points</label><input type="number" style={inputStyle} value={form.pointsCost} onChange={e => setForm((p: any) => ({ ...p, pointsCost: e.target.value }))} /></div>
              <div><label style={labelStyle}>MRP</label><input type="number" style={inputStyle} value={form.mrp} onChange={e => setForm((p: any) => ({ ...p, mrp: e.target.value }))} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>Category</label><input style={inputStyle} value={form.category} onChange={e => setForm((p: any) => ({ ...p, category: e.target.value }))} /></div>
              <div><label style={labelStyle}>Store Category</label><input style={inputStyle} value={form.storeCategory} onChange={e => setForm((p: any) => ({ ...p, storeCategory: e.target.value }))} /></div>
            </div>
            <div><label style={labelStyle}>Image URL</label><input style={inputStyle} value={form.imageUrl} onChange={e => setForm((p: any) => ({ ...p, imageUrl: e.target.value }))} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>Target Role</label><select style={inputStyle} value={form.targetRole} onChange={e => setForm((p: any) => ({ ...p, targetRole: e.target.value }))}><option value="">All</option><option value="ELECTRICIAN">Electrician</option><option value="DEALER">Dealer</option></select></div>
              <div><label style={labelStyle}>Sort Order</label><input type="number" style={inputStyle} value={form.sortOrder} onChange={e => setForm((p: any) => ({ ...p, sortOrder: e.target.value }))} /></div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.text, fontSize: 13 }}><input type="checkbox" checked={form.active} onChange={e => setForm((p: any) => ({ ...p, active: e.target.checked }))} /> Active</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={save} style={{ flex: 1, background: `linear-gradient(135deg, ${C.red}, ${C.redDark})`, color: '#fff', border: 'none', borderRadius: 10, padding: '11px 14px', cursor: 'pointer', fontWeight: 700 }}>{editingId ? 'Update' : 'Create'}</button>
              <button onClick={resetForm} style={{ background: C.surface, color: C.text, border: `1px solid ${C.border}`, borderRadius: 10, padding: '11px 14px', cursor: 'pointer', fontWeight: 700 }}>Reset</button>
            </div>
          </div>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.border}`, fontSize: 16, fontWeight: 800, color: C.text }}>Live Reward Schemes</div>
          {loading ? <div style={{ padding: 30, color: C.muted }}>Loading reward schemes...</div> : rows.length === 0 ? <div style={{ padding: 30, color: C.muted }}>No reward schemes found.</div> : rows.map((row: any) => (
            <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 0.7fr 0.7fr 120px', gap: 12, alignItems: 'center', padding: '14px 18px', borderBottom: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{row.name}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{row.category}{row.storeCategory ? ` • ${row.storeCategory}` : ''}{row.targetRole ? ` • ${row.targetRole}` : ''}</div>
              </div>
              <div style={{ fontSize: 13, color: C.text, fontWeight: 700 }}>{row.pointsCost} pts</div>
              <div style={{ fontSize: 12, color: C.muted }}>{row.mrp ? `₹${row.mrp}` : 'No MRP'}</div>
              <div><span style={{ background: row.active ? 'rgba(34,197,94,0.14)' : 'rgba(239,68,68,0.14)', color: row.active ? '#16A34A' : '#DC2626', padding: '4px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{row.active ? 'Active' : 'Inactive'}</span></div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => edit(row)} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.text, cursor: 'pointer' }}><Pencil size={14} /></button>
                <button onClick={async () => { await rewardSchemeApi.delete(String(row.id)); await loadRows(); }} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${C.dangerBorder}`, background: C.dangerBg, color: C.dangerText, cursor: 'pointer' }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
