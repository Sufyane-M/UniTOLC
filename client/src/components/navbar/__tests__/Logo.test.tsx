/**
 * Unit tests for Logo component
 * Tests rendering, navigation, responsive sizing, and accessibility
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Logo from '../Logo';
import type { LogoProps } from '@/types/navbar.types';

// Mock wouter's Link component
vi.mock('wouter', () => ({
  Link: ({ href, children, className, 'aria-label': ariaLabel, ...props }: any) => (
    <a href={href} className={className} aria-label={ariaLabel} {...props}>
      {children}
    </a>
  )
}));

// Mock utils
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

describe('Logo Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Logo />);
      
      // Check if logo link is present
      const logoLink = screen.getByRole('link');
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute('href', '/');
      
      // Check if default text is displayed
      expect(screen.getByText('UniTOLC')).toBeInTheDocument();
      
      // Check if placeholder icon is displayed (first 2 letters)
      expect(screen.getByText('UN')).toBeInTheDocument();
    });

    it('renders with custom text', () => {
      const customText = 'CustomLogo';
      render(<Logo text={customText} />);
      
      expect(screen.getByText(customText)).toBeInTheDocument();
      expect(screen.getByText('CU')).toBeInTheDocument(); // First 2 letters for icon
    });

    it('renders without text when showText is false', () => {
      render(<Logo showText={false} />);
      
      expect(screen.queryByText('UniTOLC')).not.toBeInTheDocument();
      expect(screen.getByText('UN')).toBeInTheDocument(); // Icon should still be there
    });

    it('renders with custom icon source', () => {
      const iconSrc = '/test-logo.png';
      render(<Logo iconSrc={iconSrc} />);
      
      const iconImage = screen.getByAltText('UniTOLC Logo');
      expect(iconImage).toBeInTheDocument();
      expect(iconImage).toHaveAttribute('src', iconSrc);
    });
  });

  describe('Responsive Sizing', () => {
    it('applies small size classes correctly', () => {
      render(<Logo size="sm" />);
      
      const logoLink = screen.getByRole('link');
      expect(logoLink.querySelector('div')).toHaveClass('h-6', 'w-6', 'text-sm');
      expect(screen.getByText('UniTOLC')).toHaveClass('text-lg', 'font-semibold');
    });

    it('applies medium size classes correctly', () => {
      render(<Logo size="md" />);
      
      const logoLink = screen.getByRole('link');
      expect(logoLink.querySelector('div')).toHaveClass('h-8', 'w-8', 'text-base');
      expect(screen.getByText('UniTOLC')).toHaveClass('text-xl', 'font-semibold');
    });

    it('applies large size classes correctly', () => {
      render(<Logo size="lg" />);
      
      const logoLink = screen.getByRole('link');
      expect(logoLink.querySelector('div')).toHaveClass('h-10', 'w-10', 'text-lg');
      expect(screen.getByText('UniTOLC')).toHaveClass('text-2xl', 'font-bold');
    });
  });

  describe('Navigation', () => {
    it('has correct href for homepage navigation', () => {
      render(<Logo />);
      
      const logoLink = screen.getByRole('link');
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('handles click events for navigation', () => {
      render(<Logo />);
      
      const logoLink = screen.getByRole('link');
      
      // Simulate click
      fireEvent.click(logoLink);
      
      // Since we're mocking Link as a regular anchor, we can't test actual navigation
      // but we can verify the element is clickable and has the right attributes
      expect(logoLink).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA label', () => {
      render(<Logo />);
      
      const logoLink = screen.getByRole('link');
      expect(logoLink).toHaveAttribute('aria-label', 'Logo UniTOLC - Vai alla homepage');
    });

    it('has proper focus styles', () => {
      render(<Logo />);
      
      const logoLink = screen.getByRole('link');
      expect(logoLink).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-primary', 'focus:ring-offset-2');
    });

    it('has proper hover styles', () => {
      render(<Logo />);
      
      const logoLink = screen.getByRole('link');
      expect(logoLink).toHaveClass('hover:opacity-80');
    });

    it('has non-selectable text', () => {
      render(<Logo />);
      
      const iconText = screen.getByText('UN');
      const logoText = screen.getByText('UniTOLC');
      
      expect(iconText).toHaveClass('select-none');
      expect(logoText).toHaveClass('select-none');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const customClass = 'custom-logo-class';
      render(<Logo className={customClass} />);
      
      const logoLink = screen.getByRole('link');
      expect(logoLink).toHaveClass(customClass);
    });

    it('combines custom className with default classes', () => {
      const customClass = 'custom-logo-class';
      render(<Logo className={customClass} />);
      
      const logoLink = screen.getByRole('link');
      expect(logoLink).toHaveClass(customClass);
      expect(logoLink).toHaveClass('flex', 'items-center', 'space-x-2');
    });
  });

  describe('Icon Rendering', () => {
    it('renders placeholder icon with correct letters', () => {
      render(<Logo text="TestApp" />);
      
      expect(screen.getByText('TE')).toBeInTheDocument();
    });

    it('renders custom icon image when iconSrc is provided', () => {
      const iconSrc = '/custom-icon.svg';
      render(<Logo iconSrc={iconSrc} />);
      
      const iconImage = screen.getByAltText('UniTOLC Logo');
      expect(iconImage).toBeInTheDocument();
      expect(iconImage).toHaveAttribute('src', iconSrc);
      expect(iconImage).toHaveClass('w-full', 'h-full', 'object-contain', 'rounded-md');
    });

    it('prioritizes iconSrc over placeholder text', () => {
      const iconSrc = '/custom-icon.svg';
      render(<Logo iconSrc={iconSrc} text="TestApp" />);
      
      // Should show image, not placeholder text
      expect(screen.getByAltText('UniTOLC Logo')).toBeInTheDocument();
      expect(screen.queryByText('TE')).not.toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('handles undefined props gracefully', () => {
      const props: LogoProps = {
        size: undefined as any,
        showText: undefined as any,
        className: undefined,
        text: undefined,
        iconSrc: undefined
      };
      
      expect(() => render(<Logo {...props} />)).not.toThrow();
    });

    it('handles empty string props', () => {
      render(<Logo text="" className="" iconSrc="" />);
      
      // Should still render without crashing
      const logoLink = screen.getByRole('link');
      expect(logoLink).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('applies primary color classes', () => {
      render(<Logo />);
      
      const iconContainer = screen.getByText('UN').parentElement;
      const textElement = screen.getByText('UniTOLC');
      
      expect(iconContainer).toHaveClass('bg-primary', 'text-white');
      expect(textElement).toHaveClass('text-primary', 'dark:text-primary-400');
    });

    it('applies font-heading class to text', () => {
      render(<Logo />);
      
      const textElement = screen.getByText('UniTOLC');
      expect(textElement).toHaveClass('font-heading');
    });
  });
});