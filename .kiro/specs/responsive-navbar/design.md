# Design Document

## Overview

La navbar responsive per UniTOLC è un componente React che implementa un design glassmorphism moderno con comportamento dinamico basato sullo stato di autenticazione dell'utente. Il componente si integra perfettamente con l'architettura esistente dell'applicazione, utilizzando React, TypeScript, Tailwind CSS, e i componenti Radix UI già presenti nel progetto.

## Architecture

### Component Structure
```
ResponsiveNavbar/
├── ResponsiveNavbar.tsx          # Componente principale
├── components/
│   ├── Logo.tsx                  # Logo UniTOLC
│   ├── NavigationLinks.tsx       # Link di navigazione centrali
│   ├── UserMenu.tsx              # Menu dropdown utente
│   ├── MobileMenu.tsx            # Menu mobile hamburger
│   └── GlassmorphismWrapper.tsx  # Wrapper per effetto vetro
├── hooks/
│   ├── useNavbarState.ts         # Gestione stato navbar
│   └── useResponsiveBreakpoint.ts # Gestione breakpoint responsive
└── types/
    └── navbar.types.ts           # Tipi TypeScript
```

### Integration Points
- **AuthContext**: Utilizzo del context esistente per stato autenticazione
- **Wouter Router**: Integrazione con il router esistente per navigazione
- **Radix UI**: Utilizzo dei componenti dropdown, sheet, avatar esistenti
- **Tailwind CSS**: Styling con classi utility esistenti

## Components and Interfaces

### 1. ResponsiveNavbar Component

**Props Interface:**
```typescript
interface ResponsiveNavbarProps {
  className?: string;
  variant?: 'default' | 'transparent';
}
```

**State Management:**
```typescript
interface NavbarState {
  isMobileMenuOpen: boolean;
  isUserMenuOpen: boolean;
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop';
}
```

### 2. Logo Component

**Props Interface:**
```typescript
interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}
```

**Features:**
- Logo placeholder con testo "UniTOLC"
- Responsive sizing
- Link alla homepage

### 3. NavigationLinks Component

**Props Interface:**
```typescript
interface NavigationLinksProps {
  isAuthenticated: boolean;
  currentPath: string;
  orientation: 'horizontal' | 'vertical';
  onLinkClick?: () => void;
}
```

**Link Configuration:**
```typescript
interface NavLink {
  label: string;
  href: string;
  icon?: string;
  requiresAuth: boolean;
  showForGuest: boolean;
}

const navigationConfig: NavLink[] = [
  // Guest links
  { label: "Cos'è il TOLC", href: "/tolc-info", requiresAuth: false, showForGuest: true },
  { label: "FAQ", href: "/faq", requiresAuth: false, showForGuest: true },
  
  // Authenticated links
  { label: "Dashboard", href: "/dashboard", requiresAuth: true, showForGuest: false },
  { label: "Pratica", href: "/practice", requiresAuth: true, showForGuest: false },
  { label: "Statistiche", href: "/analytics", requiresAuth: true, showForGuest: false },
  { label: "Cos'è il TOLC", href: "/tolc-info", requiresAuth: true, showForGuest: true },
  { label: "FAQ", href: "/faq", requiresAuth: true, showForGuest: true }
];
```

### 4. UserMenu Component

**Props Interface:**
```typescript
interface UserMenuProps {
  user: User | null;
  isAuthenticated: boolean;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
}
```

**Menu Items Configuration:**
```typescript
interface MenuItem {
  label: string;
  action: () => void;
  icon?: string;
  variant?: 'default' | 'destructive';
}

// Guest menu items
const guestMenuItems: MenuItem[] = [
  { label: "Accedi", action: onLogin },
  { label: "Registrati", action: onRegister }
];

// Authenticated menu items
const userMenuItems: MenuItem[] = [
  { label: "Il mio Profilo", action: () => navigate("/settings") },
  { label: "Impostazioni", action: () => navigate("/settings") },
  { label: "Logout", action: onLogout, variant: "destructive" }
];
```

### 5. MobileMenu Component

