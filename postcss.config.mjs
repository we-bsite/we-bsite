// ABOUTME: Expands Tailwind directives and adds browser prefixes to compiled styles.
// ABOUTME: Runs after Sass so Next.js emits browser-ready CSS without raw directives.

const postcssConfig = {
  plugins: {
    autoprefixer: {},
    tailwindcss: {},
  },
};

export default postcssConfig;
