const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const pages = ['flavinnho.html', 'sobre.html', 'mixes.html', 'fotos.html', 'contato.html'];
const message = 'Olá, Gui! Vi o site do Flavinnho e gostaria de saber mais sobre um site para mim.';

for (const page of pages) {
  test(`${page}: convite discreto abre o WhatsApp do Gui sem enviar mensagem`, () => {
    const html = read(page);
    const footer = html.match(/<footer>([\s\S]*?)<\/footer>/)?.[1];
    assert.ok(footer);
    assert.equal((html.match(/class="footer-invite"/g) || []).length, 1);
    assert.match(footer, /<p>Você também é DJ\? Tenha um site com a sua identidade\.<\/p>/);
    const link = footer.match(/<a class="footer-invite-link"[^>]*>[\s\S]*?<\/a>/)?.[0];
    assert.ok(link);
    assert.match(link, />Quero meu site<\/a>/);
    const url = new URL(link.match(/href="([^"]+)"/)[1]);
    assert.equal(url.origin, 'https://wa.me');
    assert.equal(url.pathname, '/5517991951286');
    assert.equal(url.searchParams.get('text'), message);
    assert.deepEqual([...url.searchParams.keys()], ['text']);
    assert.match(link, /target="_blank"/);
    assert.match(link, /rel="noopener noreferrer"/);
    assert.match(link, /aria-label="Quero meu site: conversar com Gui pelo WhatsApp \(nova aba\)"/);
    assert.doesNotMatch(link, /onclick=|download=|javascript:/i);
    assert.match(footer, /class="social-links"[\s\S]*class="footer-console"[\s\S]*<small>[\s\S]*class="footer-invite"/);
    for (const destination of ['https://www.instagram.com/flavinnhodj/', 'https://www.youtube.com/@flavinnhodj/featured', 'https://open.spotify.com/intl-pt/artist/23kYeZykGN0EkOd29kArq4']) {
      assert.ok(footer.includes(`href="${destination}"`));
    }
    assert.equal((html.match(/css\/footer-invite\.css\?v=2/g) || []).length, 1);
    assert.ok(html.indexOf('css/footer-invite.css') > html.indexOf('css/stage-effects.css'));
  });
}

test('convite: mantém texto visível no celular e alvo confortável com foco claro', () => {
  const css = read('css/footer-invite.css');
  // Base footer rules hide other paragraphs below 650px; this invitation must stay visible.
  assert.match(css, /footer \.footer-invite p\s*\{[^}]*display:\s*block/);
  assert.match(css, /footer \.footer-invite-link\s*\{[^}]*min-height:\s*44px/);
  assert.match(css, /footer \.footer-invite-link:focus-visible\s*\{[^}]*outline:\s*2px solid/);
  assert.match(css, /@media \(max-width: 650px\)[\s\S]*flex-direction:\s*column/);
  assert.doesNotMatch(css, /\banimation\s*:|@keyframes|position:\s*fixed|height:\s*100/);
});

test('convite: estilo isolado não alcança identidade ou home do Cenário', () => {
  const css = read('css/footer-invite.css');
  assert.doesNotMatch(read('index.html'), /footer-invite\.css|class="footer-invite"/);
  assert.doesNotMatch(css, /\.site-header|\.footer-console|\.social-links|\.page-inicio|:root/);
  const selectors = [...css.matchAll(/(?:^|\})\s*([^{}]+)\{/g)].map(match => match[1]);
  assert.ok(selectors.every(selector => selector.startsWith('footer .footer-invite') || selector.startsWith('@media') || selector.startsWith('/*')));
});

test('convite: contato para sites é separado da contratação do artista', () => {
  const html = read('contato.html');
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
  assert.match(main, /https:\/\/wa\.me\/5517996519630/);
  assert.doesNotMatch(main, /5517991951286|footer-invite/);
});

test('convite: frase e botão ficam próximos no desktop', () => {
  const css = read('css/footer-invite.css');
  assert.match(css, /footer \.footer-invite\s*\{[^}]*justify-content:\s*flex-start/);
  assert.match(css, /footer \.footer-invite\s*\{[^}]*gap:\s*10px 24px/);
  assert.doesNotMatch(css, /justify-content:\s*space-between/);
});
