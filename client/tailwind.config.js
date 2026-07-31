/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary: Navy (professional, trust-oriented)
        navy: {
          50: '#f8fafc',
          100: '#f1f5fb',
          200: '#e2ecf7',
          300: '#cfe1f0',
          400: '#a8c8e1',
          500: '#2c5aa0',
          600: '#1e3a52',
          700: '#1a2f42',
          800: '#152438',
          900: '#0f1829',
        },
        // Accent: Brass/Champagne (prestige, excellence - muted, not saturated yellow)
        gold: {
          50: '#faf7f0',
          100: '#f3ecda',
          200: '#e6d4ab',
          300: '#cfa958',
          400: '#b3903f',
          500: '#96762f',
          600: '#7a5f27',
          700: '#5f4a1f',
          800: '#453516',
          900: '#2b210d',
        },
        // Secondary: Deep Green (growth, stability)
        forest: {
          50: '#f5faf8',
          100: '#e8f3f0',
          200: '#d1e8e3',
          300: '#a8d9cd',
          400: '#2d6a5c',
          500: '#1e4d42',
          600: '#163d34',
          700: '#0f2f28',
          800: '#0a211e',
          900: '#051513',
        },
        // Neutral grays for typography and UI
        slate: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Semantic colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
