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


//Licznik kwoty dla całości
function updateTotal() {
  let total1 = 0;
  let total2 = 0;
  const cards = document.querySelectorAll(".flower-card");
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
    const cards = document.querySelectorAll('.flower-card');
    const items = [];

    cards.forEach(card => {
        const name = card.querySelector('.flower-name').textContent;
        const count = parseInt(card.querySelector('.counter span').textContent);
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
