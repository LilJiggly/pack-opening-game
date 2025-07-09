// Clean, fully functional script.js for Pokémon Pack Opening Game with Collection Progress, Achievements, and Sell Duplicates

const coinsEl = document.getElementById("coins");
const totalValueEl = document.getElementById("totalValue");
const packContainer = document.getElementById("packContainer");
const openPackBtn = document.getElementById("openPackBtn");
const viewCollectionBtn = document.getElementById("viewCollectionBtn");

// Coins initialization: only set to 500 if not present in localStorage
let coins;
if (localStorage.getItem("coins") !== null) {
  coins = parseInt(localStorage.getItem("coins"), 10);
} else {
  coins = 500;
  localStorage.setItem("coins", coins);
}
let totalValue = parseInt(localStorage.getItem("totalValue")) || 0;
coinsEl.textContent = coins;
totalValueEl.textContent = totalValue;

let cards = [];

fetch("cards.json")
  .then((response) => response.json())
  .then((data) => {
    cards = data;
  });

const rarityChances = {
  "ultra-rare": 1,
  rare: 9,
  uncommon: 30,
  common: 60,
};

const rarityGlow = {
  "ultra-rare": "0 0 15px 5px gold",
  rare: "0 0 10px 4px blue",
  uncommon: "0 0 8px 3px green",
  common: "0 0 5px 2px gray",
};

// Achievement milestones
const achievementMilestones = [
  {
    id: "packsOpened",
    label: "Packs Opened",
    milestones: [1, 5, 10, 25, 50, 100],
  },
  {
    id: "uniqueCards",
    label: "Unique Cards Collected",
    milestones: [10, 25, 50, 100, 150],
  },
];

// Toast container
const toastContainer = document.createElement("div");
toastContainer.id = "toastContainer";
toastContainer.style.position = "fixed";
toastContainer.style.bottom = "20px";
toastContainer.style.right = "20px";
toastContainer.style.zIndex = "10000";
document.body.appendChild(toastContainer);

function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.background = "rgba(0,0,0,0.8)";
  toast.style.color = "white";
  toast.style.padding = "10px 15px";
  toast.style.marginTop = "10px";
  toast.style.borderRadius = "5px";
  toast.style.fontFamily = "Arial, sans-serif";
  toast.style.fontSize = "14px";
  toast.style.boxShadow = "0 0 5px rgba(0,0,0,0.5)";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.3s ease";
  toastContainer.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
  });
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300);
  }, 3000);
}

function getRandomRarity() {
  const rand = Math.random() * 100;
  let sum = 0;
  for (const rarity in rarityChances) {
    sum += rarityChances[rarity];
    if (rand <= sum) return rarity;
  }
  return "common";
}

function getRandomCardByRarity(rarity) {
  const filtered = cards.filter((card) => card.rarity === rarity);
  if (filtered.length === 0)
    return cards[Math.floor(Math.random() * cards.length)];
  return filtered[Math.floor(Math.random() * filtered.length)];
}

function saveState() {
  localStorage.setItem("coins", coins);
  localStorage.setItem("totalValue", totalValue);
  localStorage.setItem("achievements", JSON.stringify(achievements));
  localStorage.setItem("packsOpened", packsOpened);
}

function createCardElement(card, delay) {
  const cardEl = document.createElement("div");
  cardEl.className = "card";
  cardEl.style.boxShadow = rarityGlow[card.rarity];
  cardEl.style.opacity = "0";
  cardEl.style.transform = "scale(0.8)";
  cardEl.style.transition = "opacity 0.3s ease, transform 0.3s ease";

  const inner = document.createElement("div");
  inner.className = "card-inner";

  const name = document.createElement("div");
  name.className = "card-name";
  name.textContent = card.name;

  const image = document.createElement("div");
  image.className = "card-image";
  image.style.backgroundImage = `url(${card.image})`;
  image.setAttribute("aria-label", `${card.name} image`);
  image.setAttribute("role", "img");

  const description = document.createElement("div");
  description.className = "card-description";
  description.textContent =
    card.description || "A Pokémon card for your collection.";

  const rarity = document.createElement("div");
  rarity.className = "card-rarity";
  rarity.textContent = `Rarity: ${card.rarity}`;

  inner.appendChild(name);
  inner.appendChild(image);
  inner.appendChild(description);
  inner.appendChild(rarity);
  cardEl.appendChild(inner);

  // Animation reveal
  setTimeout(() => {
    cardEl.style.opacity = "1";
    cardEl.style.transform = "scale(1)";
  }, delay);

  return cardEl;
}

