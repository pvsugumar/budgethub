# Plaid Integration Setup

## Current Issue
❌ "Plaid configuration incomplete" error when trying to link bank account

## Required Environment Variables

You need to add these to Vercel for Plaid to work:

### 1. PLAID_CLIENT_ID
- Get from: https://dashboard.plaid.com/team/keys
- Your current value: `a1b2c3d4e5f6...` (from .env.local)

### 2. PLAID_SECRET
- Get from: https://dashboard.plaid.com/team/keys
- Your current value: (from .env.local)

### 3. PLAID_ENV
- Value: `sandbox` (for testing)

## Steps to Add to Vercel

1. Go to: https://vercel.com/budgethub/settings/environment-variables
2. Add each variable:
   - Name: `PLAID_CLIENT_ID`
   - Value: Your actual client ID from Plaid
   - Select: Production, Preview, Development (all)
   - Click "Save"

3. Repeat for `PLAID_SECRET` and `PLAID_ENV`

4. After adding variables, go to:
   - https://vercel.com/budgethub/deployments
   - Click the most recent deployment
   - Click "Redeploy" button

5. Wait 3-5 minutes for deployment to complete

## Testing
After deployment:
1. Go to https://budgethub.vercel.app/dashboard/settings
2. Click "🏦 Link Bank Account"
3. Should now see Plaid modal (not error)
4. Use sandbox credentials: `user_good` / `pass_good`

## Questions?
Check your .env.local file for the exact values to use.
