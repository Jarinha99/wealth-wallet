# Supabase Database Setup Instructions

## Step-by-Step Guide

### 1. Access Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query** to create a new SQL script

### 2. Run the Setup Script
1. Copy the entire contents of `supabase-setup.sql`
2. Paste it into the SQL Editor
3. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

### 3. Verify the Setup

#### Check Tables
1. Go to **Table Editor** in the left sidebar
2. You should see three new tables:
   - `transactions`
   - `budgets`
   - `profiles`

#### Check Row-Level Security
1. In the Table Editor, click on the `transactions` table
2. Look for a shield icon (🛡️) indicating RLS is enabled
3. Click on the **Policies** tab to see all the policies we created
4. Repeat for the `budgets` and `profiles` tables

### 4. Test the Setup (Optional)

You can test that RLS is working by:

1. Creating a test user in the Authentication section
2. Using the Supabase client to insert a test transaction
3. Verifying that users can only see their own data

## What Was Created

### Tables

**transactions**
- Stores all income and expense entries
- Linked to users via `user_id`
- Includes validation (amount > 0, type must be 'income' or 'expense')

**budgets**
- Stores monthly/yearly budget limits per category
- Unique constraint on (user_id, category, period) to prevent duplicates
- Default period is 'monthly'

**profiles**
- Stores user profile information (username, full name)
- One profile per user (unique user_id constraint)
- Linked to auth.users for authentication

### Security

- **Row-Level Security (RLS)** enabled on all tables
- **Policies** ensure users can only:
  - View their own data
  - Insert their own data
  - Update their own data
  - Delete their own data

### Performance

- **Indexes** created on frequently queried columns:
  - `user_id` (for filtering by user)
  - `date` (for date range queries)
  - `type` (for filtering income vs expenses)
  - `category` (for category-based queries)
  - `username` (for profile lookups)

### Automation

- **Triggers** automatically update `updated_at` timestamp when records are modified

## Next Steps

After running this script, you're ready to:
1. Set up the Supabase client in your Next.js app
2. Create authentication pages (login/signup)
3. Build the dashboard and data entry forms
4. Implement data fetching and visualization

## Troubleshooting

If you encounter any errors:

1. **"relation already exists"**: The tables might already be created. You can drop them first:
   ```sql
   DROP TABLE IF EXISTS transactions CASCADE;
   DROP TABLE IF EXISTS budgets CASCADE;
   DROP TABLE IF EXISTS profiles CASCADE;
   ```
   Then re-run the setup script.

2. **Permission errors**: Make sure you're running the script as a database administrator (which you should be in the Supabase dashboard).

3. **RLS not working**: Verify that RLS is enabled by checking the table settings in the Table Editor.

