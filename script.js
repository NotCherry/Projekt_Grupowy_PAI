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

        // zapisz nazwy w state, żeby można było odczytać na innej stronie
        if (klasaKarty === 'flower-card') {
            state.flowersNames = state.flowersNames || {};
            state.flowersNames[produkt.id] = produkt.name;
        } else if (klasaKarty === 'flower-card2') {
            state.papersNames = state.papersNames || {};
            state.papersNames[produkt.id] = produkt.name;
        } else if (klasaKarty === 'flower-card3') {
            state.ribbonsNames = state.ribbonsNames || {};
            state.ribbonsNames[produkt.id] = produkt.name;
        }

            
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
        
        renderKoszyk(); // <- wywołaj po dodaniu wszystkich produktów
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
  renderKoszyk();

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
  renderKoszyk();
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
  renderKoszyk();
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
  
  const totalEl = document.getElementById("total1");
  if (totalEl) totalEl.textContent = `Cała suma: ${total.toFixed(2)} zł`;

  const totalEl2 = document.getElementById("total2");
   if (totalEl2) totalEl2.textContent = `Cała suma: ${total.toFixed(2)} zł`;

}


function getListaProduktow() {
  const lista = [];

  document.querySelectorAll('.flower-card, .flower-card2, .flower-card3')
    .forEach(card => {
      const id = card.dataset.id;
      const price = Number(card.dataset.price);
      let name = 'Produkt';
      if (card.classList.contains('flower-card')) name = state.flowersNames[id];
      if (card.classList.contains('flower-card2')) name = state.papersNames[id];
      if (card.classList.contains('flower-card3')) name = state.ribbonsNames[id];


      let ilosc = 0;
      if (card.classList.contains('flower-card')) ilosc = state.flowers[id] || 0;
      if (card.classList.contains('flower-card2')) ilosc = state.papers[id] || 0;
      if (card.classList.contains('flower-card3')) ilosc = state.ribbons[id] || 0;

      if (ilosc > 0) {
        lista.push({ id, name, ilosc, price });
      }
    });

  return lista;

  
}

function renderKoszyk() {
    const textEl = document.getElementById("orderItems");
    if (!textEl) return;

    while (textEl.firstChild) textEl.removeChild(textEl.firstChild);

    const lista = [];

    Object.entries(state.flowers).forEach(([id, qty]) => {
        if (qty > 0 && state.prices[id]) {
            lista.push({ 
                id, 
                name: state.flowersNames?.[id] || `Produkt ${id}`, 
                ilosc: qty, 
                price: state.prices[id] 
            });
        }
    });
    Object.entries(state.papers).forEach(([id, qty]) => {
        if (qty > 0 && state.prices[id]) {
            lista.push({ 
                id, 
                name: state.papersNames?.[id] || `Produkt ${id}`, 
                ilosc: qty, 
                price: state.prices[id] 
            });
        }
    });
    Object.entries(state.ribbons).forEach(([id, qty]) => {
        if (qty > 0 && state.prices[id]) {
            lista.push({ 
                id, 
                name: state.ribbonsNames?.[id] || `Produkt ${id}`, 
                ilosc: qty, 
                price: state.prices[id] 
            });
        }
    });


    lista.forEach((p, i) => {
        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttribute('x', '2010');          
        tspan.setAttribute('dy', i === 0 ? '0' : '28'); 
        tspan.textContent = `${p.name} x ${p.ilosc} = ${p.ilosc * p.price} zł`;
        textEl.appendChild(tspan);
    });

}

window.renderKoszyk = renderKoszyk;

window.getListaProduktow = getListaProduktow;
window.renderKoszyk = renderKoszyk;

document.addEventListener('DOMContentLoaded', function() {
    state = loadState();
    renderKoszyk();       
});



document.getElementById('order-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const flowers = [];
    Object.entries(state.flowers).forEach(([id, qty]) => {
        if (qty > 0) {
            flowers.push({ id: parseInt(id), quantity: qty, icon: null });
        }
    });

    const papers = [];
    Object.entries(state.papers).forEach(([id, qty]) => {
        if (qty > 0) {
            papers.push({ id: parseInt(id), icon: null });
        }
    });

    const ribbons = [];
    Object.entries(state.ribbons).forEach(([id, qty]) => {
        if (qty > 0) {
            ribbons.push({ id: parseInt(id), icon: null });
        }
    });

    const payload = {
        pseudonim: formData.get('pseudonim'),
        data: formData.get('data'),
        godzina: formData.get('godzina'),
        odbior: formData.get('odbior'),
        platnosc: formData.get('platnosc'),
        flowers: flowers,
        papers: papers,
        ribbons: ribbons,
        visualization_id: null
    };

    try {
        const res = await fetch(backendUrl + '/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.detail || 'Coś poszło nie tak');
        }

        let summary = `Zamówienie #${data.order_id} złożone!\n\n`;
        summary += `Klient: ${payload.pseudonim}\n`;
        summary += `Data: ${payload.data} o ${payload.godzina}\n`;
        summary += `Odbiór: ${payload.odbior}\n`;
        summary += `Płatność: ${payload.platnosc}\n\n`;
        summary += `Produkty:\n`;
        
        flowers.forEach(f => {
            const name = state.flowersNames?.[f.id] || `Kwiat ${f.id}`;
            summary += `- ${name} x${f.quantity}\n`;
        });
        
        papers.forEach(p => {
            const name = state.papersNames?.[p.id] || `Papier ${p.id}`;
            summary += `- ${name}\n`;
        });
        
        ribbons.forEach(r => {
            const name = state.ribbonsNames?.[r.id] || `Wstążka ${r.id}`;
            summary += `- ${name}\n`;
        });

        alert(summary);

        const note = document.getElementById('form-note');
        note.textContent = `Zamówienie utworzone. ID: ${data.order_id}`;
        note.style.color = 'green';

        form.reset();
    } catch (err) {
        const note = document.getElementById('form-note');
        note.textContent = `Błąd: ${err.message}`;
        note.style.color = 'red';
    }
});
