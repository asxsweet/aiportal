import type { Config } from 'tailwindcss';

/** Ensures tooling / IDEs recognize class-based dark mode (`dark` on &lt;html&gt;). Variants are defined in `src/styles/theme.css`. */
export default {
  darkMode: 'class',
} satisfies Config;