// Achievements tracking
let achievements = JSON.parse(localStorage.getItem("achievements")) || {};
let packsOpened = parseInt(localStorage.getItem("packsOpened")) || 0;

function updateAchievement(id, currentValue) {
  if (!achievements[id]) achievements[id] = 0;
  if (currentValue > achievements[id]) {
    achievements[id] = currentValue;
    checkMilestones(id, currentValue);
  }
}

function checkMilestones(id, currentValue) {
  const ach = achievementMilestones.find((a) => a.id === id);
  if (!ach) return;
  ach.milestones.forEach((milestone) => {
    if (currentValue === milestone) {
      showToast(`Achievement unlocked: ${ach.label} - ${milestone}!`);
    }
  });
}

function getCollection() {
  return JSON.parse(localStorage.getItem("collection")) || {};
}

function updateCollection(card) {
  let collection = getCollection();
  if (collection[card.id]) {
    collection[card.id].count += 1;
  } else {
    collection[card.id] = {
      id: card.id,
      name: card.name,
      image: card.image,
      rarity: card.rarity,
      count: 1,
      value: card.value || 0,
    };
  }
  localStorage.setItem("collection", JSON.stringify(collection));
}

function updateOpenPackButtonState() {
  // Final failsafe: disable if out of coins, enable if coins available
  if (coins < 100) {
    openPackBtn.disabled = true;
    if (coins === 0) {
      showToast("You are out of coins! Sell duplicates to earn more.");
    }
  } else {
    openPackBtn.disabled = false;
  }
}

openPackBtn.addEventListener("click", () => {
  if (coins < 100) {
    updateOpenPackButtonState();
    if (coins === 0) {
      showToast("You are out of coins! Sell duplicates to earn more.");
    } else {
      alert("Not enough coins!");
    }
    return;
  }
  if (cards.length === 0) {
    alert("Cards are still loading, please wait.");
    return;
  }

  coins -= 100;
  coinsEl.textContent = coins;
  packContainer.innerHTML = "";
  let packValue = 0;

  for (let i = 0; i < 7; i++) {
    const rarity = getRandomRarity();
    const card = getRandomCardByRarity(rarity);
    const cardEl = createCardElement(card, i * 150);
    updateCollection(card);
    packContainer.appendChild(cardEl);
    packValue += card.value || 0;
  }

  totalValue += packValue;
  totalValueEl.textContent = totalValue;

  packsOpened++;
  updateAchievement("packsOpened", packsOpened);

  saveState();
  updateOpenPackButtonState();
});

// Modal elements and functions for collection slide-in with progress and sell duplicates
const collectionModal = document.createElement("div");
collectionModal.id = "collectionModal";
collectionModal.className = "collection-modal";

