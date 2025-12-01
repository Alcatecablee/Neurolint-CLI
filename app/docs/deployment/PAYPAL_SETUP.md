# PayPal Integration Setup

This guide will help you set up PayPal payments for NeuroLint Pro.

## Prerequisites

1. PayPal Developer Account (https://developer.paypal.com/)
2. Environment variables configured
3. Webhook endpoints set up (optional but recommended)

## Step 1: Get PayPal Credentials

1. Go to https://developer.paypal.com/
2. Log in or create a developer account
3. Create a new app in the PayPal Developer Dashboard
4. Note down your:
   - Client ID
   - Client Secret

## Step 2: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id (optional)
PAYPAL_WEBHOOK_SECRET=your_paypal_webhook_secret (optional)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id

# App URL (important for PayPal return URLs)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change to your domain in production
```

## Step 3: Test Integration

Run the integration test:

```bash
npm run test:paypal
```

This will verify:
- ✅ Environment variables are set
- ✅ PayPal API connectivity works
- ✅ Checkout endpoints are accessible

## Step 4: Set Up Webhooks (Optional but Recommended)

Webhooks ensure reliable subscription management:

1. In PayPal Developer Dashboard, go to your app
2. Add webhook endpoint: `https://yourdomain.com/api/webhooks/paypal`
3. Subscribe to these events:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `BILLING.SUBSCRIPTION.PAYMENT.COMPLETED`
   - `BILLING.SUBSCRIPTION.PAYMENT.FAILED`
   - `BILLING.SUBSCRIPTION.EXPIRED`

4. Add webhook ID and secret to environment variables

## Step 5: Test Checkout Flow

1. Start your app: `npm run dev`
2. Go to: http://localhost:3000/pricing
3. Select a paid plan
4. Fill out the checkout form
5. Complete payment with PayPal sandbox account

## Sandbox vs Production

### Development (Sandbox)
- Uses `https://api-m.sandbox.paypal.com`
- Test with sandbox PayPal accounts
- No real money transactions

### Production
- Uses `https://api-m.paypal.com`
- Set `NODE_ENV=production`
- Use live PayPal credentials
- Real money transactions

## Troubleshooting

### Common Issues

**Error: "Missing required environment variables"**
- Ensure all PayPal environment variables are set in `.env.local`

**Error: "PayPal API connectivity failed"**
- Check your Client ID and Client Secret
- Verify you're using the correct environment (sandbox/production)

**Error: "Subscription creation failed"**
- Check app URL configuration
- Verify return/cancel URLs are accessible

### Testing with Sandbox Accounts

1. Create sandbox accounts at https://developer.paypal.com/
2. Use sandbox buyer account for testing payments
3. Use sandbox business account for receiving payments

### Webhook Testing

Use tools like ngrok for local webhook testing:

```bash
# Install ngrok
npm install -g ngrok

# Expose local app
ngrok http 3000

# Use the ngrok URL for webhook endpoint
# Example: https://abc123.ngrok.io/api/webhooks/paypal
```

## Support

For PayPal-specific issues:
- PayPal Developer Documentation: https://developer.paypal.com/docs/
- PayPal Developer Community: https://www.paypal-community.com/

For NeuroLint-specific issues:
- Check the console for error messages
- Run `npm run test:paypal` to diagnose issues
- Review the webhook logs in your database
