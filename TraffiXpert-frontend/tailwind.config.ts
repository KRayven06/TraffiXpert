
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Space Grotesk', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        's-n': {
          '0%': { transform: 'translate(185px, 400px) rotate(0deg)' },
          '100%': { transform: 'translate(185px, -50px) rotate(0deg)' },
        },
        'n-s': {
          '0%': { transform: 'translate(205px, 0px) rotate(180deg)' },
          '100%': { transform: 'translate(205px, 450px) rotate(180deg)' },
        },
        'w-e': {
          '0%': { transform: 'translate(0px, 205px) rotate(90deg)' },
          '100%': { transform: 'translate(450px, 205px) rotate(90deg)' },
        },
        'e-w': {
          '0%': { transform: 'translate(400px, 185px) rotate(-90deg)' },
          '100%': { transform: 'translate(-50px, 185px) rotate(-90deg)' },
        },
        's-e': {
          '0%': { transform: 'translate(185px, 400px) rotate(0deg)' },
          '40%': { transform: 'translate(185px, 205px) rotate(0deg)'},
          '50%': { transform: 'translate(205px, 205px) rotate(90deg)'},
          '100%': { transform: 'translate(450px, 205px) rotate(90deg)' },
        },
        'n-w': {
          '0%': { transform: 'translate(205px, 0px) rotate(180deg)' },
          '40%': { transform: 'translate(205px, 185px) rotate(180deg)' },
          '50%': { transform: 'translate(185px, 185px) rotate(270deg)' },
          '100%': { transform: 'translate(-50px, 185px) rotate(270deg)' },
        },
        's-w': {
            '0%': { transform: 'translate(185px, 400px) rotate(0deg)' },
            '45%': { transform: 'translate(185px, 205px) rotate(0deg)' },
            '55%': { transform: 'translate(185px, 185px) rotate(-90deg)' },
            '100%': { transform: 'translate(-50px, 185px) rotate(-90deg)' },
        },
        'n-e': {
            '0%': { transform: 'translate(205px, 0px) rotate(180deg)' },
            '45%': { transform: 'translate(205px, 185px) rotate(180deg)' },
            '55%': { transform: 'translate(205px, 205px) rotate(90deg)' },
            '100%': { transform: 'translate(450px, 205px) rotate(90deg)' },
        },
        'w-n': {
            '0%': { transform: 'translate(0px, 205px) rotate(90deg)' },
            '45%': { transform: 'translate(185px, 205px) rotate(90deg)' },
            '55%': { transform: 'translate(185px, 185px) rotate(0deg)' },
            '100%': { transform: 'translate(185px, -50px) rotate(0deg)' },
        },
        'e-s': {
            '0%': { transform: 'translate(400px, 185px) rotate(-90deg)' },
            '45%': { transform: 'translate(205px, 185px) rotate(-90deg)' },
            '55%': { transform: 'translate(205px, 205px) rotate(180deg)' },
            '100%': { transform: 'translate(205px, 450px) rotate(180deg)' },
        },
        'w-s': {
            '0%': { transform: 'translate(0px, 205px) rotate(90deg)' },
            '45%': { transform: 'translate(185px, 205px) rotate(90deg)' },
            '55%': { transform: 'translate(205px, 205px) rotate(180deg)' },
            '100%': { transform: 'translate(205px, 450px) rotate(180deg)' },
        },
        'e-n': {
            '0%': { transform: 'translate(400px, 185px) rotate(-90deg)' },
            '45%': { transform: 'translate(205px, 185px) rotate(-90deg)' },
            '55%': { transform: 'translate(185px, 185px) rotate(0deg)' },
            '100%': { transform: 'translate(185px, -50px) rotate(0deg)' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        's-n': 's-n linear 1',
        'n-s': 'n-s linear 1',
        'w-e': 'w-e linear 1',
        'e-w': 'e-w linear 1',
        's-e': 's-e linear 1',
        'n-w': 'n-w linear 1',
        's-w': 's-w linear 1',
        'n-e': 'n-e linear 1',
        'w-n': 'w-n linear 1',
        'e-s': 'e-s linear 1',
        'w-s': 'w-s linear 1',
        'e-n': 'e-n linear 1',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
