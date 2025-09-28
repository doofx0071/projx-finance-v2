// Email templates for Supabase authentication
// These templates will be used with custom SMTP settings
// Note: Supabase Auth OTP emails are handled internally by Supabase
// For custom OTP emails, use the sendCustomOTPEmail function below

export const EMAIL_TEMPLATES = {
  'confirm-signup': {
    subject: 'Verify your email - PHPinancia',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your email - PHPinancia</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
          }
          .dark body {
            background-color: #1a1a1a;
            color: #ffffff;
          }
          .header {
            text-align: center;
            padding: 30px 0;
            border-bottom: 2px solid #e5e7eb;
          }
          .dark .header {
            border-bottom-color: #374151;
          }
          .logo {
            max-width: 200px;
            height: auto;
          }
          .content {
            padding: 40px 0;
            text-align: center;
          }
          .button {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.3);
          }
          .button:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px 0 rgba(59, 130, 246, 0.4);
          }
          .footer {
            text-align: center;
            padding-top: 30px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
          }
          .dark .footer {
            border-top-color: #374151;
            color: #9ca3af;
          }
          .highlight {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://mgbhdqeazaolzbrjmsys.supabase.co/storage/v1/object/public/frontend/logos/PHPinancia-light.png"
               alt="PHPinancia Logo"
               class="logo"
               onerror="this.src='https://mgbhdqeazaolzbrjmsys.supabase.co/storage/v1/object/public/frontend/logos/PHPinancia-dark.png'" />
        </div>

        <div class="content">
          <h1 style="color: #1f2937; margin-bottom: 20px;">Welcome to PHPinancia!</h1>
          <p style="font-size: 18px; margin-bottom: 30px;">
            Thank you for joining <span class="highlight">PHPinancia</span>, your AI-powered financial intelligence platform.
          </p>
          <p style="margin-bottom: 30px;">
            Please verify your email address to activate your account and start your journey towards better financial management.
          </p>

          <a href="{{ .ConfirmationURL }}" class="button">
            Verify Email Address
          </a>

          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            If you didn't create an account with PHPinancia, you can safely ignore this email.
          </p>
        </div>

        <div class="footer">
          <p>
            &copy; 2025 PHPinancia. All rights reserved.<br>
            You're receiving this email because you recently created a new PHPinancia account.
          </p>
        </div>
      </body>
      </html>
    `,
  },

  'magic-link': {
    subject: 'Your verification code - PHPinancia',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your verification code - PHPinancia</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
          }
          .dark body {
            background-color: #1a1a1a;
            color: #ffffff;
          }
          .header {
            text-align: center;
            padding: 30px 0;
            border-bottom: 2px solid #e5e7eb;
          }
          .dark .header {
            border-bottom-color: #374151;
          }
          .logo {
            max-width: 200px;
            height: auto;
          }
          .content {
            padding: 40px 0;
            text-align: center;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 30px 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .button {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.3);
          }
          .button:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px 0 rgba(16, 185, 129, 0.4);
          }
          .footer {
            text-align: center;
            padding-top: 30px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
          }
          .dark .footer {
            border-top-color: #374151;
            color: #9ca3af;
          }
          .highlight {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://mgbhdqeazaolzbrjmsys.supabase.co/storage/v1/object/public/frontend/logos/PHPinancia-light.png"
               alt="PHPinancia Logo"
               class="logo"
               onerror="this.src='https://mgbhdqeazaolzbrjmsys.supabase.co/storage/v1/object/public/frontend/logos/PHPinancia-dark.png'" />
        </div>

        <div class="content">
          <h1 style="color: #1f2937; margin-bottom: 20px;">Your Verification Code</h1>
          <p style="font-size: 18px; margin-bottom: 30px;">
            Use the code below to complete your sign in to <span class="highlight">PHPinancia</span>.
          </p>

          <div class="otp-code">
            {{ .Token }}
          </div>

          <p style="margin: 30px 0; color: #6b7280;">
            This code will expire in 1 hour for security reasons.
          </p>

          <a href="{{ .SiteURL }}" class="button">
            Return to PHPinancia
          </a>

          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>

        <div class="footer">
          <p>
            &copy; 2025 PHPinancia. All rights reserved.<br>
            You're receiving this email because you requested a verification code for your PHPinancia account.
          </p>
        </div>
      </body>
      </html>
    `,
  },

  'change-email': {
    subject: 'Confirm your new email address - PHPinancia',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirm your new email address - PHPinancia</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
          }
          .dark body {
            background-color: #1a1a1a;
            color: #ffffff;
          }
          .header {
            text-align: center;
            padding: 30px 0;
            border-bottom: 2px solid #e5e7eb;
          }
          .dark .header {
            border-bottom-color: #374151;
          }
          .brand {
            font-size: 28px;
            font-weight: bold;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 0;
          }
          .logo {
            max-width: 200px;
            height: auto;
          }
          .content {
            padding: 40px 0;
            text-align: center;
          }
          .button {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.3);
          }
          .button:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px 0 rgba(139, 92, 246, 0.4);
          }
          .email-info {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .dark .email-info {
            background: #262626;
            border-color: #404040;
          }
          .footer {
            text-align: center;
            padding-top: 30px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
          }
          .dark .footer {
            border-top-color: #374151;
            color: #9ca3af;
          }
          .highlight {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://mgbhdqeazaolzbrjmsys.supabase.co/storage/v1/object/public/frontend/logos/PHPinancia-light.png"
               alt="PHPinancia Logo"
               class="logo"
               onerror="this.src='https://mgbhdqeazaolzbrjmsys.supabase.co/storage/v1/object/public/frontend/logos/PHPinancia-dark.png'" />
        </div>

        <div class="content">
          <h1 style="color: #1f2937; margin-bottom: 20px;">Confirm Email Change</h1>
          <p style="font-size: 18px; margin-bottom: 30px;">
            We need to verify your new email address for your <span class="highlight">PHPinancia</span> account.
          </p>

          <div class="email-info">
            <p style="margin: 0 0 10px 0;"><strong>Current Email:</strong> {{ .Email }}</p>
            <p style="margin: 0;"><strong>New Email:</strong> {{ .NewEmail }}</p>
          </div>

          <p style="margin-bottom: 30px;">
            Click the button below to confirm this email change.
          </p>

          <a href="{{ .ConfirmationURL }}" class="button">
            Confirm Email Change
          </a>

          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            If you didn't request this change, please ignore this email and your email address will remain unchanged.
          </p>
        </div>

        <div class="footer">
          <p>
            &copy; 2025 PHPinancia. All rights reserved.<br>
            You're receiving this email because you requested to change your email address for your PHPinancia account.
          </p>
        </div>
      </body>
      </html>
    `,
  },

  'reset-password': {
    subject: 'Reset your PHPinancia password',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset your PHPinancia password</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
          }
          .dark body {
            background-color: #1a1a1a;
            color: #ffffff;
          }
          .header {
            text-align: center;
            padding: 30px 0;
            border-bottom: 2px solid #e5e7eb;
          }
          .dark .header {
            border-bottom-color: #374151;
          }
          .logo {
            max-width: 200px;
            height: auto;
          }
          .content {
            padding: 40px 0;
            text-align: center;
          }
          .button {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            box-shadow: 0 4px 14px 0 rgba(239, 68, 68, 0.3);
          }
          .button:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px 0 rgba(239, 68, 68, 0.4);
          }
          .security-note {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #ef4444;
          }
          .dark .security-note {
            background: #2d1b1b;
            border-color: #5b2c2c;
          }
          .footer {
            text-align: center;
            padding-top: 30px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
          }
          .dark .footer {
            border-top-color: #374151;
            color: #9ca3af;
          }
          .highlight {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://mgbhdqeazaolzbrjmsys.supabase.co/storage/v1/object/public/frontend/logos/PHPinancia-light.png"
               alt="PHPinancia Logo"
               class="logo"
               onerror="this.src='https://mgbhdqeazaolzbrjmsys.supabase.co/storage/v1/object/public/frontend/logos/PHPinancia-dark.png'" />
        </div>

        <div class="content">
          <h1 style="color: #1f2937; margin-bottom: 20px;">Reset Your Password</h1>
          <p style="font-size: 18px; margin-bottom: 30px;">
            We received a request to reset the password for your <span class="highlight">PHPinancia</span> account.
          </p>

          <p style="margin-bottom: 30px;">
            Click the button below to set a new password. This link will expire in 1 hour for security reasons.
          </p>

          <a href="{{ .ConfirmationURL }}" class="button">
            Reset Password
          </a>

          <div class="security-note">
            <p style="margin: 0; font-weight: 600; color: #dc2626;">
              Security Notice:
            </p>
            <p style="margin: 10px 0 0 0;">
              If you didn't request this password reset, please ignore this email.
              Your password will remain unchanged and no action is needed.
            </p>
          </div>
        </div>

        <div class="footer">
          <p>
            &copy; 2025 PHPinancia. All rights reserved.<br>
            You're receiving this email because you requested a password reset for your PHPinancia account.
          </p>
        </div>
      </body>
      </html>
    `,
  },

  '`change-password': {
    subject: 'Security verification code - PHPinancia',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Security verification - PHPinancia</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
          }
          .dark body {
            background-color: #1a1a1a;
            color: #ffffff;
          }
          .header {
            text-align: center;
            padding: 30px 0;
            border-bottom: 2px solid #e5e7eb;
          }
          .dark .header {
            border-bottom-color: #374151;
          }
            .logo {
            max-width: 200px;
            height: auto;
            }
          .content {
            padding: 40px 0;
            text-align: center;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 30px 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .button {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.3);
          }
          .button:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px 0 rgba(16, 185, 129, 0.4);
          }
          .security-note {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #0ea5e9;
          }
          .dark .security-note {
            background: #1e293b;
            border-color: #334155;
          }
          .footer {
            text-align: center;
            padding-top: 30px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
          }
          .dark .footer {
            border-top-color: #374151;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://mgbhdqeazaolzbrjmsys.supabase.co/storage/v1/object/public/frontend/logos/PHPinancia-light.png"
               alt="PHPinancia Logo"
               class="logo"
               onerror="this.src='https://mgbhdqeazaolzbrjmsys.supabase.co/storage/v1/object/public/frontend/logos/PHPinancia-dark.png'" />
        </div>

        <div class="content">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Security Verification Required</h2>
          <p style="font-size: 18px; margin-bottom: 30px;">
            We need to verify your identity before updating your account security settings.
          </p>

          <div class="otp-code">
            {{ .Token }}
          </div>

          <p style="margin: 30px 0; color: #6b7280;">
            This verification code will expire in 1 hour for your security.
          </p>

          <a href="{{ .SiteURL }}" class="button">
            Access Your Account
          </a>

          <div class="security-note">
            <p style="margin: 0; font-weight: 600; color: #0ea5e9;">
              Account Security Update:
            </p>
            <p style="margin: 10px 0 0 0;">
              This verification is required to complete your account security update.
              If you did not request this change, please secure your account immediately.
            </p>
          </div>
        </div>

        <div class="footer">
          <p>
            &copy; 2025 PHPinancia. All rights reserved.<br>
            This email was sent because a security update was requested for your PHPinancia account.
          </p>
        </div>
      </body>
      </html>
    `,
  },
}

// Function to get email template
export function getEmailTemplate(type: keyof typeof EMAIL_TEMPLATES): { subject: string; html: string } {
  return EMAIL_TEMPLATES[type]
}

// Function to replace template variables
export function replaceTemplateVariables(template: string, variables: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{ \\.${key} }}`, 'g')
    result = result.replace(regex, value)
  }
  return result
}
