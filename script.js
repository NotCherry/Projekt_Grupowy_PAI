/**
 * @file script.js
 * @brief Główny skrypt aplikacji kwiaciarni
 * @details Obsługuje wybór produktów, koszyk, losowanie bukietów i składanie zamówień
 */

/** @brief URL backendu FastAPI */
const backendUrl = 'http://localhost:9000';

/** @brief Klucz do przechowywania stanu w localStorage */
const STORAGE_KEY = 'bouquetState';

/**
 * @brief Wczytuje stan aplikacji z localStorage
 * @return {Object} Stan zawierający kwiaty, papiery, wstążki i ceny
 */
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

/**
 * @brief Zapisuje aktualny stan do localStorage
 */
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** @brief Globalny stan aplikacji */
let state = loadState();

/** @brief Synchronizacja stanu między kartami przeglądarki */
window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY) {
    state = loadState();
    restoreCounters();
  }
});

/** @brief Tablica wszystkich kwiatów i zieleni z API */
let allFlowers = [];

/** @brief Tablica wszystkich papierów z API */
let allPapers = [];

/** @brief Tablica wszystkich wstążek z API */
let allRibbons = [];

/**
 * @brief Pobiera produkty z API przy starcie aplikacji
 * @async
 * @details Ładuje kwiaty, zielenie, papiery i wstążki równolegle
 */
async function ladujProdukty() {
    try {
        const [flowersRes, foliageRes, papersRes, ribbonsRes] = await Promise.all([
            fetch(backendUrl + '/flowers'),
            fetch(backendUrl + '/foliage'),
            fetch(backendUrl + '/papers'),
            fetch(backendUrl + '/ribbons')
        ]);
        
        const flowers = await flowersRes.json();
        const foliage = await foliageRes.json();
        allFlowers = [...flowers, ...foliage];
        allPapers = await papersRes.json();
        allRibbons = await ribbonsRes.json();
        
        console.log(`Załadowano: ${allFlowers.length} kwiatów, ${allPapers.length} papierów, ${allRibbons.length} wstążek`);
    } catch (err) {
        console.error('Błąd ładowania produktów:', err);
        alert('Nie udało się załadować produktów');
    }
}

/**
 * @brief Wyświetla listę produktów w interfejsie
 * @async
 * @param {Object} params Parametry wyświetlania
 * @param {string} params.endpoint Endpoint API (np. '/flowers')
 * @param {string} params.className Klasa kontenera HTML
 * @param {string} params.klasaKarty Klasa CSS dla karty produktu
 * @param {string} params.funkcjaLicznika Nazwa funkcji licznika (changeCount*)
 */
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
        
        renderKoszyk();
        saveState();
    } catch (err) {
        console.error(`Loading error ${endpoint}:`, err);
        rodzic.innerHTML = `<p class="error">Failed to load products.</p>`;
    }
}

/**
 * @brief Zmienia ilość kwiatów w koszyku
 * @param {HTMLElement} button Przycisk +/- kliknięty przez użytkownika
 * @param {number} delta Zmiana ilości (+1 lub -1)
 */
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

/**
 * @brief Zmienia papier w koszyku (max 1)
 * @param {HTMLElement} button Przycisk +/- kliknięty przez użytkownika
 * @param {number} delta Zmiana ilości (+1 lub -1)
 */
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

/**
 * @brief Zmienia wstążkę w koszyku (max 1)
 * @param {HTMLElement} button Przycisk +/- kliknięty przez użytkownika
 * @param {number} delta Zmiana ilości (+1 lub -1)
 */
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

/**
 * @brief Aktualizuje wyświetlanie ilości i ceny na karcie produktu
 * @param {HTMLElement} card Karta produktu do zaktualizowania
 * @param {number} value Nowa ilość produktu
 */
function updateCardDisplay(card, value) {
  const counter = card.querySelector("span");
  if (counter) counter.textContent = value;
  
  const sub = card.querySelector(".subtotal");
  if (sub) {
    const price = parseFloat(card.dataset.price);
    sub.textContent = `Suma: ${value * price} zł`;
  }
}

/**
 * @brief Przywraca liczniki wszystkich produktów po wczytaniu stanu
 */
function restoreCounters() {
  restoreCategoryView('flower-card', state.flowers);
  restoreCategoryView('flower-card2', state.papers);
  restoreCategoryView('flower-card3', state.ribbons);
  updateTotal();
}

