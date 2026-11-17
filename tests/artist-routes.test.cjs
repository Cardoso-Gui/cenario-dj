const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');const {routes,projectPath}=require('./page-paths.cjs');
for(const [legacy,route]of Object.entries(routes)){
 test(route+': a página, os recursos e a navegação resolvem dentro da estrutura correta',()=>{
  const html=fs.readFileSync(projectPath(legacy),'utf8'),base=new URL(route,'https://www.cenariodj.com.br');
  assert.ok(html.includes('href="'+base.href+'"'));assert.ok(html.includes('content="'+base.href+'"'));
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
  for(const [,raw]of html.matchAll(/(?:href|src|poster)="([^"]+)"/g)){
   const url=new URL(raw.replace(/&amp;/g,'&'),base);if(url.origin!==base.origin)continue;
   let target=path.join(root,url.pathname);if(url.pathname.endsWith('/'))target=path.join(target,'index.html');
   assert.ok(fs.existsSync(target),url.href);
   if(url.hash&&url.pathname===base.pathname)assert.ok(ids.includes(decodeURIComponent(url.hash.slice(1))),url.href);
  }
  const nav=html.match(/<nav class="artist-links"[\s\S]*?<\/nav>/)[0];for(const dest of Object.values(routes))assert.ok(nav.includes('href="'+dest+'"'));
  assert.ok(nav.includes('href="'+route+'" aria-current="page"'));assert.ok(html.includes('href="/" class="cenario-return"'));
 });
 test(legacy+': redireciona preservando filtros e âncoras',()=>{
  const html=fs.readFileSync(path.join(root,legacy),'utf8');assert.ok(html.includes('content="0;url='+route+'"'));assert.match(html,/noindex,follow/);
  let actual;vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],{location:{search:'?origem=teste',hash:'#conteudo',replace(url){actual=url;}}});assert.equal(actual,route+'?origem=teste#conteudo');
 });
}
test('catálogo aponta ao site do artista e sitemap não anuncia aliases antigos',()=>{require('../js/cenario-data.js');assert.equal(global.CenarioData.artists[0].profile,'/flavinnho/');const xml=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');for(const route of Object.values(routes))assert.ok(xml.includes('https://www.cenariodj.com.br'+route));for(const old of Object.keys(routes))assert.ok(!xml.includes(old));});
