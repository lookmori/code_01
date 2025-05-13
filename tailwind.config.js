/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
          },
        },
      },
    },
  },
  plugins: [
    // 使用try-catch防止模块未找到的错误
    function() {
      try {
        return require('@tailwindcss/typography');
      } catch (e) {
        console.warn('警告: @tailwindcss/typography 插件未找到，文档排版功能可能受限');
        return function() {};
      }
    }(),
  ],
}

