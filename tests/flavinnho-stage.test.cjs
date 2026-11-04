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
    assert.equal([...html.matchAll(/css\/stage-effects\.css\?v=4/g)].length, 1);
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

test('item atual tem texto claro independente do facho violeta', () => {
  const css = read('css/stage-effects.css');
  assert.match(css, /\.site-header nav a\[aria-current="page"\]\s*\{[^}]*color:\s*#fff;/);
  assert.match(css, /\.site-header nav a\[aria-current="page"\]:after\s*\{[^}]*background:\s*#d28aff;/);
});


test('cabeçalho eleva somente a arte para ocultar a treliça em cada escala', () => {
  const css = read('css/stage-effects.css');
  assert.match(css, /background: url\('\.\.\/assets\/stage\/header-lights\.webp'\) center -3\.8vw \/ 100% auto no-repeat;/);
  assert.match(css, /@media \(max-width: 800px\)[\s\S]*background-size: auto 290px;\s*background-position: center -33px;/);
  assert.match(css, /@media \(max-width: 650px\)[\s\S]*background-size: auto 260px;\s*background-position: center -30px;/);
  assert.match(css, /--header: clamp\(136px, 11vw, 200px\)/);
  assert.match(css, /height: calc\(var\(--header\) \+ 50px\)/);
  // The image is 2172 × 724. Its truss ends at source y=80;
  // cropping less than y=85 retains the lamp bodies and all light lenses.
  for (const crop of [2172 * 0.038, 33 * 724 / 290, 30 * 724 / 260]) {
    assert.ok(crop > 80 && crop < 85, `Source crop: ${crop}`);
  }
});
