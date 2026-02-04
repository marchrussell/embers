import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      screens: {
        '3xl': '1920px',
      },
      fontFamily: {
        'editorial': ['"PP Editorial Old"', 'serif'],
        'unica': ['Unica77', 'sans-serif'],
        'sans': ['Unica77', 'system-ui', '-apple-system', 'sans-serif'],
        'handwriting': ['Caveat', 'cursive'],
      },
      colors: {
        /* March Design System Colors */
        'march': {
          'dark': 'hsl(var(--bg-dark))',
          'coffee': 'hsl(var(--bg-coffee))',
          'bone': 'hsl(var(--bg-bone))',
          'bone-light': 'hsl(var(--bg-bone-light))',
        },
        'text': {
          'light': 'hsl(var(--text-light))',
          'light-muted': 'hsl(var(--text-light) / 0.7)',
          'dark': 'hsl(var(--text-dark))',
          'dark-muted': 'hsl(var(--text-dark) / 0.7)',
        },
        'accent-warm': {
          'primary': 'hsl(var(--accent-warm-primary))',
          'secondary': 'hsl(var(--accent-warm-secondary))',
        },
        /* Existing Shadcn Colors */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      spacing: {
        /* March Design System Spacing */
        '4': '4px',
        '8': '8px',
        '16': '16px',
        '24': '24px',
        '32': '32px',
        '40': '40px',
        '64': '64px',
        '96': '96px',
        '120': '120px',
        '160': '160px',
      },
      borderRadius: {
        'pill': '999px',
        'card': '24px',
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      transitionDuration: {
        '400': '400ms',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(-10px)" },
        },
        "breathe": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(228, 178, 166, 0.4)" },
          "50%": { boxShadow: "0 0 40px rgba(228, 178, 166, 0.6)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -30px) scale(1.05)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.95)" },
        },
        "float-slower": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(-40px, 30px) scale(0.95)" },
          "66%": { transform: "translate(25px, -25px) scale(1.05)" },
        },
        "float-gentle": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(20px, 20px) scale(1.02)" },
        },
        "heartbeat-glow": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 0%" },
          "50%": { backgroundPosition: "0% 100%" },
          "100%": { backgroundPosition: "0% 0%" },
        },
        "footerGlow": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "50% 100%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
        "grainDrift": {
          "0%": { transform: "translate3d(0, 0, 0)" },
          "100%": { transform: "translate3d(40px, 20px, 0)" },
        },
        "shimmer": {
          "0%": { 
            transform: "translateX(-100%)",
            opacity: "0"
          },
          "50%": {
            opacity: "1"
          },
          "100%": { 
            transform: "translateX(100%)",
            opacity: "0"
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "spin-slow": "spin-slow 2s linear infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "breathe": "breathe 4s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "float-slow": "float-slow 20s ease-in-out infinite",
        "float-slower": "float-slower 25s ease-in-out infinite",
        "float-gentle": "float-gentle 30s ease-in-out infinite",
        "heartbeat-glow": "heartbeat-glow 4s ease-in-out infinite",
        "gradient-shift": "gradient-shift 15s ease-in-out infinite",
        "footerGlow": "footerGlow 40s ease-in-out infinite alternate",
        "grainDrift": "grainDrift 60s linear infinite",
        "shimmer": "shimmer 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;