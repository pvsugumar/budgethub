'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Plaid: any;
  }
}

interface BankLinkProps {
  userId: string;
  onSuccess?: (data: any) => void;
}

export default function BankLink({ userId, onSuccess }: BankLinkProps) {
  const [loading, setLoading] = useState(false);
  const [linkedAccounts, setLinkedAccounts] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [plaidReady, setPlaidReady] = useState(false);

  useEffect(() => {
    // Load Plaid Link script
    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v3/stable/link-initialize.js';
    script.async = true;
    script.onload = () => {
      setPlaidReady(true);
      setError('');
    };
    script.onerror = () => {
      setError('Failed to load Plaid. Please try again later.');
      setPlaidReady(false);
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const handleLinkClick = async () => {
    if (!window.Plaid) {
      setError('Plaid is not loaded. Please refresh the page and try again.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Get link token from backend
      const tokenResponse = await fetch('/api/plaid/link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await tokenResponse.json();
      
      if (!tokenResponse.ok || !data.link_token) {
        setError(data.error || 'Failed to create link token');
        setLoading(false);
        return;
      }

      // Initialize Plaid Link
      const handler = window.Plaid.create({
        token: data.link_token,
        onSuccess: async (publicToken: string) => {
          try {
            // Exchange public token for access token
            const exchangeResponse = await fetch('/api/plaid/exchange-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ public_token: publicToken, userId }),
            });

            const exchangeData = await exchangeResponse.json();
            setLinkedAccounts(exchangeData.accounts);
            onSuccess?.(exchangeData);
          } catch (err) {
            setError('Failed to link account. Please try again.');
            console.error(err);
          } finally {
            setLoading(false);
          }
        },
        onExit: () => {
          setLoading(false);
        },
      });

      handler.open();
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to link bank account. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleLinkClick}
        disabled={loading || !plaidReady}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
      >
        {!plaidReady ? '⏳ Loading Plaid...' : loading ? 'Connecting...' : '🏦 Link Bank Account'}
      </button>

      {error && (
        <div className="mt-4 bg-red-100 text-red-700 p-4 rounded-lg">
          <p className="font-semibold">❌ Error</p>
          <p className="text-sm mt-2">{error}</p>
          {error.includes('Failed to load Plaid') && (
            <p className="text-xs mt-2 text-red-600">
              This might be due to network restrictions. Try refreshing the page or using an alternative method.
            </p>
          )}
        </div>
      )}

      {linkedAccounts.length > 0 && (
        <div className="mt-6 bg-green-50 p-4 rounded-lg">
          <h3 className="font-bold text-green-900 mb-4">Connected Accounts</h3>
          <div className="space-y-2">
            {linkedAccounts.map((account) => (
              <div key={account.id} className="bg-white p-3 rounded border border-green-200">
                <p className="font-semibold">{account.name}</p>
                <p className="text-sm text-gray-600">
                  {account.type} • ••••{account.mask}
                </p>
                <p className="text-sm font-bold text-green-600">
                  Balance: ${account.balance.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
