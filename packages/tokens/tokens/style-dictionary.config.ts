import StyleDictionary from 'style-dictionary';
import fs from 'node:fs';

const lightSources = ['tokens/light/**/*.json'];
const darkSources  = ['tokens/dark/**/*.json'];

/** Util: aplatir les tokens en CSS variables */
function registerCssVariablesFormat() {
  StyleDictionary.registerFormat({
    name: 'css/variables-per-scope',
    formatter({ dictionary, options }) {
      const { scope = ':root' } = options ?? {};
      const lines = dictionary.allTokens.map(t => `  --${t.name.replace(/\./g,'-')}: ${t.value};`);
      return `${scope} {\n${lines.join('\n')}\n}\n`;
    }
  });
}

registerCssVariablesFormat();

function buildForTheme(themeName: 'light'|'dark', sources: string[], scope: string) {
  const SD = StyleDictionary.extend({
    source: sources,
    transform: {
      // transformations par défaut conviennent
    },
    platforms: {
      css: {
        transforms: ['attribute/cti', 'name/cti/kebab', 'color/hex'],
        buildPath: `build/${themeName}/`,
        files: [
          { destination: 'tokens.css', format: 'css/variables-per-scope', options: { scope } }
        ],
        options: { outputReferences: true }
      },
      json: {
        transforms: ['attribute/cti', 'name/cti/kebab'],
        buildPath: `build/${themeName}/`,
        files: [{ destination: 'tokens.json', format: 'json/nested' }]
      }
    }
  });
  SD.buildAllPlatforms();
}

buildForTheme('light', lightSources, ':root');          // light sur :root
buildForTheme('dark',  darkSources,  '.theme-dark');    // dark via .theme-dark

// Fusionne un petit thème Tailwind (clé -> var CSS)
const light = JSON.parse(fs.readFileSync('build/light/tokens.json','utf8'));
const twTheme = {
  colors: {
    bg:       "var(--semantic-color-bg-default)",
    fg:       "var(--semantic-color-fg-default)",
    primary:  "var(--semantic-color-primary-default)",
    danger:   "var(--semantic-color-danger-default)",
    border:   "var(--semantic-color-border-default)",
    focus:    "var(--semantic-color-focus-ring)"
  },
  borderRadius: {
    md: "var(--primitive-radius-md)"
  },
  spacing: {
    2: "var(--primitive-space-2)",
    3: "var(--primitive-space-3)"
  },
  boxShadow: {
    sm: "var(--primitive-shadow-sm)"
  },
  // tu peux ajouter typo, etc.
};
fs.mkdirSync('build/tailwind', { recursive: true });
fs.writeFileSync('build/tailwind/theme.json', JSON.stringify(twTheme, null, 2));
console.log('Built CSS variables & Tailwind theme.');
