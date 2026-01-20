
const dateInput = document.getElementById("date-picker");
const timeInput = document.getElementById("time-picker");
const note = document.getElementById("form-note");

const now = new Date();
const today = now.toISOString().split("T")[0];

dateInput.min = today;

function updateMinTime() {
  const selectedDate = dateInput.value;

  if (selectedDate === today) {
    const h = now.getHours().toString().padStart(2, "0");
    const m = now.getMinutes().toString().padStart(2, "0");
    timeInput.min = `${h}:${m}`;
  } else {
    timeInput.min = "00:00";
  }

  validateTime();
}

//godziny
function validateTime() {
  note.textContent = ""; 

  const selectedDate = dateInput.value;
  const selectedTime = timeInput.value;

  if (!selectedTime) return;

  //Blokada nocna: 20:00–08:00 
  const [hour] = selectedTime.split(":").map(Number);

  if (hour >= 20 || hour < 8) {
    note.textContent = "Godzina niedostępna (obsługujemy 08:00–20:00)";
    timeInput.value = ""; 
    return;
  }

  //Blokada czasu z przeszslosci (tylko jeśli dziś)
  if (selectedDate === today) {
    const currentTime = now.toTimeString().slice(0,5);

    if (selectedTime < currentTime) {
      note.textContent = "Nie można wybrać czasu z przeszłości";
      timeInput.value = "";
      return;
    }
  }
}

dateInput.addEventListener("change", updateMinTime);
timeInput.addEventListener("change", validateTime);

updateMinTime();
