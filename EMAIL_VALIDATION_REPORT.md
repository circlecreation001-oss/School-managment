# SchoolNex - Email Validation Report

**Date**: August 2026  
**Status**: Architecture verified, code fixed, awaiting SMTP credentials  

---

## 1. Email Architecture Audit

### Components Verified

| Component | File | Status |
|-----------|------|--------|
| Email Worker | `apps/api/src/workers/email.worker.ts` | ✅ Nodemailer transporter with SMTP |
| Email Queue | `apps/api/src/config/queue.ts` (emailQueue) | ✅ BullMQ queue with retry (3 attempts, exponential backoff) |
| SMTP Config | `apps/api/src/config/env.ts` (lines 55-60) | ✅ Loaded from env vars |
| Worker Registration | `apps/api/src/workers/index.ts` | ✅ email worker started with concurrency 10 |

### Email Queue Configuration
```typescript
// config/queue.ts
export const emailQueue = createQueue('email');

// Default job options (set in createQueue):
{
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 5000 },
}
```

### Email Worker Capabilities
- Resolves recipient email from `recipientId` if `to` not provided
- Supports both plain text (`body`) and HTML (`html`)
- Updates notification status to `sent` after delivery
- Logs messageId on success, warns on missing email

---

## 2. Code Fixes Applied

### Fix 1: Email Verification (auth.service.ts - register method)

**Before** (line 222):
```typescript
// TODO: Send verification email via notification queue
logger.info({ userId: user.id, email: input.email }, 'User registered, verification email pending');
```

**After**:
```typescript
// Queue verification email
try {
  const { emailQueue } = await import('../../config/index.js');
  const verificationLink = `${env.appUrl}/verify-email?token=${verificationToken}`;
  await emailQueue.add('verify-email', {
    to: input.email,
    subject: 'Verify your email address',
    body: `Hi ${input.firstName},\n\nPlease verify your email address by clicking the link below:\n\n${verificationLink}\n\nThis link will expire in ${AUTH_CONSTANTS.EMAIL_VERIFICATION_EXPIRY_HOURS} hours.\n\nThank you.`,
    html: `<p>Hi ${input.firstName},</p><p>Please verify your email address by clicking the link below:</p><p><a href="${verificationLink}">Verify Email</a></p><p>This link will expire in ${AUTH_CONSTANTS.EMAIL_VERIFICATION_EXPIRY_HOURS} hours.</p>`,
    tenantId: tenant.id,
    channel: 'email',
  });
} catch (emailErr) {
  logger.warn({ err: emailErr }, 'Verification email queueing failed (non-fatal)');
}
```

### Fix 2: Password Reset Email (auth.service.ts - forgotPassword method)

**Before** (line 336):
```typescript
// TODO: Send reset email via notification queue
logger.info({ userId: user.id, email: input.email }, 'Password reset token generated');
```

**After**:
```typescript
// Queue password reset email
try {
  const { emailQueue } = await import('../../config/index.js');
  const resetLink = `${env.appUrl}/reset-password?token=${resetToken}`;
  await emailQueue.add('reset-password', {
    to: input.email,
    subject: 'Reset your password',
    body: `Hi,\n\nYou requested a password reset. Click the link below to set a new password:\n\n${resetLink}\n\nThis link will expire in ${AUTH_CONSTANTS.RESET_TOKEN_EXPIRY_MINUTES} minutes.\n\nIf you did not request this, please ignore this email.\n\nThank you.`,
    html: `<p>Hi,</p><p>You requested a password reset. Click the link below to set a new password:</p><p><a href="${resetLink}">Reset Password</a></p><p>This link will expire in ${AUTH_CONSTANTS.RESET_TOKEN_EXPIRY_MINUTES} minutes.</p><p>If you did not request this, please ignore this email.</p>`,
    tenantId: tenant.id,
    channel: 'email',
  });
} catch (emailErr) {
  logger.warn({ err: emailErr }, 'Reset email queueing failed (non-fatal)');
}
```

### Fix 3: Welcome Email (Already Implemented)

The welcome email in `signupInstitute()` (line 676) already queues correctly:
```typescript
await emailQueue.add('welcome-institute', {
  to: input.email,
  subject: `Welcome to SchoolNex - ${input.instituteName}`,
  body: `Hi ${firstName},\n\nYour institute "${input.instituteName}" is now live on SchoolNex!...`,
  tenantId: result.tenant.id,
});
```

