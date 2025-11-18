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


//Licznik kwoty dla całości
function updateTotal() {
  let total = 0;
  const cards = document.querySelectorAll(".flower-card");
  cards.forEach(card => {
    const price = parseFloat(card.dataset.price);
    const count = parseInt(card.querySelector("span").textContent);
    total += price * count;
  });

  document.getElementById("total").textContent = `Cała suma: ${total} zł`;
}
