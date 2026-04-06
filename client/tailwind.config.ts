import type { Config } from 'tailwindcss'
import { COLORS } from './src/constants/colors'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary': COLORS.PRIMARY,
        'primary-container': COLORS.PRIMARY_CONTAINER,
        'on-primary-container': COLORS.ON_PRIMARY_CONTAINER,
        'primary-fixed-dim': COLORS.PRIMARY_FIXED_DIM,
        'surface': COLORS.SURFACE,
        'surface-container-lowest': COLORS.SURFACE_CONTAINER_LOWEST,
        'surface-container-low': COLORS.SURFACE_CONTAINER_LOW,
        'surface-container': COLORS.SURFACE_CONTAINER,
        'surface-container-high': COLORS.SURFACE_CONTAINER_HIGH,
        'surface-container-highest': COLORS.SURFACE_CONTAINER_HIGHEST,
        'on-surface': COLORS.ON_SURFACE,
        'secondary': COLORS.SECONDARY,
        'on-surface-variant': COLORS.ON_SURFACE_VARIANT,
        'outline-variant': COLORS.OUTLINE_VARIANT,
        'sidebar-bg': COLORS.SIDEBAR_BG,
        'inverse-surface': COLORS.INVERSE_SURFACE,
        'chat-bg': COLORS.CHAT_BG,
        'badge-red': COLORS.BADGE_RED,
        'secondary-container': COLORS.SECONDARY_CONTAINER,
        'secondary-fixed-dim': COLORS.SECONDARY_FIXED_DIM,
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
      fontFamily: {
        headline: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
