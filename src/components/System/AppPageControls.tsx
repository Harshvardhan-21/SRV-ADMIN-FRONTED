'use client';
import { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, Save, Shield, Smartphone } from 'lucide-react';
import { settingsApi } from '@/lib/api';
import { useThemePalette } from '@/lib/theme';

type UserRole = 'dealer' | 'electrician' | 'user' | 'counterboy';
type AppFeatureKey =
  | 'home'
  | 'product'
  | 'play'
  | 'categories'
  | 'cart'
  | 'electricians'
  | 'call_electrician'
  | 'rewards'
  | 'profile'
  | 'wallet'
  | 'notification'
  | 'scan'
  | 'dealer_tier'
  | 'electrician_tier'
  | 'bank_details'
  | 'transfer_points'
  | 'dealer_bonus'
  | 'catalog_pdf'
  | 'whatsapp_support'
  | 'my_redemption'
  | 'my_orders'
  | 'refer_friend'
  | 'need_help'
  | 'offers_promotions'
  | 'password'
  | 'app_settings'
  | 'scan_history'
  | 'contact_support'
  | 'privacy_policy'
  | 'rate_us';

type RolePageControls = Record<UserRole, Record<AppFeatureKey, boolean>>;

const FEATURE_GROUPS: { title: string; items: { key: AppFeatureKey; label: string; hint: string }[] }[] = [
  {
    title: 'Main Pages',
    items: [
      { key: 'home', label: 'Home', hint: 'Main landing page' },
      { key: 'product', label: 'Products', hint: 'Product listing and categories entry' },
      { key: 'play', label: 'Play', hint: 'Customer play section' },
      { key: 'categories', label: 'Categories', hint: 'Customer categories tab' },
      { key: 'cart', label: 'Cart', hint: 'Customer cart page' },
      { key: 'electricians', label: 'Associate Electricians', hint: 'Dealer electricians page' },
      { key: 'call_electrician', label: 'Call Electrician', hint: 'Dealer contact screen' },
      { key: 'rewards', label: 'Gift Store', hint: 'Rewards and gift store page' },
      { key: 'profile', label: 'Profile', hint: 'Account and profile screen' },
      { key: 'wallet', label: 'Wallet', hint: 'Wallet and points page' },
      { key: 'notification', label: 'Notifications', hint: 'Notification page and bell entry' },
      { key: 'scan', label: 'Scan', hint: 'Scan page and scanner entry' },
      { key: 'dealer_tier', label: 'Dealer Tier', hint: 'Dealer membership tier page' },
      { key: 'electrician_tier', label: 'Member Tier', hint: 'Electrician tier page' },
      { key: 'bank_details', label: 'Bank Details', hint: 'Bank details subpage' },
      { key: 'transfer_points', label: 'Transfer Points', hint: 'Transfer points page' },
      { key: 'dealer_bonus', label: 'Dealer Bonus', hint: 'Dealer bonus page' },
    ],
  },
  {
    title: 'Home Actions',
    items: [
      { key: 'catalog_pdf', label: 'Product Catalog', hint: 'Catalog PDF card/button' },
      { key: 'whatsapp_support', label: 'WhatsApp Support', hint: 'WhatsApp quick action' },
    ],
  },
  {
    title: 'Profile Menu',
    items: [
      { key: 'my_redemption', label: 'My Redemption', hint: 'Profile redemption menu item' },
      { key: 'my_orders', label: 'My Orders', hint: 'Profile orders menu item' },
      { key: 'refer_friend', label: 'Refer To A Friend', hint: 'Referral menu item' },
      { key: 'need_help', label: 'Need Help', hint: 'Help/support page' },
      { key: 'offers_promotions', label: 'Offers & Promotions', hint: 'Offers page' },
      { key: 'password', label: 'Password', hint: 'Password settings page' },
      { key: 'app_settings', label: 'App Settings', hint: 'App preference settings page' },
      { key: 'scan_history', label: 'Scan History', hint: 'Scan history page' },
      { key: 'contact_support', label: 'Contact Support', hint: 'Contact support page' },
      { key: 'privacy_policy', label: 'Privacy Policy', hint: 'Privacy policy page' },
      { key: 'rate_us', label: 'Rate Us', hint: 'Rate us screen' },
    ],
  },
];

