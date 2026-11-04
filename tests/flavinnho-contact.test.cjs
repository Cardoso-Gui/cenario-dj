const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'contato.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/contact.css'), 'utf8');

test('contato: ambas as chamadas de contratação abrem o mesmo WhatsApp com texto editável', () => {
  const artistContact = html.split('<footer>')[0];
  const links = [...artistContact.matchAll(/<a\b[^>]*href="(https:\/\/wa\.me\/[^\"]+)"[^>]*>/g)];
  assert.equal(links.length, 2);
  assert.equal(links[0][1], links[1][1]);
  const url = new URL(links[0][1]);
  assert.equal(url.pathname, '/5517996519630');
  assert.equal(url.searchParams.get('text'), 'Olá, Flavinnho! Gostaria de consultar a disponibilidade para um evento.');
  for (const [tag] of links) {
    assert.match(tag, /target="_blank"/);
    assert.match(tag, /rel="noopener noreferrer"/);
  }
});

test('contato: mantém telefone, título e frase sem criar envio automático', () => {
  assert.match(html, /href="tel:\+5517996519630"/);
  assert.match(html, /QUER O FLAVINNHO<br>NO SEU <em>EVENTO\?<\/em>/);
  assert.match(html, /Uma nova pista\. Uma nova história\./);
  assert.match(html, /Conte a <strong>data<\/strong>, a <strong>cidade<\/strong> e o <strong>tipo de evento<\/strong>\./);
  assert.doesNotMatch(html, /<form|<input|onclick=|onload=/);
});

test('contato: ação principal mantém texto legível e foco visível', () => {
  assert.match(css, /\.page-contato \.contact \.contact-whatsapp\s*\{[^}]*font-size:\s*15px/);
  assert.match(css, /@media \(max-width: 650px\)[\s\S]*font-size:\s*14px/);
  assert.match(css, /\.contact-whatsapp:focus-visible\s*\{[^}]*outline:\s*2px solid #fff/);
  assert.match(html, /css\/contact\.css\?v=2/);
});

test('contato: refinamento visual não é carregado em outras páginas', () => {
  for (const file of ['index.html', 'flavinnho.html', 'sobre.html', 'mixes.html', 'fotos.html']) {
    assert.doesNotMatch(fs.readFileSync(path.join(root, file), 'utf8'), /css\/contact\.css/);
  }
});
