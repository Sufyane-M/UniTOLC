/**
 * Main types export file
 * Re-exports all navbar types and constants for easy importing
 */

// Export all navbar types
export type {
  // User and Authentication Types
  NavbarUser,
  AuthState,
  
  // Navigation Link Types
  NavLink,
  NavigationConfig,
  
  // User Menu Types
  MenuItem,
  UserMenuConfig,
  
  // Responsive Breakpoint Types
  ResponsiveBreakpoint,
  BreakpointConfig,
  ResponsiveState,
  
  // Glassmorphism Theme Types
  GlassmorphismTheme,
  GlassmorphismVariant,
  GlassmorphismConfig,
  
  // Component Props Types
  ResponsiveNavbarProps,
  LogoProps,
  NavigationLinksProps,
  UserMenuProps,
  MobileMenuProps,
  GlassmorphismWrapperProps,
  
  // State Management Types
  NavbarState,
  NavbarActions,
  NavbarStateManager,
  
  // Hook Types
  UseNavbarStateReturn,
  UseResponsiveBreakpointReturn,
  
  // Event Handler Types
  NavigationEventHandlers,
  ResponsiveEventHandlers,
  
  // Configuration Types
  NavbarDefaults,
  
  // Error Types
  NavbarError,
  NavbarErrorHandler
} from './navbar.types';

// Export all navbar constants
export {
  // Breakpoint Configuration
  DEFAULT_BREAKPOINTS,
  
  // Glassmorphism Theme Configuration
  DEFAULT_GLASSMORPHISM_CONFIG,
  
  // Navigation Links Configuration
  DEFAULT_GUEST_LINKS,
  DEFAULT_AUTHENTICATED_LINKS,
  DEFAULT_NAVIGATION_CONFIG,
  
  // User Menu Configuration
  DEFAULT_GUEST_MENU_ITEMS,
  DEFAULT_AUTHENTICATED_MENU_ITEMS,
  DEFAULT_USER_MENU_CONFIG,
  
  // Component Default Props
  DEFAULT_LOGO_PROPS,
  DEFAULT_NAVBAR_PROPS,
  
  // Complete Default Configuration
  NAVBAR_DEFAULTS,
  
  // CSS Class Constants
  GLASSMORPHISM_CLASSES,
  RESPONSIVE_CLASSES,
  ANIMATION_CLASSES,
  
  // Accessibility Constants
  ACCESSIBILITY_LABELS,
  KEYBOARD_KEYS
} from './navbar.constants';