'use client';
import { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, RotateCcw, Save, Settings2, Smartphone, Type } from 'lucide-react';
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
  | 'support'
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

type ContentPageKey =
  | 'home'
  | 'product'
  | 'play'
  | 'categories'
  | 'cart'
  | 'wallet'
  | 'profile'
  | 'notifications'
  | 'rewards'
  | 'scan'
  | 'electricians'
  | 'call_electrician'
  | 'member_tier'
  | 'bank_details'
  | 'dealer_bonus'
  | 'need_help'
  | 'contact_support'
  | 'offers'
  | 'transfer_points'
  | 'my_orders'
  | 'my_redemption'
  | 'refer_friend'
  | 'scan_history'
  | 'privacy_policy'
  | 'password'
  | 'app_settings'
  | 'rate_us'
  | 'support';

type ContentFieldKey =
  | 'pageTitle'
  | 'pageSubtitle'
  | 'heroTitle'
  | 'heroSubtitle'
  | 'sectionTitle'
  | 'sectionSubtitle'
  | 'primaryCtaLabel'
  | 'secondaryCtaLabel'
  | 'emptyStateTitle'
  | 'emptyStateSubtitle'
  | 'helperText'
  | 'supportText'
  | 'searchPlaceholder'
  | 'inputLabel'
  | 'cardTitle'
  | 'cardSubtitle';

type RolePageControls = Record<UserRole, Record<AppFeatureKey, boolean>>;
type AppPageContentFields = Partial<Record<ContentFieldKey, string>>;
type AppPageContentMap = Record<UserRole, Partial<Record<ContentPageKey, AppPageContentFields>>>;

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
      { key: 'support', label: 'Support', hint: 'Counter boy support page' },
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
  support: false,
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
  dealer: { ...BASE_FEATURES, electricians: true, call_electrician: true, dealer_tier: true, dealer_bonus: true },
  user: { ...BASE_FEATURES, play: true, categories: true, cart: true, rewards: true, transfer_points: false },
  counterboy: { ...BASE_FEATURES, support: true, transfer_points: false },
};

const ROLE_ALLOWED_FEATURES: Record<UserRole, AppFeatureKey[]> = {
  dealer: [
    'home',
    'product',
    'electricians',
    'call_electrician',
    'profile',
    'wallet',
    'notification',
    'dealer_tier',
    'bank_details',
    'transfer_points',
    'dealer_bonus',
    'catalog_pdf',
    'whatsapp_support',
    'my_orders',
    'need_help',
    'offers_promotions',
    'password',
    'app_settings',
    'contact_support',
    'privacy_policy',
    'rate_us',
  ],
  electrician: [
    'home',
    'product',
    'scan',
    'rewards',
    'profile',
    'wallet',
    'notification',
    'electrician_tier',
    'bank_details',
    'transfer_points',
    'catalog_pdf',
    'whatsapp_support',
    'my_redemption',
    'my_orders',
    'refer_friend',
    'need_help',
    'offers_promotions',
    'password',
    'app_settings',
    'scan_history',
    'contact_support',
    'privacy_policy',
    'rate_us',
  ],
  user: [
    'home',
    'product',
    'play',
    'categories',
    'cart',
    'rewards',
    'profile',
    'wallet',
    'notification',
    'catalog_pdf',
    'whatsapp_support',
    'my_redemption',
    'my_orders',
    'refer_friend',
    'need_help',
    'offers_promotions',
    'password',
    'app_settings',
    'contact_support',
    'privacy_policy',
    'rate_us',
  ],
  counterboy: [
    'home',
    'product',
    'support',
    'profile',
    'wallet',
    'notification',
    'bank_details',
    'catalog_pdf',
    'whatsapp_support',
    'my_orders',
    'need_help',
    'offers_promotions',
    'password',
    'app_settings',
    'contact_support',
    'privacy_policy',
    'rate_us',
  ],
};

const ROLE_META: Record<UserRole, { label: string; accent: string; blurb: string }> = {
  electrician: { label: 'Electrician', accent: '#1D4ED8', blurb: 'Scanner, rewards, wallet, profile and service flows' },
  dealer: { label: 'Dealer', accent: '#7C3AED', blurb: 'Dealer home, electrician network, bonus and support flows' },
  user: { label: 'Customer', accent: '#C2410C', blurb: 'Shopping, cart, offers and customer profile flows' },
  counterboy: { label: 'Counter Boy', accent: '#0F766E', blurb: 'Counter support, wallet, profile and service flows' },
};

