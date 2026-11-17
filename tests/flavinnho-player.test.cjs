const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../js/flavinnho-releases.js'),'utf8');
function setup(id='EP5oHuX628g'){
 const box={scrollIntoView(options){this.scroll=options;}},player={src:'original',closest(){return box;},focus(){this.focused=true;}},title={},credit={},link={},status={};
 const buttons=[{dataset:{videoId:id,videoTitle:'Medley Se Prepara',videoCredit:'Flavinho Rique · Dj Fran'},attrs:{},addEventListener(t,f){this.click=f;},setAttribute(k,v){this.attrs[k]=v;}},{dataset:{},attrs:{},addEventListener(){},setAttribute(k,v){this.attrs[k]=v;}}];
 const nodes={'featured-youtube':player,'featured-video-title':title,'featured-video-credit':credit,'featured-video-link':link,'video-status':status};
 vm.runInNewContext(source,{document:{getElementById:id=>nodes[id],querySelectorAll:()=>buttons},matchMedia:()=>({matches:true})});return{player,title,credit,link,status,buttons,box};
}
test('player: seleção usa um único iframe, atualiza título e link e preserva foco',()=>{const ui=setup();assert.equal(ui.player.src,'original');ui.buttons[0].click();assert.equal(ui.player.src,'https://www.youtube.com/embed/EP5oHuX628g?rel=0&playsinline=1&autoplay=1');assert.equal(ui.title.textContent,'Medley Se Prepara');assert.equal(ui.link.href,'https://www.youtube.com/watch?v=EP5oHuX628g');assert.equal(ui.buttons[0].attrs['aria-pressed'],'true');assert.equal(ui.buttons[1].attrs['aria-pressed'],'false');assert.equal(ui.player.focused,true);assert.equal(ui.box.scroll.behavior,'auto');});
test('player: ID inválido não altera o iframe',()=>{const ui=setup('https://outro.site/');ui.buttons[0].click();assert.equal(ui.player.src,'original');});
