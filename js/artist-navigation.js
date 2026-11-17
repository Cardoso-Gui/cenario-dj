(function(){
'use strict';
const button=document.getElementById('artist-menu'),menu=document.getElementById('artist-nav');
function closeMenu(restoreFocus=false){menu.hidden=true;button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Abrir menu');if(restoreFocus)button.focus();}
button.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');});
menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>closeMenu()));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden)closeMenu(menu.contains(document.activeElement)||document.activeElement===button);});
matchMedia('(min-width: 981px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
document.getElementById('year').textContent=new Date().getFullYear();
})();