const CONTENT_FIELD_META: { key: ContentFieldKey; label: string; hint: string; textarea?: boolean }[] = [
  { key: 'pageTitle', label: 'Page Title', hint: 'Header title shown at the top of the page' },
  { key: 'pageSubtitle', label: 'Page Subtitle', hint: 'Optional short subtitle below the title' },
  { key: 'heroTitle', label: 'Hero Title', hint: 'Main hero headline or top focus text' },
  { key: 'heroSubtitle', label: 'Hero Subtitle', hint: 'Supporting hero copy below the headline', textarea: true },
  { key: 'sectionTitle', label: 'Section Title', hint: 'Primary section heading inside the page' },
  { key: 'sectionSubtitle', label: 'Section Subtitle', hint: 'Small supporting line under a section title', textarea: true },
  { key: 'cardTitle', label: 'Card Title', hint: 'Card heading or status block label' },
  { key: 'cardSubtitle', label: 'Card Subtitle', hint: 'Card supporting copy', textarea: true },
  { key: 'inputLabel', label: 'Input Label', hint: 'Form field label or search label' },
  { key: 'searchPlaceholder', label: 'Search Placeholder', hint: 'Search / input placeholder text' },
  { key: 'primaryCtaLabel', label: 'Primary Button', hint: 'Main action button label' },
  { key: 'secondaryCtaLabel', label: 'Secondary Button', hint: 'Secondary action button label' },
  { key: 'emptyStateTitle', label: 'Empty State Title', hint: 'Message when no data is available', textarea: true },
  { key: 'emptyStateSubtitle', label: 'Empty State Subtitle', hint: 'Extra empty-state helper copy', textarea: true },
  { key: 'helperText', label: 'Helper Text', hint: 'Small note or guidance shown below controls', textarea: true },
  { key: 'supportText', label: 'Support Text', hint: 'Extra support/help copy or action subtitle', textarea: true },
];

