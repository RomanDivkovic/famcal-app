# CI/CD Pipeline Setup Guide

## ✅ FREE GitHub Actions Pipelines Configured!

Your project now has **3 automated workflows** that are **completely FREE** on GitHub:

### 1. **CI Pipeline** (`.github/workflows/ci.yml`)

**Triggers:** Every push and pull request to `dev` or `main` branches

**What it does:**

- ✅ Runs linting checks
- ✅ Runs TypeScript type checking
- ✅ Runs all tests with coverage
- ✅ Uploads coverage to Codecov (optional)
- ✅ Creates EAS preview build on pull requests
- ✅ Comments on PR with build link

### 2. **Development Build** (`.github/workflows/dev-build.yml`)

**Triggers:** Every push to `dev` branch (or manual trigger)

**What it does:**

- ✅ Creates iOS development build automatically
- ✅ Makes build available in EAS dashboard
- ✅ Can be extended with notifications

### 3. **Production Release** (`.github/workflows/release.yml`)

**Triggers:** When you create a version tag (e.g., `v1.0.0`)

**What it does:**

- ✅ Builds iOS production app
- ✅ Builds Android production app
- ✅ Submits to App Store (iOS)
- ✅ Submits to Google Play (Android)
- ✅ Creates GitHub release with notes

---

## 🔑 Required Setup (One-Time)

### Step 1: Get EXPO_TOKEN

```bash
# Login to Expo
npx eas-cli login

# Generate token
npx eas-cli whoami
npx eas-cli build:configure
```

Then go to: https://expo.dev/accounts/[your-account]/settings/access-tokens

- Create new token
- Name it: "GitHub Actions"
- Copy the token

### Step 2: Add GitHub Secrets

Go to: `https://github.com/RomanDivkovic/famcal-app/settings/secrets/actions`

Add these secrets:

| Secret Name                        | Value                              | Required For                 |
| ---------------------------------- | ---------------------------------- | ---------------------------- |
| `EXPO_TOKEN`                       | Your Expo access token from Step 1 | All workflows                |
| `EXPO_APPLE_ID`                    | Your Apple ID email                | Production release (iOS)     |
| `EXPO_APPLE_APP_SPECIFIC_PASSWORD` | App-specific password from Apple   | Production release (iOS)     |
| `EXPO_ANDROID_KEYSTORE_PASSWORD`   | Your Android keystore password     | Production release (Android) |

#### How to get Apple App-Specific Password:

1. Go to: https://appleid.apple.com/account/manage
2. Sign in with your Apple ID
3. Under "Security" → "App-Specific Passwords"
4. Click "Generate Password"
5. Name it "EAS Build"
6. Copy the password

---

## 📋 EAS Configuration

Your `eas.json` has 3 build profiles:

### 1. **development** (for local dev)

```json
{
  "developmentClient": true,
  "distribution": "internal",
  "ios": { "simulator": true }
}
```

### 2. **preview** (for testing/PR reviews)

```json
{
  "distribution": "internal",
  "ios": { "simulator": false }
}
```

### 3. **production** (for App Store/Play Store)

```json
{
  "android": { "buildType": "app-bundle" }
}
```

---

## 🚀 How to Use

### Automatic Triggers

**Every time you push to `dev`:**

```bash
git add .
git commit -m "feat: add new feature"
git push origin dev
```

→ CI tests run automatically
→ Development build starts automatically

**Every time you create a PR:**

```bash
git checkout -b feature/new-feature
# make changes
git push origin feature/new-feature
# Create PR on GitHub
```

→ CI tests run
→ Preview build created
→ Bot comments on PR with build link

**To release to production:**

```bash
# Update version in app.config.js
# Update CHANGELOG.md

git tag v1.0.0
git push origin v1.0.0
```

→ Production builds for iOS & Android
→ Automatic submission to stores
→ GitHub release created

### Manual Triggers

You can manually trigger the development build:

1. Go to: https://github.com/RomanDivkovic/famcal-app/actions
2. Click "Development Build"
3. Click "Run workflow"
4. Select branch
5. Click "Run workflow"

---

## 💰 Pricing (TL;DR: FREE!)

### GitHub Actions (FREE for you!)

- **Public repos:** Unlimited free
- **Private repos:** 2,000 minutes/month free
- Your project uses ~10 minutes per workflow
- **= 200 workflows/month FREE**

### EAS Build (FREE tier available!)

- **Free tier:** 30 builds/month
- **Priority builds:** $29/month (unlimited)
- Your setup will likely stay in free tier

**Total cost: $0/month** (unless you need >30 builds/month)

---

## 🔍 Monitoring Your Pipelines

### View workflow runs:

https://github.com/RomanDivkovic/famcal-app/actions

### View EAS builds:

https://expo.dev/accounts/romandivkovic/projects/group-calendar/builds

### Check build status badge (optional):

Add to README.md:

```markdown
![CI](https://github.com/RomanDivkovic/famcal-app/workflows/CI%2FCD%20Pipeline/badge.svg)
```

---

## 🛠 Customization

### Add Slack/Discord Notifications

Edit `.github/workflows/dev-build.yml`:

```yaml
- name: Notify Slack
  if: success()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "✅ Development build completed!"
      }
```

### Change trigger conditions

Edit the `on:` section in any workflow:

```yaml
on:
  push:
    branches: [dev, main, staging] # Add/remove branches
  schedule:
    - cron: '0 9 * * 1' # Run every Monday at 9 AM
```

### Add more test jobs

Edit `.github/workflows/ci.yml`:

```yaml
jobs:
  test:
    # existing job

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run security scan
        run: npm audit --production
```

---

## ✅ Next Steps

1. **Add GitHub secrets** (see Step 2 above)
2. **Push to `dev` branch** to test CI
3. **Create a PR** to test preview builds
4. **Create a tag** when ready for production

## 📞 Troubleshooting

**Build fails with "EXPO_TOKEN not found":**

- Add EXPO_TOKEN to GitHub secrets (see Step 2)

**iOS build fails:**

- Add Apple ID and app-specific password to secrets
- Make sure Apple Developer account is active

**Android build fails:**

- Add keystore password to secrets
- Run `eas build:configure` to set up keystore

**"No space left" error:**

- Use `ubuntu-latest` for Android builds
- Use `macos-latest` for iOS builds

---

## 🎉 Summary

You now have:

- ✅ Automated testing on every push
- ✅ Automated builds on every push to dev
- ✅ Preview builds for every PR
- ✅ One-command production releases
- ✅ Automatic App Store/Play Store submission

All for **$0/month**! 🎊
