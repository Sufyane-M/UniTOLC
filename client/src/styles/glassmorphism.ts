/**
 * Glassmorphism styling utilities and constants for the responsive navbar
 * Provides consistent glass effect styling across all navbar components
 */

export const glassmorphismConfig = {
  // Base glassmorphism configuration as per requirements
  base: {
    background: 'rgba(255, 255, 255, 0.25)',
    backdropBlur: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '0px',
    shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  },
  
  // Dark mode variants
  dark: {
    background: 'rgba(0, 0, 0, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    shadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  },

  // Responsive variants for different screen sizes
  responsive: {
    mobile: {
      background: 'rgba(255, 255, 255, 0.3)',
      backdropBlur: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      shadow: '0 6px 24px 0 rgba(31, 38, 135, 0.3)',
    },
    tablet: {
      background: 'rgba(255, 255, 255, 0.25)',
      backdropBlur: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    },
    desktop: {
      background: 'rgba(255, 255, 255, 0.25)',
      backdropBlur: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    },
  },

  // Component-specific variants
  components: {
    navbar: {
      background: 'rgba(255, 255, 255, 0.25)',
      backdropBlur: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.18)',
      shadow: '0 2px 16px 0 rgba(31, 38, 135, 0.2)',
    },
    dropdown: {
      background: 'rgba(255, 255, 255, 0.3)',
      backdropBlur: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.4)',
    },
    mobileMenu: {
      background: 'rgba(255, 255, 255, 0.35)',
      backdropBlur: 'blur(15px)',
      border: '1px solid rgba(255, 255, 255, 0.25)',
      shadow: '0 12px 48px 0 rgba(31, 38, 135, 0.5)',
    },
  },
} as const;

/**
 * Tailwind CSS class names for glassmorphism effects
 * These correspond to the utilities defined in index.css
 */
export const glassmorphismClasses = {
  // Base classes
  base: 'glass',
  light: 'glass-light',
  strong: 'glass-strong',
  
  // Component-specific classes
  navbar: 'glass-navbar',
  dropdown: 'glass-dropdown',
  mobile: 'glass-mobile',
  
  // Size variants
  small: 'glass-sm',
  medium: 'glass-md',
  large: 'glass-lg',
  
  // Interactive classes
  hover: 'glass-hover',
  
  // Responsive classes (to be used with Tailwind responsive prefixes)
  responsive: {
    mobile: 'sm:glass-sm',
    tablet: 'md:glass-md',
    desktop: 'lg:glass-lg',
  },
} as const;

/**
 * Helper function to get glassmorphism classes based on component type and screen size
 */
export const getGlassmorphismClasses = (
  component: 'navbar' | 'dropdown' | 'mobile' | 'base' = 'base',
  size: 'small' | 'medium' | 'large' = 'medium',
  includeHover: boolean = false,
  includeResponsive: boolean = true
): string => {
  const classes: string[] = [];
  
  // Add base component class
  switch (component) {
    case 'navbar':
      classes.push(glassmorphismClasses.navbar);
      break;
    case 'dropdown':
      classes.push(glassmorphismClasses.dropdown);
      break;
    case 'mobile':
      classes.push(glassmorphismClasses.mobile);
      break;
    default:
      classes.push(glassmorphismClasses.base);
  }
  
  // Add size variant
  if (includeResponsive) {
    classes.push(glassmorphismClasses.responsive.mobile);
    classes.push(glassmorphismClasses.responsive.tablet);
    classes.push(glassmorphismClasses.responsive.desktop);
  } else {
    switch (size) {
      case 'small':
        classes.push(glassmorphismClasses.small);
        break;
      case 'large':
        classes.push(glassmorphismClasses.large);
        break;
      default:
        classes.push(glassmorphismClasses.medium);
    }
  }
  
  // Add hover effect if requested
  if (includeHover) {
    classes.push(glassmorphismClasses.hover);
  }
  
  return classes.join(' ');
};

/**
 * Browser compatibility check for backdrop-filter support
 */
export const supportsBackdropFilter = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    'backdropFilter' in document.documentElement.style ||
    'webkitBackdropFilter' in document.documentElement.style
  );
};

/**
 * Fallback styles for browsers that don't support backdrop-filter
 */
export const getFallbackStyles = (isDark: boolean = false) => ({
  background: isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
  border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
});