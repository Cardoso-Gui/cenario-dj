(function(root){
'use strict';
const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
function filterArtists(artists,filters={}){
 const name=normalize(filters.name),state=filters.state||'',region=filters.region||'',style=normalize(filters.style);
 return artists.filter(a=>(!name||normalize(a.name).includes(name))&&(!state||a.state===state)&&(!region||a.region===region)&&(!style||a.styles.some(s=>normalize(s)===style)));
}
function regionsForState(regions,state){return [...(regions[state]||[])].sort((a,b)=>a.localeCompare(b,'pt-BR'));}
function catalogView(artists,filters,featuredId){return {featured:artists.find(a=>a.id===featuredId)||null,matches:filterArtists(artists,filters)};}
const api={normalize,filterArtists,regionsForState,catalogView};root.CenarioCatalog=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
