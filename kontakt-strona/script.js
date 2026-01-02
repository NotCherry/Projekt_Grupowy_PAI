
const phoneInput = document.querySelector('input[type="tel"]');

phoneInput.addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '');
    if (this.value.length > 9) {
        this.value = this.value.slice(0, 9);
    }
});
