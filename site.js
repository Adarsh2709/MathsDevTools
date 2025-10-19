(function(){
  // Register Service Worker for offline caching and faster reloads
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('./sw.js').catch(function(e){
        console.warn('SW registration failed', e);
      });
    });
  }

  // Mark active nav link
  try {
    const path = location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.site-nav .nav-link');
    links.forEach(a => {
      const href = a.getAttribute('href');
      if ((href === path) || (path === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });
  } catch {}
})();
