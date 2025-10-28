import StyleDictionary from 'style-dictionary';
import fs from 'node:fs';

// Sources (export Figma/Tokens Studio ici)
const LIGHT_SOURCES = ['tokens/light/**/*.json'];
const DARK_SOURCES  = ['tokens/dark/**/*.json'];

// Format CSS en variables, avec un scope passé en option
StyleDictionary.registerFormat({
  name: 'css/variables-per-scope',
  formatter({ dictionary, options }) {
    const scope = options?.scope ?? ':root';
    const lines = dictionary.allTokens.map(t => `  --${t.name.replace(/\./g,'-')}: ${t.value};`);
    return `${scope} {\n${lines.join('\n')}\n}\n`;
  }
});

function buildTheme(theme, sources, scope) {
  const SD = StyleDictionary.extend({
    source: sources,
    platforms: {
      css: {
        transforms: ['attribute/cti','name/cti/kebab','color/hex'],
        buildPath: `build/${theme}/`,
        files: [
          { destination: 'tokens.css', format: 'css/variables-per-scope', options: { scope } }
        ],
        options: { outputReferences: true }
      },
      json: {
        transforms: ['attribute/cti','name/cti/kebab'],
        buildPath: `build/${theme}/`,
        files: [{ destination: 'tokens.json', format: 'json/nested' }]
      }
    }
  });
  SD.buildAllPlatforms();
  console.log(`Built ${theme} tokens -> build/${theme}/`);
}

// Build light/dark
buildTheme('light', LIGHT_SOURCES, ':root');       // thème clair
buildTheme('dark',  DARK_SOURCES,  '.theme-dark'); // thème sombre

// Génére un petit thème Tailwind basé sur les variables CSS (pour @dspoc/components)
const twTheme = {
  colors: {
    bg: "var(--semantic-color-bg-default)",
    fg: "var(--semantic-color-fg-default)",
    primary: "var(--semantic-color-primary-default)",
    danger: "var(--semantic-color-danger-default)",
    border: "var(--semantic-color-border-default)",
    focus: "var(--semantic-color-focus-ring)"
  },
  borderRadius: { md: "var(--primitive-radius-md)" },
  spacing: { 2: "var(--primitive-space-2)", 3: "var(--primitive-space-3)" },
  boxShadow: { sm: "var(--primitive-shadow-sm)" }
};
fs.mkdirSync('build/tailwind', { recursive: true });
fs.writeFileSync('build/tailwind/theme.json', JSON.stringify(twTheme, null, 2));
console.log('Built Tailwind theme -> build/tailwind/theme.json');