collectionModal.innerHTML = `
  <div class="collection-modal-content" role="dialog" aria-modal="true" aria-labelledby="collectionTitle">
    <button id="closeCollectionBtn" class="close-btn" aria-label="Close Collection">&times;</button>
    <h2 id="collectionTitle">Your Collection</h2>
    <div id="collectionProgress" class="collection-progress" aria-live="polite" aria-atomic="true"></div>
    <div id="collectionGrid" class="collection-grid" tabindex="0"></div>
    <div id="sellSelectedControls" class="sell-selected-controls" style="margin-top: 10px; display: flex; align-items: center; gap:10px;">
      <button id="sellSelectedBtn" class="sell-btn" aria-label="Sell selected cards" disabled>Sell Selected</button>
      <span id="selectedValueInfo" style="font-weight: bold; color: #333;"></span>
    </div>
    <div id="sellControls" class="sell-controls" aria-label="Sell duplicates controls">
      <span>Sell ALL duplicates:</span>
      <button id="sell1Btn" class="sell-btn" aria-label="Sell 1 duplicate">Sell 1</button>
      <button id="sell5Btn" class="sell-btn" aria-label="Sell 5 duplicates">Sell 5</button>
      <button id="sell10Btn" class="sell-btn" aria-label="Sell 10 duplicates">Sell 10</button>
      <button id="sellAllBtn" class="sell-btn" aria-label="Sell all duplicates">Sell All</button>
    </div>
  </div>
`;

document.body.appendChild(collectionModal);

const closeCollectionBtn = document.getElementById("closeCollectionBtn");
const collectionGrid = document.getElementById("collectionGrid");
const collectionProgress = document.getElementById("collectionProgress");
const sell1Btn = document.getElementById("sell1Btn");
const sell5Btn = document.getElementById("sell5Btn");
const sell10Btn = document.getElementById("sell10Btn");
const sellAllBtn = document.getElementById("sellAllBtn");
const sellSelectedBtn = document.getElementById("sellSelectedBtn");
const selectedValueInfo = document.getElementById("selectedValueInfo");

// Achievements modal and button logic
const achievementsBtn = document.getElementById("viewAchievementsBtn");
const achievementsModal = document.getElementById("achievementsModal");
const closeAchievementsBtn = document.getElementById("closeAchievementsBtn");
let achievementsList = document.getElementById("achievementsList");
// If achievementsList is an <ul>, replace with <div> for styling
if (achievementsList && achievementsList.tagName === "UL") {
  const newDiv = document.createElement("div");
  newDiv.id = "achievementsList";
  newDiv.tabIndex = 0;
  newDiv.className = "achievements-list";
  newDiv.setAttribute("aria-live", "polite");
  newDiv.setAttribute("aria-atomic", "true");
  achievementsList.replaceWith(newDiv);
  achievementsList = newDiv;
}

function openAchievementsModal() {
  loadAchievements();
  // Show modal (use display: block and add .show for CSS if needed)
  achievementsModal.classList.add("show");
  achievementsModal.style.display = "block";
  achievementsModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  achievementsList.focus();
}

function closeAchievementsModal() {
  achievementsModal.classList.remove("show");
  achievementsModal.style.display = "none";
  achievementsModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  achievementsBtn && achievementsBtn.focus();
}

function loadAchievements() {
  achievementsList.innerHTML = "";
  achievementMilestones.forEach((achievement) => {
    const container = document.createElement("div");
    container.className = "achievement-item";
    container.style.marginBottom = "1em";
    const title = document.createElement("h3");
    title.textContent = achievement.label;
    container.appendChild(title);
    const milestonesList = document.createElement("ul");
    milestonesList.style.listStyle = "none";
    milestonesList.style.paddingLeft = "0";
    achievement.milestones.forEach((milestone) => {
      const li = document.createElement("li");
      const isUnlocked = achievements[achievement.id] >= milestone;
      li.textContent = milestone;
      li.style.padding = "4px 8px";
      li.style.marginBottom = "4px";
      li.style.borderRadius = "5px";
      li.style.display = "inline-block";
      li.style.minWidth = "50px";
      li.style.textAlign = "center";
      li.style.fontWeight = isUnlocked ? "bold" : "normal";
      li.style.color = isUnlocked ? "white" : "#666";
      li.style.backgroundColor = isUnlocked ? "#4caf50" : "#ddd";
      li.setAttribute(
        "aria-label",
        isUnlocked
          ? `Unlocked milestone: ${milestone}`
          : `Locked milestone: ${milestone}`
      );
      milestonesList.appendChild(li);
    });
    container.appendChild(milestonesList);
    achievementsList.appendChild(container);
  });
}

