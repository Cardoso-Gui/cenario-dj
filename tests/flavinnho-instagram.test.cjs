const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('flavinnho.html');
const css = read('css/home-instagram.css');
const section = html.match(/<section class="home-instagram"[\s\S]*?<\/section>/)?.[0];

test('convite do Instagram fica imediatamente após o hero e antes do Sobre', () => {
  assert.ok(section);
  assert.match(html, /<\/section>\s*<section class="home-instagram"/);
  assert.match(html, /<section class="home-instagram"[\s\S]*?<\/section>\s*<section class="home-about"/);
  assert.ok(html.indexOf('class="hero"') < html.indexOf('class="home-instagram"'));
  assert.ok(html.indexOf('class="home-instagram"') < html.indexOf('class="home-booking"'));
});

test('convite usa o texto aprovado e o perfil oficial sem inventar conteúdo', () => {
  assert.match(section, />Acompanhe o Flavinnho de perto<\/h2>/);
  assert.match(section, />@flavinnhodj<\/p>/);
  assert.match(section, />Novidades, bastidores e muito mais no Instagram\.<\/p>/);
  assert.match(section, />Seguir no Instagram <svg/);
  assert.doesNotMatch(section, /Siga no insta para não perder nada/);
  assert.doesNotMatch(section, /<(?:iframe|script)\b|seguidores|followers|feed|data-/i);
});

test('todo o convite é um único link nativo acessível e seguro', () => {
  assert.equal([...section.matchAll(/<a\s/g)].length, 1);
  assert.match(section, /href="https:\/\/www\.instagram\.com\/flavinnhodj\/" target="_blank" rel="noopener noreferrer"/);
  assert.match(section, /aria-labelledby="home-instagram-title"/);
  assert.match(section, /id="home-instagram-title"/);
  assert.match(section, /Abre o perfil em uma nova aba\./);
  assert.doesNotMatch(section, /onclick|tabindex|<button|role="button"/);
  assert.match(css, /\.home-instagram-link:focus-visible\s*\{[^}]*outline:\s*2px/);
});

test('convite possui layout móvel, alvos de toque e nenhuma animação', () => {
  assert.match(css, /@media \(max-width: 650px\)/);
  assert.match(css, /grid-template-columns: 40px minmax\(0, 1fr\)/);
  assert.match(css, /min-height: 44px/);
  assert.doesNotMatch(css, /@keyframes|animation\s*:|transition\s*:|@import|url\(/);
  assert.match(css, /font-family: inherit/);
});

test('estilo é isolado na home sem alterar páginas internas ou Cenário', () => {
  assert.equal([...html.matchAll(/css\/home-instagram\.css\?v=2/g)].length, 1);
  assert.ok(html.indexOf('css/home-instagram.css') > html.indexOf('css/stage-effects.css'));
  for (const file of ['index.html', 'sobre.html', 'mixes.html', 'fotos.html', 'contato.html']) {
    assert.doesNotMatch(read(file), /home-instagram/);
  }
});

test('Instagram existente no rodapé e chamadas principais são preservados', () => {
  assert.match(html, /<footer>[\s\S]*href="https:\/\/www\.instagram\.com\/flavinnhodj\/"/);
  assert.match(html, />CONTRATE PARA SEU EVENTO /);
  assert.match(html, />OUÇA NO SPOTIFY | OUÇA NO SPOTIFY /);
  assert.match(html, /class="footer-console" aria-hidden="true"/);
});


test('convite reserva espaço acima do foco para o cabeçalho fixo', () => {
  assert.match(css, /\.home-instagram-link\s*\{[^}]*scroll-margin-block-start:\s*200px/);
});
