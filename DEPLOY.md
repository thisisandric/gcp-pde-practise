# Deployment Guide - GCP PDE Learning Platform

Deploy to Vercel in **5 minutes** ⚡

## Quick Deploy (Easiest)

### Step 1: Prepare Your Code
```bash
cd gcp-pde-platform
git init
git add .
git commit -m "GCP PDE Learning Platform"
```

### Step 2: Push to GitHub
```bash
# Create new repository at github.com
# Then:
git remote add origin https://github.com/YOUR_USERNAME/gcp-pde-platform.git
git push -u origin main
```

### Step 3: Deploy to Vercel
1. Go to https://vercel.com
2. Click **"Add New"** → **"Project"**
3. Select your GitHub repository
4. Click **"Deploy"**
5. ✅ Done! Your site is live in ~30 seconds

**Your URL:** `https://gcp-pde-platform-{random}.vercel.app`

---

## Vercel CLI Deploy (Alternative)

### Step 1: Install CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
cd gcp-pde-platform
vercel
```

### Step 3: Follow Prompts
- Link to your Vercel account
- Accept default settings
- Confirm deployment

✅ Your site is live!

---

## Custom Domain (Optional)

1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Domains"**
3. Add your domain (e.g., `gcp-pde.com`)
4. Follow DNS setup instructions
5. Done! ✅

---

## Automatic Deployments

Once linked to GitHub:
- Every **pull request** → Preview deployment
- Every **merge to main** → Production deployment
- No additional setup needed!

---

## Environment Variables (Optional)

Add to Vercel dashboard if needed:

1. Project → Settings → Environment Variables
2. Add `KEY=value` pairs
3. Redeploy

(This project doesn't require any environment variables)

---

## Post-Deployment

### Test Your Site
- Open your Vercel URL
- Test quiz functionality
- Check mobile responsiveness
- Verify dark mode

### Monitor Performance
- Vercel dashboard shows analytics
- Check Core Web Vitals
- Monitor deployment logs

### Update Content
- Edit `app/data/quiz.ts`
- Push to GitHub
- Vercel auto-deploys within 30 seconds

---

## Troubleshooting

**Site not loading?**
- Check Vercel deployment status
- Look at build logs
- Ensure all files committed to Git

**Build fails?**
- Run `npm run build` locally to debug
- Check for TypeScript errors
- Verify all dependencies in package.json

**Need to rollback?**
- Vercel keeps deployment history
- Click previous deployment
- Click "Promote to Production"

---

## Cost

✅ **Free!**

- Vercel free tier includes:
  - 100 GB/month bandwidth
  - Unlimited deployments
  - Built-in CI/CD
  - Custom domains
  - Analytics

No credit card required (unless you exceed free limits)

---

## Next Steps

1. ✅ Deploy to Vercel
2. 📧 Share URL with friends studying for GCP cert
3. 🎓 Use the platform for daily practice
4. 🚀 After passing exam, contribute improvements back

---

## Support

- Vercel docs: https://vercel.com/docs
- GitHub help: https://docs.github.com
- Next.js docs: https://nextjs.org/docs

**Happy deploying! 🎉**
