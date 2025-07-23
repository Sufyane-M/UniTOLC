/**
 * Utility function to check if user has premium access to a feature
 * Returns true if the feature should be available to the user
 */
export const premiumGate = (user: { isPremium?: boolean } | null | undefined, baseLimit: number = 0): boolean => {
  // If there's no user, gate the feature
  if (!user) return false;
  
  // If user has premium, allow access
  if (user.isPremium) return true;
  
  // If there's a base limit (some features allow limited free use), use it
  return baseLimit > 0;
}; 