const ROLE_PAGE_META: Record<UserRole, { key: ContentPageKey; label: string; hint: string }[]> = {
  dealer: [
    { key: 'home', label: 'Home', hint: 'Dealer home banners, quick actions and category section' },
    { key: 'product', label: 'Product', hint: 'Dealer product listing page' },
    { key: 'wallet', label: 'Wallet', hint: 'Dealer wallet summary and transactions' },
    { key: 'profile', label: 'Profile', hint: 'Dealer profile and settings hub' },
    { key: 'electricians', label: 'Electricians', hint: 'Associated electrician list page' },
    { key: 'call_electrician', label: 'Call Electrician', hint: 'Dealer call / outreach page' },
    { key: 'member_tier', label: 'Member Tier', hint: 'Dealer tier progress page' },
    { key: 'bank_details', label: 'Bank Details', hint: 'Bank details page' },
    { key: 'dealer_bonus', label: 'Dealer Bonus', hint: 'Dealer bonus and withdrawal page' },
    { key: 'transfer_points', label: 'Transfer Points', hint: 'Dealer point transfer flow' },
    { key: 'my_orders', label: 'My Orders', hint: 'Dealer order history page' },
    { key: 'notifications', label: 'Notifications', hint: 'Dealer notifications page' },
    { key: 'need_help', label: 'Need Help', hint: 'Dealer support request page' },
    { key: 'contact_support', label: 'Contact Support', hint: 'Dealer contact support page' },
    { key: 'offers', label: 'Offers', hint: 'Dealer offers and promotions page' },
    { key: 'privacy_policy', label: 'Privacy Policy', hint: 'Dealer privacy policy page' },
    { key: 'password', label: 'Password', hint: 'Dealer password settings page' },
    { key: 'app_settings', label: 'App Settings', hint: 'Dealer app settings page' },
    { key: 'rate_us', label: 'Rate Us', hint: 'Dealer rate us page' },
  ],
  electrician: [
    { key: 'home', label: 'Home', hint: 'Electrician home dashboard' },
    { key: 'product', label: 'Product', hint: 'Electrician product page' },
    { key: 'scan', label: 'Scan', hint: 'QR scan page' },
    { key: 'rewards', label: 'Rewards', hint: 'Reward / gift store page' },
    { key: 'wallet', label: 'Wallet', hint: 'Electrician wallet page' },
    { key: 'profile', label: 'Profile', hint: 'Electrician profile hub' },
    { key: 'member_tier', label: 'Member Tier', hint: 'Electrician tier page' },
    { key: 'bank_details', label: 'Bank Details', hint: 'Bank details page' },
    { key: 'transfer_points', label: 'Transfer Points', hint: 'Transfer points page' },
    { key: 'my_orders', label: 'My Orders', hint: 'Order history page' },
    { key: 'my_redemption', label: 'My Redemption', hint: 'Redemption history page' },
    { key: 'refer_friend', label: 'Refer Friend', hint: 'Referral page' },
    { key: 'scan_history', label: 'Scan History', hint: 'Scan history page' },
    { key: 'notifications', label: 'Notifications', hint: 'Notifications page' },
    { key: 'need_help', label: 'Need Help', hint: 'Support request page' },
    { key: 'contact_support', label: 'Contact Support', hint: 'Contact support page' },
    { key: 'offers', label: 'Offers', hint: 'Offers page' },
    { key: 'privacy_policy', label: 'Privacy Policy', hint: 'Privacy policy page' },
    { key: 'password', label: 'Password', hint: 'Password settings page' },
    { key: 'app_settings', label: 'App Settings', hint: 'App settings page' },
    { key: 'rate_us', label: 'Rate Us', hint: 'Rate us page' },
  ],
  user: [
    { key: 'home', label: 'Home', hint: 'Customer home dashboard' },
    { key: 'product', label: 'Product', hint: 'Customer product page' },
    { key: 'play', label: 'Play', hint: 'Customer play page' },
    { key: 'categories', label: 'Categories', hint: 'Customer categories page' },
    { key: 'cart', label: 'Cart', hint: 'Customer cart page' },
    { key: 'rewards', label: 'Rewards', hint: 'Gift store / rewards page' },
    { key: 'wallet', label: 'Wallet', hint: 'Customer wallet page' },
    { key: 'profile', label: 'Profile', hint: 'Customer profile hub' },
    { key: 'transfer_points', label: 'Transfer Points', hint: 'Transfer points page' },
    { key: 'my_orders', label: 'My Orders', hint: 'Order history page' },
    { key: 'my_redemption', label: 'My Redemption', hint: 'Redemption history page' },
    { key: 'refer_friend', label: 'Refer Friend', hint: 'Referral page' },
    { key: 'notifications', label: 'Notifications', hint: 'Notifications page' },
    { key: 'need_help', label: 'Need Help', hint: 'Support request page' },
    { key: 'contact_support', label: 'Contact Support', hint: 'Contact support page' },
    { key: 'offers', label: 'Offers', hint: 'Offers page' },
    { key: 'privacy_policy', label: 'Privacy Policy', hint: 'Privacy policy page' },
    { key: 'password', label: 'Password', hint: 'Password settings page' },
    { key: 'app_settings', label: 'App Settings', hint: 'App settings page' },
    { key: 'rate_us', label: 'Rate Us', hint: 'Rate us page' },
  ],
  counterboy: [
    { key: 'home', label: 'Home', hint: 'Counter boy home dashboard' },
    { key: 'product', label: 'Product', hint: 'Counter boy product page' },
    { key: 'support', label: 'Support', hint: 'Counter boy support page' },
    { key: 'wallet', label: 'Wallet', hint: 'Counter boy wallet page' },
    { key: 'profile', label: 'Profile', hint: 'Counter boy profile hub' },
    { key: 'bank_details', label: 'Bank Details', hint: 'Bank details page' },
    { key: 'transfer_points', label: 'Transfer Points', hint: 'Transfer points page' },
    { key: 'my_orders', label: 'My Orders', hint: 'Order history page' },
    { key: 'my_redemption', label: 'My Redemption', hint: 'Redemption history page' },
    { key: 'refer_friend', label: 'Refer Friend', hint: 'Referral page' },
    { key: 'notifications', label: 'Notifications', hint: 'Notifications page' },
    { key: 'need_help', label: 'Need Help', hint: 'Support request page' },
    { key: 'contact_support', label: 'Contact Support', hint: 'Contact support page' },
    { key: 'offers', label: 'Offers', hint: 'Offers page' },
    { key: 'privacy_policy', label: 'Privacy Policy', hint: 'Privacy policy page' },
    { key: 'password', label: 'Password', hint: 'Password settings page' },
    { key: 'app_settings', label: 'App Settings', hint: 'App settings page' },
    { key: 'rate_us', label: 'Rate Us', hint: 'Rate us page' },
  ],
};

