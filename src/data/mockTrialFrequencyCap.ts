export type TrialEligibilityStatus = 'Capped' | 'Eligible';

export type TrialProductRow = {
  id: string;
  sku: string;
  productName: string;
  firstEnrolled: string;
  lastEnrolled: string;
  status: TrialEligibilityStatus;
  timeRemaining: string;
};

export type TrialAccountSummary = {
  customerName: string;
  tid: string;
  accountId: string;
  accountTypes: string[];
  cappedProductCount: number;
  products: TrialProductRow[];
};

export const DEMO_ACCOUNT_ID = 'ACC-88492';
export const DEMO_EMAIL = 'buyer@acmeconstruction.com';

export function buildDemoTrialAccount(): TrialAccountSummary {
  return {
    customerName: 'Acme Construction Inc.',
    tid: '98124501',
    accountId: DEMO_ACCOUNT_ID,
    accountTypes: ['Organization Owner', 'Buyer'],
    cappedProductCount: 1,
    products: [
      {
        id: 'sku-skyk-trl',
        sku: 'SKU-SKYK-TRL',
        productName: 'Trimble Connect Business (30-Day Trial)',
        firstEnrolled: '2025-11-15',
        lastEnrolled: '2025-11-15',
        status: 'Capped',
        timeRemaining: '25 days remaining in 364-day window',
      },
      {
        id: 'sku-tbc-trl',
        sku: 'SKU-TBC-TRL',
        productName: 'Trimble Business Center (30-Day Trial)',
        firstEnrolled: '2024-03-02',
        lastEnrolled: '2024-03-02',
        status: 'Eligible',
        timeRemaining: '364-day window clear',
      },
    ],
  };
}

export function matchesTrialAccountSearch(query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return false;
  return (
    normalized === DEMO_ACCOUNT_ID.toLowerCase()
    || normalized === DEMO_EMAIL.toLowerCase()
    || normalized.includes('acme')
    || normalized.includes('88492')
  );
}
