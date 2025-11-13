<!-- 4f2a78c8-030a-411c-99f7-599132292c15 c05926c8-09d4-49e9-9acb-1ccc773d762f -->
# Remove Excessive Console Logs

## Current Situation

- **452 console log statements** found across **61 files**
- Most are debug logs added during troubleshooting (phone number, bank details, distribution fetching)
- Project has proper Winston logger system in place
- Mix of console.log, console.error, console.warn throughout codebase

## Strategy

### 1. Keep Console Logs In:

- **Scripts** (`packages/backend/scripts/*`) - These are run manually and logging is useful
- **Critical error logging** - Only if logger is not available in that context

### 2. Remove Console Logs From:

- **Frontend components** - All debug console.logs
- **Backend controllers** - Replace with logger
- **Backend services** - Replace with logger
- **Frontend pages** - Remove debug logs
- **API call handlers** - Remove verbose logging

### 3. Replace With Logger:

- Backend `console.error` → `logger.error`
- Backend `console.warn` → `logger.warn`
- Backend `console.info` → `logger.info`
- Keep frontend `console.error` for critical errors only (user-facing errors)

## Files to Clean Up

### High Priority (Excessive Debug Logs):

1. `packages/frontend/pages/dashboard/profile.js` - 14 console.logs (phone number debugging)
2. `packages/admin-frontend/pages/distributions/[id]/payments.js` - 15 console.logs (distribution fetching debugging)
3. `packages/backend/src/controllers/user.controller.js` - 47 console.logs (phone update debugging)
4. `packages/frontend/lib/auth.js` - 15 console.logs (user loadin

### To-dos

- [ ] Delete subscription-related backend files (model, controller, routes, email templates)
- [ ] Update server.js to remove subscription routes
- [ ] Remove subscription references from project.controller.js and admin.controller.js
- [ ] Remove subscription references from notification, compliance, escrow, and payment controllers
- [ ] Update AuditLog model to remove subscription event types
- [ ] Delete frontend subscription page and remove from navigation
- [ ] Remove subscriptionAPI from frontend lib/api.js