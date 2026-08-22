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
  const [loading, setLoading] = useState(true);
  const [linkedAccounts, setLinkedAccounts] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [plaidReady, setPlaidReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Load Plaid Link script
    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v3/stable/link-initialize.js';
    script.async = true;
    
    script.onload = () => {
      console.log('[Plaid] Script loaded successfully');
      setPlaidReady(true);
      setError('');
      setLoading(false);
    };
    
    script.onerror = (error) => {
      console.error('[Plaid] Failed to load script:', error);
      setError('Unable to load bank linking. This may be due to network restrictions or browser settings.');
      setPlaidReady(false);
      setLoading(false);
    };
    
    // Add timeout for slow connections
    const timeout = setTimeout(() => {
      if (!plaidReady) {
        console.warn('[Plaid] Script loading timed out after 30 seconds');
        setError('Bank linking service is taking too long to load. Please check your internet connection.');
        setLoading(false);
      }
    }, 30000);

    document.body.appendChild(script);

    return () => {
      clearTimeout(timeout);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [retryCount]);

  const handleRetry = () => {
    setError('');
    setPlaidReady(false);
    setLoading(true);
    setRetryCount(prev => prev + 1);
  };

  const handleLinkClick = async () => {
    if (!window.Plaid) {
      setError('Plaid Link is not loaded. Please try refreshing the page.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      console.log('[Plaid] Requesting link token for user:', userId);
      // Get link token from backend
      const tokenResponse = await fetch('/api/plaid/link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        console.error('[Plaid] Failed to get link token:', data);
        setError(data.error || data.message || 'Failed to create link token');
        setLoading(false);
        return;
      }

      if (!data.link_token) {
        console.error('[Plaid] No link token in response:', data);
        setError('Failed to initialize bank linking');
        setLoading(false);
        return;
      }

      console.log('[Plaid] Got link token, opening handler');
      // Initialize Plaid Link
      const handler = window.Plaid.create({
        token: data.link_token,
        onSuccess: async (publicToken: string) => {
          try {
            console.log('[Plaid] User authenticated, exchanging token');
            // Exchange public token for access token
            const exchangeResponse = await fetch('/api/plaid/exchange-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ public_token: publicToken, userId }),
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

      handler.open();
    } catch (error) {
      console.error('[Plaid] Error:', error);
      setError('Failed to open bank linking. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <button
          onClick={handleLinkClick}
          disabled={loading || !plaidReady}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
        >
          {!plaidReady ? '⏳ Loading Plaid...' : loading ? 'Connecting...' : '🏦 Link Bank Account'}
        </button>
        
        {error && (
          <button
            onClick={handleRetry}
            className="px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
          >
            🔄 Retry
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-100 text-red-700 p-4 rounded-lg">
          <p className="font-semibold">❌ Error</p>
          <p className="text-sm mt-2">{error}</p>
          <p className="text-xs mt-2 text-red-600">
            Check the browser console (F12) for more details. This may be due to network restrictions or browser settings.
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
