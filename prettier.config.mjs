import * as sveltePlugin from 'prettier-plugin-svelte';
import * as tailwindPlugin from 'prettier-plugin-tailwindcss';

/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
export default {
  plugins: [sveltePlugin, tailwindPlugin],

  // Tailwind v4 CSS-first config — point at your actual stylesheet entry point
  tailwindStylesheet: './src/routes/layout.css',

  // General formatting preferences
  printWidth: 100,
  singleQuote: true,
  semi: true,
  trailingComma: 'all',
  useTabs: false,
  tabWidth: 2,
  arrowParens: 'avoid',

  // Keep whitespace behavior aligned with how the browser renders inline elements
  htmlWhitespaceSensitivity: 'css',

  overrides: [
    {
      files: '*.svelte',
      options: { parser: 'svelte' },
    },
  ],
};
