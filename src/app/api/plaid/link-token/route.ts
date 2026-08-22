import { NextRequest, NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

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

    const response = await client.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'BudgetHub',
      language: 'en',
      products: ['auth', 'transactions'],
      country_codes: ['US'],
    });

    return NextResponse.json({
      link_token: response.data.link_token,
    });
  } catch (error) {
    console.error('Plaid error:', error);
    return NextResponse.json(
      { error: 'Failed to create link token' },
      { status: 500 }
    );
  }
}
