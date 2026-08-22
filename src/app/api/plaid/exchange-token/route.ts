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

// Exchange public token for access token
export async function POST(request: NextRequest) {
  try {
    const { public_token, userId } = await request.json();

    const response = await client.itemPublicTokenExchange({
      public_token,
    });

    const access_token = response.data.access_token;
    const item_id = response.data.item_id;

    // Get account info
    const accountsResponse = await client.accountsGet({
      access_token,
    });

    const accounts = accountsResponse.data.accounts;

    // Save to database (you'll need to create a BankAccount model)
    // For now, we'll just return the data
    return NextResponse.json({
      success: true,
      item_id,
      accounts: accounts.map((acc) => ({
        id: acc.account_id,
        name: acc.name,
        type: acc.type,
        subtype: acc.subtype,
        mask: acc.mask,
        balance: acc.balances?.current || 0,
      })),
    });
  } catch (error) {
    console.error('Plaid error:', error);
    return NextResponse.json(
      { error: 'Failed to exchange token' },
      { status: 500 }
    );
  }
}
