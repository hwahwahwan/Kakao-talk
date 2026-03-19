import type { Config } from 'tailwindcss'
import { COLORS } from './src/constants/colors'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'kakao-yellow': COLORS.BRAND_YELLOW,
        'chat-bg': COLORS.CHAT_BG,
        'bubble-received': COLORS.BUBBLE_RECEIVED,
        'bubble-sent': COLORS.BUBBLE_SENT,
        'badge-red': COLORS.BADGE_RED,
        'text-primary': COLORS.TEXT_PRIMARY,
        'text-secondary': COLORS.TEXT_SECONDARY,
        'sidebar-bg': COLORS.SIDEBAR_BG,
        'header-bg': COLORS.HEADER_BG,
        'divider': COLORS.DIVIDER,
      },
    },
  },
  plugins: [],
}

export default config
