/**
 * Get redirect path based on user role and onboarding status
 * @param {Object} user - User object
 * @returns {String} Redirect path
 */
export function getRedirectPath(user) {
  // If onboarding not completed, redirect to onboarding
  if (!user.onboardingCompleted) {
    const onboardingStep = user.onboardingStep || 0;
    if (onboardingStep === 0) {
      return '/onboarding/step1';
    } else if (onboardingStep === 1) {
      return '/onboarding/step2';
    }
  }

  // Role-based redirects (after onboarding is complete)
  switch (user.role) {
    case 'admin':
      // Redirect to admin frontend (port 3001)
      // In production, this would be a full URL
      if (typeof window !== 'undefined' && window.location.port === '3000') {
        return window.location.origin.replace(':3000', ':3001') + '/dashboard?tab=users';
      }
      // Fallback: could create /admin route in main frontend
      return '/admin/dashboard';
    
    case 'asset_manager':
      return '/dashboard/asset-manager';
    
    case 'compliance_officer':
      // Check if compliance dashboard exists
      return '/dashboard/compliance';
    
    case 'investor':
    default:
      return '/dashboard';
  }
}

