# !!! IMPORTANT - READ BEFORE DEPLOYMENT !!!

## Environment Variables Template

Copy these to Vercel Dashboard → Settings → Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://jcczperyfdjwvcjiqrvj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key_from_supabase>
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key_from_supabase>

# App URL (Update after first deploy!)
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app

# Email Service
RESEND_API_KEY=re_SudLtS5g_KZYvSDtE1d8jSE3co4NnTPZQ
```

## Where to find Supabase keys:
1. Go to https://supabase.com/dashboard/project/jcczperyfdjwvcjiqrvj/settings/api
2. Copy "Project URL" → NEXT_PUBLIC_SUPABASE_URL
3. Copy "anon public" key → NEXT_PUBLIC_SUPABASE_ANON_KEY  
4. Copy "service_role" key → SUPABASE_SERVICE_ROLE_KEY

## After First Deploy:
1. Copy your Vercel URL (e.g., hustle-xyz.vercel.app)
2. Update NEXT_PUBLIC_APP_URL in Vercel environment variables
3. Go to Supabase → Authentication → URL Configuration
4. Add to "Site URL": https://your-app.vercel.app
5. Add to "Redirect URLs": https://your-app.vercel.app/auth/callback
6. Redeploy from Vercel dashboard

## Quick Deploy Steps:
1. Push latest code to GitHub (already done ✅)
2. Go to https://vercel.com/new
3. Import GitHub repo: NurchikLuchshe/Hustle
4. Add environment variables above
5. Click Deploy
6. Wait 2-3 minutes
7. Test your app!

Good luck! 🚀
