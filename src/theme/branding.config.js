/**
 * HIRENETIC WHITE-LABEL BRANDING CONFIGURATION
 * ----------------------------------------------------
 * Change this single configuration object to rebrand the entire platform for any client.
 */

export const BRAND_CONFIG = {
  // Brand Identity
  companyName: 'Hirenetic',
  appName: 'Hirenetic Enterprise AI',
  tagline: 'Next-Gen Autonomous Recruitment & Talent Matching Platform',
  supportEmail: 'support@hirenetic.ai',
  websiteUrl: 'https://hirenetic.ai',
  copyrightText: '© 2026 Hirenetic Technologies Inc. All rights reserved.',

  // Visual Theme Tokens (Hex / HSL values)
  theme: {
    primary: '#2563eb',          // Main brand color (Buttons, active states, highlights)
    primaryHover: '#1d4ed8',     // Hover state for primary buttons
    primaryLight: '#eff6ff',     // Light primary background tint
    primaryBorder: '#bfdbfe',    // Primary border tint
    
    secondary: '#0f172a',        // Dark slate for headers, primary text, dark sidebars
    secondaryHover: '#1e293b',   // Hover state for dark elements
    
    accent: '#10b981',           // Success / Matched / Verified badge color
    accentHover: '#059669',
    accentLight: '#ecfdf5',

    warning: '#f59e0b',          // Pending / Alert color
    danger: '#ef4444',           // Action error / delete color

    // Surface & Layout Neutral Colors
    bgMain: '#f8fafc',           // App main background color
    bgSurface: '#ffffff',        // Card, modal, panel background color
    bgMuted: '#f1f5f9',          // Input background, subtle containers
    
    textMain: '#0f172a',         // Main body & headings text color
    textMuted: '#64748b',        // Subtitle, placeholder, muted text color
    textLight: '#94a3b8',        // Extra subtle text color

    borderMain: '#e2e8f0',       // Standard component border color
    borderMuted: '#f1f5f9',      // Divider & subtle border color
    
    // Geometry & Fonts
    radiusSm: '6px',
    radiusMd: '10px',
    radiusLg: '16px',
    radiusFull: '9999px',

    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  }
};