/**
 * @brief Przywraca widok kategorii produktów
 * @param {string} cardClass Klasa CSS karty produktu
 * @param {Object} stateCategory Obiekt stanu dla kategorii
 */
function restoreCategoryView(cardClass, stateCategory) {
  const cards = document.querySelectorAll(`.${cardClass}`);
  cards.forEach(card => {
      const id = card.dataset.id;
      const qty = stateCategory[id] || 0;
      updateCardDisplay(card, qty);
  });
}

/**
 * @brief Oblicza i wyświetla całkowitą cenę zamówienia
 */
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

/**
 * @brief Zwraca listę wybranych produktów
 * @return {Array<Object>} Tablica obiektów z danymi produktów
 */
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

/**
 * @brief Renderuje koszyk w elemencie SVG
 * @details Wyświetla produkty jako tekst SVG w elemencie #orderItems
 */
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

/**
 * @brief Losuje liczbę z zakresu
 * @param {number} min Minimalna wartość
 * @param {number} max Maksymalna wartość
 * @return {number} Wylosowana liczba
 */
function losujLiczbe(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @brief Losuje losowy element z tablicy
 * @param {Array} array Tablica do losowania
 * @return {*} Wylosowany element
 */
function losujElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * @brief Losuje bukiet o zadanej liczbie kwiatów
 * @param {number} iloscRoznychKwiatow Całkowita liczba kwiatów (7, 14 lub 21)
 * @details Wybiera max 3 typy kwiatów, 1 papier i 1 wstążkę
 */
function losujBukiet(iloscRoznychKwiatow) {
    if (allFlowers.length === 0 || allPapers.length === 0 || allRibbons.length === 0) {
        alert('Najpierw załaduj produkty');
        return;
    }
    
    state.flowers = {};
    state.papers = {};
    state.ribbons = {};
    state.flowersNames = {};
    state.papersNames = {};
    state.ribbonsNames = {};
    state.prices = {};
    
    const kwiaty = [...allFlowers];
    const wybraneKwiaty = [];
    
    const maxTypow = Math.min(3, iloscRoznychKwiatow);
    
    for (let i = 0; i < maxTypow && kwiaty.length > 0; i++) {
        const index = Math.floor(Math.random() * kwiaty.length);
        wybraneKwiaty.push(kwiaty.splice(index, 1)[0]);
    }
    
    const pozostalaIlosc = iloscRoznychKwiatow;
    const iloscNaTyp = Math.floor(pozostalaIlosc / wybraneKwiaty.length);
    let reszta = pozostalaIlosc % wybraneKwiaty.length;
    
    wybraneKwiaty.forEach((kwiat, idx) => {
        let ilosc = iloscNaTyp;
        if (reszta > 0) {
            ilosc++;
            reszta--;
        }
        
        state.flowers[kwiat.id] = ilosc;
        state.flowersNames[kwiat.id] = kwiat.name;
        state.prices[kwiat.id] = kwiat.price;
    });
    
    const wybranyPapier = losujElement(allPapers);
    state.papers[wybranyPapier.id] = 1;
    state.papersNames[wybranyPapier.id] = wybranyPapier.name;
    state.prices[wybranyPapier.id] = wybranyPapier.price;
    
    const wybranaWstazka = losujElement(allRibbons);
    state.ribbons[wybranaWstazka.id] = 1;
    state.ribbonsNames[wybranaWstazka.id] = wybranaWstazka.name;
    state.prices[wybranaWstazka.id] = wybranaWstazka.price;
    
    saveState();
    aktualizujListeZamowienia();
    
    console.log('Wylosowano bukiet:', state);
}

/**
 * @brief Aktualizuje listę zamówienia w HTML
 * @details Wypełnia listy #flowers-list, #papers-list, #ribbons-list
 */
function aktualizujListeZamowienia() {
    const flowersList = document.getElementById('flowers-list');
    const papersList = document.getElementById('papers-list');
    const ribbonsList = document.getElementById('ribbons-list');
    const totalPrice = document.getElementById('total-price');
    
    if (flowersList) flowersList.innerHTML = '';
    if (papersList) papersList.innerHTML = '';
    if (ribbonsList) ribbonsList.innerHTML = '';
    
    let suma = 0;
    
    Object.entries(state.flowers).forEach(([id, qty]) => {
        if (qty > 0) {
            const name = state.flowersNames[id] || `Kwiat ${id}`;
            const price = state.prices[id] || 0;
            const subtotal = qty * price;
            suma += subtotal;
            
            if (flowersList) {
                const li = document.createElement('li');
                li.textContent = `${name} x${qty} = ${subtotal} zł`;
                flowersList.appendChild(li);
            }
        }
    });
    
    Object.entries(state.papers).forEach(([id, qty]) => {
        if (qty > 0) {
            const name = state.papersNames[id] || `Papier ${id}`;
            const price = state.prices[id] || 0;
            suma += price;
            
            if (papersList) {
                const li = document.createElement('li');
                li.textContent = `${name} - ${price} zł`;
                papersList.appendChild(li);
            }
        }
    });
    
    Object.entries(state.ribbons).forEach(([id, qty]) => {
        if (qty > 0) {
            const name = state.ribbonsNames[id] || `Wstążka ${id}`;
            const price = state.prices[id] || 0;
            suma += price;
            
            if (ribbonsList) {
                const li = document.createElement('li');
                li.textContent = `${name} - ${price} zł`;
                ribbonsList.appendChild(li);
            }
        }
    });
    
    if (totalPrice) {
        totalPrice.innerHTML = `<strong>Cała suma: ${suma.toFixed(2)} zł</strong>`;
    }
}

/**
 * @brief Inicjalizacja aplikacji przy załadowaniu DOM
 * @details Ładuje produkty i przywraca stan z localStorage
 */
document.addEventListener('DOMContentLoaded', async function() {
    const hasFlowerList = document.getElementsByClassName('flower-list')[0];
    
    if (hasFlowerList) {
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
    }
    
    await ladujProdukty();
    state = loadState();
    aktualizujListeZamowienia();
    renderKoszyk();
});

/**
 * @brief Obsługa formularza zamówienia
 * @details Wysyła zamówienie do API POST /orders
 */
const orderForm = document.getElementById('order-form');
if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
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
            if (note) {
                note.textContent = `Zamówienie utworzone. ID: ${data.order_id}`;
                note.style.color = 'green';
            }

            form.reset();
        } catch (err) {
            const note = document.getElementById('form-note');
            if (note) {
                note.textContent = `Błąd: ${err.message}`;
                note.style.color = 'red';
            }
        }
    });
}

