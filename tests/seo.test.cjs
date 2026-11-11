const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const origin = 'https://www.cenariodj.com.br';
const files = ['index.html', 'flavinnho.html', 'sobre.html', 'mixes.html', 'fotos.html', 'contato.html'];
const pages = Object.fromEntries(files.map(file => [file, fs.readFileSync(path.join(root, file), 'utf8')]));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const pageUrl = file => `${origin}/${file === 'index.html' ? '' : file}`;

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(match => [match[1], match[2]]));
}

function headTags(html, tag) {
  const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
  return [...head.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))].map(match => attributes(match[0]));
}

function meta(html, key) {
  const matches = headTags(html, 'meta').filter(tag => tag.name === key || tag.property === key);
  assert.equal(matches.length, 1, `Exactly one ${key} tag`);
  return matches[0].content;
}

function jsonLd(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
}

for (const file of files) {
  test(`SEO: ${file} has a unique canonical URL and complete sharing metadata`, () => {
    const html = pages[file];
    const canonical = headTags(html, 'link').filter(tag => tag.rel === 'canonical');
    assert.deepEqual(canonical, [{ rel: 'canonical', href: pageUrl(file) }]);
    const title = html.match(/<title>([^<]+)<\/title>/)[1];
    const description = meta(html, 'description');
    assert.ok(description.length > 50);
    assert.equal(meta(html, 'og:url'), pageUrl(file));
    assert.equal(meta(html, 'og:title'), title);
    assert.equal(meta(html, 'twitter:title'), title);
    assert.equal(meta(html, 'og:description'), description);
    assert.equal(meta(html, 'twitter:description'), description);
    assert.equal(meta(html, 'og:locale'), 'pt_BR');
    assert.equal(meta(html, 'og:site_name'), 'Cenário DJ');
    assert.equal(meta(html, 'og:type'), file === 'flavinnho.html' ? 'profile' : 'website');
    assert.equal(meta(html, 'twitter:card'), file === 'index.html' ? 'summary_large_image' : 'summary');
    const image = meta(html, 'og:image');
    assert.equal(meta(html, 'og:image:secure_url'), image);
    assert.equal(meta(html, 'twitter:image'), image);
    assert.ok(meta(html, 'og:image:alt').length > 10);
    assert.ok(meta(html, 'twitter:image:alt').length > 10);
    const imageUrl = new URL(image);
    assert.equal(imageUrl.origin, origin);
    assert.ok(fs.statSync(path.join(root, imageUrl.pathname)).size > 1000);
    assert.doesNotMatch(html.match(/<head>[\s\S]*?<\/head>/)[0], /cardoso-gui\.github\.io/);
  });
}

test('SEO: descriptions are specific to each of the six pages', () => {
  assert.equal(new Set(files.map(file => meta(pages[file], 'description'))).size, files.length);
  assert.match(meta(pages['mixes.html'], 'description'), /BAILE DO BLUE.*APAGA A LUZ/);
  assert.match(meta(pages['sobre.html'], 'description'), /história.*15 anos/);
  assert.match(meta(pages['fotos.html'], 'description'), /fotos e aftermovies/);
  assert.match(meta(pages['contato.html'], 'description'), /WhatsApp ou telefone/);
});

test('SEO: home remains a showcase of artists with their own sites', () => {
  assert.match(meta(pages['index.html'], 'description'), /artistas com sites criados pelo Cenário DJ/);
  assert.doesNotMatch(meta(pages['index.html'], 'description'), /em todo o Brasil/);
  const [site] = jsonLd(pages['index.html']);
  assert.equal(jsonLd(pages['index.html']).length, 1);
  assert.equal(site['@context'], 'https://schema.org');
  assert.equal(site['@type'], 'WebSite');
  assert.equal(site['@id'], `${origin}/#website`);
  assert.equal(site.url, `${origin}/`);
  assert.equal(site.name, 'Cenário DJ');
  assert.equal(site.inLanguage, 'pt-BR');
});

test('SEO: artist structured data uses existing facts and official channels without assuming an address', () => {
  const [artist] = jsonLd(pages['flavinnho.html']);
  assert.equal(jsonLd(pages['flavinnho.html']).length, 1);
  assert.equal(artist['@context'], 'https://schema.org');
  assert.equal(artist['@type'], 'MusicGroup');
  assert.equal(artist['@id'], `${origin}/flavinnho.html#artist`);
  assert.equal(artist.name, 'Flavinnho');
  assert.equal(artist.genre, 'Funk');
  assert.equal(artist.url, pageUrl('flavinnho.html'));
  assert.equal(artist.image, meta(pages['flavinnho.html'], 'og:image'));
  assert.deepEqual(artist.sameAs, [
    'https://www.instagram.com/flavinnhodj/',
    'https://www.youtube.com/@flavinnhodj/featured',
    'https://open.spotify.com/intl-pt/artist/23kYeZykGN0EkOd29kArq4'
  ]);
  assert.equal(artist.address, undefined);
  assert.equal(artist.areaServed, undefined);
  for (const file of ['sobre.html', 'mixes.html', 'fotos.html', 'contato.html']) {
    assert.equal(jsonLd(pages[file]).length, 0);
  }
});

test('SEO: image metadata matches the unchanged original assets', () => {
  for (const file of files) {
    const isHome = file === 'index.html';
    assert.equal(meta(pages[file], 'og:image:width'), isHome ? '1734' : '603');
    assert.equal(meta(pages[file], 'og:image:height'), isHome ? '907' : '920');
    assert.equal(meta(pages[file], 'og:image:type'), isHome ? 'image/png' : 'image/webp');
    assert.equal(meta(pages[file], 'og:image'), `${origin}/assets/${isHome ? 'cenario-social.png' : 'galeria/na-controladora.webp'}`);
  }
});

test('SEO: sitemap contains exactly the six canonical pages without invented dates or priorities', () => {
  const xml = read('sitemap.xml');
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
  assert.deepEqual([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]), files.map(pageUrl));
  assert.doesNotMatch(xml, /<lastmod>|<priority>|<changefreq>|github\.io/);
});

test('SEO: robots allows crawling and points to the canonical sitemap', () => {
  assert.equal(read('robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
  assert.equal(read('CNAME').trim(), 'www.cenariodj.com.br');
});

test('SEO: existing browser theme colors are unchanged', () => {
  for (const file of files) {
    assert.equal(meta(pages[file], 'theme-color'), file === 'index.html' ? '#090b09' : '#07080d');
  }
});
