/**
 * Default configuration constants for the responsive navbar
 * Contains default values for breakpoints, themes, navigation links, and menu items
 */

import type {
  BreakpointConfig,
  GlassmorphismConfig,
  NavigationConfig,
  UserMenuConfig,
  NavbarDefaults,
  NavLink,
  MenuItem
} from './navbar.types';

// ============================================================================
// Breakpoint Configuration
// ============================================================================

/**
 * Default responsive breakpoint thresholds
 * Based on common device sizes and Tailwind CSS breakpoints
 */
export const DEFAULT_BREAKPOINTS: BreakpointConfig = {
  mobile: 768,    // < 768px
  tablet: 1024,   // 768px - 1024px
  desktop: 1024   // > 1024px
} as const;

// ============================================================================
// Glassmorphism Theme Configuration
// ============================================================================

/**
 * Default glassmorphism theme configuration
 * Implements the design specified in requirements with rgba(255, 255, 255, 0.25) background
 */
export const DEFAULT_GLASSMORPHISM_CONFIG: GlassmorphismConfig = {
  default: {
    background: 'rgba(255, 255, 255, 0.25)',
    backdropBlur: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '0px',
    shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
  },
  transparent: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropBlur: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0px',
    shadow: '0 4px 16px 0 rgba(31, 38, 135, 0.2)'
  },
  solid: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropBlur: 'none',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '0px',
    shadow: '0 2px 8px 0 rgba(0, 0, 0, 0.1)'
  }
} as const;

// ============================================================================
// Navigation Links Configuration
// ============================================================================

/**
 * Default navigation links for guest users
 * Based on requirements: "Cos'è il TOLC" and "FAQ" for guests
 */
export const DEFAULT_GUEST_LINKS: NavLink[] = [
  {
    id: 'tolc-info',
    label: "Cos'è il TOLC",
    href: '/tolc-info',
    icon: 'ri-information-line',
    requiresAuth: false,
    showForGuest: true,
    tooltip: 'Informazioni sul test TOLC'
  },
  {
    id: 'faq',
    label: 'FAQ',
    href: '/faq',
    icon: 'ri-question-line',
    requiresAuth: false,
    showForGuest: true,
    tooltip: 'Domande frequenti'
  }
] as const;

/**
 * Default navigation links for authenticated users
 * Based on requirements: "Dashboard", "Pratica", "Statistiche", "Cos'è il TOLC", "FAQ"
 */
export const DEFAULT_AUTHENTICATED_LINKS: NavLink[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'ri-dashboard-line',
    requiresAuth: true,
    showForGuest: false,
    tooltip: 'Pannello di controllo principale'
  },
  {
    id: 'practice',
    label: 'Pratica',
    href: '/practice',
    icon: 'ri-edit-line',
    requiresAuth: true,
    showForGuest: false,
    tooltip: 'Esercitati con quiz e simulazioni'
  },
  {
    id: 'analytics',
    label: 'Statistiche',
    href: '/analytics',
    icon: 'ri-bar-chart-line',
    requiresAuth: true,
    showForGuest: false,
    tooltip: 'Visualizza i tuoi progressi'
  },
  {
    id: 'tolc-info-auth',
    label: "Cos'è il TOLC",
    href: '/tolc-info',
    icon: 'ri-information-line',
    requiresAuth: true,
    showForGuest: true,
    tooltip: 'Informazioni sul test TOLC'
  },
  {
    id: 'faq-auth',
    label: 'FAQ',
    href: '/faq',
    icon: 'ri-question-line',
    requiresAuth: true,
    showForGuest: true,
    tooltip: 'Domande frequenti'
  }
] as const;

/**
 * Default navigation configuration combining guest and authenticated links
 */
export const DEFAULT_NAVIGATION_CONFIG: NavigationConfig = {
  guestLinks: DEFAULT_GUEST_LINKS,
  authenticatedLinks: DEFAULT_AUTHENTICATED_LINKS
} as const;

// ============================================================================
// User Menu Configuration
// ============================================================================

/**
 * Default menu items for guest users
 * Based on requirements: "Accedi" and "Registrati" options
 */
export const DEFAULT_GUEST_MENU_ITEMS: MenuItem[] = [
  {
    id: 'login',
    label: 'Accedi',
    action: () => {}, // Will be overridden by component
    icon: 'ri-login-box-line',
    variant: 'default'
  },
  {
    id: 'register',
    label: 'Registrati',
    action: () => {}, // Will be overridden by component
    icon: 'ri-user-add-line',
    variant: 'default'
  }
] as const;

