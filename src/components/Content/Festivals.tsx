'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Pencil, Plus, Trash2 } from 'lucide-react';
import { festivalApi } from '@/lib/api';
import { useThemePalette } from '@/lib/theme';

const EMPTY_FORM = {
  name: '',
  slug: '',
  greeting: '',
  subGreeting: '',
  emoji: '🎉',
  bannerEmojis: '🎉✨🎊',
  particleEmojis: '✨⭐🌟',
  primaryColor: '#DE3B30',
  secondaryColor: '#F59E0B',
  accentColor: '#FFFFFF',
  bgColor: '#FFF8E7',
  cardColor: '#FFFBF0',
  textColor: '#1C0A00',
  startDate: '',
  endDate: '',
  active: true,
};

export default function Festivals() {
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
      setRows(await festivalApi.getAll());
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
    if (!form.name.trim() || !form.slug.trim() || !form.greeting.trim() || !form.startDate || !form.endDate) return;
    if (editingId) await festivalApi.update(editingId, form);
    else await festivalApi.create(form);
    resetForm();
    await loadRows();
  };

  const edit = (row: any) => {
    setEditingId(String(row.id));
    setForm({ ...EMPTY_FORM, ...row, startDate: String(row.startDate).slice(0, 10), endDate: String(row.endDate).slice(0, 10) });
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400 }}>
      <div style={{ background: 'linear-gradient(135deg, #9333EA, #DB2777)', borderRadius: 16, padding: '22px 28px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, fontWeight: 900, color: '#fff' }}><CalendarDays size={24} /> Festivals & Theme</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>Control the app festival banner, colors, greetings, and active dates</div>
        </div>
        <button onClick={resetForm} style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={16} /> New Festival</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 20, alignItems: 'start' }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 16 }}>{editingId ? 'Edit Festival' : 'Create Festival'}</div>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>Name</label><input style={inputStyle} value={form.name} onChange={e => setForm((p: any) => ({ ...p, name: e.target.value }))} /></div>
              <div><label style={labelStyle}>Slug</label><input style={inputStyle} value={form.slug} onChange={e => setForm((p: any) => ({ ...p, slug: e.target.value }))} /></div>
            </div>
            <div><label style={labelStyle}>Greeting</label><input style={inputStyle} value={form.greeting} onChange={e => setForm((p: any) => ({ ...p, greeting: e.target.value }))} /></div>
            <div><label style={labelStyle}>Sub Greeting</label><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 64 } as React.CSSProperties} value={form.subGreeting} onChange={e => setForm((p: any) => ({ ...p, subGreeting: e.target.value }))} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '0.7fr 1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>Emoji</label><input style={inputStyle} value={form.emoji} onChange={e => setForm((p: any) => ({ ...p, emoji: e.target.value }))} /></div>
              <div><label style={labelStyle}>Start</label><input type="date" style={inputStyle} value={form.startDate} onChange={e => setForm((p: any) => ({ ...p, startDate: e.target.value }))} /></div>
              <div><label style={labelStyle}>End</label><input type="date" style={inputStyle} value={form.endDate} onChange={e => setForm((p: any) => ({ ...p, endDate: e.target.value }))} /></div>
            </div>
            <div><label style={labelStyle}>Banner Emojis</label><input style={inputStyle} value={form.bannerEmojis} onChange={e => setForm((p: any) => ({ ...p, bannerEmojis: e.target.value }))} /></div>
            <div><label style={labelStyle}>Particle Emojis</label><input style={inputStyle} value={form.particleEmojis} onChange={e => setForm((p: any) => ({ ...p, particleEmojis: e.target.value }))} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>Primary</label><input type="color" style={{ ...inputStyle, padding: 6 }} value={form.primaryColor} onChange={e => setForm((p: any) => ({ ...p, primaryColor: e.target.value }))} /></div>
              <div><label style={labelStyle}>Secondary</label><input type="color" style={{ ...inputStyle, padding: 6 }} value={form.secondaryColor} onChange={e => setForm((p: any) => ({ ...p, secondaryColor: e.target.value }))} /></div>
              <div><label style={labelStyle}>Accent</label><input type="color" style={{ ...inputStyle, padding: 6 }} value={form.accentColor} onChange={e => setForm((p: any) => ({ ...p, accentColor: e.target.value }))} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>Background</label><input type="color" style={{ ...inputStyle, padding: 6 }} value={form.bgColor} onChange={e => setForm((p: any) => ({ ...p, bgColor: e.target.value }))} /></div>
              <div><label style={labelStyle}>Card</label><input type="color" style={{ ...inputStyle, padding: 6 }} value={form.cardColor} onChange={e => setForm((p: any) => ({ ...p, cardColor: e.target.value }))} /></div>
              <div><label style={labelStyle}>Text</label><input type="color" style={{ ...inputStyle, padding: 6 }} value={form.textColor} onChange={e => setForm((p: any) => ({ ...p, textColor: e.target.value }))} /></div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.text, fontSize: 13 }}><input type="checkbox" checked={form.active} onChange={e => setForm((p: any) => ({ ...p, active: e.target.checked }))} /> Active</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={save} style={{ flex: 1, background: `linear-gradient(135deg, ${C.red}, ${C.redDark})`, color: '#fff', border: 'none', borderRadius: 10, padding: '11px 14px', cursor: 'pointer', fontWeight: 700 }}>{editingId ? 'Update' : 'Create'}</button>
              <button onClick={resetForm} style={{ background: C.surface, color: C.text, border: `1px solid ${C.border}`, borderRadius: 10, padding: '11px 14px', cursor: 'pointer', fontWeight: 700 }}>Reset</button>
            </div>
          </div>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.border}`, fontSize: 16, fontWeight: 800, color: C.text }}>Festival Schedule</div>
          {loading ? <div style={{ padding: 30, color: C.muted }}>Loading festivals...</div> : rows.length === 0 ? <div style={{ padding: 30, color: C.muted }}>No festivals found.</div> : rows.map((row: any) => (
            <div key={row.id} style={{ padding: '16px 18px', borderBottom: `1px solid ${C.border}`, display: 'grid', gridTemplateColumns: '1fr 150px 120px', gap: 14, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{row.emoji} {row.name}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{row.greeting}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{String(row.startDate).slice(0, 10)} to {String(row.endDate).slice(0, 10)}</div>
              </div>
              <div><span style={{ background: row.active ? 'rgba(34,197,94,0.14)' : 'rgba(239,68,68,0.14)', color: row.active ? '#16A34A' : '#DC2626', padding: '4px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{row.active ? 'Active' : 'Inactive'}</span></div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => edit(row)} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.text, cursor: 'pointer' }}><Pencil size={14} /></button>
                <button onClick={async () => { await festivalApi.delete(String(row.id)); await loadRows(); }} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${C.dangerBorder}`, background: C.dangerBg, color: C.dangerText, cursor: 'pointer' }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
