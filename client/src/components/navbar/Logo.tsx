/**
 * Logo component for the responsive navbar
 * Displays the UniTOLC logo with responsive sizing and homepage navigation
 */

import React from 'react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import type { LogoProps } from '@/types/navbar.types';
import { DEFAULT_LOGO_PROPS, ACCESSIBILITY_LABELS } from '@/types/navbar.constants';

/**
 * Logo component with responsive sizing and navigation
 * 
 * Features:
 * - Responsive sizing (sm, md, lg)
 * - Homepage navigation via Link
 * - Placeholder icon with UniTOLC text
 * - Accessibility support with ARIA labels
 * - Customizable text and styling
 */
const Logo: React.FC<LogoProps> = ({
  size = DEFAULT_LOGO_PROPS.size,
  showText = DEFAULT_LOGO_PROPS.showText,
  className,
  text = DEFAULT_LOGO_PROPS.text,
  iconSrc
}) => {
  // Size-based styling configurations
  const sizeConfig = {
    sm: {
      container: 'h-8',
      icon: 'h-6 w-6 text-sm',
      text: 'text-lg font-semibold'
    },
    md: {
      container: 'h-10',
      icon: 'h-8 w-8 text-base',
      text: 'text-xl font-semibold'
    },
    lg: {
      container: 'h-12',
      icon: 'h-10 w-10 text-lg',
      text: 'text-2xl font-bold'
    }
  };

  const config = sizeConfig[size];

  return (
    <Link 
      href="/" 
      className={cn(
        'flex items-center space-x-2 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md',
        className
      )}
      aria-label={ACCESSIBILITY_LABELS.logo}
    >
      {/* Logo Icon */}
      <div className={cn(
        'flex items-center justify-center rounded-md bg-primary text-white font-bold flex-shrink-0',
        config.icon
      )}>
        {iconSrc ? (
          <img 
            src={iconSrc} 
            alt="UniTOLC Logo" 
            className="w-full h-full object-contain rounded-md"
          />
        ) : (
          // Placeholder icon using first two letters of text
          <span className="select-none">
            {text.substring(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      {/* Logo Text */}
      {showText && (
        <span className={cn(
          'text-primary dark:text-primary-400 font-heading select-none',
          config.text
        )}>
          {text}
        </span>
      )}
    </Link>
  );
};

export default Logo;