(function(){
'use strict';
const $=id=>document.getElementById(id),data=CenarioData,catalog=CenarioCatalog;
const form=$('busca'),state=$('estado'),region=$('regiao'),style=$('estilo'),name=$('nome'),results=$('results');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=id=>`<svg aria-hidden="true"><use href="#${id}-icon"/></svg>`;
for(const [code,label]of data.states){state.add(new Option(label,code));}
const coverageNote=$('coverage-note');if(coverageNote)coverageNote.textContent=data.coverage;
function filters(){return {state:state.value,region:region.value,style:style.value,name:name.value.trim()};}
function updateRegions(){
 const selected=state.value,known=Object.hasOwn(data.regions,selected),options=catalog.regionsForState(data.regions,selected);
 region.replaceChildren(new Option(selected?'Todas as regiões':'Região',''));
 options.forEach(label=>region.add(new Option(label,label)));
 region.disabled=!selected||!options.length;
 $('region-help').textContent=!selected?'Escolha um estado para ver suas regiões metropolitanas. Sem filtros, você vê todos os DJs.':!known?'Você pode buscar DJs em todo o estado.':!options.length?'Você pode buscar DJs em todo o estado.':'Regiões metropolitanas de '+state.options[state.selectedIndex].text+'. Deixe “Todas as regiões” para buscar no estado inteiro.';
}
function card(a,compact=false){
 return `<article class="dj-card ${compact?'compact-card':''}"><div class="dj-photo"><img src="${escape(a.image)}" alt="${escape(a.name)} tocando na controladora" width="603" height="920" ${compact?'loading="lazy"':''}></div><div class="dj-info"><p class="eyebrow feature-label">${compact?'ARTISTA DO CENÁRIO':'EM DESTAQUE'}</p><h2>${escape(a.name)}</h2><p class="dj-meta">${icon('pin')}${escape(a.region ? a.region+' · '+a.state : (a.state||'Localização a confirmar'))}</p><p class="dj-meta">${icon('note')}${escape(a.styles.join(', ')||'Estilo musical a confirmar')}</p>${a.events?.length ? `<p class="dj-events">${escape(a.events.join(' · '))}</p>` : ''}<a class="profile-btn" href="${escape(a.profile)}" aria-label="Ver perfil de ${escape(a.name)}">Ver perfil ${icon('arrow')}</a></div></article>`;
}

function render(sync=true){
 const f=filters(),view=catalog.catalogView(data.artists,f,data.featuredArtistId),matches=view.matches,hasFilters=Object.values(f).some(Boolean);
 results.innerHTML=view.featured?card(view.featured):'';
 $('clear-filters').hidden=!hasFilters;
 $('result-count').textContent=hasFilters?`${matches.length} ${matches.length===1?'perfil encontrado':'perfis encontrados'}`:`${matches.length} ${matches.length===1?'DJ no catálogo':'DJs no catálogo'}`;
 if(matches.length){$('catalog-grid').innerHTML=matches.map(a=>card(a,true)).join('');}
 else{$('catalog-grid').innerHTML=`<div class="empty-state grid-empty">${icon('search')}<h2>A busca continua.</h2><p>Nenhum DJ encontrado com esses filtros. Experimente outro estado, região ou estilo, ou limpe a busca para conhecer todos os artistas do catálogo.</p><button type="button" id="empty-clear">Ver todos os DJs →</button></div>`;$('empty-clear').addEventListener('click',reset);}
 if(sync){const params=new URLSearchParams();if(f.state)params.set('estado',f.state);if(f.region)params.set('regiao',f.region);if(f.style)params.set('estilo',f.style);if(f.name)params.set('nome',f.name);const url=location.pathname+(params.size?'?'+params:'')+location.hash;history.replaceState(null,'',url);}
}
function reset(){const focusResults=$('catalog-grid').contains(document.activeElement);form.reset();updateRegions();render();if(focusResults)$('catalog-grid').focus({preventScroll:true});}
function restore(){const p=new URLSearchParams(location.search);state.value=p.get('estado')||'';updateRegions();region.value=p.get('regiao')||'';style.value=p.get('estilo')||'';name.value=p.get('nome')||'';render(false);}
state.addEventListener('change',()=>{updateRegions();render();});region.addEventListener('change',()=>render());style.addEventListener('change',()=>render());name.addEventListener('input',()=>render());
form.addEventListener('submit',e=>{e.preventDefault();render();$('catalog-grid').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});$('catalog-grid').focus({preventScroll:true});});
$('clear-filters').addEventListener('click',reset);
$('open-search').addEventListener('click',()=>{closeMenu();name.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});name.focus({preventScroll:true});});
const menu=$('mobile-nav'),menuBtn=$('menu-btn');function closeMenu(){menu.hidden=true;menuBtn.setAttribute('aria-expanded','false');menuBtn.setAttribute('aria-label','Abrir menu');}menuBtn.addEventListener('click',()=>{const show=menu.hidden;menu.hidden=!show;menuBtn.setAttribute('aria-expanded',String(show));menuBtn.setAttribute('aria-label',show?'Fechar menu':'Abrir menu');});
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',e=>{
 if(e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
 const hash=link.getAttribute('href'),section=$(hash.slice(1)),target=$(link.dataset.focus||hash.slice(1));
 if(!section||!target)return;
 e.preventDefault();closeMenu();
 if(location.hash!==hash)history.pushState(null,'',location.pathname+location.search+hash);
 section.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 target.focus({preventScroll:true});
}));
document.addEventListener('keydown',e=>{
 if(e.key!=='Escape'||menu.hidden)return;
 const returnFocus=menu.contains(document.activeElement)||document.activeElement===menuBtn;
 closeMenu();if(returnFocus)menuBtn.focus();
});
matchMedia('(max-width: 600px)').addEventListener('change',e=>{if(!e.matches)closeMenu();});
window.addEventListener('popstate',restore);$('year').textContent=new Date().getFullYear();restore();
})();
