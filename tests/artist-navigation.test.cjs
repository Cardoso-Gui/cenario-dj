const {projectPath,pageUrlPath}=require('./page-paths.cjs');
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),pages=['flavinnho.html','sobre.html','mixes.html','fotos.html','contato.html'];
for(const file of pages)test(file+': cabeçalho compartilhado mantém links e página atual',()=>{
 const html=fs.readFileSync(projectPath(file),'utf8');const header=html.match(/<header class="artist-header">[\s\S]*?<\/header>/)[0];
 for(const nav of header.matchAll(/<nav\b[\s\S]*?<\/nav>/g)){assert.equal((nav[0].match(/aria-current="page"/g)||[]).length,1);assert.ok(nav[0].includes('href="'+pageUrlPath(file)+'" aria-current="page"'));for(const target of pages)assert.ok(nav[0].includes('href="'+pageUrlPath(target)+'"'));}
 assert.equal((header.match(/id="artist-menu"/g)||[]).length,1);assert.equal((header.match(/id="artist-nav"/g)||[]).length,1);assert.match(header,/aria-expanded="false"/);assert.match(html,/js\/artist-navigation.js/);assert.doesNotMatch(html,/js\/flavinnho-home.js/);assert.match(html,/css\/artist-navigation.css/);
 if(file==='contato.html')assert.match(header,/https:\/\/wa.me\/5517996519630/);else assert.match(header,/class="artist-cta" href="\/flavinnho\/contato\/"/);
});
