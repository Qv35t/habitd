import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Courier New"', 'monospace'],
      },
      colors: {
        'bg-base':    '#000000',
        'bg-panel':   '#080808',
        'bg-control': '#0f0f0f',
        'bg-hover':   '#111111',
        'text-primary':   '#e8e8e8',
        'text-secondary': '#888888',
        'text-muted':     '#444444',
        'text-label':     '#aaaaaa',
        'border-subtle':  '#1a1a1a',
        'border-default': '#2a2a2a',
        'border-active':  '#555555',
      },
      fontSize: {
        'xs':   ['10px', { lineHeight: '1.4' }],
        'sm':   ['11px', { lineHeight: '1.4' }],
        'base': ['12px', { lineHeight: '1.5' }],
        'md':   ['13px', { lineHeight: '1.5' }],
      },
      spacing: { 'sidebar': '200px' },
      maxWidth: { 'content': '900px' },
    },
  },
}

export default config
