'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BankLink from '@/components/BankLink';

type SettingsTab = 'profile' | 'categories' | 'accounts';

export default function SettingsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    currency: 'USD',
    city: '',
    state: '',
    zip: '',
    annualIncome: '',
    employmentStatus: 'Employee',
    timezone: 'America/New_York',
  });
  const [notifications, setNotifications] = useState({
    emailTransactions: true,
    emailBills: true,
    emailBudgets: true,
    smsTransactions: false,
    smsBills: false,
    smsBudgets: false,
    pushTransactions: true,
    pushBills: true,
    pushBudgets: true,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    
    if (!storedUserId) {
      router.push('/auth/login');
      return;
    }
    
    setUserId(storedUserId);
    const savedPrefs = localStorage.getItem('userPrefs');
    const prefs = savedPrefs ? JSON.parse(savedPrefs) : {};
    
    setProfile((prev) => ({
      ...prev,
      email: userEmail || prev.email,
      name: userName || prev.name,
      currency: prefs.currency || prev.currency,
    }));
    setIsLoading(false);
  }, [router]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotifications((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSaveProfile = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          name: profile.name,
          phone: profile.phone,
          country: profile.country,
          city: profile.city,
          state: profile.state,
          zip: profile.zip,
          annualIncome: profile.annualIncome,
          employmentStatus: profile.employmentStatus,
          timezone: profile.timezone,
          notifications: notifications,
        }),
      });
      if (res.ok) {
        localStorage.setItem('userName', profile.name);
        localStorage.setItem('userPrefs', JSON.stringify({
          currency: profile.currency,
        }));
        alert('✅ Profile saved!');
      } else {
        alert('❌ Failed to save profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('❌ Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert('❌ Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      if (res.ok) {
        alert('✅ Password changed!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert('❌ Failed to change password');
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
    <div className="flex gap-6">
      {/* Left Sidebar */}
      <div className="w-48 flex-shrink-0">
        <div className="sticky top-4 space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'profile'
                ? 'bg-primary text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            👤 Profile
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'categories'
                ? 'bg-primary text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            🏷️ Categories
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'accounts'
                ? 'bg-primary text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            🏦 Accounts
          </button>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div>
            <h1 className="text-3xl font-bold mb-8 text-gray-900">👤 Basic Profile</h1>

            <div className="card max-w-2xl">
              <form className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    className="input"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    disabled
                    className="input bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    placeholder="+1 (555) 000-0000"
                    className="input"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={profile.country}
                    onChange={handleProfileChange}
                    placeholder="United States"
                    className="input"
                  />
                </div>

                {/* City, State, Zip */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={profile.city}
                      onChange={handleProfileChange}
                      placeholder="San Francisco"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={profile.state}
                      onChange={handleProfileChange}
                      placeholder="CA"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zip
                    </label>
                    <input
                      type="text"
                      name="zip"
                      value={profile.zip}
                      onChange={handleProfileChange}
                      placeholder="94102"
                      className="input"
                    />
                  </div>
                </div>

                {/* Preferred Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Currency
                  </label>
                  <select name="currency" value={profile.currency} onChange={handleProfileChange} className="input">
                    <option value="USD">USD - United States Dollar</option>
                  </select>
                </div>

                {/* Annual Income */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Income <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="number"
                    name="annualIncome"
                    value={profile.annualIncome}
                    onChange={handleProfileChange}
                    placeholder="50000"
                    className="input"
                  />
                </div>

                {/* Employment Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Status
                  </label>
                  <select name="employmentStatus" value={profile.employmentStatus} onChange={handleProfileChange} className="input">
                    <option value="Employee">Employee</option>
                    <option value="Self-employed">Self-employed</option>
                    <option value="Retired">Retired</option>
                    <option value="Student">Student</option>
                  </select>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select name="timezone" value={profile.timezone} onChange={handleProfileChange} className="input">
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Asia/Shanghai">Shanghai</option>
                    <option value="Asia/Hong_Kong">Hong Kong</option>
                    <option value="Asia/Singapore">Singapore</option>
                    <option value="Australia/Sydney">Sydney</option>
                    <option value="India/Kolkata">India</option>
                  </select>
                </div>

                {/* Save Button */}
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>

              {/* Change Password Section */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-bold mb-6 text-gray-900">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="input"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-bold mb-6 text-gray-900">🔔 Notification Preferences</h3>
                
                {/* Email Notifications */}
                <div className="mb-8">
                  <h4 className="font-semibold text-gray-800 mb-4">Email Notifications</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="emailTransactions"
                        checked={notifications.emailTransactions}
                        onChange={handleNotificationChange}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-700">Notify me about new transactions</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="emailBills"
                        checked={notifications.emailBills}
                        onChange={handleNotificationChange}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-700">Notify me about upcoming bills</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="emailBudgets"
                        checked={notifications.emailBudgets}
                        onChange={handleNotificationChange}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-700">Notify me when budget limits are reached</span>
                    </label>
                  </div>
                </div>

                {/* SMS Notifications */}
                <div className="mb-8">
                  <h4 className="font-semibold text-gray-800 mb-4">SMS Notifications</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="smsTransactions"
                        checked={notifications.smsTransactions}
                        onChange={handleNotificationChange}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-700">Notify me about new transactions</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="smsBills"
                        checked={notifications.smsBills}
                        onChange={handleNotificationChange}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-700">Notify me about upcoming bills</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="smsBudgets"
                        checked={notifications.smsBudgets}
                        onChange={handleNotificationChange}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-700">Notify me when budget limits are reached</span>
                    </label>
                  </div>
                </div>

                {/* Push Notifications */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">Push Notifications</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="pushTransactions"
                        checked={notifications.pushTransactions}
                        onChange={handleNotificationChange}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-700">Notify me about new transactions</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="pushBills"
                        checked={notifications.pushBills}
                        onChange={handleNotificationChange}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-700">Notify me about upcoming bills</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="pushBudgets"
                        checked={notifications.pushBudgets}
                        onChange={handleNotificationChange}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-700">Notify me when budget limits are reached</span>
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="btn-primary mt-6"
                >
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>

              {/* Danger Zone */}
              <div className="mt-12 pt-8 border-t border-red-200 border-2 rounded-lg p-6 bg-red-50">
                <h3 className="text-lg font-bold mb-4 text-red-600">⚠️ Danger Zone</h3>
                <p className="text-gray-700 mb-6">
                  Once you delete your account, there is no going back. All your data will be permanently removed.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you absolutely sure? This cannot be undone.')) {
                      alert('Account deletion feature coming soon');
                    }
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <h1 className="text-3xl font-bold mb-8 text-gray-900">🏷️ Categories</h1>
            <div className="card max-w-2xl">
              <p className="text-gray-600">Category management coming soon</p>
            </div>
          </div>
        )}

        {/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <div>
            <h1 className="text-3xl font-bold mb-8 text-gray-900">🏦 Accounts</h1>
            <div className="card max-w-2xl">
              {userId && <BankLink userId={userId} onSuccess={() => alert('✅ Bank account linked!')} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
