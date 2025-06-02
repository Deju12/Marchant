/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
  "./App.tsx",
  "./app/**/*.{js,jsx,ts,tsx}",
  "./components/**/*.{js,jsx,ts,tsx}",
],

  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        yellow: '#f4bc1b',  // or any yellow you like
        green: '#245a34',   // or any green you like
      },
    },
  },
  plugins: [],
}