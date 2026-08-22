'use client';

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">💰 BudgetHub</div>
          <div className="flex gap-4">
            <Link href="/auth/login" className="btn btn-secondary">
              Login
            </Link>
            <Link href="/auth/signup" className="btn btn-primary">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Take Control of Your Finances
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Track expenses, set budgets, and achieve your financial goals with BudgetHub.
          </p>
          <Link href="/auth/signup" className="btn btn-primary text-lg px-8 py-3">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="📊"
              title="Transaction Tracking"
              description="Automatically categorize and track your income and expenses"
            />
            <FeatureCard
              icon="🎯"
              title="Smart Budgets"
              description="Set spending limits by category and get real-time updates"
            />
            <FeatureCard
              icon="📈"
              title="Analytics Dashboard"
              description="Visualize your spending patterns with beautiful charts"
            />
            <FeatureCard
              icon="📝"
              title="Bill Reminders"
              description="Never miss a bill payment with smart reminders"
            />
            <FeatureCard
              icon="🎁"
              title="Savings Goals"
              description="Track progress towards your financial goals"
            />
            <FeatureCard
              icon="🔐"
              title="Secure & Private"
              description="Your data is encrypted and stored securely"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Budget Planner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="card text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
