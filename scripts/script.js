// ================= CONFIG =================
const DESKTOP_BREAKPOINT = 900;
const SCROLL_THRESHOLD = 80;
const PARALLAX_SPEED = 0.35;

const STORAGE_KEY_ORDERS = "primos_craving_planner_orders_v1";
const STORAGE_KEY_SORT = "primos_craving_planner_sort_v1";
const PRIMO_FB_PAGE_URL = "https://www.facebook.com/PrimosUnlimited"; // Replace with Primo's FB Page or m.me link

const SIGNATURE_FLAVORS = [
  "Jack Daniel's",
  "Primo's Buffalo",
  "Primo's Sisig",
  "Salted Egg",
  "Cheese Bomb",
  "Garlic Parmesan",
  "Honey Mustard",
  "Smokey BBQ",
  "Korean Yangnyeom",
  "Honey Sriracha",
  "Salt N Pepper"
];

// ================= SCROLL & HERO EFFECTS =================
function initScrollEffects() {
  const primoHeader = document.querySelector("header");
  if (primoHeader) {
    window.addEventListener(
      "scroll",
      () => {
        primoHeader.classList.toggle("scrolled", window.scrollY > SCROLL_THRESHOLD);
      },
      { passive: true }
    );
  }

  if (history.scrollRestoration) {
    history.scrollRestoration = "manual";
  }

  window.addEventListener("load", () => {
    window.scrollTo({
      top: 0,
      behavior: "instant"
    });
  });

  const hero = document.getElementById("hero");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (hero && !prefersReducedMotion) {
    let ticking = false;

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const scrolled = window.scrollY;
            if (scrolled < hero.offsetHeight) {
              hero.style.setProperty("--parallax-y", `${scrolled * PARALLAX_SPEED}px`);
            }
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
  }
}

// ================= MEDIA & SCENE REVEAL =================
function initMediaReveal() {
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
    const observer = new IntersectionObserver(
      (entries, obs) => {
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
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );

    storyScenes.forEach((scene) => observer.observe(scene));
  }
}

