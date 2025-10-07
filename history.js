// API Base URL
const API_BASE = 'http://localhost:9000/api';

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadOrders();
    setupModalListeners();
});

// Load Orders
async function loadOrders() {
    const container = document.getElementById('orders-container');
    
    try {
        const response = await fetch(`${API_BASE}/orders`);
        const orders = await response.json();
        
        if (orders.length === 0) {
            container.innerHTML = '<p class="empty-message">Nie masz jeszcze żadnych zamówień</p>';
            return;
        }
        
        const ordersGrid = document.createElement('div');
        ordersGrid.className = 'orders-grid';
        
        orders.forEach(order => {
            const orderCard = createOrderCard(order);
            ordersGrid.appendChild(orderCard);
        });
        
        container.innerHTML = '';
        container.appendChild(ordersGrid);
    } catch (error) {
        console.error('Error loading orders:', error);
        container.innerHTML = '<p style="color: red;">Nie udało się załadować zamówień</p>';
    }
}

// Create Order Card
function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.dataset.orderId = order.id;
    
    const date = new Date(order.createdAt).toLocaleDateString('pl-PL');
    const flowerCount = order.flowers.reduce((sum, f) => sum + f.quantity, 0);
    
    card.innerHTML = `
        <div class="order-header">
            <span class="order-id">Zamówienie #${order.id}</span>
            <span class="order-date">${date}</span>
        </div>
        <div class="order-summary">
            ${flowerCount} ${flowerCount === 1 ? 'kwiat' : 'kwiaty/ów'} • 
            ${order.papers.length} ${order.papers.length === 1 ? 'papier' : 'papiery'} • 
            ${order.ribbons.length} ${order.ribbons.length === 1 ? 'wstążka' : 'wstążki/ek'}
        </div>
        <div class="order-price">${order.totalPrice.toFixed(2)} zł</div>
    `;
    
    card.addEventListener('click', () => showOrderDetails(order));
    
    return card;
}

// Show Order Details
async function showOrderDetails(order) {
    const modal = document.getElementById('order-detail-modal');
    const content = document.getElementById('order-detail-content');
    
    let detailsHTML = `
        <div class="order-detail-section">
            <h3>Informacje podstawowe</h3>
            <p><strong>Numer zamówienia:</strong> #${order.id}</p>
            <p><strong>Data:</strong> ${new Date(order.createdAt).toLocaleString('pl-PL')}</p>
            <p><strong>Cena całkowita:</strong> ${order.totalPrice.toFixed(2)} zł</p>
        </div>
    `;
    
    // Flowers
    if (order.flowers.length > 0) {
        detailsHTML += `
            <div class="order-detail-section">
                <h3>Kwiaty</h3>
                <ul class="order-detail-list">
                    ${order.flowers.map(f => `
                        <li>
                            <strong>${f.name}</strong> - 
                            ${f.quantity} szt. x ${f.price.toFixed(2)} zł = 
                            ${(f.quantity * f.price).toFixed(2)} zł
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    // Papers
    if (order.papers.length > 0) {
        detailsHTML += `
            <div class="order-detail-section">
                <h3>Papier Ozdobny</h3>
                <ul class="order-detail-list">
                    ${order.papers.map(p => `
                        <li><strong>${p.name}</strong> - ${p.price.toFixed(2)} zł</li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    // Ribbons
    if (order.ribbons.length > 0) {
        detailsHTML += `
            <div class="order-detail-section">
                <h3>Wstążki</h3>
                <ul class="order-detail-list">
                    ${order.ribbons.map(r => `
                        <li><strong>${r.name}</strong> - ${r.price.toFixed(2)} zł</li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    // Gift Options
    if (order.giftOptions) {
        detailsHTML += `
            <div class="order-detail-section">
                <h3>Informacje o prezencie</h3>
                <p><strong>Odbiorca:</strong> ${order.giftOptions.recipientName}</p>
                <p><strong>Adres:</strong> ${order.giftOptions.recipientAddress}</p>
                ${order.giftOptions.greetingCard ? `
                    <p><strong>Tekst na karcie:</strong></p>
                    <p style="font-style: italic; padding: 10px; background: #f5f5f5; border-radius: 8px;">
                        "${order.giftOptions.greetingCard}"
                    </p>
                ` : ''}
            </div>
        `;
    }
    
    // Visualization
    if (order.visualizationUrl) {
        detailsHTML += `
            <div class="order-detail-section">
                <h3>Wizualizacja</h3>
                <img src="${order.visualizationUrl}" alt="Wizualizacja bukietu" class="visualization-preview">
            </div>
        `;
    }
    
    content.innerHTML = detailsHTML;
    modal.classList.add('show');
}

// Setup Modal Listeners
function setupModalListeners() {
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
}

// Close Modal
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}