if (achievementsBtn) {
  achievementsBtn.addEventListener("click", openAchievementsModal);
}
if (closeAchievementsBtn) {
  closeAchievementsBtn.addEventListener("click", closeAchievementsModal);
}
// Close modal when clicking outside content
if (achievementsModal) {
  achievementsModal.addEventListener("click", (e) => {
    if (e.target === achievementsModal) {
      closeAchievementsModal();
    }
  });
}

// Keyboard accessibility: close achievements modal on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (achievementsModal.classList.contains("show")) {
      closeAchievementsModal();
    } else if (collectionModal.classList.contains("show")) {
      closeCollectionModal();
    }
  }
});

function openCollectionModal() {
  loadCollection();
  collectionModal.classList.add("show");
  collectionModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden"; // prevent background scroll
  collectionGrid.focus();
}

function closeCollectionModal() {
  collectionModal.classList.remove("show");
  collectionModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = ""; // restore scroll
  openPackBtn.focus();
}

// --- Selection for selling (NEW FUNCTIONALITY) ---
let selectedCardsToSell = new Set();

const raritySellValue = {
  "ultra-rare": 100,
  rare: 50,
  uncommon: 20,
  common: 5,
};

function getSellValueForRarity(rarity) {
  return raritySellValue[rarity] || 0;
}

function updateSelectedValueInfo() {
  if (selectedCardsToSell.size === 0) {
    selectedValueInfo.textContent = "";
    sellSelectedBtn.disabled = true;
    return;
  }
  // Calculate total value for all selected cards (one per selection)
  const collection = getCollection();
  let total = 0;
  let selectedCount = 0;
  selectedCardsToSell.forEach((cardId) => {
    const c = collection[cardId];
    if (c && c.count > 1) {
      total += getSellValueForRarity(c.rarity);
      selectedCount++;
    }
  });
  sellSelectedBtn.disabled = selectedCount === 0;
  selectedValueInfo.textContent =
    selectedCount > 0
      ? `Sell ${selectedCount} selected for ${total} coins`
      : "";
}

function clearSelection() {
  selectedCardsToSell.clear();
  updateSelectedValueInfo();
  // Remove highlight from all cards
  document
    .querySelectorAll(".collection-card.selected-for-sell")
    .forEach((el) => {
      el.classList.remove("selected-for-sell");
      el.style.boxShadow = el.dataset.originalBoxShadow || "";
    });
}

