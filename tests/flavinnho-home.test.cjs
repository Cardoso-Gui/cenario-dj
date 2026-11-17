const {projectPath,pageUrlPath}=require('./page-paths.cjs');
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(projectPath('flavinnho.html'),'utf8');
test('home: cada destino local e imagem existe, IDs são únicos e âncoras são válidas',()=>{
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 for(const [,url]of html.matchAll(/(?:href|src|poster)="(\.[^"]+)"/g)){const file=url.split('?')[0];assert.ok(fs.existsSync(projectPath(file)),file);}
 for(const [,anchor]of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(anchor),anchor);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
});
test('home: contratação do artista e oferta de sites preservam contatos distintos',()=>{
 const artist=html.split('<footer>')[0];assert.match(artist,/https:\/\/wa.me\/5517996519630\?/);assert.doesNotMatch(artist,/wa.me\/5517991951286/);
 const footer=html.split('<footer>')[1];assert.match(footer,/wa.me\/5517991951286/);
 for(const [tag]of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g))assert.match(tag,/rel="noopener noreferrer"/);
});
test('home: vídeo não inicia nem baixa automaticamente',()=>{const video=html.match(/<video\b[^>]*>/)[0];assert.match(video,/controls/);assert.match(video,/playsinline/);assert.match(video,/preload="none"/);assert.doesNotMatch(video,/autoplay/);});
test('home: menu abre, fecha e devolve o foco com Escape',()=>{
 const handlers={},button={attrs:{},addEventListener(k,fn){handlers.click=fn;},setAttribute(k,v){this.attrs[k]=v;},focus(){this.focused=true;}},menu={hidden:true,contains(e){return e===button;},querySelectorAll(){return[];}},year={};let mediaChange;
 const document={activeElement:button,getElementById(id){return {'artist-menu':button,'artist-nav':menu,year}[id];},addEventListener(k,fn){handlers[k]=fn;}};
 vm.runInNewContext(fs.readFileSync(projectPath('js/artist-navigation.js'),'utf8'),{document,Date,matchMedia(){return{addEventListener(k,fn){mediaChange=fn;}};}});
 handlers.click();assert.equal(menu.hidden,false);assert.equal(button.attrs['aria-expanded'],'true');handlers.keydown({key:'Escape'});assert.equal(menu.hidden,true);assert.equal(button.focused,true);
 handlers.click();mediaChange({matches:true});assert.equal(menu.hidden,true);assert.equal(button.attrs['aria-expanded'],'false');
});
