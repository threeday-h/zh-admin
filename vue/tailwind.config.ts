/** @type {import('tailwindcss').Config} */

const generateValues = (start, end, step) => {
  let result = {}

  for (let i = start; i <= end; i++) {
    result[i] = i * step + 'rem'
  }
  return result
}

export default {
  darkMode: 'media',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      height: {
        ...generateValues(1, 50, 0.25),
        full: '100%'
      },
      width: {
        ...generateValues(1, 50, 0.25),
        full: '100%',
        'fit-content': 'fit-content'
      },
      fontSize: {
        ...generateValues(1, 50, 0.25)
      },
      padding: {
        ...generateValues(1, 50, 0.25)
      },
      margin: {
        ...generateValues(1, 50, 0.25)
      },
      borderRadius: {
        ...generateValues(1, 50, 0.25)
      },
      borderWidth: {
        1: '.0625rem',
        2: '.125rem',
        3: '.1875rem',
        4: '.25rem'
      },
      fontWeight: {
        1: 100,
        2: 200,
        3: 300,
        4: 400,
        5: 500,
        6: 600,
        7: 700,
        8: 800,
        bold: 'bold',
        normal: 'normal'
      },
      colors: {
        black: '#000',
        white: '#fff',
        transparent: 'transparent'
      }
    }
  },
  plugins: []
}