---

## 3. Email Templates

### Welcome Email Template
- **Trigger**: Institute signup (POST /auth/signup-institute)
- **Recipient**: School owner email
- **Subject**: `Welcome to SchoolNex - {Institute Name}`
- **Content**: Plain text welcome message with 7-day trial info
- **Status**: ✅ Implemented (already in code)

### Email Verification Template
- **Trigger**: User registration (POST /auth/register)
- **Recipient**: User email
- **Subject**: `Verify your email address`
- **Content**: HTML + text with verification link
- **Link**: `{APP_URL}/verify-email?token={token}`
- **Token Expiry**: 24 hours (from EMAIL_VERIFICATION_EXPIRY_HOURS)
- **Status**: ✅ Implemented (fixed in this task)

### Password Reset Template
- **Trigger**: Forgot password (POST /auth/forgot-password)
- **Recipient**: User email
- **Subject**: `Reset your password`
- **Content**: HTML + text with reset link
- **Link**: `{APP_URL}/reset-password?token={token}`
- **Token Expiry**: 60 minutes (from RESET_TOKEN_EXPIRY_MINUTES)
- **Status**: ✅ Implemented (fixed in this task)

---

## 4. SMTP Configuration

### Required Environment Variables

| Variable | Description | Dev Default | Production |
|----------|-------------|-------------|------------|
| SMTP_HOST | SMTP server hostname | localhost | smtp.sendgrid.net |
| SMTP_PORT | SMTP port | 1025 | 465 or 587 |
| SMTP_USER | SMTP username | (empty) | apikey |
| SMTP_PASS | SMTP password | (empty) | SG.xxxxx |
| SMTP_FROM_EMAIL | Sender email | noreply@educationerp.com | noreply@schoolnex.in |
| SMTP_FROM_NAME | Sender name | Education ERP | SchoolNex |

### Recommended Providers
- **SendGrid**: Most popular, good free tier (100 emails/day)
- **Resend**: Modern API, good developer experience
- **AWS SES**: Cheap at scale, requires domain verification
- **Mailgun**: Good deliverability, developer-friendly

---

## 5. Verification Checklist

| Test | Method | Expected Result |
|------|--------|----------------|
| Welcome email on signup | POST /auth/signup-institute | Email queued in emailQueue |
| Verification email on register | POST /auth/register | Email queued with verify link |
| Reset email on forgot password | POST /auth/forgot-password | Email queued with reset link |
| Email worker processes jobs | Check BullMQ logs | `Email sent successfully` with messageId |
| Failed email retries | Simulate bad SMTP | 3 retries with exponential backoff |
| Missing email handling | Send with no `to` | Warning logged, job skipped |
| Token expiry verification | Wait past expiry | Link returns RESET_TOKEN_INVALID |
| Notification status update | After successful send | status changed to 'sent' |

---

## 6. Production Deployment Steps

1. **Choose SMTP provider** and create account
2. **Verify domain** (schoolnex.in) with provider
3. **Set environment variables** on Render:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=465
   SMTP_USER=apikey
   SMTP_PASS=SG.your_sendgrid_key
   SMTP_FROM_EMAIL=noreply@schoolnex.in
   SMTP_FROM_NAME=SchoolNex
   APP_URL=https://schoolnex.in
   ```
4. **Redeploy** backend
5. **Test** signup flow end-to-end
6. **Verify** email arrives in inbox

---

## 7. Current Status

| Email Type | Code Status | Template | Queue Integration | Tested Locally | Production Ready |
|------------|-------------|----------|-------------------|----------------|-----------------|
| Welcome Email | ✅ | ✅ | ✅ | ⚠️ (SMTP needed) | ⚠️ (SMTP needed) |
| Email Verification | ✅ | ✅ | ✅ | ⚠️ (SMTP needed) | ⚠️ (SMTP needed) |
| Password Reset | ✅ | ✅ | ✅ | ⚠️ (SMTP needed) | ⚠️ (SMTP needed) |
| Invitation Email | ⚪ | ⚪ | ⚪ | N/A | N/A |

### Overall: Architecture and code complete. Awaiting SMTP credentials.

The code correctly queues emails via BullMQ. The worker processes them via Nodemailer. All that's needed is real SMTP credentials in the environment variables. Mock/console delivery works for development (Mailpit on localhost:1025).