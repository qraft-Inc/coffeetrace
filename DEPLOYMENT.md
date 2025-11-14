# 🚀 Coffee Trace - Deployment Checklist

## ✅ Pre-Deployment Checklist

### Code Quality
- [ ] All TypeScript/ESLint errors resolved
- [ ] No console.errors in production code
- [ ] Environment variables documented
- [ ] API routes tested locally
- [ ] Authentication flows tested

### Database
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with proper permissions
- [ ] IP whitelist configured (0.0.0.0/0 for Netlify)
- [ ] Connection string tested
- [ ] Indexes created on models

### Environment Variables
- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `NEXTAUTH_SECRET` - 32+ character random string
- [ ] `NEXTAUTH_URL` - Production URL
- [ ] `NEXT_PUBLIC_MAPBOX_TOKEN` - Mapbox public token (optional)
- [ ] `CLOUDINARY_*` - Image upload credentials (optional)

### Security
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] MongoDB password is strong
- [ ] No secrets committed to Git
- [ ] `.env.local` in `.gitignore`
- [ ] API routes have proper authentication
- [ ] Role-based access control implemented

### Netlify Configuration
- [ ] `netlify.toml` configured
- [ ] Build command: `npm run build`
- [ ] Publish directory: `.next`
- [ ] Node version specified (18+)
- [ ] @netlify/plugin-nextjs installed

---

## 🌐 Netlify Deployment Steps

### 1. Prepare Repository
```powershell
# Ensure all changes are committed
git status
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Create Netlify Site
1. Log in to [Netlify](https://app.netlify.com/)
2. Click **Add new site** → **Import an existing project**
3. Connect to **GitHub**
4. Select `coffeetrace` repository
5. Verify build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Functions directory: `netlify/functions`

### 3. Configure Environment Variables
In Netlify Dashboard → **Site settings** → **Environment variables**:

**Required:**
```
MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/coffeetrace
NEXTAUTH_SECRET = [generate-random-32-chars]
NEXTAUTH_URL = https://your-site.netlify.app
```

**Optional:**
```
NEXT_PUBLIC_MAPBOX_TOKEN = pk.your_mapbox_token
CLOUDINARY_CLOUD_NAME = your-cloud-name
CLOUDINARY_API_KEY = your-api-key
CLOUDINARY_API_SECRET = your-api-secret
```

### 4. Deploy
Click **Deploy site** button.

Monitor build progress in **Deploys** tab.

### 5. Configure Custom Domain (Optional)
1. Go to **Domain settings**
2. Click **Add custom domain**
3. Follow DNS configuration instructions
4. Enable HTTPS (automatic with Let's Encrypt)

---

## 🧪 Post-Deployment Testing

### Smoke Tests
- [ ] Homepage loads correctly
- [ ] Sign up flow works (farmer & buyer)
- [ ] Sign in flow works
- [ ] Dashboard redirects work
- [ ] Marketplace page loads
- [ ] Public trace page works (create a test lot first)
- [ ] API endpoints respond correctly

### User Flows
1. **Farmer Registration & Lot Creation**
   - [ ] Sign up as farmer
   - [ ] Access farmer dashboard
   - [ ] Create a test lot
   - [ ] View lot trace page
   - [ ] Create a marketplace listing

2. **Buyer Purchase Flow**
   - [ ] Sign up as buyer
   - [ ] Browse marketplace
   - [ ] Make an offer
   - [ ] Receive offer response

### Performance
- [ ] Lighthouse score > 80
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 4s
- [ ] API response times < 500ms

---

## 🔍 Monitoring & Maintenance

### Regular Checks
- Monitor Netlify Function logs
- Check MongoDB Atlas metrics
- Review error logs
- Monitor bandwidth usage
- Check uptime status

### Backup Strategy
- MongoDB Atlas automatic backups (enabled by default)
- Regular Git commits for code
- Document database schema changes

---

## 🐛 Common Issues & Solutions

### Build Fails on Netlify
**Error:** `Module not found`
- **Solution:** Ensure all dependencies in `package.json`
- Run `npm install` locally to verify

**Error:** `Environment variable not defined`
- **Solution:** Add missing env vars in Netlify dashboard
- Redeploy after adding variables

### API Routes Return 500
**Error:** MongoDB connection timeout
- **Solution:** Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string format

**Error:** `Unauthorized`
- **Solution:** Verify `NEXTAUTH_SECRET` is set
- Clear cookies and re-login

### Map Not Loading
- **Solution:** Add `NEXT_PUBLIC_MAPBOX_TOKEN`
- Verify token is public (starts with `pk.`)
- Check browser console for errors

---

## 📊 Metrics to Track

### User Metrics
- Total users (farmers, buyers, cooperatives)
- Active users (monthly/weekly)
- New registrations per week
- User retention rate

### Platform Metrics
- Total lots created
- Total listings posted
- Offers made vs. accepted
- Average transaction value
- Total coffee volume traded

### Technical Metrics
- API response times
- Error rates
- Page load times
- Function execution times
- Database query performance

---

## 🔄 Continuous Deployment

### Auto-Deploy from GitHub
Netlify automatically deploys when you push to `main`:

```powershell
# Make changes
git add .
git commit -m "Add new feature"
git push origin main

# Netlify deploys automatically
```

### Preview Deployments
Pull requests automatically get preview URLs for testing.

### Rollback
If deployment fails:
1. Go to **Deploys** tab
2. Find last successful deploy
3. Click **Publish deploy**

---

## 📞 Support Resources

- **Netlify Docs:** https://docs.netlify.com/
- **MongoDB Atlas:** https://docs.atlas.mongodb.com/
- **Next.js:** https://nextjs.org/docs
- **Coffee Trace Issues:** GitHub Issues
- **Coffee Trap Agencies:** http://coffeetrapagencies.com

---

## ✨ Post-Launch Checklist

- [ ] Share platform with early users
- [ ] Collect feedback
- [ ] Monitor error rates
- [ ] Plan feature roadmap
- [ ] Set up analytics (Google Analytics, Plausible)
- [ ] Configure uptime monitoring (UptimeRobot, Pingdom)
- [ ] Create user documentation
- [ ] Set up support email/chat

---

**Last Updated:** November 13, 2025  
**Platform Version:** 0.1.0  
**Maintained by:** Coffee Trap Agencies Ltd
