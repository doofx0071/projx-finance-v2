# 🚀 AI Insights Quick Start Guide

## ⚡ **Get Started in 3 Steps**

---

## Step 1: Get Your Mistral AI API Key 🔑

### **Option A: Sign Up (New Users)**
1. Visit [Mistral AI Console](https://console.mistral.ai/)
2. Click "Sign Up" and create an account
3. Verify your email address
4. Log in to the console

### **Option B: Log In (Existing Users)**
1. Visit [Mistral AI Console](https://console.mistral.ai/)
2. Click "Log In"
3. Enter your credentials

### **Get Your API Key:**
1. Once logged in, navigate to **"API Keys"** section
2. Click **"Create New API Key"**
3. Give it a name (e.g., "Finance Tracker")
4. Click **"Create"**
5. **Copy the API key** (you won't see it again!)

---

## Step 2: Add API Key to Your Project 📝

### **Create or Update `.env.local` File:**

1. Open your project in VS Code
2. Create a file named `.env.local` in the root directory (if it doesn't exist)
3. Add the following line:

```env
MISTRAL_API_KEY=your_actual_api_key_here
```

**Example:**
```env
MISTRAL_API_KEY=sk-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

### **Important Notes:**
- ⚠️ **Never commit `.env.local` to Git!** (It's already in `.gitignore`)
- ⚠️ **Keep your API key secret!**
- ⚠️ **Don't share it publicly!**

---

## Step 3: Start Using AI Insights 🎉

### **Start the Development Server:**
```bash
npm run dev
```

### **Navigate to AI Insights:**
1. Open your browser to `http://localhost:3000`
2. Log in to your account
3. Click **"AI Insights"** in the sidebar (Sparkles ✨ icon)

### **Generate Your First Insights:**
1. Select a period (Week, Month, or Quarter)
2. Click **"Refresh"** to generate insights
3. Read your personalized recommendations!

---

## 🎯 **What You'll See**

### **Summary Cards:**
```
┌─────────────────────────────────────────────────────────┐
│  Period: Last 30 Days    │  Total Income: ₱45,000      │
│  45 transactions         │  Total Expenses: ₱32,500    │
│                          │  Net Income: ₱12,500        │
└─────────────────────────────────────────────────────────┘
```

### **AI-Generated Insights:**
```
┌─────────────────────────────────────────────────────────┐
│  📊 Spending Pattern Analysis                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Your spending has increased by 23% this month          │
│  compared to last month. The main driver is the         │
│  "Food & Dining" category, which is up ₱3,500.          │
│                                                          │
│  💡 Recommendation: Consider meal planning to reduce    │
│  dining out expenses.                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  💰 Budget Optimization                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  You're 85% through your "Entertainment" budget         │
│  with 10 days left in the month. Consider reducing      │
│  discretionary spending to stay within budget.          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  💡 Savings Opportunity                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  You could save ₱2,000/month by reducing dining         │
│  out from 15 times to 10 times per month. That's       │
│  ₱24,000 in annual savings!                             │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Troubleshooting**

### **Problem: "Unable to Generate Insights" Error**

**Possible Causes:**
1. ❌ API key not set
2. ❌ Invalid API key
3. ❌ No credits in Mistral AI account
4. ❌ Network connection issue

**Solutions:**
1. ✅ Check `.env.local` file exists and has `MISTRAL_API_KEY`
2. ✅ Verify API key is correct (no extra spaces)
3. ✅ Restart development server after adding API key
4. ✅ Check Mistral AI console for account status
5. ✅ Verify internet connection

### **Problem: "No Insights Available"**

**Cause:** No transaction data in your account

**Solution:**
1. ✅ Add some transactions first
2. ✅ Navigate to "Transactions" page
3. ✅ Click "Add Transaction"
4. ✅ Add at least 5-10 transactions
5. ✅ Return to AI Insights page

### **Problem: Server Won't Start**

**Solution:**
```bash
# Stop the server (Ctrl+C)
# Clear cache and restart
npm run dev
```

---

## 💰 **Cost Information**

### **Free Tier:**
- Mistral AI offers free credits for new users
- Perfect for testing and development

### **Paid Tier:**
- **Cost:** ~$0.006 per insight (less than 1 cent)
- **Monthly:** ~$6 for 1,000 insights
- **Very affordable!** 💰

### **Cost Optimization:**
- Only generate insights when needed
- Use the "Refresh" button sparingly
- Insights are valuable, not frequent

---

## 📱 **Mobile Usage**

The AI Insights page is fully responsive!

### **Mobile Features:**
- ✅ Touch-friendly buttons
- ✅ Responsive grid layout
- ✅ Easy-to-read cards
- ✅ Swipe-friendly tabs
- ✅ Optimized for small screens

---

## 🎓 **Tips for Best Results**

### **1. Add Diverse Transactions**
- Include both income and expenses
- Use different categories
- Add transactions regularly

### **2. Set Up Budgets**
- Create budgets for main categories
- Set realistic limits
- Track progress regularly

### **3. Use Different Periods**
- **Week:** For short-term insights
- **Month:** For monthly planning
- **Quarter:** For long-term trends

### **4. Act on Recommendations**
- Read insights carefully
- Implement suggestions
- Track improvements

### **5. Refresh Regularly**
- Weekly for active users
- Monthly for casual users
- After major financial changes

---

## 🎯 **What to Expect**

### **Insight Types:**

1. **📊 Spending Pattern Analysis**
   - Trends and changes
   - Category breakdowns
   - Comparison with previous periods

2. **💰 Budget Optimization**
   - Budget adherence status
   - Over/under budget alerts
   - Recommendations to stay on track

3. **💡 Savings Opportunities**
   - Cost reduction suggestions
   - Potential savings calculations
   - Actionable tips

4. **⚠️ Unusual Spending Alerts**
   - Anomaly detection
   - Large transaction alerts
   - Pattern deviations

5. **📈 Financial Summary**
   - Overall health assessment
   - Income vs. expenses
   - Savings rate
   - Future projections

---

## 📚 **Additional Resources**

### **Documentation:**
- `mds/task-13-ai-insights-complete.md` - Technical details
- `mds/task-13-implementation-summary.md` - Implementation overview
- `mds/docs/mistralai.md` - Mistral AI integration guide

### **Support:**
- [Mistral AI Documentation](https://docs.mistral.ai/)
- [Mistral AI Console](https://console.mistral.ai/)
- [Mistral AI Pricing](https://mistral.ai/pricing/)

---

## ✅ **Checklist**

Before using AI Insights:

- [ ] Created Mistral AI account
- [ ] Generated API key
- [ ] Added API key to `.env.local`
- [ ] Restarted development server
- [ ] Added transactions to account
- [ ] Set up budgets (optional but recommended)
- [ ] Navigated to AI Insights page
- [ ] Generated first insights

---

## 🎉 **You're All Set!**

Enjoy your AI-powered financial insights! 🚀✨

The AI will help you:
- 📊 Understand your spending patterns
- 💰 Optimize your budgets
- 💡 Find savings opportunities
- ⚠️ Catch unusual spending
- 📈 Track your financial health

**Happy tracking! 💰📊✨**

