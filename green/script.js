function changeCount(button, delta) {
  const card = button.closest(".green-card");
  const counter = card.querySelector("span");
  const subtotalElement = card.querySelector(".subtotal");
  const price = parseFloat(card.dataset.price);
  
  
  let value = parseInt(counter.textContent) + delta;
  if (value < 0) value = 0;
  counter.textContent = value;

  //LICZENIE SUMY DLA KONKRETNEJ KARTKI
  const subtotal = value * price;
  subtotalElement.textContent = `Suma: ${subtotal} zł`;

  
  //LICZENIE SUMY OGOLNEJ
  updateTotal();

}

function updateTotal() {
  let total = 0;
  const cards = document.querySelectorAll(".green-card");
  cards.forEach(card => {
    const price = parseFloat(card.dataset.price);
    const count = parseInt(card.querySelector("span").textContent);
    total += price * count;
  });

  document.getElementById("total").textContent = `Łączna suma: ${total} zł`;
}
