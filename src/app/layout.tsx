import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BudgetHub - Manage Your Finances",
  description: "Track expenses, set budgets, and achieve your financial goals with BudgetHub",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
}
