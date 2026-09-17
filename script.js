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

  const context = canvas.getContext('2d');
  const pointCount = 30;
  const points = Array.from({ length: pointCount }, () => ({ x: -100, y: -100 }));
  let targetX = -100;
  let targetY = -100;
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
  };

  const drawTrail = () => {
    context.clearRect(0, 0, document.documentElement.clientWidth, window.innerHeight);
    if (trailOpacity < 0.01) return;

    const leftEdge = [];
    const rightEdge = [];

    points.forEach((point, index) => {
      const previous = points[Math.max(index - 1, 0)];
      const next = points[Math.min(index + 1, pointCount - 1)];
      const tangentX = previous.x - next.x;
      const tangentY = previous.y - next.y;
      const tangentLength = Math.hypot(tangentX, tangentY) || 1;
      const normalX = -tangentY / tangentLength;
      const normalY = tangentX / tangentLength;
      const headRatio = 1 - index / (pointCount - 1);
      const halfWidth = 0.25 + Math.pow(headRatio, 1.55) * 12;

      leftEdge.push({
        x: point.x + normalX * halfWidth,
        y: point.y + normalY * halfWidth
      });
      rightEdge.push({
        x: point.x - normalX * halfWidth,
        y: point.y - normalY * halfWidth
      });
    });

    const tail = points[pointCount - 1];
    const head = points[0];
    const gradient = context.createLinearGradient(tail.x, tail.y, head.x, head.y);
    gradient.addColorStop(0, 'rgba(29, 78, 216, 0)');
    gradient.addColorStop(0.28, `rgba(37, 99, 235, ${0.13 * trailOpacity})`);
    gradient.addColorStop(0.52, `rgba(88, 166, 255, ${0.24 * trailOpacity})`);
    gradient.addColorStop(0.72, `rgba(129, 140, 248, ${0.38 * trailOpacity})`);
    gradient.addColorStop(0.88, `rgba(34, 211, 238, ${0.55 * trailOpacity})`);
    gradient.addColorStop(1, `rgba(147, 197, 253, ${0.78 * trailOpacity})`);

    const traceSmoothEdge = (edge, moveToStart = true) => {
      if (moveToStart) context.moveTo(edge[0].x, edge[0].y);
      else context.lineTo(edge[0].x, edge[0].y);
      for (let index = 1; index < edge.length - 1; index++) {
        const point = edge[index];
        const next = edge[index + 1];
        const midpointX = (point.x + next.x) * 0.5;
        const midpointY = (point.y + next.y) * 0.5;
        context.quadraticCurveTo(point.x, point.y, midpointX, midpointY);
      }
      const last = edge[edge.length - 1];
      context.lineTo(last.x, last.y);
    };

    context.save();
    context.beginPath();
    traceSmoothEdge(leftEdge);
    traceSmoothEdge([...rightEdge].reverse(), false);
    context.closePath();
    context.fillStyle = gradient;
    context.shadowColor = `rgba(34, 211, 238, ${0.42 * trailOpacity})`;
    context.shadowBlur = 8;
    context.fill();
    context.restore();
  };

  const renderCursor = now => {
    const delta = Math.min(Math.max((now - lastFrameTime) / 16.667, 0.5), 2);
    lastFrameTime = now;
    const headFollow = 1 - Math.pow(1 - 0.22, delta);
    points[0].x += (targetX - points[0].x) * headFollow;
    points[0].y += (targetY - points[0].y) * headFollow;

    for (let index = 1; index < pointCount; index++) {
      const baseStrength = 0.27 - (index / pointCount) * 0.13;
      const followStrength = 1 - Math.pow(1 - baseStrength, delta);
      points[index].x += (points[index - 1].x - points[index].x) * followStrength;
      points[index].y += (points[index - 1].y - points[index].y) * followStrength;
    }

    cursor.style.transform = `translate3d(${points[0].x}px, ${points[0].y}px, 0) translate(-50%, -50%)`;
    trailOpacity += ((performance.now() - lastMoveTime < 75 ? 1 : 0) - trailOpacity) * 0.12;
    drawTrail();

    const remainingDistance = Math.abs(targetX - points[0].x) + Math.abs(targetY - points[0].y);
    if (remainingDistance > 0.08 || trailOpacity > 0.01) {
      cursorFrame = requestAnimationFrame(renderCursor);
    } else {
      canvas.classList.remove('is-visible');
      cursorFrame = null;
    }
  };

  window.addEventListener('pointermove', event => {
    if (!initialized) {
      points.forEach(point => {
        point.x = event.clientX;
        point.y = event.clientY;
      });
      initialized = true;
    }

    targetX = event.clientX;
    targetY = event.clientY;
    lastMoveTime = performance.now();
    cursor.classList.add('is-visible');
    canvas.classList.add('is-visible');
    cursor.classList.toggle('is-interactive', Boolean(event.target.closest('a, button')));
    if (!cursorFrame) cursorFrame = requestAnimationFrame(renderCursor);
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', () => {
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
