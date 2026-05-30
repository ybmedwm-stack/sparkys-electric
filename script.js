// Sparky's Electric v2 — interactions
// Per anthropic-skills/frontend-design: motion for delight, not for noise

(function () {
  // ----- Mobile nav toggle -----
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-items');
  if (toggle && menu) {
    toggle.addEventListener('click', () => menu.classList.toggle('open'));
  }

  // ----- Active nav highlight -----
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-items a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // ----- Scroll-triggered fade-in -----
  const reveal = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveal.forEach(el => io.observe(el));
  } else {
    reveal.forEach(el => el.classList.add('visible'));
  }

  // ----- Animated counters -----
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(el => cio.observe(el));
  }

  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const decimals = (el.dataset.decimals && parseInt(el.dataset.decimals, 10)) || 0;
    const duration = 1600;
    const startTime = performance.now();
    function frame(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(frame);
      else el.textContent = target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(frame);
  }

  // ----- Electric arc on CTA hover -----
  // Subtle yellow arc traces from the hovered button to a nearby anchor,
  // then snaps away. CSS-only would be too static; here we draw an SVG path.
  const ctas = document.querySelectorAll('.slab-volt');
  if (ctas.length && window.matchMedia('(min-width: 720px)').matches) {
    const arcSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arcSvg.setAttribute('class', 'arc-trace');
    arcSvg.style.position = 'fixed';
    arcSvg.style.inset = '0';
    arcSvg.style.width = '100vw';
    arcSvg.style.height = '100vh';
    arcSvg.style.pointerEvents = 'none';
    arcSvg.style.zIndex = '5';
    arcSvg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
    document.body.appendChild(arcSvg);

    ctas.forEach(cta => {
      cta.addEventListener('mouseenter', () => {
        const rect = cta.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;

        // Build a jagged path simulating a lightning arc
        const endX = startX + (Math.random() * 200 - 100);
        const endY = startY - 80 - Math.random() * 120;
        const segments = 5;
        let d = `M ${startX} ${startY}`;
        for (let i = 1; i <= segments; i++) {
          const t = i / segments;
          const x = startX + (endX - startX) * t + (Math.random() * 40 - 20);
          const y = startY + (endY - startY) * t + (Math.random() * 20 - 10);
          d += ` L ${x} ${y}`;
        }
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', '#F5FF00');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.style.filter = 'drop-shadow(0 0 6px #F5FF00)';
        path.style.opacity = '0';
        path.style.transition = 'opacity 80ms';
        arcSvg.appendChild(path);
        requestAnimationFrame(() => { path.style.opacity = '0.95'; });
        setTimeout(() => {
          path.style.opacity = '0';
          setTimeout(() => path.remove(), 200);
        }, 220);
      });
    });

    window.addEventListener('resize', () => {
      arcSvg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
    });
  }

  // ----- Contact form (placeholder, Formspree wires later) -----
  const form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = document.querySelector('#form-message');
      if (msg) {
        msg.style.display = 'block';
        msg.textContent = "Thanks. We'll be in touch within 24 hours. For emergencies call (207) 555-0142.";
      }
      form.reset();
    });
  }

  // ----- Year in footer -----
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
})();
