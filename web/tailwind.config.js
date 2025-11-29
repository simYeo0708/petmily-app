/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        italiana: ['var(--font-italiana)', 'serif'],
        'josefin-sans': ['var(--font-josefin-sans)', 'sans-serif'],
      },
      colors: {
        'petmily-brown': '#bd8e61',
        'petmily-light': '#d5cdc9',
        'petmily-medium': '#cbb7a2',
        'petmily-dark': '#d8cab8',
        'petmily-beige': '#bea185',
      },
    },
  },
  plugins: [],
}

