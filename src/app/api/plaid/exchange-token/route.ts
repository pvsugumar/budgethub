import { NextRequest, NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { prisma } from '@/lib/db';

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

    if (!public_token || !userId) {
      return NextResponse.json(
        { error: 'Missing public_token or userId' },
        { status: 400 }
      );
    }

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

    // Save each linked account to the database
    await Promise.all(
      accounts.map((acc) =>
        prisma.bankAccount.upsert({
          where: { accountId: acc.account_id },
          update: {
            balance: acc.balances?.current || 0,
          },
          create: {
            userId,
            plaidItemId: item_id,
            accessToken: access_token,
            accountId: acc.account_id,
            name: acc.name,
            type: acc.type,
            subtype: acc.subtype || null,
            mask: acc.mask || null,
            balance: acc.balances?.current || 0,
          },
        })
      )
    );

    // Pull initial transaction history (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const transactionsResponse = await client.transactionsGet({
      access_token,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    });

    const plaidTransactions = transactionsResponse.data.transactions;

    await Promise.all(
      plaidTransactions.map((t) =>
        prisma.transaction.upsert({
          where: { plaidTransactionId: t.transaction_id },
          update: {},
          create: {
            userId,
            amount: Math.abs(t.amount),
            type: t.amount > 0 ? 'expense' : 'income',
            category: t.category?.[0] || 'Other',
            description: t.name,
            date: new Date(t.date),
            plaidTransactionId: t.transaction_id,
            accountId: t.account_id,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      item_id,
      transactionsImported: plaidTransactions.length,
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

