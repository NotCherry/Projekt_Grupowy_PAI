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
  
}


//Licznik kwoty dla całości
function updateTotal() {
  let total = 0;
  const cards = document.querySelectorAll(".flower-card, .flower-card2, .flower-card3");
  cards.forEach(card => {
    const price = parseFloat(card.dataset.price);
    const count = parseInt(card.querySelector("span").textContent);
    total += price * count;
  });

  document.getElementById("total").textContent = `Cała suma: ${total} zł`;
}
