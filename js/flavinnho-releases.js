(function(){
'use strict';
const player=document.getElementById('featured-youtube'),title=document.getElementById('featured-video-title'),credit=document.getElementById('featured-video-credit'),link=document.getElementById('featured-video-link'),status=document.getElementById('video-status');
const buttons=[...document.querySelectorAll('.select-video')];
buttons.forEach(button=>button.addEventListener('click',()=>{
 const id=button.dataset.videoId;if(!/^[A-Za-z0-9_-]{11}$/.test(id))return;
 const label=button.dataset.videoTitle||'Vídeo do Flavinnho';
 player.src='https://www.youtube.com/embed/'+id+'?rel=0&playsinline=1&autoplay=1';player.title='Assistir '+label;
 title.textContent=label;credit.textContent=button.dataset.videoCredit||'Flavinnho';link.href='https://www.youtube.com/watch?v='+id;
 buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
 status.textContent=label+' selecionado. O player está acima da seleção.';
 player.closest('.featured-video').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
 player.focus({preventScroll:true});
}));
})();
