# Supabase Setup Guide

## 1. Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose organization, name project "hanquocoi"
4. Select region (closest to your users - Singapore for Vietnam)
5. Wait for project to be created

## 2. Get API Keys
In your Supabase dashboard:
1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJ...`

## 3. Run Schema SQL
1. Go to **SQL Editor** in Supabase dashboard
2. Click **New Query**
3. Copy contents of `supabase/schema.sql`
4. Paste and click **Run**

## 4. Setup Vercel Environment Variables
Add these to your Vercel project:

```
VITE_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## 5. Deploy Edge Functions (Optional)
For Edge Functions to work, you need Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref xxxxx

# Deploy functions
supabase functions deploy
```

## 6. Setup Auth Providers (Optional)
For Google/Email auth:
1. Go to **Authentication** → **Providers**
2. Enable **Email** (with Confirmations disabled for easier testing)
3. Enable **Google** (requires Google OAuth setup)

## 7. Enable Realtime (Optional)
For real-time features:
1. Go to **Database** → **Replication**
2. Enable Realtime for tables you want to subscribe to

## Tables Created

- `user_profiles` - User information, VIP status, admin status
- `study_progress` - User learning progress, streaks
- `exam_results` - Test results
- `leaderboard` - Rankings
- `vip_revenue_log` - VIP purchase history
- `admin_settings` - Admin configuration
- `community_posts` - Forum posts
- `comments` - Post comments
- `notifications` - User notifications
- `zalo_reminders` - Zalo reminder settings
- `daily_vocab` - Daily vocabulary sets
- `study_history` - Study tracking
- `bug_reports` - Bug tracking
- `feedback` - User feedback
- `coupons` - Discount codes

## Security

All tables have Row Level Security (RLS) enabled:
- Users can only access their own data
- Admins can access all data
- Public tables (leaderboard, community) are readable by all

## Edge Functions

Located in `supabase/functions/`:
- `admin-grant-vip` - Grant/revoke VIP status
- `vip-expiry-scheduler` - Check and expire VIP
- `zalo-reminder-scheduler` - Send Zalo reminders
- `send-email-resend` - Send emails via Resend