const BASE_FEATURES: Record<AppFeatureKey, boolean> = {
  home: true,
  product: true,
  play: false,
  categories: false,
  cart: false,
  electricians: false,
  call_electrician: false,
  rewards: false,
  profile: true,
  wallet: true,
  notification: true,
  scan: false,
  dealer_tier: false,
  electrician_tier: false,
  bank_details: true,
  transfer_points: true,
  dealer_bonus: false,
  catalog_pdf: true,
  whatsapp_support: true,
  my_redemption: true,
  my_orders: true,
  refer_friend: true,
  need_help: true,
  offers_promotions: true,
  password: true,
  app_settings: true,
  scan_history: false,
  contact_support: true,
  privacy_policy: true,
  rate_us: true,
};

const DEFAULT_CONTROLS: RolePageControls = {
  electrician: { ...BASE_FEATURES, rewards: true, scan: true, electrician_tier: true, scan_history: true },
  dealer: { ...BASE_FEATURES, rewards: true, electricians: true, call_electrician: true, dealer_tier: true, dealer_bonus: true },
  user: { ...BASE_FEATURES, play: true, categories: true, cart: true, rewards: true, transfer_points: false },
  counterboy: { ...BASE_FEATURES, transfer_points: false },
};

const ROLE_META: Record<UserRole, { label: string; accent: string }> = {
  electrician: { label: 'Electrician', accent: '#1D4ED8' },
  dealer: { label: 'Dealer', accent: '#7C3AED' },
  user: { label: 'Customer', accent: '#C2410C' },
  counterboy: { label: 'Counter Boy', accent: '#0F766E' },
};

function normalizeControls(input?: unknown): RolePageControls {
  const next: RolePageControls = JSON.parse(JSON.stringify(DEFAULT_CONTROLS));
  if (!input || typeof input !== 'object') return next;

  (Object.keys(DEFAULT_CONTROLS) as UserRole[]).forEach((role) => {
    const roleConfig = (input as Record<string, unknown>)[role];
    if (!roleConfig || typeof roleConfig !== 'object') return;
    Object.keys(BASE_FEATURES).forEach((feature) => {
      const maybe = (roleConfig as Record<string, unknown>)[feature];
      if (typeof maybe === 'boolean') {
        next[role][feature as AppFeatureKey] = maybe;
      }
    });
  });

  return next;
}

