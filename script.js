// Typing effect for hero section
const texts = [
  "Azzam Azhim Muntazhar",
  "psr354",
  "CTF Player | NR - Salazhar",
  "Cybersecurity Student",
  "PWN • Web • Forensics"
];

let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typewriter = document.getElementById('typewriter');

function type() {
  const currentText = texts[textIndex];

  if (isDeleting) {
    typewriter.textContent = currentText.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typewriter.textContent = currentText.substring(0, charIndex + 1);
    charIndex++;
  }

  let typeSpeed = isDeleting ? 50 : 100;

  if (!isDeleting && charIndex === currentText.length) {
    typeSpeed = 2000; // Pause at end
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    textIndex = (textIndex + 1) % texts.length;
    typeSpeed = 500;
  }

  setTimeout(type, typeSpeed);
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function initScrollReveal() {
  const targets = document.querySelectorAll(
    'main .section-title, .about-photo, .about-copy, .experience-item, .achievement-card, .project-card, .competency-card, .toolchain-card, .practice-panel, .contact-intro, .contact-btn'
  );

  if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
    targets.forEach(target => target.classList.add('is-visible'));
    return;
  }

  document.documentElement.classList.add('reveal-ready');
  targets.forEach((target, index) => {
    target.classList.add('scroll-reveal');
    target.style.setProperty('--reveal-delay', `${(index % 4) * 45}ms`);
    if (!target.classList.contains('section-title')) {
      target.style.setProperty('--reveal-x', `${index % 2 === 0 ? -16 : 16}px`);
    }
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  targets.forEach(target => observer.observe(target));
}

function initScrollProgress() {
  const track = document.createElement('div');
  const fill = document.createElement('div');
  const head = document.createElement('div');
  const label = document.createElement('div');
  const sections = [...document.querySelectorAll('main > section')];
  const nodes = sections.map(() => document.createElement('span'));
  track.className = 'scroll-progress';
  fill.className = 'scroll-progress-fill';
  head.className = 'scroll-progress-head';
  label.className = 'scroll-progress-label';
  nodes.forEach(node => node.className = 'scroll-progress-node');
  track.setAttribute('aria-hidden', 'true');
  track.append(fill, ...nodes, head, label);
  document.body.appendChild(track);

  let ticking = false;
  let sectionTops = [];
  let activeIndex = -1;

  const measureSections = () => {
    const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    sectionTops = sections.map(section => section.offsetTop);
    nodes.forEach((node, index) => {
      node.style.top = `${Math.min(sectionTops[index] / scrollable, 1) * 100}%`;
    });
  };

  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    fill.style.transform = `scaleY(${ratio})`;
    const headOffset = ratio * track.clientHeight;
    head.style.transform = `translate(-50%, calc(${headOffset}px - 50%))`;
    label.style.top = `${Math.min(Math.max(ratio * 100, 2), 98)}%`;

    const focusPoint = window.scrollY + window.innerHeight * 0.4;
    let nextIndex = 0;
    sectionTops.forEach((top, index) => {
      if (top <= focusPoint) nextIndex = index;
    });

    if (nextIndex !== activeIndex) {
      activeIndex = nextIndex;
      nodes.forEach((node, index) => node.classList.toggle('is-active', index === activeIndex));
      label.textContent = sections[activeIndex]?.querySelector('.section-title')?.textContent || '';
      label.classList.add('is-visible');
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateProgress);
  }, { passive: true });

  window.addEventListener('resize', () => {
    measureSections();
    updateProgress();
  }, { passive: true });

  measureSections();
  updateProgress();
}

