const {projectPath,pageUrlPath}=require('./page-paths.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pages = ['flavinnho.html', 'sobre.html', 'mixes.html', 'fotos.html', 'contato.html'];
const read = file => fs.readFileSync(projectPath( file), 'utf8');

for (const file of pages) {
  test(`${file}: mantém os cinco destinos e marca somente a página atual`, () => {
    const html = read(file);
    const nav = html.match(/<nav\b[^>]*aria-label="Menu principal"[^>]*>([\s\S]*?)<\/nav>/);
    assert.ok(nav, 'Menu principal presente');
    const links = [...nav[1].matchAll(/<a\b([^>]*)href="([^"#?]+)"([^>]*)>/g)];
    assert.deepEqual(links.map(link => link[2]), pages.map(pageUrlPath));
    assert.deepEqual(links.filter(link => /aria-current="page"/.test(link[1] + link[3])).map(link => link[2]), [pageUrlPath(file)]);
    assert.doesNotMatch(html, /eventos\.html|modelo visual/);
    assert.match(html, /css\/artist-navigation\.css/);

  });
}

test('a página Eventos foi removida e a contratação continua com destino real', () => {
  assert.equal(fs.existsSync(projectPath( 'eventos.html')), false);
  const home = read('flavinnho.html');
  assert.doesNotMatch(home, /class="home-events"/);
  assert.match(home, /href="\/flavinnho\/contato\/"[^>]*>Contratar para meu evento/);
});

test('o texto e a descrição da foto do artista são preservados', () => {
  const home = read('flavinnho.html');
  assert.match(home, /MÚSICA QUE<br>CONECTA PESSOAS/);
  assert.match(home, /alt="DJ Flavinnho de óculos escuros, com luzes de palco"/);
});

test('o fundo do rodapé também cobre a home', () => {
  assert.match(read('css/surfaces.css'), /footer,\s*\.page-inicio footer\s*\{/);
});
