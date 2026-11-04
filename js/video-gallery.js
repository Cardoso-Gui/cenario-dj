(() => {
  const viewer = document.querySelector('.video-viewer');
  if (!viewer || typeof viewer.showModal !== 'function') return;
  const video = viewer.querySelector('video');
  const title = viewer.querySelector('h2');
  const status = viewer.querySelector('.video-status');
  let opener;
  let playbackSession = 0;
  document.querySelectorAll('.video-preview').forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = link;
    const session = ++playbackSession;
    status.textContent = '';
    title.textContent = link.dataset.videoTitle;
    video.setAttribute('aria-label', `Vídeo ${link.dataset.videoTitle}`);
    video.poster = link.querySelector('img').src;
    video.src = link.href;
    viewer.showModal();
    video.play().catch(() => {
      if (viewer.open && session === playbackSession) status.textContent = 'Use o botão de reprodução para assistir ao vídeo.';
    });
  }));
  viewer.querySelector('.video-close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', event => {
    if (event.target !== viewer) return;
    const rect = viewer.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) viewer.close();
  });
  viewer.addEventListener('close', () => {
    playbackSession++;
    video.pause();
    video.removeAttribute('src');
    video.load();
    status.textContent = '';
    opener?.focus({ preventScroll: true });
  });
  video.addEventListener('error', () => {
    if (viewer.open) status.textContent = 'Não foi possível carregar o vídeo. Feche esta janela e tente “Abrir vídeo”.';
  });
})();
