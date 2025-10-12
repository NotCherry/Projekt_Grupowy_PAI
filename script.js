// API Base URL
const API_BASE = 'http://localhost:9000/api';

// State Management
const state = {
    flowers: [],
    papers: [],
    ribbons: [],
    selectedItems: {
        flowers: {},
        papers: {},
        ribbons: {}
    },
    giftOptions: {
        isGift: false,
        recipientName: '',
        recipientAddress: '',
        greetingCard: ''
    },
    totalPrice: 0
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
    await loadFlowers();
    await loadPapers();
    await loadRibbons();
    setupEventListeners();
    updateSummary();
});

// Fetch Flowers from API
async function loadFlowers() {
    try {
        const response = await fetch(`${API_BASE}/flowers`);
        const data = await response.json();
        state.flowers = data;
        renderFlowers();
    } catch (error) {
        console.error('Error loading flowers:', error);
        showError('Nie udało się załadować kwiatów');
    }
}

// Fetch Papers from API
async function loadPapers() {
    try {
        const response = await fetch(`${API_BASE}/papers`);
        const data = await response.json();
        state.papers = data;
        renderPapers();
    } catch (error) {
        console.error('Error loading papers:', error);
        showError('Nie udało się załadować papierów ozdobnych');
    }
}

// Fetch Ribbons from API
async function loadRibbons() {
    try {
        const response = await fetch(`${API_BASE}/ribbons`);
        const data = await response.json();
        state.ribbons = data;
        renderRibbons();
    } catch (error) {
        console.error('Error loading ribbons:', error);
        showError('Nie udało się załadować wstążek');
    }
}

// Render Flowers
function renderFlowers() {
    const container = document.getElementById('flowers-container');
    container.innerHTML = '';
    
    state.flowers.forEach(flower => {
        const card = createItemCard(flower, 'flowers');
        container.appendChild(card);
    });
}

// Render Papers
function renderPapers() {
    const container = document.getElementById('paper-container');
    container.innerHTML = '';
    
    state.papers.forEach(paper => {
        const card = createItemCard(paper, 'papers');
        container.appendChild(card);
    });
}

// Render Ribbons
function renderRibbons() {
    const container = document.getElementById('ribbon-container');
    container.innerHTML = '';
    
    state.ribbons.forEach(ribbon => {
        const card = createItemCard(ribbon, 'ribbons');
        container.appendChild(card);
    });
}

// Create Item Card
function createItemCard(item, category) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.dataset.id = item.id;
    card.dataset.category = category;
    
    const isSelected = state.selectedItems[category][item.id];
    if (isSelected) {
        card.classList.add('selected');
    }
    
    card.innerHTML = `
        <div class="item-icon">${item.icon}</div>
        <h4>${item.name}</h4>
        <span class="price">${item.price.toFixed(2)} zł</span>
        ${category === 'flowers' ? `
            <div class="quantity-control">
                <button onclick="decrementQuantity(${item.id}, '${category}')">-</button>
                <span id="qty-${category}-${item.id}">${isSelected ? isSelected.quantity : 0}</span>
                <button onclick="incrementQuantity(${item.id}, '${category}')">+</button>
            </div>
        ` : ''}
    `;
    
    if (category !== 'flowers') {
        card.addEventListener('click', () => toggleItem(item.id, category));
    }
    
    return card;
}

// Increment Quantity
function incrementQuantity(id, category) {
    const item = state[category].find(i => i.id === id);
    if (!item) return;
    
    if (!state.selectedItems[category][id]) {
        state.selectedItems[category][id] = {
            ...item,
            quantity: 1
        };
    } else {
        state.selectedItems[category][id].quantity++;
    }
    
    updateItemCard(id, category);
    updateSummary();
}

// Decrement Quantity
function decrementQuantity(id, category) {
    if (!state.selectedItems[category][id]) return;
    
    state.selectedItems[category][id].quantity--;
    
    if (state.selectedItems[category][id].quantity <= 0) {
        delete state.selectedItems[category][id];
    }
    
    updateItemCard(id, category);
    updateSummary();
}

// Toggle Item (for papers and ribbons)
function toggleItem(id, category) {
    const item = state[category].find(i => i.id === id);
    if (!item) return;
    
    if (state.selectedItems[category][id]) {
        delete state.selectedItems[category][id];
    } else {
        state.selectedItems[category][id] = {
            ...item,
            quantity: 1
        };
    }
    
    updateItemCard(id, category);
    updateSummary();
}

// Update Item Card UI
function updateItemCard(id, category) {
    const card = document.querySelector(`.item-card[data-id="${id}"][data-category="${category}"]`);
    if (!card) return;
    
    const isSelected = state.selectedItems[category][id];
    
    if (isSelected) {
        card.classList.add('selected');
    } else {
        card.classList.remove('selected');
    }
    
    if (category === 'flowers') {
        const qtySpan = document.getElementById(`qty-${category}-${id}`);
        if (qtySpan) {
            qtySpan.textContent = isSelected ? isSelected.quantity : 0;
        }
    }
}