function loadCollection() {
  collectionGrid.innerHTML = "";
  clearSelection();
  const collection = getCollection();
  const keys = Object.keys(collection);
  const totalUnique = cards.length;
  const ownedUnique = keys.length;
  const progressPercent =
    totalUnique === 0 ? 0 : Math.round((ownedUnique / totalUnique) * 100);

  collectionProgress.innerHTML = `
    <div style="margin-bottom:8px;">
      <strong>Collection Progress:</strong> ${ownedUnique} / ${totalUnique} unique cards (${progressPercent}%)
    </div>
    <progress value="${ownedUnique}" max="${totalUnique}" style="width: 100%; height: 20px;" aria-valuemin="0" aria-valuemax="${totalUnique}" aria-valuenow="${ownedUnique}"></progress>
  `;

  if (keys.length === 0) {
    collectionGrid.innerHTML = "<p>Your collection is empty.</p>";
    disableSellButtons(true);
    sellSelectedBtn.disabled = true;
    selectedValueInfo.textContent = "";
    return;
  }

  disableSellButtons(false);
  sellSelectedBtn.disabled = true;
  selectedValueInfo.textContent = "";

  keys.forEach((key) => {
    const card = collection[key];
    const cardEl = document.createElement("div");
    cardEl.className = "collection-card";
    cardEl.setAttribute("tabindex", "0");
    cardEl.dataset.cardId = card.id;
    cardEl.dataset.rarity = card.rarity;
    cardEl.dataset.count = card.count;
    cardEl.dataset.name = card.name;
    cardEl.dataset.sellValue = getSellValueForRarity(card.rarity);
    cardEl.dataset.originalBoxShadow = rarityGlow[card.rarity] || "";
    cardEl.style.boxShadow = rarityGlow[card.rarity] || "";

    const imageEl = document.createElement("div");
    imageEl.className = "collection-card-image";
    imageEl.style.backgroundImage = `url(${card.image})`;
    imageEl.setAttribute("aria-label", `${card.name} image`);
    imageEl.setAttribute("role", "img");

    const nameEl = document.createElement("div");
    nameEl.className = "collection-card-name";
    nameEl.textContent = card.name;

    const rarityEl = document.createElement("div");
    rarityEl.className = "collection-card-rarity";
    rarityEl.textContent = `Rarity: ${card.rarity}`;

    const countEl = document.createElement("div");
    countEl.className = "collection-card-count";
    countEl.textContent = `Count: ${card.count}`;

    const sellInfoEl = document.createElement("div");
    sellInfoEl.className = "collection-card-sell-info";
    const duplicates = card.count > 1 ? card.count - 1 : 0;
    if (duplicates > 0) {
      sellInfoEl.textContent = `Duplicates available: ${duplicates} (Sell value: ${getSellValueForRarity(
        card.rarity
      )} coins)`;
      // Only enable selection if there are duplicates
      cardEl.classList.add("selectable-for-sell");
      cardEl.style.cursor = "pointer";
      cardEl.addEventListener("click", function (e) {
        // Toggle selection
        if (selectedCardsToSell.has(card.id)) {
          selectedCardsToSell.delete(card.id);
          cardEl.classList.remove("selected-for-sell");
          cardEl.style.boxShadow = cardEl.dataset.originalBoxShadow || "";
        } else {
          selectedCardsToSell.add(card.id);
          cardEl.classList.add("selected-for-sell");
          cardEl.style.boxShadow =
            "0 0 18px 6px #ff9800, " + (cardEl.dataset.originalBoxShadow || "");
        }
        updateSelectedValueInfo();
      });
      // Keyboard accessibility: toggle with space/enter
      cardEl.addEventListener("keydown", function (e) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          cardEl.click();
        }
      });
    } else {
      sellInfoEl.textContent = "No duplicates";
      cardEl.style.cursor = "default";
    }

    cardEl.appendChild(imageEl);
    cardEl.appendChild(nameEl);
    cardEl.appendChild(rarityEl);
    cardEl.appendChild(countEl);
    cardEl.appendChild(sellInfoEl);

    collectionGrid.appendChild(cardEl);
  });
}
// Sell selected cards functionality
sellSelectedBtn.addEventListener("click", function () {
  const collection = getCollection();
  let totalCoinsGained = 0;
  let cardsSold = 0;
  let soldCardNames = [];
  let changed = false;
  // Only sell one duplicate per selected card
  selectedCardsToSell.forEach((cardId) => {
    const card = collection[cardId];
    if (card && card.count > 1) {
      card.count -= 1;
      totalCoinsGained += getSellValueForRarity(card.rarity);
      cardsSold += 1;
      soldCardNames.push(card.name);
      changed = true;
    }
  });
  // Remove any cards with count 0 (shouldn't happen, but safety)
  Object.keys(collection).forEach((k) => {
    if (collection[k].count <= 0) delete collection[k];
  });
  if (!changed) {
    showToast("No valid cards selected to sell.");
    return;
  }
  coins += totalCoinsGained;
  localStorage.setItem("coins", coins); // Ensure coins persist immediately
  coinsEl.textContent = coins;
  localStorage.setItem("collection", JSON.stringify(collection));
  saveState();
  clearSelection();
  loadCollection();
  showToast(
    `Sold ${cardsSold} card${
      cardsSold > 1 ? "s" : ""
    } for ${totalCoinsGained} coins.`
  );
  updateOpenPackButtonState();
});

