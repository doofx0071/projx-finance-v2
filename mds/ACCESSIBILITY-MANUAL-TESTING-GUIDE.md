# Accessibility Manual Testing Guide

**Project:** PHPinancia Finance Tracker  
**Date:** January 2025  
**Purpose:** Step-by-step guide for manual accessibility testing  
**Time Required:** 30-45 minutes

---

## 🎯 **OVERVIEW**

This guide will walk you through manually testing all accessibility features implemented in PHPinancia. Follow each section in order to ensure comprehensive testing.

---

## 🔧 **SETUP**

### **Before You Start**
1. **Close all browser tabs** except the testing tab
2. **Start the dev server**: `npm run dev`
3. **Open browser**: Navigate to `http://localhost:3000`
4. **Disable mouse** (optional but recommended): Unplug mouse or don't use it during testing

### **Tools Needed**
- ✅ Keyboard only (no mouse)
- ✅ Browser (Chrome, Firefox, or Edge)
- ✅ Screen reader (optional but recommended):
  - **Windows**: NVDA (free) - [Download here](https://www.nvaccess.org/download/)
  - **macOS**: VoiceOver (built-in) - Press Cmd+F5 to enable
  - **Linux**: Orca (built-in)

---

## 📝 **PART 1: KEYBOARD NAVIGATION TESTING**

### **Test 1: Skip Navigation** ⏱️ 2 minutes

**Steps:**
1. Load the homepage (`http://localhost:3000`)
2. Press **Tab** once
3. You should see a "Skip to main content" link appear at the top

**Expected Results:**
- ✅ Link appears with clear focus indicator
- ✅ Link text reads "Skip to main content"
- ✅ Focus indicator is visible (blue outline/ring)

**Action:**
4. Press **Enter** to activate the skip link

**Expected Results:**
- ✅ Page scrolls to main content
- ✅ Focus moves to main content area
- ✅ You can continue tabbing through main content

**Status:** [ ] PASS [ ] FAIL

---

### **Test 2: Page Navigation** ⏱️ 5 minutes

**Steps:**
1. From homepage, press **Tab** until you reach a navigation link
2. Press **Enter** to navigate to a different page (e.g., Transactions)
3. Observe what happens

**Expected Results:**
- ✅ Page navigates successfully
- ✅ Focus automatically moves to main content
- ✅ Page scrolls to top
- ✅ You can press Tab to continue through the page

**Test Multiple Pages:**
- [ ] Dashboard → Transactions
- [ ] Transactions → Categories
- [ ] Categories → Insights
- [ ] Insights → Reports

**Status:** [ ] PASS [ ] FAIL

---

### **Test 3: Tab Order** ⏱️ 5 minutes

**Steps:**
1. Go to any page (e.g., Dashboard)
2. Press **Ctrl+Shift+T** to enable Tab Order Visualizer (dev mode only)
3. Observe the numbered badges on all interactive elements

**Expected Results:**
- ✅ All interactive elements have numbers
- ✅ Numbers follow logical reading order (left to right, top to bottom)
- ✅ No elements are skipped
- ✅ No unexpected tab stops

**Test on Multiple Pages:**
- [ ] Dashboard
- [ ] Transactions page
- [ ] Categories page
- [ ] Forms (Add Transaction)

**To Close Visualizer:**
- Press **Ctrl+Shift+T** again

**Status:** [ ] PASS [ ] FAIL

---

### **Test 4: Focus Indicators** ⏱️ 3 minutes

**Steps:**
1. Go to any page
2. Press **Tab** repeatedly through all interactive elements
3. Observe the focus indicator on each element

**Expected Results:**
- ✅ Every interactive element shows a clear focus indicator
- ✅ Focus indicator is visible (blue ring/outline)
- ✅ Focus indicator has good contrast (visible against background)
- ✅ Focus indicator doesn't disappear behind other elements

**Test Elements:**
- [ ] Buttons
- [ ] Links
- [ ] Form inputs
- [ ] Dropdowns/Selects
- [ ] Checkboxes
- [ ] Radio buttons

**Status:** [ ] PASS [ ] FAIL

---

### **Test 5: Form Navigation** ⏱️ 5 minutes

**Steps:**
1. Go to Transactions page
2. Click "Add Transaction" button (or press Enter when focused)
3. Use **Tab** to navigate through the form

**Expected Results:**
- ✅ All form fields are reachable with Tab
- ✅ Tab order is logical (top to bottom)
- ✅ Labels are clearly associated with inputs
- ✅ Required fields are indicated

**Test Form Submission:**
4. Leave required fields empty
5. Press **Enter** or Tab to Submit button and press **Enter**

**Expected Results:**
- ✅ Error messages appear
- ✅ Focus moves to first error field
- ✅ Error messages are clearly visible

**Test Forms:**
- [ ] Add Transaction form
- [ ] Add Category form
- [ ] Add Budget form

**Status:** [ ] PASS [ ] FAIL

---

### **Test 6: Modal/Dialog Navigation** ⏱️ 3 minutes

**Steps:**
1. Open any modal/dialog (e.g., Add Transaction)
2. Press **Tab** repeatedly

**Expected Results:**
- ✅ Focus stays inside the modal (focus trap)
- ✅ Tab cycles through modal elements only
- ✅ Can't tab to elements behind the modal

**Test Closing:**
3. Press **Escape** key

**Expected Results:**
- ✅ Modal closes
- ✅ Focus returns to the button that opened the modal

**Test Modals:**
- [ ] Add Transaction dialog
- [ ] Delete confirmation dialog
- [ ] Edit dialogs

**Status:** [ ] PASS [ ] FAIL

---

### **Test 7: Dropdown/Menu Navigation** ⏱️ 3 minutes

**Steps:**
1. Navigate to a dropdown menu (e.g., user menu, category filter)
2. Press **Enter** or **Space** to open

**Expected Results:**
- ✅ Menu opens
- ✅ Focus moves into menu

**Navigation:**
3. Press **Arrow Down** and **Arrow Up** keys

**Expected Results:**
- ✅ Arrow keys navigate through menu items
- ✅ Current item is highlighted
- ✅ Press **Enter** to select item
- ✅ Press **Escape** to close menu

**Test Menus:**
- [ ] User menu
- [ ] Category dropdown
- [ ] Date range picker
- [ ] Filter menus

**Status:** [ ] PASS [ ] FAIL

---

## 📝 **PART 2: SCREEN READER TESTING**

### **Setup Screen Reader**

**Windows (NVDA):**
1. Download NVDA from https://www.nvaccess.org/download/
2. Install and run NVDA
3. NVDA will start speaking immediately
4. Press **Insert+Q** to quit NVDA when done

**macOS (VoiceOver):**
1. Press **Cmd+F5** to enable VoiceOver
2. VoiceOver will start speaking
3. Press **Cmd+F5** again to disable when done

**Basic Commands:**
- **Read next item**: Arrow Down (or Ctrl+Option+Right on Mac)
- **Read previous item**: Arrow Up (or Ctrl+Option+Left on Mac)
- **Stop reading**: Ctrl (or Ctrl+Option on Mac)

---

### **Test 8: Page Structure** ⏱️ 5 minutes

**Steps:**
1. Enable screen reader
2. Load homepage
3. Listen to what the screen reader announces

**Expected Announcements:**
- ✅ Page title announced
- ✅ "Skip to main content" link announced
- ✅ Navigation region announced
- ✅ Main content region announced

**Navigate by Headings:**
4. Press **H** key (NVDA) or **Cmd+Option+H** (VoiceOver) to jump between headings

**Expected Results:**
- ✅ All headings are announced with levels (Heading 1, Heading 2, etc.)
- ✅ Heading hierarchy is logical (H1 → H2 → H3)

**Status:** [ ] PASS [ ] FAIL

---

### **Test 9: Form Accessibility** ⏱️ 5 minutes

**Steps:**
1. Navigate to Add Transaction form
2. Tab through each form field
3. Listen to screen reader announcements

**Expected Announcements for Each Field:**
- ✅ Label announced (e.g., "Amount")
- ✅ Field type announced (e.g., "Edit text" or "Combo box")
- ✅ Required status announced (e.g., "Required")
- ✅ Current value announced (if any)

**Test Error Messages:**
4. Submit form with errors
5. Listen to announcements

**Expected Announcements:**
- ✅ Error message announced immediately
- ✅ "Invalid" status announced for error fields
- ✅ Error description announced

**Status:** [ ] PASS [ ] FAIL

---

### **Test 10: Dynamic Content** ⏱️ 5 minutes

**Steps:**
1. Go to Transactions page
2. Click "Add Transaction" button
3. Listen to screen reader

**Expected Announcements:**
- ✅ "Loading..." announced when form is loading
- ✅ Form fields announced when loaded

**Test Form Submission:**
4. Fill out form and submit
5. Listen to announcements

**Expected Announcements:**
- ✅ "Saving..." or "Loading..." announced
- ✅ Success message announced (e.g., "Transaction saved successfully")
- ✅ Page update announced

**Test Data Loading:**
6. Navigate to different pages
7. Listen for loading announcements

**Expected Announcements:**
- ✅ "Loading transactions..." announced
- ✅ "X transactions loaded" announced when complete

**Status:** [ ] PASS [ ] FAIL

---

### **Test 11: Navigation Announcements** ⏱️ 3 minutes

**Steps:**
1. Navigate through the sidebar menu
2. Listen to screen reader announcements

**Expected Announcements:**
- ✅ Each link announced with its name
- ✅ Current page indicated (e.g., "Dashboard, current page")
- ✅ Link purpose is clear

**Test Page Navigation:**
3. Navigate to different pages
4. Listen to announcements

**Expected Announcements:**
- ✅ New page title announced
- ✅ Main content region announced
- ✅ Focus moved to main content

**Status:** [ ] PASS [ ] FAIL

---

## 📝 **PART 3: VISUAL INSPECTION**

### **Test 12: Color Contrast** ⏱️ 3 minutes

**Steps:**
1. Visually inspect all text on the page
2. Check contrast between text and background

**Expected Results:**
- ✅ All text is easily readable
- ✅ No light gray text on white background
- ✅ Focus indicators are clearly visible
- ✅ Error messages are clearly visible (red text)

**Use Browser DevTools:**
1. Right-click any text element
2. Select "Inspect"
3. Look for contrast ratio in the Styles panel

**Minimum Requirements:**
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

**Status:** [ ] PASS [ ] FAIL

---

### **Test 13: Text Resizing** ⏱️ 2 minutes

**Steps:**
1. Press **Ctrl+Plus** (or **Cmd+Plus** on Mac) to zoom to 200%
2. Check if content is still readable

**Expected Results:**
- ✅ Text is larger and readable
- ✅ No horizontal scrolling required
- ✅ Content doesn't overlap
- ✅ All functionality still works

**Reset Zoom:**
- Press **Ctrl+0** (or **Cmd+0** on Mac)

**Status:** [ ] PASS [ ] FAIL

---

## 📊 **TESTING CHECKLIST SUMMARY**

### **Keyboard Navigation**
- [ ] Test 1: Skip Navigation
- [ ] Test 2: Page Navigation
- [ ] Test 3: Tab Order
- [ ] Test 4: Focus Indicators
- [ ] Test 5: Form Navigation
- [ ] Test 6: Modal/Dialog Navigation
- [ ] Test 7: Dropdown/Menu Navigation

### **Screen Reader Testing**
- [ ] Test 8: Page Structure
- [ ] Test 9: Form Accessibility
- [ ] Test 10: Dynamic Content
- [ ] Test 11: Navigation Announcements

### **Visual Inspection**
- [ ] Test 12: Color Contrast
- [ ] Test 13: Text Resizing

---

## 🐛 **REPORTING ISSUES**

If you find any issues during testing, document them with:

1. **Test Number**: Which test failed
2. **Page/Component**: Where the issue occurred
3. **Steps to Reproduce**: How to recreate the issue
4. **Expected Behavior**: What should happen
5. **Actual Behavior**: What actually happened
6. **Screenshot**: If applicable

**Example:**
```
Test 5: Form Navigation - FAIL
Page: Add Transaction form
Steps: Tab through form, submit with errors
Expected: Error message announced
Actual: No announcement, only visual error
Screenshot: [attach]
```

---

## ✅ **COMPLETION**

Once all tests pass:
- ✅ All keyboard navigation works
- ✅ All screen reader announcements work
- ✅ All visual elements are accessible
- ✅ Application is WCAG 2.1 Level AA compliant

**Congratulations! Your application is fully accessible!** 🎉

---

## 📚 **ADDITIONAL RESOURCES**

### **Screen Reader Guides**
- [NVDA User Guide](https://www.nvaccess.org/files/nvda/documentation/userGuide.html)
- [VoiceOver User Guide](https://support.apple.com/guide/voiceover/welcome/mac)

### **Accessibility Testing Tools**
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Chrome Accessibility Inspector](https://developer.chrome.com/docs/devtools/accessibility/)

### **Learning Resources**
- [WebAIM](https://webaim.org/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Happy Testing!** 🎉

