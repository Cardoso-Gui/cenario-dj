const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'fotos.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/gallery.css'), 'utf8');
const photoJS = fs.readFileSync(path.join(root, 'js/photo-gallery.js'), 'utf8');
const videoJS = fs.readFileSync(path.join(root, 'js/video-gallery.js'), 'utf8');
const photoFiles = ['palco-azul-ia.webp','energia-no-palco-ia.webp','ao-ar-livre-ia.webp','na-controladora-ia.webp','no-microfone-ia.webp','retrato.webp?v=2','set-externo-ia.webp','voz-e-musica-ia.webp','producao-ia.webp','retrato-retro-ia.webp','sorrindo-ia.webp'];
test('galeria: preserva todas as onze imagens na mesma ordem', () => {
  const urls = [...html.matchAll(/class="photo-card"\s+href="\.\/assets\/galeria\/([^\"]+)"/g)].map(x=>x[1]);
  assert.deepEqual(urls,photoFiles);
  assert.equal((html.match(/aria-label="Abrir foto /g)||[]).length,11);
  assert.doesNotMatch(html,/photo-carousel|gallery-play|aria-roledescription="carrossel"/);
  assert.doesNotMatch(photoJS,/setTimeout|aria-hidden|tabIndex\s*=/);
});
test('galeria: grade responsiva e atalhos válidos', () => {
  assert.match(css,/column-count: 3/);
  assert.match(css,/@media\(max-width:650px\)[\s\S]*column-count: 2/);
  for (const id of ['fotos-grid','videos']) {
    assert.match(html,new RegExp(`href="#${id}"`));
    assert.match(html,new RegExp(`id="${id}"`));
  }
  assert.match(css,/scroll-margin-top: 28px/);
  assert.match(css,/scroll-margin-top: 16px/);
  assert.match(fs.readFileSync(path.join(root,"css/styles.css"),"utf8"),/scroll-padding-top: var\(--header\)/);
  assert.match(css,/\.video-preview:focus-visible \{ outline-offset: -4px/);
});
test('galeria: preserva quatro vídeos e poster sem carregar o player antecipadamente', () => {
  for(const name of ['oficial-jk','afterfunk','carnavrau','urupes']) {
    assert.match(html,new RegExp(`href="\\./assets/videos/${name}\\.mp4"`));
    assert.match(html,new RegExp(`src="\\./assets/videos/${name}\\.jpg"`));
  }
  assert.equal((html.match(/class="video-preview"/g)||[]).length,4);
  assert.match(html,/<video class="viewer-video" controls playsinline preload="none"><\/video>/);
  assert.doesNotMatch(html,/<video[^>]*autoplay/);
  assert.match(videoJS,/video\.pause\(\)/);
  assert.match(videoJS,/video\.removeAttribute\('src'\)/);
});
function el(extra={}) {
 return Object.assign({events:{},addEventListener(n,f){this.events[n]=f},focus(){this.focused=true},getBoundingClientRect(){return {left:0,top:0,right:100,bottom:100}}},extra);
}
test('galeria: viewer troca fotos, dá a volta e restaura o foco no item aberto', () => {
 const image={},counter={};const close=el(),prev=el({dataset:{direction:'-1'}}),next=el({dataset:{direction:'1'}});
 const cards=photoFiles.map((href,i)=>el({href,querySelector(){return {alt:`Imagem ${i+1}`}}}));
 const viewer=el({open:false,querySelector(s){return {'img':image,'.viewer-counter':counter,'.viewer-close':close}[s]},querySelectorAll(){return [prev,next]},showModal(){this.open=true},close(){this.open=false;this.events.close()}});
 vm.runInNewContext(photoJS,{document:{querySelector(s){return s==='.photo-grid'?{querySelectorAll(){return cards}}:viewer}}});
 let prevented=false;cards[0].events.click({preventDefault(){prevented=true}});assert.equal(prevented,true);assert.equal(viewer.open,true);assert.equal(counter.textContent,'Foto 1 de 11');
 prev.events.click();assert.equal(counter.textContent,'Foto 11 de 11');assert.equal(image.src,photoFiles[10]);
 next.events.click();assert.equal(counter.textContent,'Foto 1 de 11');
 viewer.events.keydown({key:'ArrowRight',preventDefault(){}});assert.equal(counter.textContent,'Foto 2 de 11');
 close.events.click();assert.equal(viewer.open,false);assert.equal(cards[0].focused,true);
});
test('galeria: clique modificado mantém abertura nativa da imagem', () => {
 let opened=false;const card=el({href:'photo'});const viewer=el({showModal(){opened=true},querySelector(s){return s==='.viewer-close'?el():{}},querySelectorAll(){return []}});
 vm.runInNewContext(photoJS,{document:{querySelector(s){return s==='.photo-grid'?{querySelectorAll(){return [card]}}:viewer}}});
 card.events.click({ctrlKey:true,preventDefault(){throw Error('Should not intercept')}});assert.equal(opened,false);
});
test('galeria: vídeo só reproduz por clique e para ao fechar', async () => {
 let plays=0,pauses=0,loads=0;const status={},title={},close=el();
 const video=el({setAttribute(k,v){this[k]=v},removeAttribute(k){delete this[k]},play(){plays++;return Promise.resolve()},pause(){pauses++},load(){loads++}});
 const link=el({href:'video.mp4',dataset:{videoTitle:'Oficial JK'},querySelector(){return {src:'poster.jpg'}}});
 const viewer=el({open:false,querySelector(s){return {'video':video,'h2':title,'.video-status':status,'.video-close':close}[s]},showModal(){this.open=true},close(){this.open=false;this.events.close()}});
 vm.runInNewContext(videoJS,{document:{querySelector(){return viewer},querySelectorAll(){return [link]}}});
 assert.equal(plays,0);assert.equal(video.src,undefined);
 link.events.click({preventDefault(){}});assert.equal(plays,1);assert.equal(video.src,'video.mp4');assert.equal(title.textContent,'Oficial JK');
 close.events.click();assert.equal(pauses,1);assert.equal(loads,1);assert.equal(video.src,undefined);assert.equal(link.focused,true);
});
