
function loadState() {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    const loaded = json ? JSON.parse(json) : {};
    return {
      flowers: loaded.flowers || {},
      papers: loaded.papers || {},
      ribbons: loaded.ribbons || {},
      prices: loaded.prices || {}
    };
  } catch (e) {
    console.error("LocalStorage error", e);
    return { flowers: {}, papers: {}, ribbons: {}, prices: {} };
  }
}

window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY) {
    state = loadState();
    renderOrderSummary();
  }
});

document.addEventListener('DOMContentLoaded', function() {
    renderOrderSummary();
    setupGenerateButton();
});

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

function renderOrderSummary() {
    const flowersList = document.getElementById('flowers-list');
    const papersList = document.getElementById('papers-list');
    const ribbonsList = document.getElementById('ribbons-list');
    const totalPriceEl = document.getElementById('total-price');
    
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
            
            const li = document.createElement('li');
            li.innerHTML = `<span class="item-name" data-id="${id}">ID: ${id}</span> - 
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
            const subtotal = price * qty;
            total += subtotal;
            
            const li = document.createElement('li');
            li.innerHTML = `<span class="item-name" data-id="${id}">ID: ${id}</span> - 
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
            const subtotal = price * qty;
            total += subtotal;
            
            const li = document.createElement('li');
            li.innerHTML = `<span class="item-name" data-id="${id}">ID: ${id}</span> - 
                           <span class="item-price">${price} zł</span>`;
            ribbonsList.appendChild(li);
        }
    });
    
    if (!hasRibbons) {
        ribbonsList.innerHTML = '<li class="empty">Brak wybranej wstążki</li>';
    }
    
    totalPriceEl.innerHTML = `<h2>Całkowita suma: <strong>${total.toFixed(2)} zł</strong></h2>`;
    
    loadProductNames();
}

async function loadProductNames() {
    const itemNames = document.querySelectorAll('.item-name');
    
    for (const nameEl of itemNames) {
        const id = nameEl.dataset.id;
        const product = await fetchProductDetails(id);
        if (product) {
            nameEl.textContent = product.name;
        }
    }
}

function setupGenerateButton() {
    const generateBtn = document.getElementById('generate-btn');
    if (!generateBtn) return;
    
    generateBtn.addEventListener('click', async () => {
        const flowers = Object.entries(state.flowers)
            .filter(([id, qty]) => qty > 0)
            .map(([id, qty]) => ({ id: Number(id), quantity: qty }));
        
        const papers = Object.entries(state.papers)
            .filter(([id, qty]) => qty > 0)
            .map(([id, qty]) => ({ id: Number(id) }));
        
        const ribbons = Object.entries(state.ribbons)
            .filter(([id, qty]) => qty > 0)
            .map(([id, qty]) => ({ id: Number(id) }));

        if (flowers.length === 0) {
            alert('Wybierz przynajmniej jeden kwiat!');
            return;
        }

        const body = JSON.stringify({ flowers, papers, ribbons });

        try {
            const resp = await fetch(`${backendUrl}/api/visualization`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body
            });

            if (resp.ok) {
                const { imageUrl } = await resp.json();
                const img = document.getElementById('bouquet-image');
                if (img) img.src = `${imageUrl}`;
            } else {
                const err = await resp.json();
                alert(`Błąd: ${err.detail || 'Nieznany błąd'}`);
            }
        } catch (e) {
            console.error(e);
            alert("Błąd połączenia z serwerem.");
        }
    });
}
