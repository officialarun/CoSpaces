# Frontend Build Fix for Render - Next.js Not Found

## Problem

The frontend build was failing on Render with:
```
sh: 1: next: not found
npm error Lifecycle script `build` failed with error
```

## Root Cause

The build script was using:
```json
"build:frontend": "cd packages/frontend && npm run build"
```

This approach has issues in npm workspaces:
1. When `cd` is used, the workspace context might not be properly set up
2. The `next` binary might not be in the PATH
3. Dependencies might be hoisted to root `node_modules`, causing resolution issues
4. npm might not correctly resolve workspace dependencies when using `cd`

## Solution

Changed to use npm workspace commands (consistent with backend build):
```json
"build:frontend": "npm run build --workspace=packages/frontend",
"build:admin": "npm run build --workspace=packages/admin-frontend"
```

## Why This Works

npm workspace commands (`--workspace`) automatically:
1. **Run from the correct directory**: Executes the command from within the workspace directory
2. **Resolve dependencies correctly**: Looks for dependencies in both workspace and root `node_modules`
3. **Set up PATH correctly**: Ensures binaries in `node_modules/.bin` are available
4. **Maintain workspace context**: Preserves the workspace relationship during execution

## Files Modified

### `package.json` (Root)
**Changed**:
- `build:frontend`: From `cd packages/frontend && npm run build` to `npm run build --workspace=packages/frontend`
- `build:admin`: From `cd packages/admin-frontend && npm run build` to `npm run build --workspace=packages/admin-frontend`

**Unchanged**:
- `build:backend`: Already using workspace command (was working)
- Dev scripts: Still use `cd` approach (works fine for local development)
- Start scripts: Still use `cd` approach (works fine for production start)

## Testing

### Local Development
```bash
# Test frontend build
npm run build:frontend

# Test admin build
npm run build:admin

# Test all builds
npm run build
```

### Render Deployment
1. Build should now succeed
2. Next.js binary will be found correctly
3. Dependencies will be resolved from workspace

## Consistency

All build scripts now use the same pattern:
- ✅ `build:backend`: `npm run build --workspace=packages/backend`
- ✅ `build:frontend`: `npm run build --workspace=packages/frontend`
- ✅ `build:admin`: `npm run build --workspace=packages/admin-frontend`

## Notes

- **Dev scripts unchanged**: Local development scripts still use `cd` approach, which works fine locally
- **Start scripts unchanged**: Production start scripts still use `cd` approach, which works fine for running
- **Build scripts updated**: Only build scripts needed the workspace command fix
- **Dependencies**: Next.js is in `dependencies` (not `devDependencies`), so it's installed in production

## Next Steps

1. ✅ Code changes complete
2. 📋 Test locally: `npm run build:frontend`
3. 📋 Deploy to Render
4. 📋 Verify build succeeds
5. 📋 Check that Next.js is found correctly