const DEFAULT_PAGE_CONTENT: AppPageContentMap = {
  electrician: {},
  dealer: {},
  user: {},
  counterboy: {},
};

const DEFAULT_PAGE_COPY: AppPageContentMap = {
  dealer: {
    home: {
      sectionTitle: 'Shop by Category',
      sectionSubtitle: 'Browse the complete SRV product collection for your dealership.',
      primaryCtaLabel: 'View all',
    },
    product: {
      pageTitle: 'All Products',
      searchPlaceholder: 'Search all products...',
      primaryCtaLabel: 'Buy Now',
      secondaryCtaLabel: 'Buy Now',
      emptyStateTitle: 'No products found',
    },
    wallet: {
      pageTitle: 'SRV Dealer Wallet',
      heroSubtitle: 'Dealer wallet for schemes, bank payouts, and dealer bonus tracking.',
      pageSubtitle: 'Quick Actions',
      sectionTitle: 'Manage dealer payouts',
      sectionSubtitle: 'Redeem Point History',
      cardTitle: 'Activity Timeline',
      emptyStateTitle: 'No detailed records yet',
      emptyStateSubtitle: 'Your complete wallet history will appear here once bank payouts or dealer bonus activity starts.',
    },
    electricians: {
      pageTitle: 'Dealer Network',
      heroTitle: 'Connected electricians',
      heroSubtitle: 'Dealers can review every connected electrician here and add new electricians to their network from the same page.',
      sectionTitle: 'Electrician directory',
      searchPlaceholder: 'Search by name, phone, or city',
      primaryCtaLabel: 'Add Electrician',
      emptyStateTitle: 'No electricians connected yet. Add your first electrician!',
    },
    call_electrician: {
      pageTitle: 'Dealer Calling Desk',
      heroTitle: 'Reach your electricians instantly',
      heroSubtitle: 'Use normal phone call or WhatsApp call actions to connect with any associated electrician.',
      supportText: 'electricians in your network',
      emptyStateTitle: 'No electricians yet',
      emptyStateSubtitle: 'Associate electricians from the home screen to see them here.',
    },
    member_tier: {
      pageTitle: 'Member Tier',
      pageSubtitle: 'Current Dealer Level',
      sectionTitle: 'Grading system',
      cardTitle: 'How dealer level works',
    },
    dealer_bonus: {
      cardTitle: '5% Auto Bonus',
      heroTitle: 'GET YOUR BONUS',
      heroSubtitle: '5% of the points redeemed by any electrician will be credited to your dealer wallet. 1 point = 1 INR, and you can withdraw it directly to your bank account.',
      sectionTitle: 'How it works',
      pageSubtitle: 'Withdraw to bank',
      inputLabel: 'Enter amount in rupees',
      primaryCtaLabel: 'Request bank transfer',
    },
    notifications: {
      pageTitle: 'Notification Center',
      heroTitle: 'Stay updated with SRV',
      heroSubtitle: 'Important price updates, reward alerts, and account notices in one place.',
      sectionTitle: 'Latest updates',
      primaryCtaLabel: 'Back Home',
      secondaryCtaLabel: 'More',
      emptyStateTitle: 'No notifications yet',
      emptyStateSubtitle: "You're all caught up. New updates will appear here.",
    },
  },
  electrician: {
    home: {
      sectionTitle: 'Shop by Category',
      sectionSubtitle: 'Browse the complete SRV product collection for every electrician need.',
      primaryCtaLabel: 'View all',
    },
    product: {
      pageTitle: 'All Products',
      searchPlaceholder: 'Search all products...',
      primaryCtaLabel: 'Scan to Earn',
      secondaryCtaLabel: 'Scan\n& Earn',
      emptyStateTitle: 'No products found',
    },
    wallet: {
      pageTitle: 'SRV Premium Wallet',
      heroSubtitle: 'Premium rewards dashboard for redemptions, transfers, and loyalty growth.',
      pageSubtitle: 'Quick Actions',
      sectionTitle: 'Move your wallet faster',
      sectionSubtitle: 'Redeem Point History',
      cardTitle: 'Activity Timeline',
      emptyStateTitle: 'No detailed records yet',
      emptyStateSubtitle: 'Start scanning products and your reward credits will appear here automatically.',
    },
    notifications: {
      pageTitle: 'Notification Center',
      heroTitle: 'Stay updated with SRV',
      heroSubtitle: 'Important price updates, reward alerts, and account notices in one place.',
      sectionTitle: 'Latest updates',
      primaryCtaLabel: 'Back Home',
      secondaryCtaLabel: 'More',
      emptyStateTitle: 'No notifications yet',
      emptyStateSubtitle: "You're all caught up. New updates will appear here.",
    },
  },
  user: {
    home: {
      sectionTitle: 'Shop by Category',
      sectionSubtitle: 'Discover trusted SRV products, offers, and categories for your home.',
      primaryCtaLabel: 'View all',
    },
    product: {
      pageTitle: 'All Products',
      searchPlaceholder: 'Search all products...',
      helperText: 'Loading products...',
    },
    cart: {
      pageTitle: 'Customer Cart',
      heroTitle: 'My Cart',
      emptyStateTitle: 'Your cart is empty',
      emptyStateSubtitle: 'Browse categories, explore products and add items here for a cleaner enquiry flow.',
      primaryCtaLabel: 'Browse Products',
    },
    rewards: {
      pageTitle: 'Gift Store',
      sectionTitle: 'Gift Store',
      heroTitle: 'Redeem your SRV rewards',
      heroSubtitle: 'Use your earned points to claim gifts, offers, and customer rewards from one place.',
      emptyStateTitle: 'No gifts available',
      emptyStateSubtitle: 'Check back soon!',
    },
    notifications: {
      pageTitle: 'Notification Center',
      heroTitle: 'Stay updated with SRV',
      heroSubtitle: 'Important price updates, reward alerts, and account notices in one place.',
      sectionTitle: 'Latest updates',
      primaryCtaLabel: 'Back Home',
      secondaryCtaLabel: 'More',
      emptyStateTitle: 'No notifications yet',
      emptyStateSubtitle: "You're all caught up. New updates will appear here.",
    },
  },
  counterboy: {
    home: {
      sectionTitle: 'Shop by Category',
      sectionSubtitle: 'Browse the SRV range and support tools for counter operations.',
      primaryCtaLabel: 'View all',
    },
    product: {
      pageTitle: 'All Products',
      searchPlaceholder: 'Search all products...',
      primaryCtaLabel: 'Buy Now',
      secondaryCtaLabel: 'Buy Now',
      emptyStateTitle: 'No products found',
    },
    support: {
      pageTitle: 'Get in Touch',
      pageSubtitle: 'Have a question or need assistance? We are just a tap away.',
      supportText: 'Our team typically responds within 24 hours.',
    },
    notifications: {
      pageTitle: 'Notification Center',
      heroTitle: 'Stay updated with SRV',
      heroSubtitle: 'Important price updates, reward alerts, and account notices in one place.',
      sectionTitle: 'Latest updates',
      primaryCtaLabel: 'Back Home',
      secondaryCtaLabel: 'More',
      emptyStateTitle: 'No notifications yet',
      emptyStateSubtitle: "You're all caught up. New updates will appear here.",
    },
  },
};

