(() => {
    const links = [...document.querySelectorAll('.sidebar a[href^="#"]')];
    const items = links.map(link => ({
        link,
        section: document.getElementById(link.hash.slice(1))
    })).filter(item => item.section);
    if (!items.length) return;

    function activate(id) {
        items.forEach(({ link, section }) => {
            const active = section.id === id;
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    }

    let scheduled = false;
    function updateFromScroll() {
        scheduled = false;
        const threshold = Math.min(180, window.innerHeight * .25);
        let current = items[0];
        for (const item of items) {
            if (item.section.getBoundingClientRect().top <= threshold) current = item;
        }
        if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
            current = items[items.length - 1];
        }
        activate(current.section.id);
    }
    function scheduleUpdate() {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(updateFromScroll);
    }
    function updateFromHash() {
        const id = window.location.hash.slice(1);
        if (items.some(item => item.section.id === id)) activate(id);
        else updateFromScroll();
    }
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('hashchange', updateFromHash);
    window.addEventListener('load', updateFromHash, { once: true });
    updateFromHash();
})();
