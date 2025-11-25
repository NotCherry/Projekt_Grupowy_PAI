const backendUrl = 'http://localhost:9000';  

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
});

async function listujProdukty({endpoint, className, klasaKarty, funkcjaLicznika}) {
    const rodzic = document.getElementsByClassName(className)[0];
    if (!rodzic) {
        console.warn(`Nie znaleziono elementu z id '${className}'.`);
        return;
    }
    
    const odpowiedz = await fetch(backendUrl+endpoint);
    if (!odpowiedz.ok) {
        throw new Error(`Błąd pobierania z ${endpoint}: ${odpowiedz.status}`);
    }
    const produkty = await odpowiedz.json();
    
    produkty.forEach(produkt => {
        const szablon = document.createElement("template");
        const divMax = produkt.max_quantity > 0 ? `<div class="max">(max ${produkt.max_quantity} sztuka)</div>` : '';
        szablon.innerHTML = `
            <div class="${klasaKarty}" data-price="${produkt.price}">
                <img src="${backendUrl+produkt.image}" alt="${produkt.name}">
                <div class="flower-name">${produkt.name}</div>
                <div class="price">Cena: ${produkt.price} zł</div>
                ${divMax}
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
}
