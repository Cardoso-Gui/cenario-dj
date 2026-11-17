const {projectPath,pageUrlPath}=require('./page-paths.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(projectPath( 'contato.html'), 'utf8');

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

test('contato: oferece ligação e orienta o pedido de disponibilidade', () => {
  assert.match(html, /href="tel:\+5517996519630"[\s\S]*?Ligar para Flavinnho/);
  assert.match(html, /<h1 id="contact-title">QUER O FLAVINNHO/);
  for (const item of ['Data do evento', 'Cidade', 'Tipo de evento']) {
    assert.ok(html.includes(`${item}</li>`));
  }
  assert.doesNotMatch(html, /<form|<input|onclick=|onload=/);
});

test('contato: refinamento visual não é carregado em outras páginas', () => {
  for (const file of ['index.html', 'flavinnho.html', 'sobre.html', 'mixes.html', 'fotos.html']) {
    assert.doesNotMatch(fs.readFileSync(projectPath( file), 'utf8'), /css\/contact\.css/);
  }
});
