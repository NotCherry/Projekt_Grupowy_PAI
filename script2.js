function changeCount(button, delta) {
  const card = button.closest(".flower-card");
  const counter = card.querySelector("span");
  const subtotalElement = card.querySelector(".subtotal");
  const price = parseFloat(card.dataset.price);
  
  //Licznik ilości kwiatów
  let value = parseInt(counter.textContent) + delta;
  if (value < 0) value = 0;
  counter.textContent = value;

  //Licznik kwoty dla konkretnego kwiatka
  const subtotal = value * price;
  subtotalElement.textContent = `Suma: ${subtotal} zł`;
  

  //Licznik kwoty dla całości
  updateTotal();
  
  //Lista - zawartość
  updateOrderList();
}



function changeCount2(button, delta) {
  const card = button.closest(".flower-card2");
  const counter = card.querySelector("span");
  const subtotalElement = card.querySelector(".subtotal");
  const price = parseFloat(card.dataset.price);

   // LIMIT PRODUKTU
  const maxLimit = 1;
  
  //Licznik ilości kwiatów
  let value = parseInt(counter.textContent) + delta;
  if (value < 0) value = 0;
  if (value > maxLimit) {
    value = maxLimit;
  }
  counter.textContent = value;

  //Licznik kwoty dla konkretnego kwiatka
  const subtotal = value * price;
  subtotalElement.textContent = `Suma: ${subtotal} zł`;

  // Wyłącz/aktywuj przyciski dla tego kwiatu
  const minusButton = card.querySelector('button:first-of-type');
  const plusButton = card.querySelector('button:last-of-type');
  minusButton.disabled = value === 0;
  plusButton.disabled = value === maxLimit;

  // BLOKADA innych produktów po osiągnięciu limitu
  const allCards = document.querySelectorAll(".flower-card2");
 allCards.forEach(c => {
    if (c !== card) {
      if (value === maxLimit) {
        c.classList.add("disabled"); // poszarzenie i blokada
      } else {
        c.classList.remove("disabled"); // odblokowanie
      }
    }
  });

  //Licznik kwoty dla całości
  updateTotal();

  //Lista - zawartość
  updateOrderList();
  
}


function changeCount3(button, delta) {
  const card = button.closest(".flower-card3");
  const counter = card.querySelector("span");
  const subtotalElement = card.querySelector(".subtotal");
  const price = parseFloat(card.dataset.price);

   // LIMIT PRODUKTU
  const maxLimit = 1;
  
  //Licznik ilości kwiatów
  let value = parseInt(counter.textContent) + delta;
  if (value < 0) value = 0;
  if (value > maxLimit) {
    value = maxLimit;
  }
  counter.textContent = value;

  //Licznik kwoty dla konkretnego kwiatka
  const subtotal = value * price;
  subtotalElement.textContent = `Suma: ${subtotal} zł`;

  // Wyłącz/aktywuj przyciski dla tego kwiatu
  const minusButton = card.querySelector('button:first-of-type');
  const plusButton = card.querySelector('button:last-of-type');
  minusButton.disabled = value === 0;
  plusButton.disabled = value === maxLimit;

  // BLOKADA innych produktów po osiągnięciu limitu
  const allCards = document.querySelectorAll(".flower-card3");
 allCards.forEach(c => {
    if (c !== card) {
      if (value === maxLimit) {
        c.classList.add("disabled"); // poszarzenie i blokada
      } else {
        c.classList.remove("disabled"); // odblokowanie
      }
    }
  });

  //Licznik kwoty dla całości
  updateTotal();
  
  //Lista - zawartość
  updateOrderList();
}


//Licznik kwoty dla całości
function updateTotal() {
  let total1 = 0;
  let total2 = 0;
  const cards = document.querySelectorAll(".flower-card, .flower-card2, .flower-card3");
  cards.forEach(card => {
    const price = parseFloat(card.dataset.price);
    const count = parseInt(card.querySelector("span").textContent);
    total1 += price * count;
    total2 += price * count;
  });

  document.getElementById("total1").textContent = `Cała suma: ${total1} zł`;
  document.getElementById("total2").textContent = `Cała suma: ${total2} zł`;
}

//Lista - zawartość
function updateOrderList() {
    const cards = document.querySelectorAll('.flower-card, .flower-card2, .flower-card3');
    const items = [];

    cards.forEach(card => {
        const name = card.querySelector('.flower-name').textContent;
        const count = parseInt(card.querySelector('span').textContent);
        const price = card.querySelector('.subtotal').textContent;

        if (count > 0) {
            items.push(`${name} x${count} = ${price}`);
        }
    });

    // wstawianie do SVG
    const tspan = document.getElementById("orderItems");
    if (tspan) {
        tspan.textContent = items.join(",\n");
        
    }
}