export default function AppPageControls({ role }: { role?: import('@/lib/types').AdminRole }) {
  const C = useThemePalette();
  const canEdit = role === 'super_admin' || role === 'admin';
  const [controls, setControls] = useState<RolePageControls>(DEFAULT_CONTROLS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>('electrician');

  useEffect(() => {
    settingsApi
      .getAll()
      .then((rows: any[]) => {
        const row = rows?.find((item: any) => item.key === 'rolePageControls');
        if (!row?.value) return;
        try {
          setControls(normalizeControls(JSON.parse(row.value)));
        } catch {
          setControls(DEFAULT_CONTROLS);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const roleSummary = useMemo(() => {
    return (Object.keys(ROLE_META) as UserRole[]).map((itemRole) => {
      const enabledCount = Object.values(controls[itemRole]).filter(Boolean).length;
      return { role: itemRole, enabledCount };
    });
  }, [controls]);

  const toggleFeature = (roleKey: UserRole, featureKey: AppFeatureKey) => {
    if (!canEdit) return;
    setControls((current) => ({
      ...current,
      [roleKey]: {
        ...current[roleKey],
        [featureKey]: !current[roleKey][featureKey],
      },
    }));
  };

  const handleResetRole = () => {
    if (!canEdit) return;
    setControls((current) => ({ ...current, [activeRole]: { ...DEFAULT_CONTROLS[activeRole] } }));
  };

  const handleSave = async () => {
    if (!canEdit) return;
    setSaving(true);
    try {
      await settingsApi.update('rolePageControls', JSON.stringify(controls));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save page controls', err);
    } finally {
      setSaving(false);
    }
  };

  const card: React.CSSProperties = {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 18,
    boxShadow: '0 4px 16px rgba(15,23,42,0.06)',
  };
  const sectionTitle: React.CSSProperties = { fontSize: 12, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' };

  if (loading) {
    return <div style={{ padding: '28px 32px', color: C.muted }}>Loading page controls...</div>;
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1320 }}>
      <div style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)', borderRadius: 20, padding: '22px 24px', marginBottom: 22, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Smartphone size={26} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>App Page Controls</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
              Role-based control for which pages and app features appear inside the mobile app.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={handleResetRole} disabled={!canEdit} style={{ border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: canEdit ? 'pointer' : 'not-allowed', opacity: canEdit ? 1 : 0.6 }}>
            Reset {ROLE_META[activeRole].label}
          </button>
          <button onClick={handleSave} disabled={!canEdit || saving} style={{ border: 'none', background: '#22C55E', color: '#04210F', padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, cursor: canEdit ? 'pointer' : 'not-allowed', opacity: canEdit ? 1 : 0.6 }}>
            <Save size={15} />
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save Controls'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px minmax(0,1fr)', gap: 18, alignItems: 'start' }}>
        <div style={{ ...card, padding: 18, position: 'sticky', top: 24 }}>
          <div style={sectionTitle}>Roles</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            {roleSummary.map(({ role: roleKey, enabledCount }) => {
              const meta = ROLE_META[roleKey];
              const active = activeRole === roleKey;
              return (
                <button
                  key={roleKey}
                  onClick={() => setActiveRole(roleKey)}
                  style={{
                    border: active ? `2px solid ${meta.accent}` : `1px solid ${C.border}`,
                    background: active ? `${meta.accent}12` : C.card,
                    borderRadius: 14,
                    padding: '14px 14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{meta.label}</div>
                    <div style={{ width: 10, height: 10, borderRadius: 999, background: meta.accent }} />
                  </div>
                  <div style={{ marginTop: 6, fontSize: 12, color: C.muted }}>{enabledCount} controls enabled</div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {FEATURE_GROUPS.map((group) => (
            <div key={group.title} style={{ ...card, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: `${ROLE_META[activeRole].accent}12`, color: ROLE_META[activeRole].accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {group.title === 'Main Pages' ? <LayoutGrid size={18} /> : <Shield size={18} />}
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: C.text }}>{group.title}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{ROLE_META[activeRole].label} visibility and access rules</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                {group.items.map((feature) => {
                  const enabled = controls[activeRole][feature.key];
                  return (
                    <div key={feature.key} style={{ border: `1px solid ${enabled ? `${ROLE_META[activeRole].accent}40` : C.border}`, borderRadius: 14, padding: 14, background: enabled ? `${ROLE_META[activeRole].accent}08` : C.surface }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{feature.label}</div>
                          <div style={{ marginTop: 6, fontSize: 12, lineHeight: 1.45, color: C.muted }}>{feature.hint}</div>
                        </div>
                        <button
                          onClick={() => toggleFeature(activeRole, feature.key)}
                          disabled={!canEdit}
                          style={{
                            minWidth: 72,
                            border: 'none',
                            borderRadius: 999,
                            padding: '8px 10px',
                            background: enabled ? ROLE_META[activeRole].accent : '#CBD5E1',
                            color: enabled ? '#fff' : '#475569',
                            fontSize: 11,
                            fontWeight: 800,
                            cursor: canEdit ? 'pointer' : 'not-allowed',
                            opacity: canEdit ? 1 : 0.6,
                          }}
                        >
                          {enabled ? 'Visible' : 'Hidden'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
