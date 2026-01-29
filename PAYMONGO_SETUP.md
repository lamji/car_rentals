# PayMongo Setup Guide

## 🔑 Getting PayMongo API Keys

### 1. Create PayMongo Account
1. Visit [PayMongo Dashboard](https://dashboard.paymongo.com/)
2. Sign up for a new account or login
3. Complete account verification

### 2. Get Test API Keys
1. Go to **Developers** → **API Keys** in the dashboard
2. Copy your test keys:
   - **Public Key**: `pk_test_...` (safe for client-side)
   - **Secret Key**: `sk_test_...` (server-side only)

### 3. Environment Configuration

Add these to your `.env.local` file:

```bash
# PayMongo Test API Keys
NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY=pk_test_your_public_key_here
PAYMONGO_SECRET_KEY=sk_test_your_secret_key_here

# PayMongo Webhook (optional for testing)
PAYMONGO_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 4. Test the Integration

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Visit test page**:
   ```
   http://localhost:3000/payment/test
   ```

3. **Check environment status** - the page will show if keys are configured correctly

## 🧪 Testing Payment Methods

### Available Test Payment Methods:
- **GCash**: 2% fee, PHP 1.00 - PHP 50,000.00
- **PayMaya**: 2% fee, PHP 1.00 - PHP 50,000.00  
- **GrabPay**: 2% fee, PHP 1.00 - PHP 25,000.00
- **Credit/Debit Cards**: 3.5% + PHP 15.00 fee
- **Billease**: 2% fee, PHP 1,000.00 - PHP 40,000.00
- **Online Banking**: PHP 15.00 flat fee

### Test Card Numbers (for card payments):
```
Visa: 4343434343434345
Mastercard: 5555555555554444
JCB: 3566002020360505
```

## 🚨 Important Notes

- **Never commit API keys** to version control
- **Use test keys only** for development
- **Switch to live keys** only in production
- **Test small amounts** first (PHP 20.00 - PHP 100.00)

## 🔧 Troubleshooting

### "API key does not exist" Error
- Verify keys are copied correctly (no extra spaces)
- Ensure you're using test keys (`pk_test_` and `sk_test_`)
- Check PayMongo dashboard for key status

### "Payment method not available" Error
- Check amount is within method limits
- Verify payment method is enabled in PayMongo dashboard
- Try different payment amounts

### Environment Variable Issues
- Restart development server after adding keys
- Check `.env.local` file exists in project root
- Verify variable names match exactly

## 📞 Support

- **PayMongo Docs**: https://developers.paymongo.com/
- **PayMongo Support**: support@paymongo.com
- **Test Page**: http://localhost:3000/payment/test