const PAGE_TO_FEATURE: Partial<Record<ContentPageKey, AppFeatureKey>> = {
  home: 'home',
  product: 'product',
  play: 'play',
  categories: 'categories',
  cart: 'cart',
  wallet: 'wallet',
  profile: 'profile',
  notifications: 'notification',
  rewards: 'rewards',
  scan: 'scan',
  electricians: 'electricians',
  call_electrician: 'call_electrician',
  bank_details: 'bank_details',
  dealer_bonus: 'dealer_bonus',
  need_help: 'need_help',
  contact_support: 'contact_support',
  offers: 'offers_promotions',
  transfer_points: 'transfer_points',
  my_orders: 'my_orders',
  my_redemption: 'my_redemption',
  refer_friend: 'refer_friend',
  scan_history: 'scan_history',
  privacy_policy: 'privacy_policy',
  password: 'password',
  app_settings: 'app_settings',
  rate_us: 'rate_us',
  support: 'support',
};

function getFeatureKeyForPage(role: UserRole, page: ContentPageKey) {
  if (page === 'member_tier') {
    return role === 'electrician' ? 'electrician_tier' : 'dealer_tier';
  }
  return PAGE_TO_FEATURE[page];
}

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

function normalizePageContent(input?: unknown): AppPageContentMap {
  const next: AppPageContentMap = {
    electrician: {},
    dealer: {},
    user: {},
    counterboy: {},
  };

  if (!input || typeof input !== 'object') return next;

  (Object.keys(DEFAULT_PAGE_CONTENT) as UserRole[]).forEach((role) => {
    const roleConfig = (input as Record<string, unknown>)[role];
    if (!roleConfig || typeof roleConfig !== 'object') return;

    Object.entries(roleConfig as Record<string, unknown>).forEach(([pageKey, pageFields]) => {
      if (!pageFields || typeof pageFields !== 'object') return;
      const normalizedFields: AppPageContentFields = {};
      CONTENT_FIELD_META.forEach(({ key }) => {
        const maybe = (pageFields as Record<string, unknown>)[key];
        if (typeof maybe === 'string') {
          normalizedFields[key] = maybe;
        }
      });
      if (Object.keys(normalizedFields).length > 0) {
        next[role][pageKey as ContentPageKey] = normalizedFields;
      }
    });
  });

  return next;
}

