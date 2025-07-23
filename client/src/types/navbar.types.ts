/**
 * Core TypeScript interfaces and types for the responsive navbar component
 * Defines types for navbar components, state management, navigation links,
 * user menu items, glassmorphism configuration, and responsive breakpoints
 */

// ============================================================================
// User and Authentication Types
// ============================================================================

/**
 * User interface extending the existing AuthContext User type
 * Used for navbar user menu and profile display
 */
export interface NavbarUser {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  role: "user" | "admin";
  isPremium: boolean;
  profileImage?: string;
  xpPoints?: number;
  lastActive?: string;
}

/**
 * Authentication state interface for navbar components
 */
export interface AuthState {
  user: NavbarUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ============================================================================
// Navigation Link Types
// ============================================================================

/**
 * Navigation link configuration interface
 * Defines structure for both guest and authenticated navigation links
 */
export interface NavLink {
  /** Unique identifier for the link */
  id: string;
  /** Display label for the link */
  label: string;
  /** Navigation path/href */
  href: string;
  /** Optional icon identifier (e.g., "ri-dashboard-line") */
  icon?: string;
  /** Whether this link requires authentication to be visible */
  requiresAuth: boolean;
  /** Whether this link should be shown to guest users */
  showForGuest: boolean;
  /** Optional external link indicator */
  isExternal?: boolean;
  /** Optional badge text to display next to the link */
  badge?: string;
  /** Optional tooltip text */
  tooltip?: string;
}

/**
 * Navigation links configuration by authentication state
 */
export interface NavigationConfig {
  /** Links shown to guest (non-authenticated) users */
  guestLinks: NavLink[];
  /** Links shown to authenticated users */
  authenticatedLinks: NavLink[];
}

// ============================================================================
// User Menu Types
// ============================================================================

/**
 * User menu item interface for dropdown menu items
 */
export interface MenuItem {
  /** Unique identifier for the menu item */
  id: string;
  /** Display label for the menu item */
  label: string;
  /** Action to execute when item is clicked */
  action: () => void;
  /** Optional icon identifier */
  icon?: string;
  /** Visual variant for the menu item */
  variant?: 'default' | 'destructive';
  /** Whether the item should show a separator after it */
  showSeparator?: boolean;
  /** Whether the item is disabled */
  disabled?: boolean;
}

/**
 * User menu configuration for different authentication states
 */
export interface UserMenuConfig {
  /** Menu items for guest users */
  guestItems: MenuItem[];
  /** Menu items for authenticated users */
  authenticatedItems: MenuItem[];
}

// ============================================================================
// Responsive Breakpoint Types
// ============================================================================

/**
 * Responsive breakpoint enumeration
 * Defines the different screen size categories
 */
export type ResponsiveBreakpoint = 'mobile' | 'tablet' | 'desktop';

/**
 * Breakpoint configuration interface
 * Defines pixel thresholds for responsive behavior
 */
export interface BreakpointConfig {
  /** Mobile breakpoint threshold (max width) */
  mobile: number;
  /** Tablet breakpoint threshold (max width) */
  tablet: number;
  /** Desktop breakpoint threshold (min width) */
  desktop: number;
}

/**
 * Responsive state interface
 * Tracks current breakpoint and screen dimensions
 */
export interface ResponsiveState {
  /** Current active breakpoint */
  currentBreakpoint: ResponsiveBreakpoint;
  /** Current window width */
  windowWidth: number;
  /** Current window height */
  windowHeight: number;
  /** Whether the screen is in portrait orientation */
  isPortrait: boolean;
}

// ============================================================================
// Glassmorphism Theme Types
// ============================================================================

/**
 * Glassmorphism styling configuration interface
 * Defines the visual properties for the glass effect
 */
export interface GlassmorphismTheme {
  /** Background color with transparency */
  background: string;
  /** Backdrop blur filter value */
  backdropBlur: string;
  /** Border styling */
  border: string;
  /** Border radius */
  borderRadius: string;
  /** Box shadow styling */
  shadow: string;
  /** Optional gradient overlay */
  gradient?: string;
}

/**
 * Theme variant types for different glassmorphism styles
 */
export type GlassmorphismVariant = 'default' | 'transparent' | 'solid';

/**
 * Complete glassmorphism configuration
 */
export interface GlassmorphismConfig {
  /** Default theme configuration */
  default: GlassmorphismTheme;
  /** Transparent variant */
  transparent: GlassmorphismTheme;
  /** Solid variant */
  solid: GlassmorphismTheme;
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Main ResponsiveNavbar component props
 */
export interface ResponsiveNavbarProps {
  /** Optional CSS class name */
  className?: string;
  /** Visual variant of the navbar */
  variant?: GlassmorphismVariant;
  /** Whether to show the navbar in fixed position */
  fixed?: boolean;
  /** Custom navigation configuration */
  navigationConfig?: NavigationConfig;
  /** Custom user menu configuration */
  userMenuConfig?: UserMenuConfig;
  /** Custom glassmorphism theme */
  theme?: Partial<GlassmorphismConfig>;
}

/**
 * Logo component props
 */
export interface LogoProps {
  /** Size variant for the logo */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show the text alongside the logo */
  showText?: boolean;
  /** Optional CSS class name */
  className?: string;
  /** Custom logo text (defaults to "UniTOLC") */
  text?: string;
  /** Custom logo icon/image source */
  iconSrc?: string;
}

/**
 * NavigationLinks component props
 */
export interface NavigationLinksProps {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Current route path for active link highlighting */
  currentPath: string;
  /** Layout orientation */
  orientation: 'horizontal' | 'vertical';
  /** Navigation links configuration */
  links: NavLink[];
  /** Callback when a link is clicked */
  onLinkClick?: (link: NavLink) => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * UserMenu component props
 */
export interface UserMenuProps {
  /** Current user data */
  user: NavbarUser | null;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Menu items configuration */
  menuItems: MenuItem[];
  /** Callback for login action */
  onLogin: () => void;
  /** Callback for register action */
  onRegister: () => void;
  /** Callback for logout action */
  onLogout: () => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * MobileMenu component props
 */
export interface MobileMenuProps {
  /** Whether the mobile menu is open */
  isOpen: boolean;
  /** Callback to close the mobile menu */
  onClose: () => void;
  /** Navigation links to display */
  navigationLinks: NavLink[];
  /** User menu items to display */
  userMenuItems: MenuItem[];
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Current user data */
  user: NavbarUser | null;
  /** Current route path */
  currentPath: string;
  /** Optional CSS class name */
  className?: string;
}

/**
 * GlassmorphismWrapper component props
 */
export interface GlassmorphismWrapperProps {
  /** Child components to wrap */
  children: React.ReactNode;
  /** Glassmorphism variant */
  variant?: GlassmorphismVariant;
  /** Custom theme configuration */
  theme?: GlassmorphismTheme;
  /** Optional CSS class name */
  className?: string;
}

// ============================================================================
// State Management Types
// ============================================================================

/**
 * Navbar state interface for component state management
 * Tracks all interactive states of the navbar
 */
export interface NavbarState {
  /** Whether the mobile menu is open */
  isMobileMenuOpen: boolean;
  /** Whether the user menu dropdown is open */
  isUserMenuOpen: boolean;
  /** Current responsive breakpoint */
  currentBreakpoint: ResponsiveBreakpoint;
  /** Whether the page has been scrolled (for styling changes) */
  isScrolled: boolean;
  /** Whether the navbar is in loading state */
  isLoading: boolean;
}

/**
 * Navbar actions interface for state management
 */
export interface NavbarActions {
  /** Toggle mobile menu open/closed */
  toggleMobileMenu: () => void;
  /** Set mobile menu state explicitly */
  setMobileMenuOpen: (isOpen: boolean) => void;
  /** Toggle user menu open/closed */
  toggleUserMenu: () => void;
  /** Set user menu state explicitly */
  setUserMenuOpen: (isOpen: boolean) => void;
  /** Update current breakpoint */
  setCurrentBreakpoint: (breakpoint: ResponsiveBreakpoint) => void;
  /** Update scroll state */
  setScrolled: (isScrolled: boolean) => void;
  /** Update loading state */
  setLoading: (isLoading: boolean) => void;
  /** Reset all state to initial values */
  resetState: () => void;
}

/**
 * Combined navbar state and actions interface
 */
export interface NavbarStateManager extends NavbarState, NavbarActions {}

// ============================================================================
// Hook Types
// ============================================================================

/**
 * useNavbarState hook return type
 */
export interface UseNavbarStateReturn extends NavbarStateManager {
  /** Initialize the navbar state */
  initialize: () => void;
}

/**
 * useResponsiveBreakpoint hook return type
 */
export interface UseResponsiveBreakpointReturn extends ResponsiveState {
  /** Update breakpoint configuration */
  updateBreakpointConfig: (config: Partial<BreakpointConfig>) => void;
}

// ============================================================================
// Event Handler Types
// ============================================================================

/**
 * Navigation event handler types
 */
export interface NavigationEventHandlers {
  /** Handle navigation link click */
  onNavigationClick: (link: NavLink, event: React.MouseEvent) => void;
  /** Handle logo click */
  onLogoClick: (event: React.MouseEvent) => void;
  /** Handle menu item click */
  onMenuItemClick: (item: MenuItem, event: React.MouseEvent) => void;
}

/**
 * Responsive event handler types
 */
export interface ResponsiveEventHandlers {
  /** Handle window resize */
  onWindowResize: (width: number, height: number) => void;
  /** Handle orientation change */
  onOrientationChange: (isPortrait: boolean) => void;
  /** Handle breakpoint change */
  onBreakpointChange: (breakpoint: ResponsiveBreakpoint) => void;
}

// ============================================================================
// Configuration Constants Types
// ============================================================================

/**
 * Default configuration values type
 */
export interface NavbarDefaults {
  /** Default breakpoint configuration */
  breakpoints: BreakpointConfig;
  /** Default glassmorphism theme */
  glassmorphismTheme: GlassmorphismConfig;
  /** Default navigation configuration */
  navigationConfig: NavigationConfig;
  /** Default user menu configuration */
  userMenuConfig: UserMenuConfig;
  /** Default component props */
  componentDefaults: {
    logo: Partial<LogoProps>;
    navbar: Partial<ResponsiveNavbarProps>;
  };
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Navbar-specific error types
 */
export interface NavbarError {
  /** Error type identifier */
  type: 'AUTH_ERROR' | 'NAVIGATION_ERROR' | 'BREAKPOINT_ERROR' | 'THEME_ERROR';
  /** Error message */
  message: string;
  /** Optional error details */
  details?: any;
  /** Timestamp when error occurred */
  timestamp: Date;
}

/**
 * Error handler function type
 */
export type NavbarErrorHandler = (error: NavbarError) => void;