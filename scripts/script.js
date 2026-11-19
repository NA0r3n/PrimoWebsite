// Scroll listener for navbar scrolled effect
const primoHeader = document.querySelector("header");
if (primoHeader) {
  window.addEventListener("scroll", () => {
    primoHeader.classList.toggle("scrolled", window.scrollY > 80);
  }, { passive: true });
}

// Reset scroll to TOP on page load
if (history.scrollRestoration) {
  history.scrollRestoration = "manual";
}
window.addEventListener("load", () => {
  window.scrollTo({
    top: 0,
    behavior: "instant"
  });
});

// Hero parallax (runs only on pages with #hero)
const hero = document.getElementById("hero");
if (hero && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        if (scrolled < hero.offsetHeight) {
          hero.style.setProperty("--parallax-y", `${scrolled * 0.35}px`);
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// Lazy image reveal for Home cards + About story scenes
const initMediaReveal = () => {
  const lazyImages = document.querySelectorAll(".promo-card img, .item-card img");
  const revealImage = (img) => {
    img.classList.add("loaded");
    const card = img.closest(".promo-card, .item-card");
    if (card) card.classList.add("is-loaded");
  };

  lazyImages.forEach((img) => {
    if (img.complete && img.naturalHeight !== 0) {
      revealImage(img);
    } else {
      img.addEventListener("load", () => revealImage(img), { once: true });
      img.addEventListener("error", () => revealImage(img), { once: true });
    }
  });

  const storyScenes = document.querySelectorAll("#story > div[id^='scene-']");
  if (storyScenes.length > 0) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const scene = entry.target;
        const img = scene.querySelector("img");

        const showScene = () => {
          scene.classList.add("is-visible");
          obs.unobserve(scene);
        };

        if (!img || (img.complete && img.naturalHeight !== 0)) {
          showScene();
        } else {
          img.addEventListener("load", showScene, { once: true });
          img.addEventListener("error", showScene, { once: true });
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });

    storyScenes.forEach((scene) => observer.observe(scene));
  }
};

const initAll = () => {
  initMediaReveal();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAll);
} else {
  initAll();
}