function getDefaultPage(role: UserRole) {
  return ROLE_PAGE_META[role].find((page) => {
    const featureKey = getFeatureKeyForPage(role, page.key);
    return !featureKey || ROLE_ALLOWED_FEATURES[role].includes(featureKey);
  })?.key ?? 'home';
}

function getDefaultFieldValue(role: UserRole, page: ContentPageKey, field: ContentFieldKey) {
  const presetValue = DEFAULT_PAGE_COPY[role]?.[page]?.[field];
  if (presetValue) return presetValue;

  const pageMeta = ROLE_PAGE_META[role].find((item) => item.key === page);
  if (field === 'pageTitle') {
    return pageMeta?.label ?? '';
  }

  return '';
}

export default function AppPageControls({ role }: { role?: import('@/lib/types').AdminRole }) {
  const C = useThemePalette();
  const canEdit = role === 'super_admin' || role === 'admin';
  const [controls, setControls] = useState<RolePageControls>(DEFAULT_CONTROLS);
  const [pageContent, setPageContent] = useState<AppPageContentMap>(DEFAULT_PAGE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>('electrician');
  const [activePageByRole, setActivePageByRole] = useState<Record<UserRole, ContentPageKey>>({
    electrician: getDefaultPage('electrician'),
    dealer: getDefaultPage('dealer'),
    user: getDefaultPage('user'),
    counterboy: getDefaultPage('counterboy'),
  });

  useEffect(() => {
    settingsApi
      .getAll()
      .then((rows: any[]) => {
        const controlRow = rows?.find((item: any) => item.key === 'rolePageControls');
        const contentRow = rows?.find((item: any) => item.key === 'appPageContent');

        if (controlRow?.value) {
          try {
            setControls(normalizeControls(JSON.parse(controlRow.value)));
          } catch {
            setControls(DEFAULT_CONTROLS);
          }
        }

        if (contentRow?.value) {
          try {
            setPageContent(normalizePageContent(JSON.parse(contentRow.value)));
          } catch {
            setPageContent(DEFAULT_PAGE_CONTENT);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const roleSummary = useMemo(() => {
    return (Object.keys(ROLE_META) as UserRole[]).map((itemRole) => {
      const enabledCount = ROLE_ALLOWED_FEATURES[itemRole].filter((feature) => controls[itemRole][feature]).length;
      const contentCount = Object.values(pageContent[itemRole] ?? {}).reduce((count, page) => {
        return count + Object.values(page ?? {}).filter((value) => typeof value === 'string' && value.trim()).length;
      }, 0);
      return { role: itemRole, enabledCount, contentCount };
    });
  }, [controls, pageContent]);

  const activePages = ROLE_PAGE_META[activeRole].filter((page) => {
    const featureKey = getFeatureKeyForPage(activeRole, page.key);
    return !featureKey || ROLE_ALLOWED_FEATURES[activeRole].includes(featureKey);
  });
  const activePage = activePageByRole[activeRole];
  const activePageMeta = activePages.find((item) => item.key === activePage) ?? activePages[0];
  const activePageFields = pageContent[activeRole][activePageMeta.key] ?? {};
  const activeFeatureGroups = useMemo(() => {
    const allowed = new Set(ROLE_ALLOWED_FEATURES[activeRole]);
    return FEATURE_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((feature) => allowed.has(feature.key)),
    })).filter((group) => group.items.length > 0);
  }, [activeRole]);

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

  const updatePageField = (field: ContentFieldKey, value: string) => {
    if (!canEdit) return;
    const normalizedValue = value.trim();
    const defaultValue = getDefaultFieldValue(activeRole, activePageMeta.key, field).trim();

    setPageContent((current) => {
      const nextRoleContent = { ...(current[activeRole] ?? {}) };
      const nextPageFields = { ...(nextRoleContent[activePageMeta.key] ?? {}) };

      if (!normalizedValue || normalizedValue === defaultValue) {
        delete nextPageFields[field];
      } else {
        nextPageFields[field] = value;
      }

      if (Object.keys(nextPageFields).length > 0) {
        nextRoleContent[activePageMeta.key] = nextPageFields;
      } else {
        delete nextRoleContent[activePageMeta.key];
      }

      return {
        ...current,
        [activeRole]: nextRoleContent,
      };
    });
  };

  const handleResetRoleVisibility = () => {
    if (!canEdit) return;
    setControls((current) => ({ ...current, [activeRole]: { ...DEFAULT_CONTROLS[activeRole] } }));
  };

  const handleResetCurrentPageContent = () => {
    if (!canEdit) return;
    setPageContent((current) => ({
      ...current,
      [activeRole]: {
        ...current[activeRole],
        [activePageMeta.key]: {},
      },
    }));
  };

  const handleSave = async () => {
    if (!canEdit) return;
    setSaving(true);
    try {
      await Promise.all([
        settingsApi.update('rolePageControls', JSON.stringify(controls)),
        settingsApi.update('appPageContent', JSON.stringify(pageContent)),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save app page controls', err);
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
  const sectionTitle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 800,
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  };
  const inputStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: 12,
    border: `1px solid ${C.border}`,
    background: C.surface,
    color: C.text,
    padding: '11px 13px',
    outline: 'none',
    fontSize: 13,
    fontFamily: 'inherit',
  };

  if (loading) {
    return <div style={{ padding: '28px 32px', color: C.muted }}>Loading app page controls...</div>;
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1440 }}>
      <div style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)', borderRadius: 20, padding: '22px 24px', marginBottom: 22, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 54, height: 54, borderRadius: 16, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Smartphone size={27} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>App Page Controls</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', marginTop: 4 }}>
              Role-wise page visibility plus editable copy for the live mobile app.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={handleResetRoleVisibility} disabled={!canEdit} style={{ border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: canEdit ? 'pointer' : 'not-allowed', opacity: canEdit ? 1 : 0.6 }}>
            Reset {ROLE_META[activeRole].label} Visibility
          </button>
          <button onClick={handleSave} disabled={!canEdit || saving} style={{ border: 'none', background: '#22C55E', color: '#04210F', padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, cursor: canEdit ? 'pointer' : 'not-allowed', opacity: canEdit ? 1 : 0.6 }}>
            <Save size={15} />
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save All Changes'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px minmax(0,1fr)', gap: 18, alignItems: 'start' }}>
        <div style={{ ...card, padding: 18, position: 'sticky', top: 24 }}>
          <div style={sectionTitle}>Roles</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            {roleSummary.map(({ role: roleKey, enabledCount, contentCount }) => {
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
                  <div style={{ marginTop: 6, fontSize: 12, color: C.muted }}>{meta.blurb}</div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.text, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 999, padding: '4px 8px' }}>
                      {enabledCount} visible
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.text, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 999, padding: '4px 8px' }}>
                      {contentCount} text overrides
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {activeFeatureGroups.map((group) => (
            <div key={group.title} style={{ ...card, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: `${ROLE_META[activeRole].accent}12`, color: ROLE_META[activeRole].accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {group.title === 'Main Pages' ? <LayoutGrid size={18} /> : <Settings2 size={18} />}
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

          <div style={{ ...card, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: `${ROLE_META[activeRole].accent}12`, color: ROLE_META[activeRole].accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Type size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: C.text }}>Live Page Content</div>
                  <div style={{ fontSize: 12, color: C.muted }}>
                    Fields below already show the current app text. Change anything here and save to override it.
                  </div>
                </div>
              </div>
              <button onClick={handleResetCurrentPageContent} disabled={!canEdit} style={{ border: `1px solid ${C.border}`, background: C.surface, color: C.text, padding: '9px 12px', borderRadius: 10, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, cursor: canEdit ? 'pointer' : 'not-allowed', opacity: canEdit ? 1 : 0.6 }}>
                <RotateCcw size={14} />
                Reset This Page
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '260px minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
              <div style={{ border: `1px solid ${C.border}`, borderRadius: 16, padding: 12, background: C.surface }}>
                <div style={{ ...sectionTitle, marginBottom: 12 }}>Pages</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {activePages.map((page) => {
                    const selected = activePageMeta.key === page.key;
                    const filledCount = Object.values(pageContent[activeRole][page.key] ?? {}).filter((value) => typeof value === 'string' && value.trim()).length;
                    return (
                      <button
                        key={page.key}
                        onClick={() => setActivePageByRole((current) => ({ ...current, [activeRole]: page.key }))}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          border: selected ? `2px solid ${ROLE_META[activeRole].accent}` : `1px solid ${C.border}`,
                          background: selected ? `${ROLE_META[activeRole].accent}10` : C.card,
                          borderRadius: 12,
                          padding: '12px 12px',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{page.label}</div>
                          <span style={{ fontSize: 10, fontWeight: 800, color: filledCount ? '#fff' : C.muted, background: filledCount ? ROLE_META[activeRole].accent : C.surface, border: filledCount ? 'none' : `1px solid ${C.border}`, borderRadius: 999, padding: '4px 7px' }}>
                            {filledCount}
                          </span>
                        </div>
                        <div style={{ marginTop: 5, fontSize: 11.5, lineHeight: 1.45, color: C.muted }}>{page.hint}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, background: C.surface }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                  <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: C.text }}>
                    {ROLE_META[activeRole].label} / {activePageMeta.label}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 12, color: C.muted }}>{activePageMeta.hint}</div>
                </div>
                  <div style={{ fontSize: 11.5, color: C.muted }}>
                    Changes appear in the app after the next settings refresh.
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                  {CONTENT_FIELD_META.map((field) => (
                    <label key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{field.label}</div>
                          <div style={{ marginTop: 3, fontSize: 11.5, lineHeight: 1.45, color: C.muted }}>{field.hint}</div>
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: activePageFields[field.key]?.trim() ? '#fff' : C.muted,
                            background: activePageFields[field.key]?.trim() ? ROLE_META[activeRole].accent : C.surface,
                            border: activePageFields[field.key]?.trim() ? 'none' : `1px solid ${C.border}`,
                            borderRadius: 999,
                            padding: '4px 7px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {activePageFields[field.key]?.trim() ? 'Custom' : 'Default'}
                        </span>
                      </div>
                      {field.textarea ? (
                        <textarea
                          value={activePageFields[field.key] ?? getDefaultFieldValue(activeRole, activePageMeta.key, field.key)}
                          onChange={(e) => updatePageField(field.key, e.target.value)}
                          disabled={!canEdit}
                          placeholder="No text available yet"
                          rows={4}
                          style={{ ...inputStyle, resize: 'vertical', minHeight: 96 }}
                        />
                      ) : (
                        <input
                          value={activePageFields[field.key] ?? getDefaultFieldValue(activeRole, activePageMeta.key, field.key)}
                          onChange={(e) => updatePageField(field.key, e.target.value)}
                          disabled={!canEdit}
                          placeholder="No text available yet"
                          style={inputStyle}
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
