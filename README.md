# Projekt Grupowy Pai - Frontend

Aplikacja webowa do tworzenia zamówień bukietów kwiatów.

## Technologie

- HTML5
- CSS3
- Vanilla JavaScript (bez frameworków)

## Wymagania

- Przeglądarka webowa (Chrome, Firefox, Edge)
- Python 3 (opcjonalnie, do uruchomienia serwera HTTP)

## Szybki Start

### Opcja 1: Otwarcie w przeglądarce

Otwórz plik index.html bezpośrednio w przeglądarce


### Opcja 2: Lokalny serwer HTTP (zalecane)

python -m http.server 3000
Otwórz w przeglądarce:
http://localhost:3000


## Konfiguracja

Przed uruchomieniem zaktualizuj adres API w plikach `script.js` i `history.js`:

const API_BASE = 'http://localhost:8001/api'; // Zmień na adres swojego backendu

## Struktura

```
Projekt_Grupowy_PAI/
├── index.html # Strona główna - kreator bukietów
├── history.html # Historia zamówień
├── styles.css # Style CSS
├── script.js # Logika strony głównej
└── history.js # Logika historii
```

## Funkcjonalności

- Wybór kwiatów i ilości
- Wybór papierów ozdobnych i wstążek
- Automatyczne obliczanie ceny
- Opcja prezentu z kartą z życzeniami
- Generowanie wizualizacji AI
- Historia zamówień

## Backend

Frontend wymaga działającego backendu. Zobacz repozytorium:
[Projekt_Grupowy_PAI_Backend](https://github.com/NotCherry/Projekt_Grupowy_PAI_Backend)