// Update Summary
function updateSummary() {
    const summaryContent = document.getElementById('summary-content');
    const totalPriceElement = document.getElementById('total-price');
    
    let totalPrice = 0;
    let hasItems = false;
    let summaryHTML = '';
    
    // Flowers
    const selectedFlowers = Object.values(state.selectedItems.flowers);
    if (selectedFlowers.length > 0) {
        hasItems = true;
        summaryHTML += '<div class="summary-item"><strong>Kwiaty:</strong></div>';
        selectedFlowers.forEach(flower => {
            const itemTotal = flower.price * flower.quantity;
            totalPrice += itemTotal;
            summaryHTML += `
                <div class="summary-item">
                    <div class="summary-item-header">
                        <span>${flower.icon} ${flower.name}</span>
                        <span class="price">${itemTotal.toFixed(2)} zł</span>
                    </div>
                    <div class="summary-item-details">Ilość: ${flower.quantity} x ${flower.price.toFixed(2)} zł</div>
                </div>
            `;
        });
    }
    
    // Papers
    const selectedPapers = Object.values(state.selectedItems.papers);
    if (selectedPapers.length > 0) {
        hasItems = true;
        summaryHTML += '<div class="summary-item"><strong>Papier Ozdobny:</strong></div>';
        selectedPapers.forEach(paper => {
            totalPrice += paper.price;
            summaryHTML += `
                <div class="summary-item">
                    <div class="summary-item-header">
                        <span>${paper.icon} ${paper.name}</span>
                        <span class="price">${paper.price.toFixed(2)} zł</span>
                    </div>
                </div>
            `;
        });
    }
    
    // Ribbons
    const selectedRibbons = Object.values(state.selectedItems.ribbons);
    if (selectedRibbons.length > 0) {
        hasItems = true;
        summaryHTML += '<div class="summary-item"><strong>Wstążki:</strong></div>';
        selectedRibbons.forEach(ribbon => {
            totalPrice += ribbon.price;
            summaryHTML += `
                <div class="summary-item">
                    <div class="summary-item-header">
                        <span>${ribbon.icon} ${ribbon.name}</span>
                        <span class="price">${ribbon.price.toFixed(2)} zł</span>
                    </div>
                </div>
            `;
        });
    }
    
    if (!hasItems) {
        summaryContent.innerHTML = '<p class="empty-message">Dodaj kwiaty do bukietu, aby zobaczyć podsumowanie</p>';
    } else {
        summaryContent.innerHTML = summaryHTML;
    }
    
    state.totalPrice = totalPrice;
    totalPriceElement.textContent = `${totalPrice.toFixed(2)} zł`;
    
    // Enable/disable buttons
    document.getElementById('visualize-btn').disabled = !hasItems;
    document.getElementById('order-btn').disabled = !hasItems;
}

// Setup Event Listeners
function setupEventListeners() {
    // Gift checkbox
    const giftCheckbox = document.getElementById('gift-checkbox');
    const giftOptions = document.getElementById('gift-options');
    
    giftCheckbox.addEventListener('change', (e) => {
        state.giftOptions.isGift = e.target.checked;
        if (e.target.checked) {
            giftOptions.classList.remove('hidden');
        } else {
            giftOptions.classList.add('hidden');
        }
    });
    
    // Gift form fields
    document.getElementById('recipient-name').addEventListener('input', (e) => {
        state.giftOptions.recipientName = e.target.value;
    });
    
    document.getElementById('recipient-address').addEventListener('input', (e) => {
        state.giftOptions.recipientAddress = e.target.value;
    });
    
    const greetingCard = document.getElementById('greeting-card');
    greetingCard.addEventListener('input', (e) => {
        state.giftOptions.greetingCard = e.target.value;
        document.getElementById('char-count').textContent = e.target.value.length;
    });
    
    // Visualize button
    document.getElementById('visualize-btn').addEventListener('click', generateVisualization);
    
    // Order button
    document.getElementById('order-btn').addEventListener('click', placeOrder);
    
    // Modal close
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
}

// Generate Visualization
async function generateVisualization() {
    const modal = document.getElementById('visualization-modal');
    const container = document.getElementById('visualization-container');
    const image = document.getElementById('visualization-image');
    
    modal.classList.add('show');
    container.classList.remove('hidden');
    image.classList.add('hidden');
    
    try {
        const orderData = prepareOrderData();
        const response = await fetch(`${API_BASE}/visualization`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        const data = await response.json();
        
        if (data.imageUrl) {
            image.src = data.imageUrl;
            image.classList.remove('hidden');
            container.classList.add('hidden');
        } else {
            throw new Error('No image URL returned');
        }
    } catch (error) {
        console.error('Error generating visualization:', error);
        container.innerHTML = '<p style="color: red;">Wystąpił błąd podczas generowania wizualizacji</p>';
    }
}

// Place Order
async function placeOrder() {
    try {
        const orderData = prepareOrderData();
        
        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(`Zamówienie złożone pomyślnie!\nNumer zamówienia: ${data.orderId}`);
            resetForm();
        } else {
            throw new Error(data.message || 'Order failed');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        showError('Nie udało się złożyć zamówienia');
    }
}

// Prepare Order Data
function prepareOrderData() {
    return {
        flowers: Object.values(state.selectedItems.flowers).map(f => ({
            id: f.id,
            quantity: f.quantity
        })),
        papers: Object.values(state.selectedItems.papers).map(p => ({
            id: p.id
        })),
        ribbons: Object.values(state.selectedItems.ribbons).map(r => ({
            id: r.id
        })),
        totalPrice: state.totalPrice,
        giftOptions: state.giftOptions.isGift ? state.giftOptions : null
    };
}

// Reset Form
function resetForm() {
    state.selectedItems = {
        flowers: {},
        papers: {},
        ribbons: {}
    };
    state.giftOptions = {
        isGift: false,
        recipientName: '',
        recipientAddress: '',
        greetingCard: ''
    };
    
    document.getElementById('gift-checkbox').checked = false;
    document.getElementById('gift-options').classList.add('hidden');
    document.getElementById('recipient-name').value = '';
    document.getElementById('recipient-address').value = '';
    document.getElementById('greeting-card').value = '';
    document.getElementById('char-count').textContent = '0';
    
    renderFlowers();
    renderPapers();
    renderRibbons();
    updateSummary();
}

// Close Modal
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}

// Show Error
function showError(message) {
    alert(message);
}
