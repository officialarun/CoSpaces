# Dashboard Profile Section

## Overview

A comprehensive profile section has been added to the dashboard that displays all information collected during the onboarding process (Steps 1 & 2).

## Features

### 🎯 Toggle View
- **Button Location**: Top-right of dashboard header
- **States**: "View Profile" / "Hide Profile"
- **Default**: Hidden (collapsed) - User can expand when needed

### 📋 Profile Layout

The profile section is organized into **4 color-coded cards** in a 2x2 grid:

#### 1. **Personal Information** (Blue Card 🔵)
- Full Name
- Email Address
- Phone Number
- Date of Birth (formatted as: "Month Day, Year")
- Complete Address (Street, City, State, Pincode, Country)

#### 2. **Professional Details** (Green Card 🟢)
- Occupation (Salaried, Self Employed, Business Owner, etc.)
- Company/Organization Name
- Designation/Job Title
- Years of Experience
- Education Level
- Annual Income Range

#### 3. **Land Preferences** (Purple Card 🟣)
- **Preferred Land Types**: Displayed as chips/badges with emoji icons
  - 🌾 Agricultural
  - 🏘️ Residential
  - 🏢 Commercial
  - 🏭 Industrial
  - 🏗️ Mixed Use
  
- **Preferred Locations**: List of locations with 📍 pin icon
  - Shows: City, State, Pincode

#### 4. **Investment Strategy** (Orange Card 🟠)
- **Investment Goal**: Capital Appreciation, Regular Income, etc.
- **Risk Appetite**: Color-coded badge
  - 🟢 Conservative (Green badge)
  - 🟡 Moderate (Yellow badge)
  - 🔴 Aggressive (Red badge)
- **Investment Horizon**: Short/Medium/Long term
- **Investment Range**: Min - Max amounts in Indian Rupees

### ✏️ Edit Profile Button
- **Location**: Top-right of profile section
- **Action**: Redirects to `/onboarding/step1` to edit details
- **Icon**: Pencil/Edit icon
- **Users can**: Update their information through the onboarding flow

## Visual Design

### Color Scheme
```
Personal Info:    bg-blue-50    (Light Blue)
Professional:     bg-green-50   (Light Green)  
Land Preferences: bg-purple-50  (Light Purple)
Investment:       bg-orange-50  (Light Orange)
```

### Layout
- **Desktop (lg)**: 2x2 grid
- **Mobile**: Stacked single column
- **Cards**: Rounded corners with padding
- **Headers**: Icons + Bold text
- **Data**: Label (gray) + Value (bold black)

## Data Formatting

All data from the onboarding is formatted for readability:

### Occupation Types
```javascript
'salaried' → 'Salaried Employee'
'self_employed' → 'Self Employed'
'business_owner' → 'Business Owner'
'professional' → 'Professional'
'retired' → 'Retired'
'student' → 'Student'
```

### Education Levels
```javascript
'high_school' → 'High School'
'undergraduate' → 'Undergraduate'
'postgraduate' → 'Postgraduate'
'doctorate' → 'Doctorate'
```

### Income Ranges
```javascript
'below_5L' → 'Below ₹5 Lakhs'
'5L_10L' → '₹5 - 10 Lakhs'
'10L_25L' → '₹10 - 25 Lakhs'
'25L_50L' → '₹25 - 50 Lakhs'
'50L_1Cr' → '₹50 Lakhs - 1 Crore'
'above_1Cr' → 'Above ₹1 Crore'
```

### Land Types (with Emojis)
```javascript
'agricultural' → '🌾 Agricultural'
'residential' → '🏘️ Residential'
'commercial' → '🏢 Commercial'
'industrial' → '🏭 Industrial'
'mixed_use' → '🏗️ Mixed Use'
```

### Risk Appetite (with Color Coding)
```javascript
'conservative' → Green badge: 'Conservative'
'moderate' → Yellow badge: 'Moderate'
'aggressive' → Red badge: 'Aggressive'
```

### Investment Horizon
```javascript
'short_term' → 'Short Term (< 3 years)'
'medium_term' → 'Medium Term (3-5 years)'
'long_term' → 'Long Term (> 5 years)'
```

### Investment Goals
```javascript
'capital_appreciation' → 'Capital Appreciation'
'regular_income' → 'Regular Income'
'diversification' → 'Portfolio Diversification'
'tax_benefits' → 'Tax Benefits'
```

## Responsive Design

### Desktop (lg: 1024px+)
- 2-column grid layout
- All 4 cards visible side-by-side
- Comfortable spacing

### Tablet (md: 768px - 1023px)
- 2-column grid maintained
- Cards may wrap to 2x2

### Mobile (< 768px)
- Single column stack
- Full-width cards
- Easy scrolling

## User Experience

### Why This Design?

1. **Collapsible**: Doesn't clutter dashboard - shows only when needed
2. **Color-Coded**: Each section has distinct color for easy scanning
3. **Icon-Based**: Visual icons help quick identification
4. **Edit Access**: Easy one-click access to update information
5. **Formatted Data**: All data displayed in human-readable format
6. **Organized**: Logical grouping of related information

### Use Cases

1. **Quick Reference**: Users can quickly check their saved preferences
2. **Verification**: Users can verify what information is stored
3. **Updates**: Easy access to edit outdated information
4. **Transparency**: Users see exactly what data the platform has

## Technical Details

### Component: `packages/frontend/pages/dashboard/index.js`

**State Management:**
```javascript
const [showProfile, setShowProfile] = useState(false);
```

**Toggle Function:**
```javascript
onClick={() => setShowProfile(!showProfile)}
```

**Data Source:**
```javascript
const { user } = useAuth(); // From AuthContext
```

### Helper Functions

All formatting functions are defined within the component:
- `formatOccupation()`
- `formatEducation()`
- `formatIncome()`
- `formatLandType()`
- `formatInvestmentGoal()`
- `formatRiskAppetite()`
- `formatInvestmentHorizon()`

## Future Enhancements

1. **Inline Editing**: Edit fields directly from profile without going to onboarding
2. **Profile Completeness**: Show percentage of profile completion
3. **Profile Picture**: Add avatar/profile photo upload
4. **Download PDF**: Export profile as PDF
5. **Privacy Controls**: Toggle visibility of certain fields
6. **Activity Timeline**: Show when profile was last updated
7. **Document Attachments**: Link to uploaded KYC documents
8. **Verification Badges**: Show verification status for each section

## Testing Checklist

- [ ] Profile section hidden by default
- [ ] "View Profile" button toggles visibility
- [ ] All 4 card sections display correctly
- [ ] Personal information shows correctly
- [ ] Professional details formatted properly
- [ ] Land types displayed with emojis
- [ ] Locations show with proper formatting
- [ ] Investment strategy displays with color-coded badges
- [ ] Investment amounts formatted with commas
- [ ] "Edit Profile" button redirects to onboarding
- [ ] Responsive layout works on mobile/tablet
- [ ] Missing fields handled gracefully (no undefined errors)
- [ ] Date formatting works correctly
- [ ] Address displays properly with line breaks

## Support

For issues or feature requests related to the profile section, please contact the development team.

