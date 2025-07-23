/**
 * Demo component to test Logo component visually
 * This is for development/testing purposes only
 */

import React from 'react';
import Logo from '../Logo';

const LogoDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Logo Component Demo</h1>
      
      {/* Size Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Size Variants</h2>
        <div className="flex items-center space-x-8 p-4 bg-white rounded-lg shadow">
          <div className="text-center">
            <Logo size="sm" />
            <p className="mt-2 text-sm text-gray-600">Small</p>
          </div>
          <div className="text-center">
            <Logo size="md" />
            <p className="mt-2 text-sm text-gray-600">Medium (Default)</p>
          </div>
          <div className="text-center">
            <Logo size="lg" />
            <p className="mt-2 text-sm text-gray-600">Large</p>
          </div>
        </div>
      </section>

      {/* Text Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Text Variants</h2>
        <div className="flex items-center space-x-8 p-4 bg-white rounded-lg shadow">
          <div className="text-center">
            <Logo showText={true} />
            <p className="mt-2 text-sm text-gray-600">With Text</p>
          </div>
          <div className="text-center">
            <Logo showText={false} />
            <p className="mt-2 text-sm text-gray-600">Icon Only</p>
          </div>
          <div className="text-center">
            <Logo text="CustomApp" />
            <p className="mt-2 text-sm text-gray-600">Custom Text</p>
          </div>
        </div>
      </section>

      {/* Glassmorphism Background Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">On Glassmorphism Background</h2>
        <div 
          className="p-8 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative'
          }}
        >
          <div 
            className="p-4 rounded-lg"
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.18)'
            }}
          >
            <div className="flex items-center justify-between">
              <Logo size="md" />
              <Logo size="sm" showText={false} />
            </div>
          </div>
        </div>
      </section>

      {/* Dark Background Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">On Dark Background</h2>
        <div className="p-8 bg-gray-900 rounded-lg">
          <div className="flex items-center space-x-8">
            <Logo size="sm" />
            <Logo size="md" />
            <Logo size="lg" />
          </div>
        </div>
      </section>

      {/* Interactive Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Interactive Test</h2>
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="mb-4 text-gray-600">Click the logo to test navigation (should go to homepage)</p>
          <Logo size="md" />
        </div>
      </section>
    </div>
  );
};

export default LogoDemo;