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
