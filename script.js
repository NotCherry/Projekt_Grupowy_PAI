const backendUrl = 'http://localhost:9000';
const STORAGE_KEY = 'bouquetState';

function loadState() {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : { 
      flowers: {}, 
      papers: {}, 
      ribbons: {},
      prices: {}
    };
  } catch (e) {
    console.error("LocalStorage error", e);
    return { flowers: {}, papers: {}, ribbons: {}, prices: {} };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY) {
    state = loadState();
    restoreCounters();
  }
});

document.addEventListener('DOMContentLoaded', async function() {
    await Promise.all([
        listujProdukty({
            endpoint: '/flowers', 
            className: 'flower-list', 
            klasaKarty: 'flower-card', 
            funkcjaLicznika: 'changeCount'
        }),
        listujProdukty({
            endpoint: '/foliage', 
            className: 'foliage-list', 
            klasaKarty: 'flower-card', 
            funkcjaLicznika: 'changeCount'
        }),
        listujProdukty({
            endpoint: '/ribbons', 
            className: 'ribbons-list', 
            klasaKarty: 'flower-card3', 
            funkcjaLicznika: 'changeCount3'
        }),
        listujProdukty({
            endpoint: '/papers', 
            className: 'papers-list', 
            klasaKarty: 'flower-card2', 
            funkcjaLicznika: 'changeCount2'
        })
    ]);
    restoreCounters();
});

async function listujProdukty({endpoint, className, klasaKarty, funkcjaLicznika}) {
    const rodzic = document.getElementsByClassName(className)[0];
    if (!rodzic) {
        console.warn(`Element '${className}' not found.`);
        return;
    }
    
    try {
        const odpowiedz = await fetch(backendUrl+endpoint);
        if (!odpowiedz.ok) throw new Error(`Status: ${odpowiedz.status}`);
        const produkty = await odpowiedz.json();
        
        produkty.forEach(produkt => {
            state.prices[produkt.id] = produkt.price;
            
            const szablon = document.createElement("template");
            const maxInfo = produkt.max_quantity > 0 ? `(max ${produkt.max_quantity})` : '';
            
            szablon.innerHTML = `
                <div class="${klasaKarty}" data-price="${produkt.price}" data-id="${produkt.id}">
                    <img src="${backendUrl+produkt.image}" alt="${produkt.name}" loading="lazy">
                    <div class="flower-name">${produkt.name}</div>
                    <div class="price">Cena: ${produkt.price} zł</div>
                    ${maxInfo ? `<div class="max">${maxInfo}</div>` : ''}
                    <div class="counter">
                        <button onclick="${funkcjaLicznika}(this, -1)">-</button>
                        <span>0</span>
                        <button onclick="${funkcjaLicznika}(this, 1)">+</button>
                    </div>
                    <div class="subtotal">Suma: 0 zł</div>
                </div>
            `;
            rodzic.appendChild(szablon.content.firstElementChild);
        });
        
        saveState();
    } catch (err) {
        console.error(`Loading error ${endpoint}:`, err);
        rodzic.innerHTML = `<p class="error">Failed to load products.</p>`;
    }
}

function changeCount(button, delta) {
  const card = button.closest(".flower-card");
  const id = card.dataset.id;
  
  let value = (state.flowers[id] || 0) + delta;
  if (value < 0) value = 0;
  
  state.flowers[id] = value;
  saveState();
  
  updateCardDisplay(card, value);
  updateTotal();
}

function changeCount2(button, delta) {
  const card = button.closest(".flower-card2");
  const currentId = card.dataset.id;
  const currentVal = state.papers[currentId] || 0;

  if (delta > 0) {
    if (currentVal >= 1) return;
    
    Object.keys(state.papers).forEach(id => {
        state.papers[id] = 0;
    });
    state.papers[currentId] = 1;
  } else {
    state.papers[currentId] = Math.max(0, currentVal - 1);
  }
  
  saveState();
  restoreCategoryView('flower-card2', state.papers);
  updateTotal();
}

function changeCount3(button, delta) {
  const card = button.closest(".flower-card3");
  const currentId = card.dataset.id;
  const currentVal = state.ribbons[currentId] || 0;

  if (delta > 0) {
    if (currentVal >= 1) return;
    
    Object.keys(state.ribbons).forEach(id => {
        state.ribbons[id] = 0;
    });
    state.ribbons[currentId] = 1;
  } else {
    state.ribbons[currentId] = Math.max(0, currentVal - 1);
  }
  
  saveState();
  restoreCategoryView('flower-card3', state.ribbons);
  updateTotal();
}

function updateCardDisplay(card, value) {
  const counter = card.querySelector("span");
  if (counter) counter.textContent = value;
  
  const sub = card.querySelector(".subtotal");
  if (sub) {
    const price = parseFloat(card.dataset.price);
    sub.textContent = `Suma: ${value * price} zł`;
  }
}

function restoreCounters() {
  restoreCategoryView('flower-card', state.flowers);
  restoreCategoryView('flower-card2', state.papers);
  restoreCategoryView('flower-card3', state.ribbons);
  updateTotal();
}

function restoreCategoryView(cardClass, stateCategory) {
  const cards = document.querySelectorAll(`.${cardClass}`);
  cards.forEach(card => {
      const id = card.dataset.id;
      const qty = stateCategory[id] || 0;
      updateCardDisplay(card, qty);
  });
}

function updateTotal() {
  let total = 0;
  
  Object.entries(state.flowers).forEach(([id, qty]) => {
    if (qty > 0 && state.prices[id]) {
      total += state.prices[id] * qty;
    }
  });
  
  Object.entries(state.papers).forEach(([id, qty]) => {
    if (qty > 0 && state.prices[id]) {
      total += state.prices[id] * qty;
    }
  });
  
  Object.entries(state.ribbons).forEach(([id, qty]) => {
    if (qty > 0 && state.prices[id]) {
      total += state.prices[id] * qty;
    }
  });
  
  const totalEl = document.getElementById("total");
  if (totalEl) totalEl.textContent = `Cała suma: ${total.toFixed(2)} zł`;
}