// ================= CRAVING PLANNER DRAWER & ORDERS =================
function initCravingPlanner() {
  const addToCartBtn = document.getElementById("add-to-cart-btn");
  const cravingPlanner = document.getElementById("craving-planner");
  if (!addToCartBtn || !cravingPlanner) return;

  const closePlannerBtn = cravingPlanner.querySelector(".close-btn");
  const plannerBody = cravingPlanner.querySelector(".body");
  const toolbarEl = cravingPlanner.querySelector(".planner-toolbar");
  const sortSelect = cravingPlanner.querySelector("#planner-sort-select");
  const totalAmountEl = cravingPlanner.querySelector(".total-amount");
  const clearBtn = cravingPlanner.querySelector(".btn-clear");
  const copyBtn = cravingPlanner.querySelector(".btn-copy");
  const fbSendBtn = cravingPlanner.querySelector(".btn-fb-send");
  const addButtons = document.querySelectorAll(".add-planner-btn");

  let itemsContainer = plannerBody ? plannerBody.querySelector(".planner-items") : null;
  if (plannerBody && !itemsContainer) {
    itemsContainer = document.createElement("div");
    itemsContainer.className = "planner-items";
    plannerBody.appendChild(itemsContainer);
  }

  let pickerContainer = plannerBody ? plannerBody.querySelector(".planner-flavor-picker") : null;
  if (plannerBody && !pickerContainer) {
    pickerContainer = document.createElement("div");
    pickerContainer.className = "planner-flavor-picker";
    pickerContainer.hidden = true;
    plannerBody.insertBefore(pickerContainer, itemsContainer);
  }

  function loadOrders() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_ORDERS) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }

  function saveOrders(items) {
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(items));
    } catch {
      // Ignore storage quota or private mode errors
    }
  }

  function loadSortMode() {
    try {
      return localStorage.getItem(STORAGE_KEY_SORT) || "recent";
    } catch {
      return "recent";
    }
  }

  function saveSortMode(mode) {
    try {
      localStorage.setItem(STORAGE_KEY_SORT, mode);
    } catch {
      // Ignore storage errors
    }
  }

  let orders = loadOrders();
  let sortMode = loadSortMode();
  let pendingItem = null;
  let selectedFlavors = [];

  if (sortSelect) {
    sortSelect.value = sortMode;
  }

  const formatPeso = (amount) => `₱${Number(amount || 0).toLocaleString("en-PH")}`;

  function getSortedOrders() {
    const list = [...orders];
    switch (sortMode) {
      case "price-high":
        return list.sort((a, b) => b.price - a.price);
      case "price-low":
        return list.sort((a, b) => a.price - b.price);
      case "title-asc":
        return list.sort((a, b) => a.title.localeCompare(b.title));
      case "recent":
      default:
        return list;
    }
  }

  function buildOrderSummaryText() {
    const sorted = getSortedOrders();
    const lines = sorted.map((item) => {
      const flavorSuffix =
        item.flavors && item.flavors.length > 0 ? ` [${item.flavors.join(", ")}]` : "";
      return `• ${item.title}${flavorSuffix} (${item.meta}) — ${formatPeso(item.price)}`;
    });
    const total = sorted.reduce((sum, item) => sum + item.price, 0);

    return [
      "PRIMO'S CRAVING PLANNER ORDER",
      ...lines,
      `Estimated Total: ${formatPeso(total)}`
    ].join("\n");
  }

  async function copySummaryToClipboard(summaryText) {
    try {
      await navigator.clipboard.writeText(summaryText);
      return true;
    } catch {
      return false;
    }
  }

  function openPlanner() {
    cravingPlanner.classList.remove("closing");
    cravingPlanner.classList.add("open");
    addToCartBtn.classList.add("is-active");
  }

  function closePlanner() {
    if (!cravingPlanner.classList.contains("open")) return;

    cravingPlanner.classList.remove("open");
    cravingPlanner.classList.add("closing");
    addToCartBtn.classList.remove("is-active");

    cravingPlanner.addEventListener(
      "animationend",
      () => {
        cravingPlanner.classList.remove("closing");
      },
      { once: true }
    );
  }

  function resetPicker() {
    pendingItem = null;
    selectedFlavors = [];
    if (pickerContainer) {
      pickerContainer.hidden = true;
      pickerContainer.innerHTML = "";
    }
  }

  function pushOrder(itemData, flavors = []) {
    orders.push({
      uid: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...itemData,
      flavors
    });
    saveOrders(orders);
    resetPicker();
    renderOrders();
    openPlanner();
  }

  function renderFlavorPicker() {
    if (!pickerContainer || !pendingItem) return;

    const maxFlavors = pendingItem.flavorsCount;
    pickerContainer.hidden = false;

    pickerContainer.innerHTML = `
      <div class="planner-flavor-header">
        <h4 class="planner-flavor-title">Choose Flavor for ${pendingItem.title}</h4>
        <span class="planner-flavor-limit">${selectedFlavors.length}/${maxFlavors} selected</span>
      </div>
      <div class="planner-flavor-grid">
        ${SIGNATURE_FLAVORS.map((flavor) => {
          const isSelected = selectedFlavors.includes(flavor);
          return `
            <button
              type="button"
              class="flavor-option-btn ${isSelected ? "selected" : ""}"
              data-flavor="${flavor}"
            >
              ${flavor}
            </button>
          `;
        }).join("")}
      </div>
      <div class="planner-flavor-actions">
        <button type="button" class="flavor-cancel-btn">Cancel</button>
        <button
          type="button"
          class="flavor-confirm-btn"
          ${selectedFlavors.length === maxFlavors ? "" : "disabled"}
        >
          Add to Planner
        </button>
      </div>
    `;
  }

  function renderOrders() {
    if (!plannerBody || !itemsContainer || !totalAmountEl) return;

    const hasItems = orders.length > 0 || Boolean(pendingItem);
    plannerBody.classList.toggle("has-items", hasItems);

    if (toolbarEl) {
      toolbarEl.hidden = orders.length < 2;
    }

    if (orders.length === 0) {
      itemsContainer.innerHTML = "";
      totalAmountEl.textContent = "₱ 0";
      return;
    }

    const sortedItems = getSortedOrders();

    itemsContainer.innerHTML = sortedItems
      .map((item) => {
        const flavorLine =
          item.flavors && item.flavors.length > 0
            ? `<div class="planner-item-flavors">Flavor: ${item.flavors.join(", ")}</div>`
            : "";

        return `
          <article class="planner-item-card" data-uid="${item.uid}">
            <div class="planner-item-top">
              <div class="planner-item-left">
                <span class="planner-item-badge" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 3a4 4 0 0 0-2.6 7l-1.9 1.9a2.1 2.1 0 0 0 3 3L7.3 13A4 4 0 1 0 13 7.3l5.6-3.9a1.5 1.5 0 1 0-1.7-2.5L11.3 4.8A4 4 0 0 0 7 3z"/>
                  </svg>
                </span>
                <div class="planner-item-headings">
                  <span class="planner-item-subheader">${item.subheader}</span>
                  <span class="planner-item-title">${item.title}</span>
                </div>
              </div>
              <span class="planner-item-price">${formatPeso(item.price)}</span>
            </div>

            <p class="planner-item-desc">${item.description}</p>
            ${flavorLine}
            <div class="planner-item-divider"></div>

            <div class="planner-item-bottom">
              <span class="planner-item-meta">${item.meta}</span>
              <button type="button" class="planner-remove-btn" data-remove-uid="${item.uid}">Remove</button>
            </div>
          </article>
        `;
      })
      .join("");

    const total = orders.reduce((sum, item) => sum + item.price, 0);
    totalAmountEl.textContent = formatPeso(total);
  }

  addToCartBtn.addEventListener("click", () => {
    const isOpen = cravingPlanner.classList.contains("open");
    const isLargeScreen = window.innerWidth >= DESKTOP_BREAKPOINT;

    if (isOpen && isLargeScreen) {
      closePlanner();
    } else if (!isOpen) {
      openPlanner();
    }
  });

  if (closePlannerBtn) {
    closePlannerBtn.addEventListener("click", closePlanner);
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      sortMode = sortSelect.value;
      saveSortMode(sortMode);
      renderOrders();
    });
  }

  addButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const itemData = {
        id: btn.dataset.id || "item",
        subheader: btn.dataset.subheader || "PRIMO'S MENU",
        title: btn.dataset.title || "ORDER ITEM",
        price: Number(btn.dataset.price) || 0,
        description: btn.dataset.description || "",
        meta: btn.dataset.meta || "1 Item",
        flavorsCount: Number(btn.dataset.flavorsCount) || 0
      };

      if (itemData.flavorsCount > 0) {
        pendingItem = itemData;
        selectedFlavors = [];
        renderOrders();
        renderFlavorPicker();
        openPlanner();
      } else {
        pushOrder(itemData, []);
      }
    });
  });

  if (pickerContainer) {
    pickerContainer.addEventListener("click", (e) => {
      const flavorBtn = e.target.closest(".flavor-option-btn");
      if (flavorBtn && pendingItem) {
        const flavor = flavorBtn.dataset.flavor;
        const idx = selectedFlavors.indexOf(flavor);

        if (idx !== -1) {
          selectedFlavors.splice(idx, 1);
        } else if (selectedFlavors.length < pendingItem.flavorsCount) {
          selectedFlavors.push(flavor);
        } else if (pendingItem.flavorsCount === 1) {
          selectedFlavors = [flavor];
        }

        renderFlavorPicker();
        return;
      }

      if (e.target.closest(".flavor-cancel-btn")) {
        resetPicker();
        renderOrders();
        return;
      }

      if (e.target.closest(".flavor-confirm-btn") && pendingItem) {
        if (selectedFlavors.length === pendingItem.flavorsCount) {
          pushOrder(pendingItem, [...selectedFlavors]);
        }
      }
    });
  }

  if (itemsContainer) {
    itemsContainer.addEventListener("click", (e) => {
      const removeBtn = e.target.closest(".planner-remove-btn");
      if (!removeBtn) return;

      const uid = removeBtn.dataset.removeUid;
      orders = orders.filter((item) => item.uid !== uid);
      saveOrders(orders);
      renderOrders();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      orders = [];
      saveOrders(orders);
      resetPicker();
      renderOrders();
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      if (!orders.length) return;
      const summary = buildOrderSummaryText();
      const copied = await copySummaryToClipboard(summary);
      if (copied) {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = "COPIED!";
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 1200);
      }
    });
  }

  if (fbSendBtn) {
    fbSendBtn.addEventListener("click", async () => {
      if (!orders.length) return;

      const summary = buildOrderSummaryText();
      await copySummaryToClipboard(summary);

      window.open(PRIMO_FB_PAGE_URL, "_blank", "noopener,noreferrer");
    });
  }

  renderOrders();
}

// ================= INITIALIZATION =================
function initAll() {
  initScrollEffects();
  initMediaReveal();
  initCravingPlanner();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAll);
} else {
  initAll();
}