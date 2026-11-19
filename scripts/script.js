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

// Click-to-Advance Presentation Controller (Works on About, Home & Franchise pages)
const initClickPresentation = () => {
  const storyContainer = document.getElementById("story");
  const homeContainer = document.getElementById("home-tour");
  const franchiseContainer = document.getElementById("franchise-page");
  const container = storyContainer || homeContainer || franchiseContainer;

  const hud = document.getElementById("story-hud");
  const stepBadge = document.getElementById("story-step-badge");
  const promptText = document.getElementById("story-prompt-text");
  const footer = document.getElementById("site-footer");

  if (!container || !hud || !stepBadge || !promptText) return;

  let stops = [];
  if (storyContainer) {
    stops = [
      { selector: "#scene-1", ratio: 0.0,  label: "More Than Just Wings" },
      { selector: "#scene-1", ratio: 0.3,  label: "The Story Behind the Bucket" },
      { selector: "#scene-2", ratio: 0.0,  label: "From Primo's Diner" },
      { selector: "#scene-2", ratio: 0.52, label: "Unlimited Bucket Wings" },
      { selector: "#scene-3", ratio: 0.05, label: "A Name That Feels Like Family" },
      { selector: "#scene-3", ratio: 0.45, label: "Team & Family Photo" },
      { selector: "#scene-4", ratio: 0.0,  label: "More Than Wings" },
      { selector: "#scene-4", ratio: 0.55, label: "It's About Being Together" },
      { selector: "#story-end-marker", ratio: 0.0, isEnd: true }
    ];
  } else if (franchiseContainer) {
    stops = [
      { selector: ".franchise-intro", ratio: 0.0, label: "Why Franchise Primo's?" },
      { selector: "#franchise-q3", ratio: 0.1, label: "3 Questions Before You Franchise" },
      { selector: "#franchise-start", ratio: -0.5, label: "Primo Hero!" },
      { selector: "#franchise-start", ratio: 0.0, label: "How Much To Start?" },
      { selector: "#franchise-start", ratio: 0.5, label: "Dream Franchise!" },
      { selector: "#franchise-location", ratio: 0.05, label: "Where Do You Want to Open?" },
      { selector: "#franchise-location", ratio: 0.5, label: "Ready To Franchise?" },
      { selector: "#story-end-marker", ratio: 0.0, isEnd: true }
    ];
  } else {
    stops = [
      { selector: "#hero", ratio: 0.0, label: "Primo's Bucket Wings" },
      { selector: "#promos", ratio: 0.0, label: "Primo's Deals" },
      { selector: "#promos .posters", ratio: 0.35, label: "More Promos" },
      { selector: "#signatures", ratio: 0.0, label: "11 Signature Flavors" },
      { selector: "#signatures .grid-container", ratio: 0.45, label: "More Flavors" },
      { selector: "#story-end-marker", ratio: 0.0, isEnd: true }
    ];
  }

  let currentStep = 0;

  const revealAllScenesUpTo = (targetSelector) => {
    if (!storyContainer) return;
    const scenes = Array.from(document.querySelectorAll("#story > div[id^='scene-']"));
    const targetScene = document.querySelector(targetSelector);
    const targetIdx = targetScene ? scenes.indexOf(targetScene) : scenes.length - 1;

    scenes.forEach((scene, idx) => {
      if (targetIdx === -1 || idx <= targetIdx) {
        scene.classList.add("is-visible");
      }
    });
  };

  const getStopScrollY = (stop) => {
    const el = document.querySelector(stop.selector);
    if (!el) return 0;
    const target = storyContainer ? (el.querySelector("img") || el) : el;
    const headerHeight = primoHeader ? primoHeader.offsetHeight : 72;
    const topInDoc = target.getBoundingClientRect().top + window.scrollY;
    return Math.max(0, topInDoc + target.offsetHeight * stop.ratio - headerHeight - 12);
  };

  const updateHud = (index) => {
    currentStep = Math.max(0, Math.min(stops.length - 1, index));
    const stop = stops[currentStep];

    if (stop.isEnd) {
      hud.classList.add("is-end");
      stepBadge.textContent = "END";
      promptText.textContent = "End of highlights • Click for Footer";
    } else {
      hud.classList.remove("is-end");
      stepBadge.textContent = `${currentStep + 1} / ${stops.length - 1}`;
      promptText.textContent = "Click anywhere to continue";
    }
  };

  const handleAdvance = (e) => {
    // Ignore clicks on buttons, links, inputs, or labels so interactive controls still work
    if (e.target.closest("a, button, input, select, textarea, label")) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (currentStep < stops.length - 1) {
      const nextStep = currentStep + 1;
      const nextStop = stops[nextStep];
      revealAllScenesUpTo(nextStop.selector);
      updateHud(nextStep);

      window.scrollTo({
        top: getStopScrollY(nextStop),
        behavior: prefersReduced ? "auto" : "smooth"
      });
    } else if (footer) {
      revealAllScenesUpTo("#scene-4");
      footer.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
    }
  };

  container.addEventListener("click", handleAdvance);
  hud.addEventListener("click", (e) => {
    e.stopPropagation();
    handleAdvance(e);
  });

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      if (footer) {
        const footerTop = footer.getBoundingClientRect().top;
        hud.classList.toggle("is-hidden", footerTop < window.innerHeight * 0.85);
      }

      const probeY = window.scrollY + window.innerHeight * 0.35;
      let closest = 0;
      let minDiff = Infinity;

      stops.forEach((stop, idx) => {
        const el = document.querySelector(stop.selector);
        if (!el) return;
        const target = storyContainer ? (el.querySelector("img") || el) : el;
        const y = target.getBoundingClientRect().top + window.scrollY + target.offsetHeight * stop.ratio;
        const diff = Math.abs(y - probeY);
        if (diff < minDiff) {
          minDiff = diff;
          closest = idx;
        }
      });

      updateHud(closest);
      ticking = false;
    });
  }, { passive: true });

  const firstScene = document.querySelector("#scene-1");
  if (firstScene) firstScene.classList.add("is-visible");
  updateHud(0);
};

const initAll = () => {
  initMediaReveal();
  initClickPresentation();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAll);
} else {
  initAll();
}