function disableSellButtons(disable) {
  sell1Btn.disabled = disable;
  sell5Btn.disabled = disable;
  sell10Btn.disabled = disable;
  sellAllBtn.disabled = disable;
  sellSelectedBtn.disabled = true;
  selectedValueInfo.textContent = "";
}

function sellDuplicates(amount) {
  let collection = getCollection();
  let totalCoinsGained = 0;
  let duplicatesSold = 0;

  // Gather cards with duplicates sorted by rarity value descending (ultra-rare first)
  let cardsWithDuplicates = Object.values(collection).filter(
    (c) => c.count > 1
  );
  if (cardsWithDuplicates.length === 0) {
    showToast("No duplicates available to sell.");
    return;
  }

  // Sort by rarity value descending, fallback to card value or 0
  const rarityOrder = ["ultra-rare", "rare", "uncommon", "common"];
  cardsWithDuplicates.sort((a, b) => {
    const rarityA = rarityOrder.indexOf(a.rarity);
    const rarityB = rarityOrder.indexOf(b.rarity);
    if (rarityA !== rarityB) return rarityA - rarityB;
    return (b.value || 0) - (a.value || 0);
  });

  // If amount is 'all', set to large number
  if (amount === "all") amount = 999999;

  for (let card of cardsWithDuplicates) {
    const duplicates = card.count - 1;
    if (duplicates === 0) continue;

    const toSell = Math.min(amount - duplicatesSold, duplicates);
    if (toSell <= 0) break;

    card.count -= toSell;
    duplicatesSold += toSell;
    // Use rarity sell value for coins, not card.value
    totalCoinsGained += toSell * getSellValueForRarity(card.rarity);

    if (duplicatesSold >= amount) break;
  }

  if (duplicatesSold === 0) {
    showToast("No duplicates available to sell.");
    return;
  }

  coins += totalCoinsGained;
  localStorage.setItem("coins", coins); // Ensure coins persist immediately
  coinsEl.textContent = coins;

  // Remove cards with count 0 (should not happen but safety)
  for (let key in collection) {
    if (collection[key].count <= 0) delete collection[key];
  }

  localStorage.setItem("collection", JSON.stringify(collection));
  saveState();
  loadCollection();
  showToast(
    `Sold ${duplicatesSold} duplicate${
      duplicatesSold > 1 ? "s" : ""
    } for ${totalCoinsGained} coins.`
  );
  updateOpenPackButtonState();
}

sell1Btn.addEventListener("click", () => {
  clearSelection();
  sellDuplicates(1);
});
sell5Btn.addEventListener("click", () => {
  clearSelection();
  sellDuplicates(5);
});
sell10Btn.addEventListener("click", () => {
  clearSelection();
  sellDuplicates(10);
});
sellAllBtn.addEventListener("click", () => {
  clearSelection();
  sellDuplicates("all");
});

viewCollectionBtn.addEventListener("click", openCollectionModal);
closeCollectionBtn.addEventListener("click", () => {
  clearSelection();
  closeCollectionModal();
});

// Optional: close modal when clicking outside content
collectionModal.addEventListener("click", (e) => {
  if (e.target === collectionModal) {
    clearSelection();
    closeCollectionModal();
  }
});

// Keyboard accessibility: close modal on Escape
// (Handled above with achievements modal keyboard listener)

// Add simple CSS for selection highlight (for immediate testability)
const style = document.createElement("style");
style.textContent = `
.collection-card.selected-for-sell {
  outline: 3px solid #ff9800 !important;
  box-shadow: 0 0 18px 6px #ff9800, var(--original-box-shadow, "");
  position: relative;
}
.collection-card.selectable-for-sell:hover:not(.selected-for-sell) {
  outline: 2px solid #ffd54f;
}
`;
document.head.appendChild(style);

// --- Final failsafe: Check on load and whenever coins change ---
updateOpenPackButtonState();
