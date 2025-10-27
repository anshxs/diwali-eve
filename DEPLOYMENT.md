# Deployment Checklist

## Pre -Deployment Setup

### 1. Supabase Setup
- [ ] Create Supabase project
- [ ] Run the SQL script from `supabase-setup.sql`
- [ ] Get Supabase URL and anon key
- [ ] Test database connection

### 2. GitHub Setup
- [ ] Create GitHub repository for image storage
- [ ] Generate Personal Access Token with `repo` permissions
- [ ] Test repository access
- [ ] Create initial directory structure if needed

### 3. Environment Variables
Copy `.env.example` to `.env.local` and fill in:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_GITHUB_TOKEN`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_NAME`

### 4. Local Testing
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Test registration flow
- [ ] Test payment screenshot upload
- [ ] Test ticket generation
- [ ] Test local storage functionality
- [ ] Test admin dashboard at `/admin`

## Production Deployment

### Vercel (Recommended)
1. [ ] Push code to GitHub repository
2. [ ] Connect Vercel to your GitHub repo
3. [ ] Add environment variables in Vercel dashboard
4. [ ] Deploy and test

### Environment Variables for Production
In your deployment platform, set:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GITHUB_TOKEN=your_github_token
NEXT_PUBLIC_GITHUB_REPO_OWNER=your_github_username
NEXT_PUBLIC_GITHUB_REPO_NAME=your_repo_name
```

### 5. Post-Deployment Testing
- [ ] Test registration form on production
- [ ] Test UPI payment flow
- [ ] Test image upload functionality
- [ ] Test ticket generation and storage
- [ ] Test admin dashboard
- [ ] Test responsive design on mobile devices
- [ ] Test database insertion and retrieval

## Security Checklist

### Database Security
- [ ] Row Level Security (RLS) enabled
- [ ] Proper policies configured
- [ ] No sensitive data in public tables
- [ ] Admin access properly restricted

### File Upload Security
- [ ] GitHub token permissions minimal (repo only)
- [ ] File size limits implemented
- [ ] File type validation in place
- [ ] No direct file system access

### Environment Variables
- [ ] No hardcoded secrets in code
- [ ] All sensitive data in environment variables
- [ ] Environment variables properly prefixed for client-side use

## Performance Checklist

### Frontend Optimization
- [ ] Images optimized and compressed
- [ ] Components properly optimized
- [ ] Loading states implemented
- [ ] Error handling in place

### Database Optimization
- [ ] Proper indexes created
- [ ] Query optimization
- [ ] Connection pooling configured

## Monitoring Setup

### Analytics (Optional)
- [ ] Add Google Analytics or similar
- [ ] Track registration conversions
- [ ] Monitor form abandonment

### Error Monitoring (Optional)  
- [ ] Set up Sentry or similar
- [ ] Monitor API errors
- [ ] Track user issues

## Launch Preparation

### Content Review
- [ ] Event details are correct
- [ ] Contact information is accurate
- [ ] Pricing information is correct
- [ ] Terms and conditions added if needed

### Communication Plan
- [ ] Social media posts prepared
- [ ] Email templates ready for confirmations
- [ ] QR codes generated for promotion
- [ ] Registration link tested and shortened

### Day of Event
- [ ] Admin dashboard access confirmed
- [ ] Payment verification process in place
- [ ] Backup contact methods ready
- [ ] Entry procedure defined

## Troubleshooting Guide

### Common Issues
1. **Supabase Connection Errors**
   - Check URL and key
   - Verify RLS policies
   - Check network connectivity

2. **GitHub Upload Failures**
   - Verify token permissions
   - Check repository access
   - Validate file format

3. **UPI Payment Issues**
   - Verify UPI ID format
   - Test on different devices
   - Check deep link handling

4. **Form Validation Problems**
   - Check required field validation
   - Verify data types
   - Test edge cases

### Support Contacts
- Technical: [Your email]
- Event: shreegarden.roorkee@gmail.com
- Emergency: +918439100899

---

**Remember**: Always test thoroughly in a staging environment before going live!
