import { NextRequest, NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments, CountryCode, Products } from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const client = new PlaidApi(configuration);

// Create Link Token for bank connection
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId. Please log in first.' },
        { status: 400 }
      );
    }

    if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
      console.error('[Plaid] Missing environment variables');
      return NextResponse.json(
        { error: 'Plaid configuration incomplete' },
        { status: 500 }
      );
    }

    console.log('[Plaid] Creating link token for userId:', userId);
    const response = await client.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'BudgetHub',
      language: 'en',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
    });

    console.log('[Plaid] Link token created successfully');
    return NextResponse.json({
      link_token: response.data.link_token,
    });
  } catch (error: any) {
    const plaidError = error?.response?.data;
    console.error('[Plaid] Error creating link token:', plaidError || error);
    return NextResponse.json(
      { error: 'Failed to create link token: ' + (plaidError?.error_message || (error instanceof Error ? error.message : 'Unknown error')) },
      { status: 500 }
    );
  }
}
