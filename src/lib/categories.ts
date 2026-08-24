export const CATEGORIES = [
  { name: 'Auto & Transport', icon: '🚗' },
  { name: 'Bills & Utilities', icon: '📋' },
  { name: 'Education', icon: '🎓' },
  { name: 'Entertainment', icon: '🎬' },
  { name: 'Fees & Charges', icon: '🏦' },
  { name: 'Food & Dining', icon: '🍽️' },
  { name: 'Gifts & Donations', icon: '🎁' },
  { name: 'Groceries', icon: '🛒' },
  { name: 'Health & Fitness', icon: '🩺' },
  { name: 'Home', icon: '🏠' },
  { name: 'Income', icon: '💰' },
  { name: 'Insurance', icon: '🛡️' },
  { name: 'Investments', icon: '📈' },
  { name: 'Kids', icon: '🧸' },
  { name: 'Personal Care', icon: '💇' },
  { name: 'Pets', icon: '🐾' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Subscriptions', icon: '🔁' },
  { name: 'Transfer', icon: '↔️' },
  { name: 'Travel', icon: '✈️' },
  { name: 'Other', icon: '🏷️' },
] as const;

export function categoryIcon(category: string): string {
  const match = CATEGORIES.find((c) => c.name.toLowerCase() === category.toLowerCase());
  if (match) return match.icon;

  const c = category.toLowerCase();
  if (c.includes('auto') || c.includes('transport') || c.includes('car') || c.includes('gas')) return '🚗';
  if (c.includes('dining') || c.includes('restaurant') || c.includes('food')) return '🍽️';
  if (c.includes('coffee')) return '☕';
  if (c.includes('shop')) return '🛍️';
  if (c.includes('travel')) return '✈️';
  if (c.includes('entertain')) return '🎬';
  if (c.includes('home') || c.includes('rent') || c.includes('mortgage')) return '🏠';
  if (c.includes('bill') || c.includes('util')) return '📋';
  if (c.includes('health') || c.includes('medical')) return '🩺';
  if (c.includes('education') || c.includes('school')) return '🎓';
  if (c.includes('gift') || c.includes('donat')) return '🎁';
  if (c.includes('kid')) return '🧸';
  if (c.includes('financ') || c.includes('fee') || c.includes('interest')) return '🏦';
  if (c.includes('atm') || c.includes('withdraw') || c.includes('cash')) return '💼';
  if (c.includes('income') || c.includes('salary') || c.includes('earning') || c.includes('payroll')) return '💰';
  return '🏷️';
}

// Maps Plaid's raw category strings (or any free-text category) onto our fixed category list
const PLAID_CATEGORY_MAP: Record<string, string> = {
  'food and drink': 'Food & Dining',
  'restaurants': 'Food & Dining',
  'groceries': 'Groceries',
  'travel': 'Travel',
  'airlines and aviation services': 'Travel',
  'transportation': 'Auto & Transport',
  'taxi': 'Auto & Transport',
  'ride share': 'Auto & Transport',
  'gas stations': 'Auto & Transport',
  'shops': 'Shopping',
  'shopping': 'Shopping',
  'payment': 'Bills & Utilities',
  'bills and utilities': 'Bills & Utilities',
  'utilities': 'Bills & Utilities',
  'rent': 'Home',
  'mortgage': 'Home',
  'home improvement': 'Home',
  'transfer': 'Transfer',
  'interest': 'Fees & Charges',
  'interest earned': 'Income',
  'bank fees': 'Fees & Charges',
  'service': 'Bills & Utilities',
  'recreation': 'Entertainment',
  'entertainment': 'Entertainment',
  'healthcare': 'Health & Fitness',
  'medical': 'Health & Fitness',
  'personal care': 'Personal Care',
  'education': 'Education',
  'payroll': 'Income',
  'deposit': 'Income',
  'income': 'Income',
};

export function normalizeCategory(rawCategory: string): string {
  const key = rawCategory.trim().toLowerCase();
  if (PLAID_CATEGORY_MAP[key]) return PLAID_CATEGORY_MAP[key];

  const exactMatch = CATEGORIES.find((c) => c.name.toLowerCase() === key);
  if (exactMatch) return exactMatch.name;

  for (const [plaidKey, fixedName] of Object.entries(PLAID_CATEGORY_MAP)) {
    if (key.includes(plaidKey)) return fixedName;
  }

  return 'Other';
}
