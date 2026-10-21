# 🎵 Koncertownik

Mój cyfrowy pamiętnik koncertowy: globus z miastami, artyści, setlisty i nagrania.

## Struktura plików

```
index.html        strona główna (globus, artyści, księga gości)
artysta.html      podstrona artysty – jeden szablon dla wszystkich
css/
  base.css        wspólny wygląd (kolory = zmienne z motywu)
  globe.css       globus i plakietki miast
  lista.css       rozwijana lista artystów
  ksiega.css      formularz księgi gości
  artysta.css     podstrona artysty
js/
  dane.js         ⭐ CAŁA TREŚĆ STRONY – tu dopisujesz koncerty
  narzedzia.js    małe funkcje pomocnicze (daty, YouTube…)
  motyw.js        zamienia motyw z dane.js na kolory i czcionki
  glowna.js       uruchamia stronę główną
  globe.js        globus
  miasta.js       plakietki miast
  lista.js        lista artystów
  ksiega.js       księga gości (na razie bez zapisu)
  artysta.js      podstrona artysty
```

## Jak dodać koncert

Otwórz `js/dane.js` i dopisz w `koncerty`:

```js
{
  artysta: 'nothing-but-thieves',   // id z listy artystów
  data: '2025-03-14',
  miasto: 'Warszawa',               // musi być na liście miast
  miejsce: 'COS Torwar',
  setlista: ['Amsterdam', 'Sorry'],
  filmy: ['https://youtu.be/XXXXXXXXXXX']
},
```

Nowe miasto? Dopisz je w `miasta` (współrzędne znajdziesz w Google Maps:
prawy klik na mapie → pierwsza liczba to szerokość, druga to długość;
w pliku wpisujemy je odwrotnie: `[długość, szerokość]`).

## Jak zmienić motyw artysty

W `artysci` dodaj artyście `motyw` z wartościami, które mają się różnić
od domyślnych (lista wszystkich jest w `ustawienia.motyw`). Czcionki to
nazwy z [Google Fonts](https://fonts.google.com).

## Publikacja na GitHub Pages

1. Na github.com: **New repository** → nazwa np. `koncertownik` → **Public**.
2. **Add file → Upload files** → przeciągnij całą zawartość tego folderu.
3. **Settings → Pages** → Source: *Deploy from a branch* → `main` / `(root)` → Save.
4. Po minucie strona działa pod `https://TWOJ-NICK.github.io/koncertownik/`.

⚠️ Repozytorium jest publiczne – nie wrzucaj tu biletów ani innych prywatnych plików.
Na nie przygotujemy prywatny schowek w Supabase.

## Plan

- [x] Podział kodu, jedno miejsce na dane, motywy artystów
- [ ] Konto Supabase
- [ ] Panel admina: koncerty, filmy, motywy, wygląd całej strony
- [ ] Prywatne bilety
- [ ] Zapisywanie księgi gości
