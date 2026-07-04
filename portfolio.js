const root = document.documentElement;
const header = document.querySelector('.site-header');
const revealItems = [...document.querySelectorAll('[data-reveal]')];
const parallaxItems = [...document.querySelectorAll('[data-parallax]')];
const storySteps = [...document.querySelectorAll('.story-step')];
const storyPanels = [...document.querySelectorAll('.story-panel')];

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let rafScheduled = false;

document.getElementById('year').textContent = new Date().getFullYear();

revealItems.forEach((item, index) => {
  item.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 90}ms`);
});

function syncVisibleReveals() {
  revealItems.forEach((item) => {
    if (item.classList.contains('is-visible')) {
      return;
    }

    const rect = item.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight * 0.92 && rect.bottom > window.innerHeight * 0.08;

    if (isVisible || prefersReducedMotion) {
      item.classList.add('is-visible');
    }
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  },
  {
    threshold: 0.08,
    rootMargin: '0px 0px -6% 0px',
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

function updateScrollState() {
  const scrollTop = window.scrollY || window.pageYOffset;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;

  root.style.setProperty('--scroll-progress', progress.toFixed(4));
  header.classList.toggle('is-condensed', scrollTop > 24);

  if (!prefersReducedMotion) {
    parallaxItems.forEach((item) => {
      const speed = Number(item.dataset.parallax || 0.1);
      const rect = item.getBoundingClientRect();
      const offset = (window.innerHeight * 0.5 - rect.top) * speed;
      item.style.setProperty('--parallax-y', `${offset.toFixed(1)}px`);
    });
  }

  syncVisibleReveals();

  if (storySteps.length > 0) {
    const viewportAnchor = window.innerHeight * 0.45;
    let activeIndex = 0;
    let smallestDistance = Number.POSITIVE_INFINITY;

    storySteps.forEach((step, index) => {
      const rect = step.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = Math.abs(center - viewportAnchor);

      if (distance < smallestDistance) {
        smallestDistance = distance;
        activeIndex = index;
      }
    });

    storySteps.forEach((step, index) => {
      step.classList.toggle('is-active', index === activeIndex);
    });

    storyPanels.forEach((panel, index) => {
      panel.classList.toggle('is-active', index === activeIndex);
    });
  }

  rafScheduled = false;
}

function requestScrollUpdate() {
  if (rafScheduled) {
    return;
  }

  rafScheduled = true;
  window.requestAnimationFrame(updateScrollState);
}

window.addEventListener('scroll', requestScrollUpdate, { passive: true });
window.addEventListener('resize', requestScrollUpdate);
window.addEventListener('load', requestScrollUpdate);

updateScrollState();
