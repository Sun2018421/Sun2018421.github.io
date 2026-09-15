(() => {
    const status = document.getElementById('view-counter-status');
    const container = document.getElementById('busuanzi_container_site_pv');
    const value = document.getElementById('busuanzi_value_site_pv');
    if (!status || !container || !value) return;

    // Preview visits must never add to the public site's total.
    if (location.hostname !== 'sun2018421.github.io') {
        status.textContent = 'Live site only';
        return;
    }

    status.textContent = 'Loading…';
    let timeout;
    function syncValue() {
        const count = value.textContent.trim();
        if (!/^\d+$/.test(count)) return;
        clearTimeout(timeout);
        status.hidden = true;
        container.style.display = 'inline';
    }
    const observer = new MutationObserver(syncValue);
    observer.observe(value, { childList: true, characterData: true, subtree: true });
    const script = document.createElement('script');
    script.src = 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
    script.async = true;
    script.onerror = () => {
        clearTimeout(timeout);
        status.textContent = 'Unavailable';
    };
    timeout = setTimeout(() => {
        status.textContent = 'Unavailable';
    }, 10000);
    document.head.appendChild(script);
})();
