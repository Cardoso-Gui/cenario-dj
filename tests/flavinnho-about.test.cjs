const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'sobre.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/about.css'), 'utf8');
test('sobre: mantém biografia e modal consolidados', () => {
  assert.match(html, /A música faz parte da minha história desde os 15 anos\./);
  assert.match(html, /Depois de dois anos com a banda, decidi seguir esse caminho de vez e focar na carreira de DJ\./);
  assert.match(html, /Minhas próprias músicas e remixes fazem parte dos meus sets/);
  assert.match(html, /js\/story-modal\.js\?v=1/);
  assert.match(html, /<details class="story">/);
  assert.match(html, /assets\/flavinnho-sorrindo\.jpg/);
});
test('sobre: link discreto leva à página existente de mixes', () => {
  assert.match(html, /<a class="about-mixes" href="\.\/mixes\.html">Ouça meus mixes/);
  assert.match(css, /\.about-mixes:focus-visible\s*\{[^}]*outline:\s*2px solid #fff/);
  assert.match(css, /min-height:\s*44px/);
});
test('sobre: refinamento móvel é isolado e legível', () => {
  assert.match(css, /@media \(max-width: 650px\)/);
  assert.match(css, /font-size: 16px/);
  assert.match(css, /font-size: 12px/);
  assert.match(html, /css\/about\.css\?v=1/);
  for (const f of ['index.html','flavinnho.html','mixes.html','fotos.html','contato.html']) {
    assert.doesNotMatch(fs.readFileSync(path.join(root,f),'utf8'), /css\/about\.css/);
  }
});