/**
 * @brief Generuje wizualizację bukietu używając API
 * @async
 * @details Wysyła żądanie POST do /api/visualization i wyświetla obraz
 */
async function generujWizualizacje() {
    const flowers = [];
    Object.entries(state.flowers).forEach(([id, qty]) => {
        if (qty > 0) {
            flowers.push({ 
                id: parseInt(id), 
                quantity: qty, 
                icon: null 
            });
        }
    });

    const papers = [];
    Object.entries(state.papers).forEach(([id, qty]) => {
        if (qty > 0) {
            papers.push({ 
                id: parseInt(id), 
                icon: null 
            });
        }
    });

    const ribbons = [];
    Object.entries(state.ribbons).forEach(([id, qty]) => {
        if (qty > 0) {
            ribbons.push({ 
                id: parseInt(id), 
                icon: null 
            });
        }
    });

    if (flowers.length === 0) {
        alert('Najpierw wylosuj bukiet!');
        return;
    }

    const payload = {
        flowers: flowers,
        papers: papers,
        ribbons: ribbons
    };

    try {
        const res = await fetch(backendUrl + '/api/visualization', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || 'Błąd generowania');
        }

        const data = await res.json();
        
        const img = document.querySelector('section.background img');
        if (img) {
            img.src = data.imageUrl;
            img.alt = 'Wygenerowany bukiet';
        }

        alert('Wizualizacja wygenerowana!');
    } catch (err) {
        console.error('Błąd:', err);
        alert(`Błąd generowania: ${err.message}`);
    }
}

/** @brief Eksport funkcji do globalnego scope */
window.generujWizualizacje = generujWizualizacje;
window.renderKoszyk = renderKoszyk;
window.getListaProduktow = getListaProduktow;
window.losujBukiet = losujBukiet;
window.changeCount = changeCount;
window.changeCount2 = changeCount2;
window.changeCount3 = changeCount3;
