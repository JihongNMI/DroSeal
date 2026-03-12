import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Custom theme extensions for brand-specific design tokens
      colors: {
        // Example: Add custom brand colors here
        // 'brand-primary': '#0066CC',
      },
      fontFamily: {
        // Example: Add custom fonts here
        // 'sans': ['Inter', 'sans-serif'],
      },
      spacing: {
        // Example: Add custom spacing values here
        // '128': '32rem',
      },
    },
  },
  plugins: [
    // Add custom utilities for scrollbar hiding
    function({ addUtilities }: { addUtilities: (utilities: Record<string, Record<string, string>>) => void }) {
      addUtilities({
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      })
    }
  ],
} satisfies Config
