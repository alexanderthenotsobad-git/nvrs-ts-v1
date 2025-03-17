/* eslint-disable @typescript-eslint/no-unused-vars */
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
