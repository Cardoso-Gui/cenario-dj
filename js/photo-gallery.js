(() => {
  const grid = document.querySelector('.photo-grid');
  const viewer = document.querySelector('.photo-viewer');
  if (!grid || !viewer || typeof viewer.showModal !== 'function') return;
  const cards = [...grid.querySelectorAll('.photo-card')];
  const image = viewer.querySelector('img');
  const counter = viewer.querySelector('.viewer-counter');
  let current = 0;
  let opener;
  function showPhoto(index) {
    current = (index + cards.length) % cards.length;
    const thumbnail = cards[current].querySelector('img');
    image.src = cards[current].href;
    image.alt = thumbnail.alt;
    counter.textContent = `Foto ${current + 1} de ${cards.length}`;
  }
  cards.forEach((card, index) => card.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = card;
    showPhoto(index);
    viewer.showModal();
  }));
  viewer.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => {
    showPhoto(current + Number(button.dataset.direction));
  }));
  viewer.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    showPhoto(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', event => {
    if (event.target !== viewer) return;
    const rect = viewer.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) viewer.close();
  });
  viewer.addEventListener('close', () => opener?.focus({ preventScroll: true }));
})();