/**
 * Default menu items for authenticated users
 * Based on requirements: "Il mio Profilo", "Impostazioni", "Logout"
 */
export const DEFAULT_AUTHENTICATED_MENU_ITEMS: MenuItem[] = [
  {
    id: 'profile',
    label: 'Il mio Profilo',
    action: () => {}, // Will be overridden by component
    icon: 'ri-user-line',
    variant: 'default'
  },
  {
    id: 'settings',
    label: 'Impostazioni',
    action: () => {}, // Will be overridden by component
    icon: 'ri-settings-4-line',
    variant: 'default',
    showSeparator: true
  },
  {
    id: 'logout',
    label: 'Logout',
    action: () => {}, // Will be overridden by component
    icon: 'ri-logout-box-line',
    variant: 'destructive'
  }
] as const;

/**
 * Default user menu configuration combining guest and authenticated items
 */
export const DEFAULT_USER_MENU_CONFIG: UserMenuConfig = {
  guestItems: DEFAULT_GUEST_MENU_ITEMS,
  authenticatedItems: DEFAULT_AUTHENTICATED_MENU_ITEMS
} as const;

// ============================================================================
// Component Default Props
// ============================================================================

/**
 * Default props for Logo component
 */
export const DEFAULT_LOGO_PROPS = {
  size: 'md' as const,
  showText: true,
  text: 'UniTOLC'
} as const;

/**
 * Default props for ResponsiveNavbar component
 */
export const DEFAULT_NAVBAR_PROPS = {
  variant: 'default' as const,
  fixed: true
} as const;

// ============================================================================
// Complete Default Configuration
// ============================================================================

/**
 * Complete default configuration object
 * Combines all default values for easy access and override
 */
export const NAVBAR_DEFAULTS: NavbarDefaults = {
  breakpoints: DEFAULT_BREAKPOINTS,
  glassmorphismTheme: DEFAULT_GLASSMORPHISM_CONFIG,
  navigationConfig: DEFAULT_NAVIGATION_CONFIG,
  userMenuConfig: DEFAULT_USER_MENU_CONFIG,
  componentDefaults: {
    logo: DEFAULT_LOGO_PROPS,
    navbar: DEFAULT_NAVBAR_PROPS
  }
} as const;

// ============================================================================
// CSS Class Constants
// ============================================================================

/**
 * Tailwind CSS classes for glassmorphism effect
 * Pre-defined classes to ensure consistent styling
 */
export const GLASSMORPHISM_CLASSES = {
  default: 'bg-white/25 backdrop-blur-[10px] border border-white/18 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]',
  transparent: 'bg-white/10 backdrop-blur-[8px] border border-white/10 shadow-[0_4px_16px_0_rgba(31,38,135,0.2)]',
  solid: 'bg-white/95 border border-black/10 shadow-[0_2px_8px_0_rgba(0,0,0,0.1)]'
} as const;

/**
 * Responsive breakpoint classes for Tailwind CSS
 */
export const RESPONSIVE_CLASSES = {
  mobile: 'block sm:hidden',
  tablet: 'hidden sm:block lg:hidden',
  desktop: 'hidden lg:block'
} as const;

/**
 * Animation and transition classes
 */
export const ANIMATION_CLASSES = {
  slideIn: 'transform transition-transform duration-300 ease-in-out translate-x-0',
  slideOut: 'transform transition-transform duration-300 ease-in-out translate-x-full',
  fadeIn: 'opacity-100 transition-opacity duration-200 ease-in-out',
  fadeOut: 'opacity-0 transition-opacity duration-200 ease-in-out',
  scaleIn: 'transform transition-transform duration-200 ease-in-out scale-100',
  scaleOut: 'transform transition-transform duration-200 ease-in-out scale-95'
} as const;

// ============================================================================
// Accessibility Constants
// ============================================================================

/**
 * ARIA labels and roles for accessibility
 */
export const ACCESSIBILITY_LABELS = {
  navbar: 'Navigazione principale',
  logo: 'Logo UniTOLC - Vai alla homepage',
  mobileMenuToggle: 'Apri menu di navigazione mobile',
  userMenuToggle: 'Apri menu utente',
  navigationLinks: 'Link di navigazione',
  userMenu: 'Menu utente',
  mobileMenu: 'Menu di navigazione mobile'
} as const;

/**
 * Keyboard navigation key codes
 */
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight'
} as const;