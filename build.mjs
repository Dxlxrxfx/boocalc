/**
 * BooCalc — Build Script
 * Produces dist/index.html: a standalone single-file HTML artifact
 * with CSS and all JS modules inlined. No external dependencies needed.
 *
 * Usage: node build.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const __dir = dirname(fileURLToPath(import.meta.url));
const src   = p => join(__dir, 'src', p);
const dist  = p => join(__dir, 'dist', p);

// ─── Read source files ────────────────────────────────────────────────────────

const html    = readFileSync(src('index.html'),    'utf8');
const css     = readFileSync(src('style.css'), 'utf8');
const engine  = readFileSync(src('engine.js'),     'utf8');
let frames = readFileSync(src('sprite-frames.js'), 'utf8');
for (const filename of ['boocalc-sprites.webp', 'boocalc-supplement.webp']) {
  const url = `data:image/webp;base64,${readFileSync(src('assets/' + filename)).toString('base64')}`;
  frames = frames.replace(JSON.stringify('assets/' + filename), JSON.stringify(url));
}
const ghosts  = readFileSync(src('ghosts.js'),     'utf8');
const animator = readFileSync(src('animator.js'),  'utf8');
const sound   = readFileSync(src('sound.js'),      'utf8');
const ui      = readFileSync(src('ui.js'),         'utf8');
const demo    = readFileSync(src('demo.js'),       'utf8');
const demoCss = readFileSync(src('demo.css'),      'utf8');

// ─── Strip ES module syntax for inline bundle ─────────────────────────────────
//
// We convert the module graph into a single IIFE-style script.
// Strategy:
//   1. Remove all `import` statements (we'll concatenate in order).
//   2. Remove all `export` keywords from declarations.
//   3. Concatenate engine → sprite-frames → ghosts → animator → sound → ui in dependency order.
//   4. Append a call to init().

function stripModuleSyntax(code, filename) {
  return code
    // Bind each module's imports inside its own closure, including aliases.
    .replace(/import\s*\{([\s\S]*?)\}\s*from\s*['"]\.\/([^'"]+)['"]\s*;?/g,
      (_, names, module) => {
        const bindings = names.split(',').map(name => name.trim()).filter(Boolean)
          .map(name => name.replace(/\s+as\s+/, ': ')).join(', ');
        return `const { ${bindings} } = __booModules[${JSON.stringify(module)}];`;
      })
    // Remove `export default` on function/class/const
    .replace(/^export\s+default\s+/gm, '')
    // Remove `export` from named exports: export function, export class, export const, export let, export var
    .replace(/^export\s+(async\s+)?(function|class|const|let|var)\s+/gm, (_, async_, kw) => (async_ || '') + kw + ' ')
    // Remove standalone `export { ... };` lines
    .replace(/^export\s+\{[^}]*\};?\s*$/gm, '')
    // Remove 'use strict' (we'll add one at the top)
    .replace(/^'use strict';\s*$/gm, '')
    .replace(/^"use strict";\s*$/gm, '');
}

function wrapModule(name, code) {
  const names = [...code.matchAll(/^export\s+(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)/gm)]
    .map(match => match[1]);
  return `__booModules[${JSON.stringify(name)}] = (() => {\n${stripModuleSyntax(code, name)}\nreturn {${names.join(',')}};\n})();`;
}

function makeInlineScript(withDemo = false) { return `
'use strict';
const __booModules = Object.create(null);
${wrapModule('engine.js', engine)}
${wrapModule('sprite-frames.js', frames)}
${wrapModule('ghosts.js', ghosts)}
${wrapModule('animator.js', animator)}
${wrapModule('sound.js', sound)}
${wrapModule('ui.js', ui)}
${withDemo ? wrapModule('demo.js', demo) : ''}
function bootBooCalc() {
  __booModules['ui.js'].init();
  ${withDemo ? "__booModules['demo.js'].initDemo();" : ''}
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootBooCalc, {once: true});
} else {
  bootBooCalc();
}
`; }
const inlineScript = makeInlineScript();
const demoScript = makeInlineScript(true);

// Fail the build on invalid standalone JavaScript rather than ship a blank keypad.
new Script(inlineScript, {filename: 'boocalc-standalone.js'});
new Script(demoScript, {filename: 'boocalc-demo-standalone.js'});

// ─── Inject into HTML ─────────────────────────────────────────────────────────

function makeDocument(styles, script) {
let output = html;

// Replace <link rel="stylesheet" href="style.css"> with inline <style>
output = output.replace(
  /<link\s+rel="stylesheet"\s+href="style\.css"\s*\/?>/,
  () => `<style>\n${styles}\n</style>`
);

// Replace <script type="module"> ... </script> with inline script
output = output.replace(
  /<script\s+type="module"[\s\S]*?<\/script>/,
  () => `<script>\n${script.replace(/<\/script/gi, '<\\/script')}\n</script>`
);
return output;
}
const output = makeDocument(css, inlineScript);
const demoOutput = makeDocument(css + '\n' + demoCss, demoScript);

// Update html lang — keep as-is (es)

// ─── Write dist ───────────────────────────────────────────────────────────────

mkdirSync(dist(''), { recursive: true });
writeFileSync(dist('index.html'), output, 'utf8');
writeFileSync(dist('demo.html'), demoOutput, 'utf8');

console.log(`✓ Built dist/index.html (${(output.length / 1024).toFixed(1)} KB)`);
console.log(`✓ Built dist/demo.html (${(demoOutput.length / 1024).toFixed(1)} KB)`);
