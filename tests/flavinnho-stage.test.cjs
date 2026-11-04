const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const pages = ['flavinnho.html', 'sobre.html', 'mixes.html', 'fotos.html', 'contato.html'];

for (const page of pages) {
  test(`${page}: cenário decorativo preserva conteúdo e navegação reais`, () => {
    const html = read(page);
    assert.equal([...html.matchAll(/css\/stage-effects\.css\?v=2/g)].length, 1);
    assert.ok(html.indexOf('css/stage-effects.css') > html.indexOf('css/readability.css'));
    assert.equal([...html.matchAll(/class="footer-console" aria-hidden="true"/g)].length, 1);
    assert.match(html, /<footer>[\s\S]*class="social-links"[\s\S]*class="footer-console"[\s\S]*<small>/);
    assert.doesNotMatch(html, /eventos\.html/);
  });
}

test('efeitos não interceptam cliques nem animam as luzes', () => {
  const css = read('css/stage-effects.css');
  assert.match(css, /\.site-header:after\s*\{[^}]*pointer-events:\s*none/);
  assert.match(css, /\.footer-console\s*\{[^}]*pointer-events:\s*none/);
  assert.doesNotMatch(css, /\banimation\s*:|@keyframes/);
  assert.match(css, /@media \(max-width: 650px\)/);
  assert.match(css, /\.page-inicio footer/);
});

test('recursos decorativos são WebP locais e leves', () => {
  let total = 0;
  for (const file of ['header-lights.webp', 'footer-controller.webp']) {
    const bytes = fs.readFileSync(path.join(root, 'assets/stage', file));
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    assert.ok(read('css/stage-effects.css').includes(`../assets/stage/${file}`));
    total += bytes.length;
  }
  assert.ok(total < 150000, `Total: ${total} bytes`);
});

test('identidade de palco não é carregada pela home Cenário', () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /stage-effects|footer-console|assets\/stage/);
});

test('rodapé compacto aproxima a controladora sem reduzir a fonte', () => {
  const css = read('css/stage-effects.css');
  assert.match(css, /height:\s*clamp\(100px, 14vw, 235px\)/);
  assert.match(css, /height:\s*76px/);
  assert.match(css, /text-shadow:\s*0 1px 2px #000/);
  assert.match(css, /color:\s*#e4dced/);
  assert.doesNotMatch(css, /font-size/);
});
