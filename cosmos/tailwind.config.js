/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bgApp: 'var(--bg-app)',
        bgSurface: 'var(--bg-surface)',
        bgHover: 'var(--bg-hover)',
        bgInput: 'var(--bg-input)',
        bgMuted: 'var(--bg-muted)',
        border: 'var(--border)',
        borderInput: 'var(--border-input)',
        textPrimary: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        textMuted: 'var(--text-muted)',
        textFaint: 'var(--text-faint)',
        accent: 'var(--accent)',
        accentHover: 'var(--accent-hover)',
        accentLight: 'var(--accent-light)',
        accentText: 'var(--accent-text)',
        sidebarBg: 'var(--sidebar-bg)',
        topbarBg: 'var(--topbar-bg)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      }
    },
  },
  plugins: [],
}
