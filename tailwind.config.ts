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
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
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
        nova: {
          success: "hsl(var(--nova-success))",
          warning: "hsl(var(--nova-warning))",
          info: "hsl(var(--nova-info))",
        },
        module: {
          sales: "hsl(var(--module-sales))",
          "sales-light": "hsl(var(--module-sales-light))",
          products: "hsl(var(--module-products))",
          "products-light": "hsl(var(--module-products-light))",
          inventory: "hsl(var(--module-inventory))",
          "inventory-light": "hsl(var(--module-inventory-light))",
          customers: "hsl(var(--module-customers))",
          "customers-light": "hsl(var(--module-customers-light))",
          invoicing: "hsl(var(--module-invoicing))",
          "invoicing-light": "hsl(var(--module-invoicing-light))",
          suppliers: "hsl(var(--module-suppliers))",
          "suppliers-light": "hsl(var(--module-suppliers-light))",
          cash: "hsl(var(--module-cash))",
          "cash-light": "hsl(var(--module-cash-light))",
          expenses: "hsl(var(--module-expenses))",
          "expenses-light": "hsl(var(--module-expenses-light))",
          reports: "hsl(var(--module-reports))",
          "reports-light": "hsl(var(--module-reports-light))",
          accounting: "hsl(var(--module-accounting))",
          "accounting-light": "hsl(var(--module-accounting-light))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
