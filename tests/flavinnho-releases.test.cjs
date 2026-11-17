const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'mixes.html'),'utf8');
const css=fs.readFileSync(path.join(root,'css/flavinnho-releases.css'),'utf8');
test('mixes: one visible main title and two explicit destinations',()=>{
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.match(html,/no Spotify/); assert.match(html,/no YouTube/);
 assert.doesNotMatch(html,/src="[^"]*autoplay=1|atualiza automaticamente/i);assert.equal((html.match(/<iframe/g)||[]).length,3);
});
test('mixes: exact verified release and video links',()=>{
 assert.match(html,/https:\/\/open.spotify.com\/album\/3olFKQlBntnXMTke09YryF/);
 assert.match(html,/https:\/\/www.youtube.com\/watch\?v=VQZCh1CUMrs/);
});
test('mixes: permanent artist channels remain available',()=>{
 assert.match(html,/https:\/\/open.spotify.com\/intl-pt\/artist\/23kYeZykGN0EkOd29kArq4/);
 assert.match(html,/https:\/\/www.youtube.com\/@flavinnhodj\/featured/);
 for(const link of html.matchAll(/<a\b[^>]*href="https:[^>]+>/g)) {
  assert.match(link[0],/target="_blank"/);assert.match(link[0],/rel="noopener noreferrer"/);
 }
});
test('mixes: players usam apenas músicas do perfil e o vídeo oficial',()=>{for(const id of ['2105CvnYPZ7UN4xAP0Kj9h','7ifyKlUymf6t1336GkGyZ3'])assert.ok(html.includes('open.spotify.com/embed/track/'+id));assert.ok(html.includes('youtube.com/embed/VQZCh1CUMrs'));for(const [frame]of html.matchAll(/<iframe[^>]*>/g)){assert.match(frame,/title="[^"]+"/);assert.match(frame,/encrypted-media/);assert.match(frame,/referrerpolicy="strict-origin-when-cross-origin"/);}assert.equal((html.match(/class="select-video"/g)||[]).length,6);});
test('mixes: responsive rows and accessible interactive target size',()=>{
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css,/grid-template-columns:1fr/);
 assert.match(css,/min-height:45px/);
 assert.match(fs.readFileSync(path.join(root,'css/flavinnho-home.css'),'utf8'),/:focus-visible/);
});

test('Lançamentos: names change without breaking existing URLs or anchors',()=>{
 assert.match(html,/<title>Lançamentos — Flavinnho<\/title>/);
 assert.match(html,/class="eyebrow">DÊ O PLAY\.<\/p>/);
 assert.match(html,/id="mixes"/);
 for (const file of ['flavinnho.html','sobre.html','mixes.html','fotos.html','contato.html']) {
  const page = fs.readFileSync(path.join(root,file),'utf8');
  assert.match(page,/<a href="\.\/mixes\.html"(?: aria-current="page")?>Lançamentos<\/a/);
  assert.doesNotMatch(page,/>Mixes<\/a/);
 }
});
test('Lançamentos: home invitation and biography link use the new name',()=>{
 assert.match(fs.readFileSync(path.join(root,'flavinnho.html'),'utf8'),/id="releases-title">LANÇAMENTOS/);
 assert.match(fs.readFileSync(path.join(root,'sobre.html'),'utf8'),/Ouça meus lançamentos/);
});
