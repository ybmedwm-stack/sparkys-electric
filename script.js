// Sparky's Electric v3 — interactions
// Respects prefers-reduced-motion. Accessible nav toggle + form messaging.

(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nf = new Intl.NumberFormat('en-US');

  // ----- Mobile nav toggle (with aria-expanded) -----
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-items');
  if (toggle && menu) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', menu.id || 'nav-menu');
    if (!menu.id) menu.id = 'nav-menu';
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // ----- Active nav highlight -----
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-items a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });

  // ----- Scroll-triggered fade-in (skipped under reduced-motion) -----
  const reveal = document.querySelectorAll('.reveal');
  if (prefersReduced) {
    reveal.forEach(el => el.classList.add('visible'));
  } else if ('IntersectionObserver' in window) {
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

  // ----- Animated counters (with thousands separator, skipped under reduced-motion) -----
  const counters = document.querySelectorAll('[data-count]');
  if (prefersReduced) {
    // Reduced-motion: just show the final value statically, formatted.
    counters.forEach(el => formatFinal(el));
  } else if (counters.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(el => cio.observe(el));
  } else {
    counters.forEach(el => formatFinal(el));
  }

  function formatFinal(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = (el.dataset.decimals && parseInt(el.dataset.decimals, 10)) || 0;
    const suffix = el.dataset.suffix || '';
    el.textContent = formatNum(target, decimals) + suffix;
  }

  function formatNum(value, decimals) {
    if (decimals > 0) {
      return value.toFixed(decimals);
    }
    return nf.format(Math.round(value));
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
      el.textContent = formatNum(value, decimals) + suffix;
      if (progress < 1) requestAnimationFrame(frame);
      else el.textContent = formatNum(target, decimals) + suffix;
    }
    requestAnimationFrame(frame);
  }

  // ----- Electric arc on CTA hover (disabled under reduced-motion + small screens) -----
  const ctas = document.querySelectorAll('.slab-volt');
  if (!prefersReduced && ctas.length && window.matchMedia('(min-width: 720px)').matches) {
    const arcSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arcSvg.setAttribute('class', 'arc-trace');
    arcSvg.setAttribute('aria-hidden', 'true');
    arcSvg.style.position = 'fixed';
    arcSvg.style.inset = '0';
    arcSvg.style.width = '100vw';
    arcSvg.style.height = '100vh';
    arcSvg.style.pointerEvents = 'none';
    arcSvg.style.zIndex = '5';
    arcSvg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
    document.body.appendChild(arcSvg);

    let lastFired = 0;
    ctas.forEach(cta => {
      cta.addEventListener('mouseenter', () => {
        // Debounce to prevent stacking on rapid hover
        const now = Date.now();
        if (now - lastFired < 300) return;
        lastFired = now;

        const rect = cta.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;
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

  // ----- Contact form (placeholder, with accessible status messaging) -----
  const form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = document.querySelector('#form-message');
      if (msg) {
        msg.style.display = 'block';
        msg.textContent = "Thanks. We'll be in touch within 24 hours. For emergencies call (207) 555-0142.";
        msg.focus?.();
      }
      form.reset();
    });
  }

  // ----- Year in footer -----
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
})();
