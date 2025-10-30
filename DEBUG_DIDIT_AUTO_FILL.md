# Debug: DIDIT Auto-Fill Not Working

## 🐛 **Issue**
After DIDIT verification, DOB and Gender fields are not auto-filling in the onboarding form.

## 🔍 **Debugging Steps Added**

I've added comprehensive console logging at every step of the verification process. Follow these steps to identify the issue:

---

## 📋 **Step-by-Step Debugging**

### **1. Upload Document & Check Backend Logs**

After uploading an ID document, check the **backend console** for these log blocks:

#### **A. DIDIT API Response**
```
===== DIDIT VERIFICATION RESPONSE =====
Full Response: {...}
ID Verification Data: {...}
=========================================
```

**What to check:**
- Is `date_of_birth` present? (e.g., `"date_of_birth": "1998-05-15"`)
- Is `age` present? (e.g., `"age": 27`)
- Is `gender` present? (e.g., `"gender": "Male"` or `"M"`)
- Is the response structure correct?

#### **B. Field Availability Check**
```
[INFO] DIDIT response received: {
  status: 'Approved',
  requestId: '...',
  hasDateOfBirth: true/false,  ← Check this
  hasAge: true/false,          ← Check this
  hasGender: true/false,       ← Check this
  hasAddress: true/false
}
```

**What to check:**
- Are `hasDateOfBirth`, `hasAge`, `hasGender` showing as `true`?
- If any show `false`, DIDIT didn't return that field

#### **C. Data Being Stored**
```
===== STORING DIDIT DATA =====
User ID: 69026871641405732fba044c
DOB from DIDIT: 1998-05-15      ← Check if present
Age from DIDIT: 27               ← Check if present
Gender from DIDIT: Male          ← Check if present
Full Name from DIDIT: John Doe
================================
```

**What to check:**
- Are DOB, Age, and Gender showing actual values or `undefined`?

#### **D. Data Stored in Database**
```
===== DATA STORED IN DATABASE =====
Stored DOB: 1998-05-15T00:00:00.000Z  ← Check if present
Stored Gender: male                    ← Check if present
DIDIT Verification Data: {
  "verifiedDOB": "1998-05-15T00:00:00.000Z",
  "verifiedAge": 27,
  "verifiedGender": "Male",
  ...
}
Verified Fields: ['dob', 'age', 'gender', ...]
====================================
```

**What to check:**
- Is `Stored DOB` showing a date or `undefined`?
- Is `Stored Gender` showing a value or `undefined`?
- Are DOB, Age, Gender in the `Verified Fields` array?

---

### **2. Check Status API Call**

After verification completes, the frontend calls `/api/v1/didit/status`. Check the **backend console**:

```
===== GET VERIFICATION STATUS =====
User ID: 69026871641405732fba044c
IsVerified: true
Verified Data: {
  "name": "John Doe",
  "dob": "1998-05-15T00:00:00.000Z",  ← Check if present
  "age": 27,                           ← Check if present
  "gender": "Male",                    ← Check if present
  "address": {...}
}
Verified Fields: {
  "dob": true,     ← Check if true
  "age": true,     ← Check if true
  "gender": true,  ← Check if true
  ...
}
====================================
```

**What to check:**
- Is `dob` present in `verifiedData`?
- Is `gender` present in `verifiedData`?
- Are `verifiedFields.dob` and `verifiedFields.gender` showing as `true`?

---

### **3. Check Frontend Console**

Open **Browser DevTools → Console** and look for:

```javascript
📤 Uploading document to DIDIT...
📥 DIDIT Verification Response: {...}
✅ Calling onVerificationComplete with: {...}

🔍 DIDIT Status Response: {...}
✅ Verified: true
📋 Verified Data: {
  dob: "1998-05-15T00:00:00.000Z",  ← Check if present
  age: 27,                           ← Check if present
  gender: "Male"                     ← Check if present
}
🔐 Verified Fields: {
  dob: true,     ← Check if true
  gender: true   ← Check if true
}

🎯 Auto-filling form with verified data...
📝 New form data: {
  dateOfBirth: "1998-05-15",  ← Check if filled
  gender: "male"               ← Check if filled
}
```

**What to check:**
- Is `verifiedData.dob` present?
- Is `verifiedData.gender` present?
- Is the form data being updated with these values?

---

