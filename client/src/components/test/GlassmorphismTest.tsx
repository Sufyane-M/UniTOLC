import React from 'react';
import { getGlassmorphismClasses, supportsBackdropFilter, getFallbackStyles } from '../../styles/glassmorphism';
import styles from '../../styles/glassmorphism.module.css';

/**
 * Test component to verify glassmorphism utilities are working correctly
 * This component will be removed after testing
 */
export const GlassmorphismTest: React.FC = () => {
  const hasBackdropSupport = supportsBackdropFilter();
  const fallbackStyles = getFallbackStyles(false);

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-blue-400 to-purple-600 min-h-screen">
      <h1 className="text-white text-2xl font-bold mb-8">Glassmorphism Utilities Test</h1>
      
      {/* Browser support info */}
      <div className="text-white mb-4">
        <p>Backdrop-filter support: {hasBackdropSupport ? '✅ Supported' : '❌ Not supported'}</p>
      </div>

      {/* Base glassmorphism classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Base Glass</h3>
          <p className="text-sm">rgba(255, 255, 255, 0.25) with blur(10px)</p>
        </div>

        <div className="glass-light p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Light Glass</h3>
          <p className="text-sm">Lighter variant with less opacity</p>
        </div>

        <div className="glass-strong p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Strong Glass</h3>
          <p className="text-sm">Stronger variant with more opacity</p>
        </div>
      </div>

      {/* Component-specific classes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-navbar p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Navbar Glass</h3>
          <p className="text-sm">Optimized for navbar component</p>
        </div>

        <div className="glass-dropdown p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Dropdown Glass</h3>
          <p className="text-sm">Optimized for dropdown menus</p>
        </div>

        <div className="glass-mobile p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Mobile Glass</h3>
          <p className="text-sm">Optimized for mobile screens</p>
        </div>
      </div>

      {/* Size variants */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-sm p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Small Glass</h3>
          <p className="text-sm">Small size variant</p>
        </div>

        <div className="glass-md p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Medium Glass</h3>
          <p className="text-sm">Medium size variant</p>
        </div>

        <div className="glass-lg p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Large Glass</h3>
          <p className="text-sm">Large size variant</p>
        </div>
      </div>

      {/* Interactive glass with hover */}
      <div className="glass-hover p-4 rounded-lg cursor-pointer">
        <h3 className="font-semibold mb-2">Hover Glass</h3>
        <p className="text-sm">Hover over this element to see the effect</p>
      </div>

      {/* Helper function test */}
      <div className={`${getGlassmorphismClasses('navbar', 'medium', true, true)} p-4 rounded-lg`}>
        <h3 className="font-semibold mb-2">Helper Function Test</h3>
        <p className="text-sm">Generated using getGlassmorphismClasses helper</p>
      </div>

      {/* CSS Module test */}
      <div className={`${styles.glassEnhanced} p-4 rounded-lg`}>
        <h3 className="font-semibold mb-2">CSS Module Enhanced</h3>
        <p className="text-sm">Using CSS module enhanced glass effect</p>
      </div>

      <div className={`${styles.glassAnimated} ${styles.glassEnhanced} p-4 rounded-lg cursor-pointer`}>
        <h3 className="font-semibold mb-2">Animated Glass</h3>
        <p className="text-sm">Hover for smooth animation</p>
      </div>

      {/* Responsive test */}
      <div className={`${styles.glassResponsive} p-4 rounded-lg`}>
        <h3 className="font-semibold mb-2">Responsive Glass</h3>
        <p className="text-sm">Changes appearance based on screen size</p>
      </div>

      {/* Fallback styles test */}
      {!hasBackdropSupport && (
        <div style={fallbackStyles} className="p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Fallback Styles</h3>
          <p className="text-sm">Fallback for browsers without backdrop-filter support</p>
        </div>
      )}
    </div>
  );
};