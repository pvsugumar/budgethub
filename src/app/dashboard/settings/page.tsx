'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BankLink from '@/components/BankLink';

export default function SettingsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    email: 'user@example.com',
    name: 'John Doe',
    currency: 'USD',
    theme: 'light',
    notifications: true,
  });

  useEffect(() => {
    // Get userId from localStorage (set during login)
    const storedUserId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    
    if (!storedUserId) {
      // Not logged in, redirect to login
      router.push('/auth/login');
      return;
    }
    
    setUserId(storedUserId);
    const savedPrefs = localStorage.getItem('userPrefs');
    const prefs = savedPrefs ? JSON.parse(savedPrefs) : {};
    setSettings((prev) => ({
      ...prev,
      email: userEmail || prev.email,
      name: userName || prev.name,
      currency: prefs.currency || prev.currency,
      theme: prefs.theme || prev.theme,
      notifications: prefs.notifications ?? prev.notifications,
    }));
    setIsLoading(false);
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: settings.name }),
      });
      if (res.ok) {
        localStorage.setItem('userName', settings.name);
        localStorage.setItem('userPrefs', JSON.stringify({
          currency: settings.currency,
          theme: settings.theme,
          notifications: settings.notifications,
        }));
        alert('✅ Settings saved!');
      } else {
        alert('❌ Failed to save settings');
      }
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Settings</h1>

      <div className="card max-w-2xl">
        <h2 className="text-xl font-bold mb-6">Account Settings</h2>

        <form className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={settings.name}
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={settings.email}
              onChange={handleChange}
              className="input"
              disabled
            />
            <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Currency
            </label>
            <select name="currency" value={settings.currency} onChange={handleChange} className="input">
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>INR</option>
              <option>JPY</option>
            </select>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select name="theme" value={settings.theme} onChange={handleChange} className="input">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          {/* Notifications */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="notifications"
              checked={settings.notifications}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label className="ml-3 text-sm font-medium text-gray-700">
              Enable email notifications
            </label>
          </div>

          {/* Save Button */}
          <div className="flex gap-4">
            <button type="button" onClick={handleSave} disabled={saving} className="btn btn-primary disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Bank Linking */}
      <div className="card max-w-2xl mt-8">
        <h2 className="text-xl font-bold mb-6">Connected Bank Accounts</h2>
        <p className="text-gray-600 mb-4">
          Link your bank account to automatically sync transactions and get real-time account balances.
        </p>
        <BankLink userId={userId || ''} onSuccess={(data) => {
          console.log('Bank linked:', data);
          alert('✅ Bank account linked successfully!');
        }} />
      </div>

      {/* Danger Zone */}
      <div className="card max-w-2xl mt-8 border-2 border-red-200">
        <h2 className="text-xl font-bold mb-4 text-red-600">Danger Zone</h2>
        <p className="text-gray-600 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Delete Account
        </button>
      </div>
    </div>
  );
}
