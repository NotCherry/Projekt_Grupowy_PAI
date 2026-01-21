/**
 * @file formularz.js
 * @brief Skrypt walidacji formularza
 * @details Obsługuje walidacje formularza
 */

const dateInput = document.getElementById("date-picker");
const timeInput = document.getElementById("time-picker");
const note = document.getElementById("form-note");

const now = new Date();
const today = now.toISOString().split("T")[0];

dateInput.min = today;

/** @brief Ustawia minimalną możliwą godzinę w polu czasu i wywołuje walidację czasu.*/
function updateMinTime() {
  const selectedDate = dateInput.value;

  if (selectedDate === today) {
    const h = now.getHours().toString().padStart(2, "0");
    const m = now.getMinutes().toString().padStart(2, "0");
    timeInput.min = `${h}:${m}`;
  } else {
    timeInput.min = "00:00";
  }

/** @brief wywołanie walidacji czasu */
  validateTime();
}

/** @brief Sprawdza poprawność wybranej godziny oraz w przypadku błędu wyświetla komunikat i czyści pole czasu.*/
function validateTime() {
  note.textContent = ""; 

  const selectedDate = dateInput.value;
  const selectedTime = timeInput.value;

  if (!selectedTime) return;

/** @brief Blokada nocna: 20:00–08:00 */
  const [hour] = selectedTime.split(":").map(Number);

  if (hour >= 20 || hour < 8) {
    note.textContent = "Godzina niedostępna (obsługujemy 08:00–20:00)";
    timeInput.value = ""; 
    return;
  }

/** @brief Blokada czasu z przeszslosci (tylko jeśli dziś) */
  if (selectedDate === today) {
    const currentTime = now.toTimeString().slice(0,5);

    if (selectedTime < currentTime) {
      note.textContent = "Nie można wybrać czasu z przeszłości";
      timeInput.value = "";
      return;
    }
  }
}

/** @brief Nasłuchiwanie zdarzeń - reaguje na zmianę daty i godziny*/
dateInput.addEventListener("change", updateMinTime);
timeInput.addEventListener("change", validateTime);

/** @brief Ustawia poprawne limity od razu po załadowaniu strony.*/
updateMinTime();
