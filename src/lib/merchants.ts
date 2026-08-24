// Merchant logo mapping - maps merchant names to their logo URLs
export const MERCHANT_LOGOS: Record<string, string> = {
  // Fast Food & Restaurants
  'KFC': 'https://logo.clearbit.com/kfc.com',
  'McDonald\'s': 'https://logo.clearbit.com/mcdonalds.com',
  'Burger King': 'https://logo.clearbit.com/burgerking.com',
  'Chipotle': 'https://logo.clearbit.com/chipotle.com',
  'Starbucks': 'https://logo.clearbit.com/starbucks.com',
  'Domino\'s': 'https://logo.clearbit.com/dominos.com',
  'Pizza Hut': 'https://logo.clearbit.com/pizzahut.com',
  'Taco Bell': 'https://logo.clearbit.com/tacobell.com',
  'Wendy\'s': 'https://logo.clearbit.com/wendys.com',
  'Chick-fil-A': 'https://logo.clearbit.com/chick-fil-a.com',
  
  // Retail
  'Walmart': 'https://logo.clearbit.com/walmart.com',
  'Amazon': 'https://logo.clearbit.com/amazon.com',
  'Target': 'https://logo.clearbit.com/target.com',
  'Costco': 'https://logo.clearbit.com/costco.com',
  'Best Buy': 'https://logo.clearbit.com/bestbuy.com',
  'Whole Foods': 'https://logo.clearbit.com/wholefoodsmarket.com',
  
  // Transportation
  'Uber': 'https://logo.clearbit.com/uber.com',
  'Lyft': 'https://logo.clearbit.com/lyft.com',
  'Delta': 'https://logo.clearbit.com/delta.com',
  'Southwest': 'https://logo.clearbit.com/southwest.com',
  'United': 'https://logo.clearbit.com/united.com',
  'American Airlines': 'https://logo.clearbit.com/aa.com',
  
  // Streaming & Entertainment
  'Netflix': 'https://logo.clearbit.com/netflix.com',
  'Spotify': 'https://logo.clearbit.com/spotify.com',
  'Disney+': 'https://logo.clearbit.com/disneyplus.com',
  'Hulu': 'https://logo.clearbit.com/hulu.com',
  'HBO': 'https://logo.clearbit.com/hbo.com',
  'YouTube': 'https://logo.clearbit.com/youtube.com',
  'Apple Music': 'https://logo.clearbit.com/apple.com',
  
  // Fitness & Wellness
  'Apple Gym': 'https://logo.clearbit.com/apple.com',
  'Planet Fitness': 'https://logo.clearbit.com/planetfitness.com',
  'Peloton': 'https://logo.clearbit.com/peloton.com',
  'ClassPass': 'https://logo.clearbit.com/classpass.com',
  
  // Tech & Software
  'Apple': 'https://logo.clearbit.com/apple.com',
  'Microsoft': 'https://logo.clearbit.com/microsoft.com',
  'Google': 'https://logo.clearbit.com/google.com',
  'Meta': 'https://logo.clearbit.com/meta.com',
  'Tesla': 'https://logo.clearbit.com/tesla.com',
  
  // Hotels & Travel
  'Marriott': 'https://logo.clearbit.com/marriott.com',
  'Hilton': 'https://logo.clearbit.com/hilton.com',
  'Airbnb': 'https://logo.clearbit.com/airbnb.com',
  'Booking.com': 'https://logo.clearbit.com/booking.com',
  'Expedia': 'https://logo.clearbit.com/expedia.com',
  
  // Utilities & Bills
  'Verizon': 'https://logo.clearbit.com/verizon.com',
  'AT&T': 'https://logo.clearbit.com/att.com',
  'T-Mobile': 'https://logo.clearbit.com/t-mobile.com',
  'Comcast': 'https://logo.clearbit.com/comcast.com',
  'Duke Energy': 'https://logo.clearbit.com/duke-energy.com',
};

// Get merchant logo URL with fallback
export function getMerchantLogo(merchantName: string | null): string | null {
  if (!merchantName) return null;
  
  // Direct match
  if (MERCHANT_LOGOS[merchantName]) {
    return MERCHANT_LOGOS[merchantName];
  }
  
  // Try to find partial match
  const normalized = merchantName.toLowerCase();
  for (const [merchant, url] of Object.entries(MERCHANT_LOGOS)) {
    if (normalized.includes(merchant.toLowerCase()) || merchant.toLowerCase().includes(normalized)) {
      return url;
    }
  }
  
  // Fallback: use Clearbit with merchant name
  return `https://logo.clearbit.com/${merchantName.toLowerCase().replace(/\s+/g, '')}.com`;
}

// Get merchant initials for fallback display
export function getMerchantInitials(merchantName: string | null): string {
  if (!merchantName) return '?';
  const parts = merchantName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return merchantName.substring(0, 2).toUpperCase();
}
