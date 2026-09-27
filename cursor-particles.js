(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(any-pointer: fine)');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.className = 'cursor-particles';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    const colors = ['#f2ce80', '#a9d8ca', '#e8eed0'];
    const particles = [];
    let frame = 0;
    let previousTime = 0;
    let lastPointer = null;
    let lastEmission = 0;

    function clear() {
        cancelAnimationFrame(frame);
        frame = 0;
        previousTime = 0;
        lastPointer = null;
        lastEmission = 0;
        particles.length = 0;
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function resize() {
        clear();
        const scale = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(window.innerWidth * scale);
        canvas.height = Math.round(window.innerHeight * scale);
        context.setTransform(scale, 0, 0, scale, 0, 0);
    }

    function draw(time) {
        const elapsed = previousTime ? Math.min((time - previousTime) / 1000, .05) : 0;
        previousTime = time;
        context.clearRect(0, 0, canvas.width, canvas.height);
        for (let index = particles.length - 1; index >= 0; index--) {
            const particle = particles[index];
            particle.life -= elapsed;
            if (particle.life <= 0) {
                particles.splice(index, 1);
                continue;
            }
            particle.x += particle.vx * elapsed;
            particle.y += particle.vy * elapsed;
            context.globalAlpha = .65 * (particle.life / particle.duration) ** 2;
            context.fillStyle = particle.color;
            context.fillRect(Math.round(particle.x), Math.round(particle.y), particle.size, particle.size);
        }
        context.globalAlpha = 1;
        frame = particles.length ? requestAnimationFrame(draw) : 0;
        if (!frame) previousTime = 0;
    }

    function follow(event) {
        if (event.pointerType !== 'mouse' || event.buttons || reducedMotion.matches ||
            !finePointer.matches || document.hidden) return;
        const now = performance.now();
        const point = { x: event.clientX, y: event.clientY };
        if (!lastPointer) {
            lastPointer = point;
            return;
        }
        if (now - lastEmission < 24) return;
        const dx = point.x - lastPointer.x;
        const dy = point.y - lastPointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 6) return;
        // Avoid drawing a long streak after scrolling or re-entering the window.
        const count = Math.min(4, Math.floor(distance / 6));
        const origin = distance > 120 ? point : lastPointer;
        for (let index = 0; index < count; index++) {
            const fraction = (index + 1) / count;
            const duration = .6 + Math.random() * .25;
            particles.push({
                x: origin.x + (point.x - origin.x) * fraction + (Math.random() - .5) * 10,
                y: origin.y + (point.y - origin.y) * fraction + (Math.random() - .5) * 10,
                vx: (Math.random() - .5) * 16,
                vy: 8 + Math.random() * 16,
                size: Math.random() < .75 ? 4 : 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: duration,
                duration
            });
        }
        if (particles.length > 40) particles.splice(0, particles.length - 40);
        lastPointer = point;
        lastEmission = now;
        if (!frame) frame = requestAnimationFrame(draw);
    }

    window.addEventListener('pointermove', follow, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', clear, { passive: true });
    window.addEventListener('blur', clear);
    document.documentElement.addEventListener('pointerleave', clear);
    document.addEventListener('visibilitychange', clear);
    reducedMotion.addEventListener('change', clear);
    finePointer.addEventListener('change', clear);
    resize();
})();
