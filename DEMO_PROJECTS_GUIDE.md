# 🏗️ Demo Projects Seeding Guide

This guide explains how to populate your database with realistic demo investment projects for testing.

---

## 📦 What's Included

The seed script creates **6 diverse land investment projects** across India:

### 1. **Bangalore Tech Park Land - Whitefield** 🏢
- **Type**: Commercial
- **Size**: 5.2 acres
- **Value**: ₹52 Cr
- **Status**: Listed
- **IRR**: 15% target
- **Location**: IT hub with metro connectivity

### 2. **Pune Agricultural Farm - Bhor Region** 🌾
- **Type**: Agricultural
- **Size**: 25.5 acres
- **Value**: ₹1.53 Cr
- **Status**: Fundraising
- **IRR**: 10% target
- **Location**: Fertile land with water access

### 3. **Gurgaon Highway Retail Plot - NH-8** 🛣️
- **Type**: Commercial
- **Size**: 3.1 acres
- **Value**: ₹93 Cr
- **Status**: Listed
- **IRR**: 18% target
- **Location**: High-traffic highway location

### 4. **Hyderabad Residential Plotted Development** 🏘️
- **Type**: Residential
- **Size**: 45 acres (150 plots)
- **Value**: ₹36 Cr
- **Status**: Fundraising
- **IRR**: 22% target
- **Location**: RERA-approved gated community

### 5. **Chennai Industrial Land - Oragadam** 🏭
- **Type**: Industrial
- **Size**: 10.2 acres
- **Value**: ₹30.6 Cr
- **Status**: Listed
- **IRR**: 14% target
- **Location**: Auto manufacturing corridor

### 6. **Jaipur Mixed-Use Development - Ajmer Road** 🏙️
- **Type**: Mixed Use
- **Size**: 8 acres
- **Value**: ₹40 Cr
- **Status**: Fundraising
- **IRR**: 19% target
- **Location**: Residential + Commercial development

---

## 🚀 How to Run

### **Option 1: Using Node directly**
```bash
node packages/backend/scripts/seed-demo-projects.js
```

### **Option 2: Using npm script** (if added to package.json)
```bash
npm run seed:projects
```

---

## 📋 Prerequisites

1. **MongoDB Connection**: Make sure `MONGODB_URI` is set in your `.env` file
2. **Backend Dependencies**: Ensure all packages are installed (`npm install`)
3. **Database Access**: Script will connect to your MongoDB instance

---

## 🎯 What the Script Does

### **Step 1: Database Connection**
- Connects to MongoDB using your `.env` configuration

### **Step 2: User Setup**
- Checks for existing Asset Manager or Admin user
- If none found, creates a **Demo Asset Manager** account:
  - Email: `assetmanager@fractionalland.com`
  - Password: `AssetManager@123`
  - Role: `asset_manager`

### **Step 3: Cleanup**
- Removes any existing demo projects with the same project codes
- Prevents duplicate entries on re-running

### **Step 4: Project Creation**
- Creates 6 complete projects with:
  - ✅ Full land details (location, area, zoning)
  - ✅ Financial projections (IRR, exit strategy)
  - ✅ RERA compliance data (where applicable)
  - ✅ Timeline & status
  - ✅ Images from Unsplash
  - ✅ Risk factors
  - ✅ Approvals (for listed projects)

### **Step 5: Summary Report**
- Displays created projects
- Shows breakdown by type, city, status
- Provides next steps

---

## 📊 Output Example

