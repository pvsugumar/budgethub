'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type SettingsTab = 'profile' | 'accounts' | 'notifications' | 'security';

export default function SettingsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [userInitial, setUserInitial] = useState('S');
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
    setUserInitial(userName?.charAt(0).toUpperCase() || 'S');
    
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

  const handleNotificationChange = (field: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [field]: !prev[field],
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
          newPassword: passwordForm.newPassword,
        }),
      });
      if (res.ok) {
        alert('✅ Password changed!');
        setPasswordForm({ newPassword: '', confirmPassword: '' });
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

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-emerald-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="flex gap-8">
      {/* Left Sidebar Navigation */}
      <div className="w-64 flex-shrink-0">
        {/* Profile Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 sticky top-4">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl font-bold mb-4">
              {userInitial}
            </div>
            <p className="text-lg font-semibold text-gray-900">{profile.name || 'User'}</p>
            <p className="text-sm text-gray-500">{profile.email}</p>
            <div className="mt-6 pt-6 border-t border-gray-200 w-full space-y-3 text-sm">
              <div className="flex justify-between items-center text-gray-700">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{profile.country || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center text-gray-700">
                <span className="text-gray-600">Currency:</span>
                <span className="font-medium">{profile.currency}</span>
              </div>
              <div className="flex justify-between items-center text-gray-700">
                <span className="text-gray-600">Timezone:</span>
                <span className="font-medium text-xs">{profile.timezone.split('/')[1] || 'ET'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition ${
              activeTab === 'profile'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            👤 Profile
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition ${
              activeTab === 'accounts'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            🏦 Accounts
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition ${
              activeTab === 'notifications'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            🔔 Notifications
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition ${
              activeTab === 'security'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            🔒 Security
          </button>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 max-w-3xl">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600 text-sm mt-1">Manage your personal information</p>
            </div>

            {/* Basic Information Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number <span className="text-gray-400">(optional)</span></label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Location</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={profile.country}
                    onChange={handleProfileChange}
                    placeholder="United States"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={profile.city}
                      onChange={handleProfileChange}
                      placeholder="San Francisco"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      value={profile.state}
                      onChange={handleProfileChange}
                      placeholder="CA"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                    <input
                      type="text"
                      name="zip"
                      value={profile.zip}
                      onChange={handleProfileChange}
                      placeholder="94102"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Preferences</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Currency</label>
                  <select 
                    name="currency" 
                    value={profile.currency} 
                    onChange={handleProfileChange} 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="USD">USD - United States Dollar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select 
                    name="timezone" 
                    value={profile.timezone} 
                    onChange={handleProfileChange} 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Annual Income <span className="text-gray-400">(optional)</span></label>
                  <input
                    type="number"
                    name="annualIncome"
                    value={profile.annualIncome}
                    onChange={handleProfileChange}
                    placeholder="50000"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employment Status</label>
                  <select 
                    name="employmentStatus" 
                    value={profile.employmentStatus} 
                    onChange={handleProfileChange} 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Self-employed">Self-employed</option>
                    <option value="Retired">Retired</option>
                    <option value="Student">Student</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 w-full"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
              <p className="text-gray-600 text-sm mt-1">Manage your connected bank accounts</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
              <p className="text-gray-600">Bank account management coming soon</p>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 text-sm mt-1">Control how you receive notifications</p>
            </div>

            {/* Email Notifications */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">📧 Email Notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">Transaction Alerts</p>
                    <p className="text-sm text-gray-600">Get notified of new transactions</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications.emailTransactions}
                    onChange={() => handleNotificationChange('emailTransactions')}
                  />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">Bill Reminders</p>
                    <p className="text-sm text-gray-600">Get reminded about upcoming bills</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications.emailBills}
                    onChange={() => handleNotificationChange('emailBills')}
                  />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">Budget Alerts</p>
                    <p className="text-sm text-gray-600">Get alerted when budgets reach limits</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications.emailBudgets}
                    onChange={() => handleNotificationChange('emailBudgets')}
                  />
                </div>
              </div>
            </div>

            {/* SMS Notifications */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">📱 SMS Notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">Transaction Alerts</p>
                    <p className="text-sm text-gray-600">Get notified of new transactions</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications.smsTransactions}
                    onChange={() => handleNotificationChange('smsTransactions')}
                  />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">Bill Reminders</p>
                    <p className="text-sm text-gray-600">Get reminded about upcoming bills</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications.smsBills}
                    onChange={() => handleNotificationChange('smsBills')}
                  />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">Budget Alerts</p>
                    <p className="text-sm text-gray-600">Get alerted when budgets reach limits</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications.smsBudgets}
                    onChange={() => handleNotificationChange('smsBudgets')}
                  />
                </div>
              </div>
            </div>

            {/* Push Notifications */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">🔔 Push Notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">Transaction Alerts</p>
                    <p className="text-sm text-gray-600">Get notified of new transactions</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications.pushTransactions}
                    onChange={() => handleNotificationChange('pushTransactions')}
                  />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">Bill Reminders</p>
                    <p className="text-sm text-gray-600">Get reminded about upcoming bills</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications.pushBills}
                    onChange={() => handleNotificationChange('pushBills')}
                  />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">Budget Alerts</p>
                    <p className="text-sm text-gray-600">Get alerted when budgets reach limits</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications.pushBudgets}
                    onChange={() => handleNotificationChange('pushBudgets')}
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 w-full"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Security</h1>
              <p className="text-gray-600 text-sm mt-1">Manage your account security</p>
            </div>

            {/* Change Password Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 w-full"
                >
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-2xl border-2 border-red-200 p-6">
              <h2 className="text-lg font-semibold text-red-600 mb-2">⚠️ Danger Zone</h2>
              <p className="text-sm text-red-600 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
              <button
                className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
