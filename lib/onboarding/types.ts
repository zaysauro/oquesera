// Shape of the onboarding wizard state. `OnboardingAnswers` mirrors the
// `answers` JSON column on `user_onboarding` (see lib/db/schema/auth.ts) and
// the per-step input the client posts to /api/portal/onboarding.

export type OnboardingStep =
  | 'welcome'
  | 'about-you'
  | 'about-company'
  | 'choose-modules'
  | 'payment'
  | 'module-setup'
  | 'brand-vibe'
  | 'mission'
  | 'features'
  | 'upsell'
  | 'power-up'
  | 'done';

export const ONBOARDING_STEPS: OnboardingStep[] = [
  'welcome',
  'about-you',
  'about-company',
  'choose-modules',
  'payment',
  'module-setup',
  'brand-vibe',
  'mission',
  'features',
  'upsell',
  'power-up',
  'done',
];

export interface OnboardingAnswers {
  role?: string;
  timezone?: string;
  companySize?: string;
  industry?: string;
  websiteUrl?: string;
  brandTones?: string[];
  primaryColor?: string;
  /** Google font family names → mirrored to brand profile heading/body font. */
  primaryFont?: string;
  secondaryFont?: string;
  mission?: string;
  featuresInterested?: string[];
  skillsDownloaded?: boolean;
  mcpKeyCreatedId?: number;
  /** Domain keys the client selected in the choose-modules step (or ['bundle']). */
  selectedModules?: string[];
  /** ISO timestamp stamped when Stripe checkout completes successfully. */
  checkoutCompletedAt?: string;
  /** Per-domain action completion tracking. domainKey → completed action keys. */
  moduleSetup?: Record<string, string[]>;
  /** ISO timestamp when the post-onboarding checklist was dismissed. */
  checklistDismissedAt?: string;
  /** ISO timestamp stamped server-side by the 'reopen' action; never settable via PATCH. Presence = not a fresh signup. */
  reopenedAt?: string;
  /** Domain keys whose in-domain GetStarted card the user dismissed. */
  dismissedDomains?: string[];
}

export interface OnboardingState {
  step: OnboardingStep;
  answers: OnboardingAnswers;
  completedAt: string | null;
  // pre-filled from users/clients so the wizard never asks for what we
  // already know
  prefill: {
    name: string;
    email: string;
    company: string;
    website: string;
  };
  /**
   * True only for self-serve (billingMode='saas') clients that have not yet
   * activated any module. Computed server-side in loadOnboarding(). When false
   * the wizard skips 'choose-modules' and 'payment' entirely.
   */
  showBillingSteps: boolean;
}

export const FEATURE_CATALOG: Array<{ id: string; label: string; icon: string; description: string }> = [
  { id: 'website', label: 'Build a website', icon: 'language', description: 'Drag-and-drop pages, blog, SEO.' },
  { id: 'email', label: 'Send email campaigns', icon: 'email', description: 'Newsletters, automations, segments.' },
  { id: 'booking', label: 'Take bookings', icon: 'calendar_month', description: 'Calendar sync, reminders, embeddable widgets.' },
  { id: 'decks', label: 'Pitch decks', icon: 'slideshow', description: 'AI-drafted decks with auto-branding.' },
  { id: 'crm', label: 'Run a CRM', icon: 'contacts', description: 'Contacts, deals, pipelines, activity.' },
  { id: 'surveys', label: 'Surveys & forms', icon: 'list_alt', description: 'Intake forms, NPS, lead capture.' },
  { id: 'brain', label: 'Company Brain (AI)', icon: 'smart_toy', description: 'Search your docs & meetings with AI.' },
  { id: 'projects', label: 'Project mgmt', icon: 'view_kanban', description: 'Kanban, sprints, team collaboration.' },
  { id: 'store', label: 'Online store', icon: 'storefront', description: 'Products, orders, inventory.' },
  { id: 'ai-chat', label: 'Live chat for visitors', icon: 'chat', description: 'Branded live-chat widget with a shared team inbox.' },
];

export const BRAND_TONES: Array<{ id: string; label: string; icon: string }> = [
  { id: 'professional', label: 'Profissional', icon: 'badge' },
  { id: 'friendly', label: 'Amigável', icon: 'sentiment_satisfied' },
  { id: 'bold', label: 'Ousado', icon: 'bolt' },
  { id: 'playful', label: 'Descontraído', icon: 'celebration' },
  { id: 'calm', label: 'Tranquilo', icon: 'spa' },
  { id: 'smart', label: 'Inteligente', icon: 'psychology' },
  { id: 'warm', label: 'Acolhedor', icon: 'wb_sunny' },
  { id: 'confident', label: 'Confiante', icon: 'star' },
];

export const COMPANY_SIZES: Array<{ id: string; label: string }> = [
  { id: 'solo', label: 'Só eu' },
  { id: 'small', label: '2–10' },
  { id: 'mid', label: '11–50' },
  { id: 'large', label: '51–250' },
  { id: 'xl', label: '250+' },
];

export const ROLE_PRESETS: Array<{ id: string; label: string; icon: string }> = [
  { id: 'owner', label: 'Dono(a) / Fundador(a)', icon: 'workspace_premium' },
  { id: 'marketing', label: 'Marketing', icon: 'campaign' },
  { id: 'sales', label: 'Vendas', icon: 'trending_up' },
  { id: 'ops', label: 'Operações', icon: 'settings_suggest' },
  { id: 'engineering', label: 'Tecnologia / TI', icon: 'code' },
  { id: 'consultant', label: 'Consultoria / Agência', icon: 'support_agent' },
  { id: 'other', label: 'Outro', icon: 'more_horiz' },
];

export const COLOR_PRESETS: string[] = [
  '#2563eb', // blue
  '#7c3aed', // violet
  '#db2777', // pink
  '#dc2626', // red
  '#ea580c', // orange
  '#ca8a04', // amber
  '#16a34a', // green
  '#0891b2', // cyan
  '#475569', // slate
  '#111827', // graphite
];