function initCursorEffect() {
  if (
    prefersReducedMotion.matches ||
    !window.matchMedia('(pointer: fine)').matches ||
    window.matchMedia('(max-width: 680px)').matches
  ) return;

  const cursor = document.createElement('div');
  const canvas = document.createElement('canvas');
  const core = document.createElement('span');
  cursor.className = 'cursor-hud';
  canvas.className = 'cursor-canvas';
  core.className = 'cursor-hud-core';
  cursor.setAttribute('aria-hidden', 'true');
  canvas.setAttribute('aria-hidden', 'true');
  for (let index = 0; index < 4; index++) {
    const corner = document.createElement('span');
    corner.className = 'cursor-corner';
    cursor.appendChild(corner);
  }
  cursor.appendChild(core);
  document.body.append(canvas, cursor);
  document.documentElement.classList.add('custom-cursor-active');

  const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
  const trailStep = 8;
  const trailPointCount = 28;
  const trailLayers = [
    { reach: 0.22, width: 36, alpha: 0.25 },
    { reach: 0.38, width: 30, alpha: 0.26 },
    { reach: 0.54, width: 23, alpha: 0.28 },
    { reach: 0.69, width: 16, alpha: 0.31 },
    { reach: 0.83, width: 10, alpha: 0.37 },
    { reach: 0.94, width: 5.5, alpha: 0.45 },
    { reach: 1, width: 2, alpha: 0.66 }
  ];
  const trailPoints = Array.from({ length: trailPointCount }, () => ({ x: -100, y: -100 }));
  const history = [];
  let targetX = -100;
  let targetY = -100;
  let cursorX = -100;
  let cursorY = -100;
  let cursorFrame = null;
  let initialized = false;
  let lastMoveTime = 0;
  let lastFrameTime = performance.now();
  let trailOpacity = 0;

  const resizeCanvas = () => {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(document.documentElement.clientWidth * pixelRatio);
    canvas.height = Math.round(window.innerHeight * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.imageSmoothingEnabled = true;
  };

  const sampleTrail = now => {
    let historyIndex = history.length - 1;

    for (let index = 0; index < trailPointCount; index++) {
      const sampleTime = now - index * trailStep;
      while (historyIndex > 0 && history[historyIndex - 1].time > sampleTime) {
        historyIndex--;
      }

      const newer = history[historyIndex];
      const older = history[Math.max(historyIndex - 1, 0)];
      const duration = Math.max(newer.time - older.time, 1);
      const mix = Math.min(Math.max((newer.time - sampleTime) / duration, 0), 1);
      trailPoints[index].x = newer.x + (older.x - newer.x) * mix;
      trailPoints[index].y = newer.y + (older.y - newer.y) * mix;
    }
  };

  const traceCurve = count => {
    context.beginPath();
    context.moveTo(trailPoints[0].x, trailPoints[0].y);

    for (let index = 1; index < count - 1; index++) {
      const point = trailPoints[index];
      const next = trailPoints[index + 1];
      context.quadraticCurveTo(
        point.x,
        point.y,
        (point.x + next.x) * 0.5,
        (point.y + next.y) * 0.5
      );
    }

    const last = trailPoints[count - 1];
    context.lineTo(last.x, last.y);
  };

  const drawTrail = now => {
    context.clearRect(0, 0, document.documentElement.clientWidth, window.innerHeight);
    if (trailOpacity < 0.01) return;

    sampleTrail(now);
    const tail = trailPoints[trailPointCount - 1];
    const head = trailPoints[0];
    const gradient = context.createLinearGradient(tail.x, tail.y, head.x, head.y);
    gradient.addColorStop(0, 'rgba(29, 78, 216, 0)');
    gradient.addColorStop(0.3, 'rgba(37, 99, 235, 0.18)');
    gradient.addColorStop(0.58, 'rgba(88, 166, 255, 0.42)');
    gradient.addColorStop(0.8, 'rgba(129, 140, 248, 0.64)');
    gradient.addColorStop(1, 'rgba(34, 211, 238, 0.92)');

    context.save();
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = gradient;
    trailLayers.forEach(layer => {
      const count = Math.max(2, Math.ceil(trailPointCount * layer.reach));
      traceCurve(count);
      context.lineWidth = layer.width;
      context.globalAlpha = layer.alpha * trailOpacity;
      context.stroke();
    });
    context.restore();
  };

  const renderCursor = now => {
    const deltaSeconds = Math.min(Math.max((now - lastFrameTime) / 1000, 1 / 240), 1 / 30);
    lastFrameTime = now;
    const headFollow = 1 - Math.exp(-58 * deltaSeconds);
    cursorX += (targetX - cursorX) * headFollow;
    cursorY += (targetY - cursorY) * headFollow;

    const latest = history[history.length - 1];
    if (!latest || now - latest.time >= 4 || Math.hypot(cursorX - latest.x, cursorY - latest.y) > 0.1) {
      history.push({ x: cursorX, y: cursorY, time: now });
    }
    while (history.length > 2 && history[1].time < now - trailStep * (trailPointCount + 8)) {
      history.shift();
    }

    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    const remainingDistance = Math.hypot(targetX - cursorX, targetY - cursorY);
    const targetOpacity = now - lastMoveTime < 105 || remainingDistance > 0.35 ? 1 : 0;
    const opacityRate = targetOpacity ? 18 : 7;
    trailOpacity += (targetOpacity - trailOpacity) * (1 - Math.exp(-opacityRate * deltaSeconds));
    drawTrail(now);

    if (remainingDistance > 0.04 || trailOpacity > 0.01) {
      cursorFrame = requestAnimationFrame(renderCursor);
    } else {
      canvas.classList.remove('is-visible');
      cursorFrame = null;
    }
  };

  window.addEventListener('pointermove', event => {
    const samples = event.getCoalescedEvents?.() || [event];
    const latestSample = samples[samples.length - 1];
    const now = performance.now();

    if (!initialized) {
      cursorX = latestSample.clientX;
      cursorY = latestSample.clientY;
      for (let index = trailPointCount - 1; index >= 0; index--) {
        history.push({ x: cursorX, y: cursorY, time: now - index * trailStep });
      }
      initialized = true;
    } else if (now - lastMoveTime > 180) {
      cursorX = latestSample.clientX;
      cursorY = latestSample.clientY;
      history.length = 0;
      for (let index = trailPointCount - 1; index >= 0; index--) {
        history.push({ x: cursorX, y: cursorY, time: now - index * trailStep });
      }
    }

    targetX = latestSample.clientX;
    targetY = latestSample.clientY;
    lastMoveTime = now;
    cursor.classList.add('is-visible');
    canvas.classList.add('is-visible');
    cursor.classList.toggle('is-interactive', Boolean(event.target.closest('a, button')));
    if (!cursorFrame) {
      lastFrameTime = now;
      cursorFrame = requestAnimationFrame(renderCursor);
    }
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', () => {
    lastMoveTime = 0;
    cursor.classList.remove('is-visible');
    canvas.classList.remove('is-visible');
  });

  window.addEventListener('resize', resizeCanvas, { passive: true });
  resizeCanvas();
}

// Start typing effect after page load
document.addEventListener('DOMContentLoaded', () => {
  type();
  initScrollReveal();
  initScrollProgress();
  initCursorEffect();
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
        block: 'start'
      });
    }
  });
});