```
🌱 Starting project seeding...

📋 Using asset manager: assetmanager@fractionalland.com

🗑️  Removed 6 existing demo projects

✅ Created: Bangalore Tech Park Land - Whitefield (BLR-WF-001) - listed
✅ Created: Pune Agricultural Farm - Bhor Region (PUN-BHR-002) - fundraising
✅ Created: Gurgaon Highway Retail Plot - NH-8 (GGN-NH8-003) - listed
✅ Created: Hyderabad Residential Plotted Development (HYD-PAT-004) - fundraising
✅ Created: Chennai Industrial Land - Oragadam (CHN-ORG-005) - listed
✅ Created: Jaipur Mixed-Use Development - Ajmer Road (JAI-AJM-006) - fundraising

🎉 Successfully seeded 6 demo projects!

📊 SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Projects: 6
Listed Projects: 3
Fundraising Projects: 3

Projects by Type:
  Commercial: 2
  Agricultural: 1
  Residential: 1
  Industrial: 1
  Mixed Use: 1

Projects by City:
  Bangalore: 1
  Pune: 1
  Gurugram: 1
  Hyderabad: 1
  Chennai: 1
  Jaipur: 1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🧪 Testing Scenarios

### **1. Browse Projects**
- Visit `/projects` to see all 6 demo projects
- Filter by land type, location, status
- Check project cards display correctly

### **2. View Project Details**
- Click on any project to see full details
- Verify all sections render properly:
  - Location & map
  - Financials & IRR
  - Timeline
  - Risk factors
  - Documents

### **3. Investment Flow**
- Select a "listed" project
- Test subscription creation
- Test investment calculation
- Test SPV assignment

### **4. Admin Workflows**
- Login as asset manager
- View project management dashboard
- Test approval workflows
- Update project status

### **5. Filter & Search**
- Test city filters (Bangalore, Pune, etc.)
- Test land type filters (Commercial, Agricultural, etc.)
- Test status filters (Listed, Fundraising)
- Test price range filters

---

## 🎨 Project Features

Each demo project includes:

### **Complete Land Details**
- ✅ Full address with coordinates
- ✅ Survey numbers & plot numbers
- ✅ Title deed numbers
- ✅ Registration details
- ✅ Zoning information

### **Financial Modeling**
- ✅ Land value & acquisition cost
- ✅ Target raise amount
- ✅ Min/Max investment limits
- ✅ Expected IRR (low/high/target)
- ✅ Holding period
- ✅ Exit strategy
- ✅ Projected exit value

### **RERA Compliance**
- ✅ Applicability determination
- ✅ Registration numbers (where applicable)
- ✅ Project type classification
- ✅ Compliance documentation

### **Timeline & Status**
- ✅ Draft creation date
- ✅ Listed date
- ✅ Fundraising period
- ✅ Expected acquisition/exit dates
- ✅ Current status

### **Media & Assets**
- ✅ Cover image from Unsplash
- ✅ Multiple project images
- ✅ High-quality placeholder visuals

### **Risk Assessment**
- ✅ Categorized risk factors
- ✅ Severity ratings (low/medium/high)
- ✅ Risk descriptions

### **Approvals (for Listed Projects)**
- ✅ Legal approval
- ✅ Compliance approval
- ✅ Asset manager approval
- ✅ Admin approval

---

## 🔄 Re-running the Script

**Safe to run multiple times!**

The script will:
1. Delete existing demo projects (by project code)
2. Create fresh projects with latest data
3. Not affect other projects in your database

---

## 🛠️ Customization

### **Add More Projects**
Edit `packages/backend/scripts/seed-demo-projects.js` and add to the `demoProjects` array:

```javascript
{
  projectName: "Your Project Name",
  projectCode: "YPC-ABC-007",
  description: "Detailed description...",
  // ... rest of project data
}
```

### **Change Project Status**
Update the `status` field in the project object:
- `'draft'` - In draft mode
- `'listed'` - Live and accepting investments
- `'fundraising'` - Actively fundraising
- `'funded'` - Fully funded

### **Modify Financial Data**
Adjust values in the `financials` object:
```javascript
financials: {
  landValue: 50000000,  // ₹50 Cr
  targetRaise: 50000000,
  minimumInvestment: 1000000,  // ₹10 Lakh
  expectedIRR: {
    low: 12,
    high: 18,
    target: 15
  },
  // ...
}
```

---

## 🐛 Troubleshooting

### **Error: MongoDB Connection Failed**
- Check your `.env` file has correct `MONGODB_URI`
- Ensure MongoDB is running
- Verify network connectivity

### **Error: User not found**
- Script will auto-create a demo asset manager
- Check console output for credentials

### **Error: Duplicate key error**
- Clear existing projects manually:
  ```javascript
  db.projects.deleteMany({ projectCode: /^(BLR|PUN|GGN|HYD|CHN|JAI)/ })
  ```

### **Error: Validation failed**
- Check Project model schema
- Ensure all required fields are present
- Verify enum values match schema

---

## 📝 Notes

1. **Images**: Uses Unsplash placeholder images (requires internet)
2. **Coordinates**: Real GPS coordinates for each location
3. **Prices**: Realistic based on 2023-2024 Indian real estate market
4. **IRR**: Conservative estimates based on location & type
5. **RERA**: Correctly applied based on project type

---

## 🎯 Next Steps After Seeding

1. **Create Demo Investors**
   - Signup or create investor accounts
   - Complete KYC and onboarding

2. **Test Subscriptions**
   - Create subscriptions for listed projects
   - Test payment flows
   - Verify SPV assignment

3. **Test Distributions**
   - Create demo distributions
   - Test calculation logic
   - Verify investor payouts

4. **Admin Testing**
   - Test project approval workflows
   - Test compliance reviews
   - Test reporting features

---

## 🔐 Demo Credentials

If the script creates a new asset manager:

**Email**: `assetmanager@fractionalland.com`  
**Password**: `AssetManager@123`  
**Role**: Asset Manager

Use these credentials to:
- View all projects
- Manage project lifecycle
- Test admin features

---

**Happy Testing! 🚀**

