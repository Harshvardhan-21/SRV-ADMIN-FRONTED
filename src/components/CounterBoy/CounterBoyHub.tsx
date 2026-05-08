'use client';
import { useState } from 'react';
import { Users, Trophy, FileCheck, ScanLine, Wallet, Gift, CreditCard, Landmark } from 'lucide-react';
import AllCounterBoys from './AllCounterBoys';
import TopCounterBoys from './pages/TopCounterBoys';
import CounterBoyKYC from './pages/KYC';
import CounterBoyScanHistory from './pages/ScanHistory';
import CounterBoyWallet from './pages/Wallet';
import CounterBoyOffers from './pages/Offers';
import CounterBoyFinance from './pages/Finance';
import CounterBoyBankLinked from './pages/BankLinked';
import type { AdminRole } from '@/lib/types';
import { useThemePalette } from '@/lib/theme';

interface CounterBoyHubProps {
  role: AdminRole;
  defaultPage?: string;
  onSubPageChange?: (subPage: string, label: string) => void;
}

const subPages = [
  { id: 'counterboys', label: 'All Counter Boys', Icon: Users, description: 'Manage counter staff' },
  { id: 'top', label: 'Top Counter Boys', Icon: Trophy, description: 'Leaderboard' },
  { id: 'kyc', label: 'KYC Management', Icon: FileCheck, description: 'Verify documents' },
  { id: 'scans', label: 'Scan History', Icon: ScanLine, description: 'View scan records' },
  { id: 'wallet', label: 'Wallet History', Icon: Wallet, description: 'Track transactions' },
  { id: 'offers', label: 'Offers', Icon: Gift, description: 'Manage promotions' },
  { id: 'finance', label: 'Finance', Icon: CreditCard, description: 'Wallet and redemptions' },
  { id: 'bank', label: 'Bank Linked', Icon: Landmark, description: 'Bank and UPI details' },
];

export default function CounterBoyHub({ role, defaultPage, onSubPageChange }: CounterBoyHubProps) {
  const C = useThemePalette();
  const [activePage, setActivePage] = useState(defaultPage || 'counterboys');

  const handlePageChange = (id: string) => {
    setActivePage(id);
    const page = subPages.find(p => p.id === id);
    onSubPageChange?.(id, page?.label ?? id);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'counterboys': return <AllCounterBoys role={role} />;
      case 'top': return <TopCounterBoys />;
      case 'kyc': return <CounterBoyKYC />;
      case 'scans': return <CounterBoyScanHistory />;
      case 'wallet': return <CounterBoyWallet />;
      case 'offers': return <CounterBoyOffers />;
      case 'finance': return <CounterBoyFinance />;
      case 'bank': return <CounterBoyBankLinked />;
      default: return <AllCounterBoys role={role} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      {/* Sub-page Navigation */}
      <div style={{ background: C.subNavBg, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 40, boxShadow: C.shadow }}>
        <div style={{ padding: '0 32px', display: 'flex', gap: 0, overflowX: 'auto', scrollBehavior: 'smooth', msOverflowStyle: 'none', scrollbarWidth: 'none' } as React.CSSProperties}>
          {subPages.map(page => {
            const isActive = activePage === page.id;
            const PageIcon = page.Icon;
            return (
              <button
                key={page.id}
                onClick={() => handlePageChange(page.id)}
                style={{ padding: '16px 20px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, borderBottom: isActive ? `3px solid ${C.red}` : '3px solid transparent', color: isActive ? C.red : C.muted, fontWeight: isActive ? 600 : 500, fontSize: 13, whiteSpace: 'nowrap', transition: 'all 0.2s' }}
              >
                <PageIcon size={16} />
                {page.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: 0, overflowX: 'hidden' }}>
        {renderPage()}
      </div>
    </div>
  );
}
