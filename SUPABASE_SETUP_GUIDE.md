# Supabase Setup Guide for WealthWallet

This guide will walk you through setting up Supabase in your Next.js project.

## Step 1: Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click on **Settings** (gear icon) in the left sidebar
4. Click on **API** under Project Settings
5. You'll see two important values:
   - **Project URL** - This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key - This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 2: Create Environment Variables

1. Create a file named `.env.local` in the root of your project (same level as `package.json`)
2. Add the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Replace `your-project-url-here` with your actual Project URL
4. Replace `your-anon-key-here` with your actual anon public key

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example
```

## Step 3: Verify the Setup

The following files have been created for you:

### TypeScript Types
- `types/database.ts` - TypeScript types for all your database tables (transactions, budgets, profiles)

### Supabase Clients
- `lib/supabase/client.ts` - Client-side Supabase client (use in Client Components)
- `lib/supabase/server.ts` - Server-side Supabase client (use in Server Components, Route Handlers)
- `lib/supabase/middleware.ts` - Middleware helper for session management

### Middleware
- `middleware.ts` - Next.js middleware that automatically refreshes user sessions

## Step 4: Usage Examples

### In Client Components

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function MyComponent() {
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  return <div>User: {user?.email}</div>;
}
```

### In Server Components

```typescript
import { createClient } from '@/lib/supabase/server';

export default async function ServerComponent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <div>User: {user?.email}</div>;
}
```

### Fetching Data

```typescript
import { createClient } from '@/lib/supabase/server';
import type { Transaction } from '@/types/database';

export default async function TransactionsList() {
  const supabase = await createClient();
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return <div>Error loading transactions</div>;
  }

  return (
    <ul>
      {transactions?.map((transaction: Transaction) => (
        <li key={transaction.id}>
          {transaction.category}: ${transaction.amount}
        </li>
      ))}
    </ul>
  );
}
```

## Step 5: Test the Connection

1. Make sure your `.env.local` file is created with the correct values
2. Restart your development server:
   ```bash
   npm run dev
   ```
3. The middleware will automatically handle session management
4. You can now start building authentication pages and data fetching

## Next Steps

Now that Supabase is set up, you can:

1. **Create authentication pages** (`/app/auth/login.tsx`, `/app/auth/signup.tsx`)
2. **Build the dashboard** to display transactions and budgets
3. **Create forms** for adding transactions and budgets
4. **Implement data visualizations** using the fetched data

## Troubleshooting

### "NEXT_PUBLIC_SUPABASE_URL is not defined"
- Make sure `.env.local` exists in the root directory
- Make sure the variable names are exactly `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your development server after creating/modifying `.env.local`

### "Invalid API key"
- Double-check that you copied the correct anon key (not the service_role key)
- Make sure there are no extra spaces or quotes in your `.env.local` file

### Type errors
- Make sure `types/database.ts` exists and is properly formatted
- Check that your `tsconfig.json` has the path alias `@/*` configured (it should be already set up)

## Security Notes

- The `anon` key is safe to expose in client-side code (it's public)
- Never commit `.env.local` to version control (it should be in `.gitignore`)
- Row-Level Security (RLS) policies in your database ensure users can only access their own data

