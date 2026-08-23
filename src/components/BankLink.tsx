'use client';

import { useState, useEffect, useRef } from 'react';
import { usePlaidLink } from 'react-plaid-link';

interface BankLinkProps {
  userId: string;
  onSuccess?: (data: any) => void;
}

export default function BankLink({ userId, onSuccess }: BankLinkProps) {
  const [loading, setLoading] = useState(false);
  const [linkedAccounts, setLinkedAccounts] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const shouldOpenRef = useRef(false);

  // Load previously linked accounts on mount
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/bank-accounts?userId=${userId}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setLinkedAccounts(data))
      .catch((err) => console.error('[Plaid] Failed to load linked accounts:', err));
  }, [userId]);

  // Fetch link token from backend
  const fetchLinkToken = async () => {
    try {
      console.log('[Plaid] Requesting link token for user:', userId);
      const response = await fetch('/api/plaid/link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[Plaid] Failed to get link token:', data);
        setError(data.error || data.message || 'Failed to create link token');
        return null;
      }

      if (!data.link_token) {
        console.error('[Plaid] No link token in response:', data);
        setError('Failed to initialize bank linking');
        return null;
      }

      console.log('[Plaid] Got link token successfully');
      return data.link_token;
    } catch (err) {
      console.error('[Plaid] Error fetching link token:', err);
      setError('Failed to initialize bank linking. Please try again.');
      return null;
    }
  };

  // Initialize Plaid Link
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token: string | null) => {
      try {
        if (!public_token) {
          setError('Failed to get authorization token');
          return;
        }
        console.log('[Plaid] User authenticated, exchanging token');
        setLoading(true);
        const exchangeResponse = await fetch('/api/plaid/exchange-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_token, userId }),
        });

        const exchangeData = await exchangeResponse.json();
        console.log('[Plaid] Exchange successful:', exchangeData);
        setLinkedAccounts(exchangeData.accounts || []);
        setError('');
        onSuccess?.(exchangeData);
      } catch (err) {
        console.error('[Plaid] Exchange error:', err);
        setError('Failed to link account. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onExit: (err: any) => {
      console.log('[Plaid] User exited, error:', err);
      setLoading(false);
    },
  });

  // Open Plaid Link automatically once the SDK reports ready (avoids stale-closure race)
  useEffect(() => {
    if (ready && shouldOpenRef.current) {
      shouldOpenRef.current = false;
      setLoading(false);
      open();
    }
  }, [ready, open]);

  const handleLinkClick = async () => {
    if (!linkToken) {
      setLoading(true);
      shouldOpenRef.current = true;
      const token = await fetchLinkToken();
      if (!token) {
        shouldOpenRef.current = false;
        setLoading(false);
      } else {
        setLinkToken(token);
      }
    } else if (ready) {
      open();
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <button
          onClick={handleLinkClick}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? '⏳ Loading...' : '🏦 Link Bank Account'}
        </button>
      </div>

      {error && (
        <div className="mt-4 bg-red-100 text-red-700 p-4 rounded-lg">
          <p className="font-semibold">❌ Error</p>
          <p className="text-sm mt-2">{error}</p>
          <p className="text-xs mt-2 text-red-600">
            Try again or contact support if the issue persists.
          </p>
        </div>
      )}

      {linkedAccounts.length > 0 && (
        <div className="mt-6 bg-green-50 p-4 rounded-lg">
          <h3 className="font-bold text-green-900 mb-4">✅ Connected Accounts</h3>
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
