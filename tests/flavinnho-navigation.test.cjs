const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pages = ['flavinnho.html', 'sobre.html', 'mixes.html', 'fotos.html', 'contato.html'];
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

for (const file of pages) {
  test(`${file}: mantém os cinco destinos e marca somente a página atual`, () => {
    const html = read(file);
    const nav = html.match(/<nav\b[^>]*aria-label="Menu principal"[^>]*>([\s\S]*?)<\/nav>/);
    assert.ok(nav, 'Menu principal presente');
    const links = [...nav[1].matchAll(/<a\b([^>]*)href="\.\/([^"#?]+)"([^>]*)>/g)];
    assert.deepEqual(links.map(link => link[2]), pages);
    assert.deepEqual(links.filter(link => /aria-current="page"/.test(link[1] + link[3])).map(link => link[2]), [file]);
    assert.doesNotMatch(html, /eventos\.html|↗|modelo visual/);
    assert.match(html, /css\/theme\.css\?v=14/);
    assert.match(html, /css\/readability\.css\?v=1/);
    assert.match(html, /css\/surfaces\.css\?v=2/);
    for (const match of html.matchAll(/href="(\.\/[^"?#]+\.html)(?:[?#][^"]*)?"/g)) {
      assert.ok(fs.existsSync(path.resolve(root, match[1])), `Destino existente: ${match[1]}`);
    }
    const arrows = [...html.matchAll(/<svg\b[^>]*class="icon-arrow-up-right"[^>]*>/g)];
    assert.ok(arrows.length > 0);
    for (const [svg] of arrows) {
      assert.match(svg, /aria-hidden="true"/);
      assert.match(svg, /focusable="false"/);
    }
  });
}

test('a página Eventos foi removida e a contratação continua com destino real', () => {
  assert.equal(fs.existsSync(path.join(root, 'eventos.html')), false);
  const home = read('flavinnho.html');
  assert.doesNotMatch(home, /class="home-events"/);
  assert.match(home, /href="\.\/contato\.html"[^>]*>CONSULTE UMA DATA/);
});

test('o texto continua separado no celular e o retrato é descrito como ilustração', () => {
  const home = read('flavinnho.html');
  assert.match(home, /MÚSICA QUE\s+<br>CONECTA PESSOAS/);
  assert.match(home, /alt="Ilustração de um DJ sorrindo, de óculos escuros e jaqueta"/);
});

test('o fundo do rodapé também cobre a home', () => {
  assert.match(read('css/surfaces.css'), /footer,\s*\.page-inicio footer\s*\{/);
});
