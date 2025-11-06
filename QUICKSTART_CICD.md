# Quick Start: GitHub Actions CI/CD

## 🚀 Get Your Pipelines Running in 15 Minutes

### Prerequisites Checklist

- ✅ GitHub repository created
- ✅ Expo account created
- ✅ EAS project configured (✅ Done: d2b85b83-45b9-4e6a-bcc1-6736fc9d83fe)

---

## Step 1: Get Your Expo Token (5 minutes)

### Generate Token

```bash
# Make sure you're logged in
npx eas-cli whoami

# Go to your browser
open https://expo.dev/accounts/[your-username]/settings/access-tokens
```

### Create Token

1. Click "Create Token"
2. Name it: `GitHub Actions CI/CD`
3. Copy the token (you won't see it again!)

---

## Step 2: Add GitHub Secret (2 minutes)

### Navigate to Secrets

```bash
# Go to your repo settings
open https://github.com/[your-username]/[repo-name]/settings/secrets/actions
```

### Add Secret

1. Click "New repository secret"
2. Name: `EXPO_TOKEN`
3. Value: [paste the token from Step 1]
4. Click "Add secret"

---

## Step 3: Test Your Pipeline (5 minutes)

### Commit and Push

```bash
# Make sure all files are committed
git add .
git commit -m "chore: add GitHub Actions CI/CD pipelines"
git push origin dev  # or main
```

### Watch It Work

```bash
# Open GitHub Actions tab
open https://github.com/[your-username]/[repo-name]/actions
```

You should see:

- ✅ Tests running
- ✅ Type checking
- ✅ Linting
- ✅ Preview build starting (if on PR)

---

## Step 4: Verify Everything Works (3 minutes)

### Check CI Workflow

Go to Actions tab and click on your workflow run:

- Job 1: `test` should pass ✅
  - Lint ✅
  - Type check ✅
  - Tests ✅
  - Coverage uploaded ✅

### Check Build (if triggered)

If you pushed to `dev` branch:

- Job 2: `preview` should start
  - EAS build starts ✅
  - Takes ~5-10 minutes

---

## 🎉 You're Done!

Your CI/CD pipeline is now:

- ✅ **Automatically testing** every push
- ✅ **Building previews** for pull requests
- ✅ **Ready for production** releases

---

## What Happens Now?

### Every Push to dev/main

```bash
git push origin dev
```

**Triggers:**

- ✅ Lint + Type Check + Tests
- ✅ EAS preview build (if on dev)

### Every Pull Request

```bash
gh pr create --base main
```

**Triggers:**

- ✅ All tests
- ✅ Preview build
- ✅ Comment on PR with build link

### Every Release Tag

```bash
git tag v1.0.0
git push --tags
```

**Triggers:**

- ✅ Production build (iOS + Android)
- ✅ Submit to stores (optional)
- ✅ GitHub release with changelog

---

## Optional: Production Setup

### For iOS App Store (Later)

Add these secrets when ready:

- `APPLE_ID` - Your Apple developer email
- `APPLE_APP_SPECIFIC_PASSWORD` - Generate from appleid.apple.com

### For Google Play Store (Later)

Add these secrets when ready:

- `ANDROID_KEYSTORE_PASSWORD` - Your keystore password
- `ANDROID_KEY_PASSWORD` - Your key password

---

## Troubleshooting

### Pipeline Fails with "Invalid credentials"

- ✅ Check `EXPO_TOKEN` secret is set
- ✅ Verify token hasn't expired
- ✅ Make sure you copied it correctly

### Build Fails

- ✅ Check EAS project is configured: `npx eas-cli project:info`
- ✅ Verify build profiles exist in `eas.json`
- ✅ Check EAS build logs: expo.dev/accounts/[username]/projects/[project]/builds

### Tests Fail

- ✅ Run tests locally: `npm test`
- ✅ Fix any failing tests
- ✅ Commit and push again

---

## 📊 Cost Breakdown

### GitHub Actions (Free Tier)

- **Private repos:** 2,000 minutes/month FREE
- **Public repos:** Unlimited FREE
- **Your usage:** ~10 min/workflow = 200 workflows/month FREE

### EAS Builds

- **Free plan:** 30 builds/month
- **Typical usage:** 5-10 builds/month
- **Cost:** $0/month on free plan

**Total monthly cost: $0** 🎉

---

## 🔗 Useful Links

### GitHub Actions

- Your workflows: `github.com/[username]/[repo]/actions`
- Workflow runs: `github.com/[username]/[repo]/actions/workflows/ci.yml`

### EAS Builds

- Dashboard: `expo.dev/accounts/[username]/projects/[project]/builds`
- Settings: `expo.dev/accounts/[username]/projects/[project]/settings`

### Documentation

- GitHub Actions: `docs.github.com/actions`
- EAS Build: `docs.expo.dev/build/introduction/`
- CI/CD Setup: `./CI_CD_SETUP.md` (detailed guide)

---

## Next Steps

1. ✅ Test refactored CalendarScreen (all features work?)
2. ✅ Wait for first build to complete
3. ✅ Share preview link with testers
4. ✅ Create your first PR to see preview comments
5. ✅ When ready for production, add Apple/Google credentials

---

## 💡 Pro Tips

### Speed Up Builds

- Use `eas build --local` for faster iteration
- Cache dependencies in GitHub Actions
- Only build what changed

### Monitor Usage

- Check GitHub Actions tab for minutes used
- Check EAS dashboard for build quota
- Set up Slack/Discord notifications

### Best Practices

- Create PRs for features (auto-preview builds)
- Tag releases with semantic versioning (v1.2.3)
- Write tests before pushing (CI catches issues early)

---

## Questions?

Check the detailed guide:

```bash
cat CI_CD_SETUP.md
```

Or reach out if you need help! 🙌
