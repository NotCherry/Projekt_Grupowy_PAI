/**
 * @file order_summary.js
 * @brief Skrypt strony podsumowania zamówienia
 * @details Wyświetla wybrane produkty z localStorage i generuje wizualizację
 */

/** @brief URL backendu FastAPI */
const backendUrl = 'http://localhost:9000';

/** @brief Klucz localStorage */
const STORAGE_KEY = 'bouquetState';

/**
 * @brief Wczytuje stan z localStorage
 * @return {Object} Stan zawierający kwiaty, papiery, wstążki i ceny
 */
function loadState() {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    const loaded = json ? JSON.parse(json) : {};
    return {
      flowers: loaded.flowers || {},
      papers: loaded.papers || {},
      ribbons: loaded.ribbons || {},
      prices: loaded.prices || {},
      flowersNames: loaded.flowersNames || {},
      papersNames: loaded.papersNames || {},
      ribbonsNames: loaded.ribbonsNames || {}
    };
  } catch (e) {
    console.error("LocalStorage error", e);
    return { 
      flowers: {}, 
      papers: {}, 
      ribbons: {}, 
      prices: {},
      flowersNames: {},
      papersNames: {},
      ribbonsNames: {}
    };
  }
}

/** @brief Globalny stan aplikacji */
let state = loadState();

/**
 * @brief Synchronizacja stanu między kartami
 * @details Nasłuchuje zmian w localStorage i odświeża podsumowanie
 */
window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY) {
    state = loadState();
    renderOrderSummary();
  }
});

/**
 * @brief Inicjalizacja strony
 */
document.addEventListener('DOMContentLoaded', function() {
    renderOrderSummary();
    setupGenerateButton();
});

/**
 * @brief Pobiera szczegóły produktu z API
 * @async
 * @param {string|number} id ID produktu
 * @return {Promise<Object|null>} Obiekt produktu lub null
 */
async function fetchProductDetails(id) {
    try {
        const categories = ['flowers', 'foliage', 'papers', 'ribbons'];
        for (const category of categories) {
            const resp = await fetch(`${backendUrl}/${category}`);
            if (resp.ok) {
                const products = await resp.json();
                const product = products.find(p => p.id === parseInt(id));
                if (product) return product;
            }
        }
        return null;
    } catch (e) {
        console.error("Fetch error:", e);
        return null;
    }
}

/**
 * @brief Renderuje podsumowanie zamówienia
 * @details Wypełnia listy produktów i oblicza cenę całkowitą
 */
function renderOrderSummary() {
    const flowersList = document.getElementById('flowers-list');
    const papersList = document.getElementById('papers-list');
    const ribbonsList = document.getElementById('ribbons-list');
    const totalPriceEl = document.getElementById('total-price');
    
    if (!flowersList || !papersList || !ribbonsList || !totalPriceEl) return;
    
    flowersList.innerHTML = '';
    papersList.innerHTML = '';
    ribbonsList.innerHTML = '';
    
    let total = 0;
    let hasItems = false;
    
    Object.entries(state.flowers).forEach(([id, qty]) => {
        if (qty > 0) {
            hasItems = true;
            const price = state.prices[id] || 0;
            const subtotal = price * qty;
            total += subtotal;
            const name = state.flowersNames[id] || `Produkt ${id}`;
            
            const li = document.createElement('li');
            li.innerHTML = `<span class="item-name">${name}</span> - 
                           <span class="item-qty">${qty} szt.</span> × 
                           <span class="item-price">${price} zł</span> = 
                           <strong>${subtotal.toFixed(2)} zł</strong>`;
            flowersList.appendChild(li);
        }
    });
    
    if (!hasItems || flowersList.children.length === 0) {
        flowersList.innerHTML = '<li class="empty">Brak wybranych kwiatów</li>';
    }
    
    let hasPapers = false;
    Object.entries(state.papers).forEach(([id, qty]) => {
        if (qty > 0) {
            hasPapers = true;
            const price = state.prices[id] || 0;
            total += price;
            const name = state.papersNames[id] || `Papier ${id}`;
            
            const li = document.createElement('li');
            li.innerHTML = `<span class="item-name">${name}</span> - 
                           <span class="item-price">${price} zł</span>`;
            papersList.appendChild(li);
        }
    });
    
    if (!hasPapers) {
        papersList.innerHTML = '<li class="empty">Brak wybranego papieru</li>';
    }
    
    let hasRibbons = false;
    Object.entries(state.ribbons).forEach(([id, qty]) => {
        if (qty > 0) {
            hasRibbons = true;
            const price = state.prices[id] || 0;
            total += price;
            const name = state.ribbonsNames[id] || `Wstążka ${id}`;
            
            const li = document.createElement('li');
            li.innerHTML = `<span class="item-name">${name}</span> - 
                           <span class="item-price">${price} zł</span>`;
            ribbonsList.appendChild(li);
        }
    });
    
    if (!hasRibbons) {
        ribbonsList.innerHTML = '<li class="empty">Brak wybranej wstążki</li>';
    }
    
    totalPriceEl.innerHTML = `<h2>Całkowita suma: <strong>${total.toFixed(2)} zł</strong></h2>`;
}

/**
 * @brief Konfiguruje przycisk generowania wizualizacji
 * @details Obsługuje kliknięcie i wysyła żądanie do API
 */
function setupGenerateButton() {
    const generateBtn = document.getElementById('generate-btn');
    if (!generateBtn) return;
    
    generateBtn.addEventListener('click', async () => {
        const flowers = Object.entries(state.flowers)
            .filter(([id, qty]) => qty > 0)
            .map(([id, qty]) => ({ id: Number(id), quantity: qty, icon: null }));
        
        const papers = Object.entries(state.papers)
            .filter(([id, qty]) => qty > 0)
            .map(([id, qty]) => ({ id: Number(id), icon: null }));
        
        const ribbons = Object.entries(state.ribbons)
            .filter(([id, qty]) => qty > 0)
            .map(([id, qty]) => ({ id: Number(id), icon: null }));

        if (flowers.length === 0) {
            alert('Wybierz przynajmniej jeden kwiat!');
            return;
        }

        const body = JSON.stringify({ flowers, papers, ribbons });

        try {
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generowanie...';
            
            const resp = await fetch(`${backendUrl}/api/visualization`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body
            });

            if (resp.ok) {
                const { imageUrl } = await resp.json();
                const img = document.getElementById('bouquet-image');
                if (img) {
                    img.src = imageUrl;
                    img.alt = 'Wygenerowany bukiet';
                }
                alert('Wizualizacja wygenerowana!');
            } else {
                const err = await resp.json();
                alert(`Błąd: ${err.detail || 'Nieznany błąd'}`);
            }
        } catch (e) {
            console.error(e);
            alert("Błąd połączenia z serwerem.");
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generuj';
        }
    });
}

/** @brief Eksport funkcji do globalnego scope */
window.renderOrderSummary = renderOrderSummary;
window.loadState = loadState;