**Props Interface:**
```typescript
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigationLinks: NavLink[];
  userMenuItems: MenuItem[];
  isAuthenticated: boolean;
  user: User | null;
}
```

## Data Models

### NavbarState Type
```typescript
interface NavbarState {
  isMobileMenuOpen: boolean;
  isUserMenuOpen: boolean;
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop';
  isScrolled: boolean;
}
```

### Theme Configuration
```typescript
interface GlassmorphismTheme {
  background: string;
  backdropBlur: string;
  border: string;
  borderRadius: string;
  shadow: string;
}

const glassmorphismConfig: GlassmorphismTheme = {
  background: 'rgba(255, 255, 255, 0.25)',
  backdropBlur: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: '0px',
  shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
};
```

## Error Handling

### Authentication State Errors
```typescript
const handleAuthError = (error: AuthError) => {
  console.error('Navbar auth error:', error);
  // Fallback to guest state
  setNavbarState(prev => ({ ...prev, isAuthenticated: false }));
};
```

### Navigation Errors
```typescript
const handleNavigationError = (path: string, error: Error) => {
  console.error(`Navigation error for ${path}:`, error);
  // Show toast notification
  toast({
    title: "Errore di navigazione",
    description: "Impossibile navigare alla pagina richiesta.",
    variant: "destructive"
  });
};
```

### Responsive Breakpoint Errors
```typescript
const handleBreakpointError = (error: Error) => {
  console.error('Breakpoint detection error:', error);
  // Fallback to desktop layout
  setCurrentBreakpoint('desktop');
};
```

## Testing Strategy

### Unit Tests
1. **Component Rendering Tests**
   - Logo component renders correctly
   - Navigation links display based on auth state
   - User menu shows correct items
   - Mobile menu toggles properly

2. **State Management Tests**
   - Navbar state updates correctly
   - Authentication state changes trigger re-renders
   - Breakpoint changes update layout

3. **Interaction Tests**
   - Menu dropdowns open/close correctly
   - Mobile hamburger menu functions
   - Navigation links work properly
   - Keyboard navigation accessibility

### Integration Tests
1. **Auth Integration**
   - Login/logout state changes update navbar
   - User profile data displays correctly
   - Protected routes redirect appropriately

2. **Router Integration**
   - Active link highlighting works
   - Navigation preserves state
   - Deep linking functions correctly

3. **Responsive Behavior**
   - Layout adapts to screen size changes
   - Touch interactions work on mobile
   - Orientation changes handled properly

### E2E Tests
1. **User Journeys**
   - Guest user can access public pages
   - User can login and access protected areas
   - Mobile navigation works end-to-end
   - Logout clears state properly

2. **Accessibility Tests**
   - Screen reader compatibility
   - Keyboard navigation complete flow
   - Focus management in dropdowns
   - ARIA labels and roles correct

### Visual Regression Tests
1. **Glassmorphism Effect**
   - Background blur renders correctly
   - Transparency levels appropriate
   - Border styling consistent

2. **Responsive Layouts**
   - Desktop layout screenshots
   - Tablet layout screenshots  
   - Mobile layout screenshots
   - Menu state screenshots

## Performance Considerations

### Optimization Strategies
1. **Component Memoization**
   - Memoize navigation links to prevent unnecessary re-renders
   - Optimize user menu rendering with React.memo
   - Cache breakpoint calculations

2. **Event Handling**
   - Debounce resize events for responsive behavior
   - Throttle scroll events for glassmorphism effects
   - Use passive event listeners where appropriate

3. **Bundle Size**
   - Tree-shake unused Radix UI components
   - Optimize Tailwind CSS purging
   - Lazy load mobile menu components

### Accessibility Optimizations
1. **Keyboard Navigation**
   - Implement proper tab order
   - Add skip links for screen readers
   - Ensure all interactive elements are focusable

2. **Screen Reader Support**
   - Add appropriate ARIA labels
   - Implement live regions for state changes
   - Provide alternative text for icons

3. **Motion Preferences**
   - Respect prefers-reduced-motion settings
   - Provide alternatives to animations
   - Ensure functionality without JavaScript