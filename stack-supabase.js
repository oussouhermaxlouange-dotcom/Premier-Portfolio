(() => {
  const showcases = [...document.querySelectorAll('[data-stack-showcase]')];

  if (showcases.length === 0) {
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  showcases.forEach((showcase) => {
    const buttons = [...showcase.querySelectorAll('[data-stack-target]')];
    const cards = [...showcase.querySelectorAll('[data-stack-card]')];

    if (buttons.length === 0 || buttons.length !== cards.length) {
      return;
    }

    let activeIndex = Math.max(
      0,
      buttons.findIndex((button) => button.classList.contains('is-active'))
    );
    let intervalId = null;
    let paused = false;
    let inView = true;

    const activate = (nextIndex) => {
      activeIndex = nextIndex;

      buttons.forEach((button, index) => {
        const isActive = index === nextIndex;

        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      cards.forEach((card, index) => {
        const isActive = index === nextIndex;

        card.classList.toggle('is-active', isActive);
        card.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      });
    };

    const stopAutoPlay = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };

    const startAutoPlay = () => {
      if (prefersReducedMotion || paused || !inView || intervalId !== null) {
        return;
      }

      intervalId = window.setInterval(() => {
        activate((activeIndex + 1) % buttons.length);
      }, 2600);
    };

    buttons.forEach((button, index) => {
      button.addEventListener('click', () => {
        activate(index);
      });

      button.addEventListener('focus', () => {
        activate(index);
      });

      if (canHover) {
        button.addEventListener('mouseenter', () => {
          activate(index);
        });
      }
    });

    showcase.addEventListener('mouseenter', () => {
      paused = true;
      stopAutoPlay();
    });

    showcase.addEventListener('mouseleave', () => {
      paused = false;
      startAutoPlay();
    });

    showcase.addEventListener('focusin', () => {
      paused = true;
      stopAutoPlay();
    });

    showcase.addEventListener('focusout', (event) => {
      if (showcase.contains(event.relatedTarget)) {
        return;
      }

      paused = false;
      startAutoPlay();
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          inView = entry.isIntersecting;

          if (inView) {
            startAutoPlay();
          } else {
            stopAutoPlay();
          }
        });
      },
      {
        threshold: 0.45,
      }
    );

    observer.observe(showcase);
    activate(activeIndex);
    startAutoPlay();
  });
})();