## 🎯 **Common Issues & Fixes**

### **Issue 1: DIDIT Not Returning DOB/Gender**

**Symptoms:**
```
hasDateOfBirth: false
hasGender: false
```

**Cause**: DIDIT API didn't extract DOB/Gender from the uploaded document

**Solutions:**
1. **Try a clearer image** - Take a well-lit, high-resolution photo
2. **Try a different document** - Some IDs have better OCR results
3. **Check DIDIT documentation** - Verify which document types support DOB/Gender extraction

---

### **Issue 2: Data Stored But Not Retrieved**

**Symptoms:**
- Backend logs show data stored correctly
- Frontend shows `verifiedData: null` or empty fields

**Cause**: User data not refreshing after verification

**Fix**: Ensure `loadUser()` is called after verification:
```javascript
const handleVerificationComplete = async (verificationData) => {
  setIsVerified(true);
  await loadUser(); // ✅ Refresh user data
  await checkVerificationStatus(); // ✅ Re-fetch verification status
  setShowDIDIT(false);
};
```

---

### **Issue 3: Gender Not Matching Enum**

**Symptoms:**
```
Gender from DIDIT: M
Stored Gender: undefined
```

**Cause**: DIDIT returns `"M"` but our enum expects `"male"`

**Fix**: Already implemented in code:
```javascript
const genderMap = {
  'M': 'male',
  'Male': 'male',
  'MALE': 'male',
  'F': 'female',
  'Female': 'female',
  'FEMALE': 'female',
  'O': 'other',
  'Other': 'other',
  'OTHER': 'other'
};
updateData.gender = genderMap[idVerification.gender] || idVerification.gender.toLowerCase();
```

---

### **Issue 4: Form Not Auto-Filling**

**Symptoms:**
- Backend logs show data correctly
- Frontend logs show `verifiedFields.dob: true`
- But form fields remain empty

**Cause**: Form state not updating

**Check**:
```javascript
// In checkVerificationStatus()
console.log('📝 New form data:', newFormData);
setFormData(newFormData);
```

Make sure `setFormData()` is being called with the new data.

---

## 🧪 **Testing Checklist**

Run through these steps:

1. ✅ Restart backend server
2. ✅ Open browser with DevTools console
3. ✅ Navigate to `/onboarding/step1`
4. ✅ Upload ID document
5. ✅ Watch **backend console** for:
   - DIDIT response
   - Data storage logs
6. ✅ Watch **frontend console** for:
   - Verification response
   - Status fetch
   - Form auto-fill
7. ✅ Check if form fields are filled and locked

---

## 📊 **Expected Successful Flow**

### **Backend Console**:
```
===== DIDIT VERIFICATION RESPONSE =====
[Shows DOB, Age, Gender present]

===== STORING DIDIT DATA =====
DOB from DIDIT: 1998-05-15
Age from DIDIT: 27
Gender from DIDIT: Male

===== DATA STORED IN DATABASE =====
Stored DOB: 1998-05-15T00:00:00.000Z
Stored Gender: male

===== GET VERIFICATION STATUS =====
Verified Data: {"dob":"1998-05-15T00:00:00.000Z","age":27,"gender":"Male"}
Verified Fields: {"dob":true,"gender":true}
```

### **Frontend Console**:
```
✅ Verified: true
📋 Verified Data: {dob: "1998-05-15T00:00:00.000Z", age: 27, gender: "Male"}
🔐 Verified Fields: {dob: true, gender: true}
🎯 Auto-filling form with verified data...
📝 New form data: {dateOfBirth: "1998-05-15", gender: "male"}
```

### **UI Result**:
- ✅ DOB field: Filled with date, green border, locked
- ✅ Gender field: Filled with "Male", green border, locked
- ✅ Green checkmarks visible
- ✅ "✓ Verified via DIDIT" text shown

---

## 🚀 **Next Steps**

1. **Upload a document** and watch the logs
2. **Share the console output** (both backend and frontend) here
3. I'll identify exactly where the issue is based on the logs

---

## 📝 **Quick Debug Command**

To see all relevant logs in one place, run:

```bash
# Backend
cd packages/backend
npm run dev | grep -E "(DIDIT|STORING|STORED|STATUS)"
```

This will filter only DIDIT-related logs.

---

**Ready to debug!** Upload a document and share the console output! 🔍

