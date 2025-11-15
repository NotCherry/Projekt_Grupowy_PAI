const radios = document.querySelectorAll('input[name="papier"]');
const info = document.getElementById('selected-info');

radios.forEach(radio => {
  radio.addEventListener('change', () => {
    info.textContent = `Wybrano: ${radio.value} — ${radio.dataset.price} zł`;
  });
});

