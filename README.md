# 🎵 Koncertownik

Strona: https://mokshelka.github.io/Koncertowe-historie/ · Panel: …/admin.html

Mój cyfrowy pamiętnik koncertowy: globus z miastami, artyści, setlisty i nagrania.

## Struktura plików

Wszystkie pliki leżą w jednym folderze (łatwiej wgrywać na GitHuba):

```
index.html     strona główna (globus, artyści, księga gości)
artysta.html   podstrona artysty – jeden szablon dla wszystkich

base.css       wspólny wygląd (kolory = zmienne z motywu)
globe.css      globus i plakietki miast
lista.css      siatka kafelków artystów
ksiega.css     formularz księgi gości
artysta.css    podstrona artysty

supabase.js    połączenie z bazą (adres + klucz publiczny)
dane.js        pobiera treść strony z bazy
narzedzia.js   małe funkcje pomocnicze (daty, YouTube…)
motyw.js       zamienia motyw z dane.js na kolory i czcionki
glowna.js      uruchamia stronę główną
globe.js       globus
miasta.js      plakietki miast
lista.js       lista artystów
ksiega.js      księga gości
artysta.js     podstrona artysty (nagłówek, koncerty, galeria)
media.js       zdjęcia, nagrania, bilety (pliki, YouTube, Dysk Google)
ikony.js       ikony Phosphor

artysta-edycja*.js / .css   tryb edycji na stronie artysty (po zalogowaniu)

bloki.js / bloki.css        bloki strony artysty (tekst, zdjęcia, kolaż, Spotify…)
bloki-edycja.js / .css      edytor bloków: dodawanie, przesuwanie, rozmiar
bloki-ustawienia.js         szuflada z ustawieniami bloku (tło, ramka, tekst, animacja)
bloki-kolaz.js              swobodne układanie elementów w kolażu

admin.html     panel admina (logowanie)
admin.css      wygląd panelu
admin.js       logowanie i zakładki
admin-*.js     zakładki panelu: koncerty, artyści, miasta, wygląd, księga
baza.sql       budowa bazy w Supabase (uruchamiana raz)
media.sql      tabela media + opis artysty (uruchamiana raz, po baza.sql)
bloki.sql      kolumna z blokami stron artystów (uruchamiana raz, po media.sql)
```

## Jak dodać koncert, artystę, zmienić wygląd

Wejdź na `…/admin.html` i zaloguj się. Koncerty, miasta, wygląd całej strony
i księgę gości edytujesz w zakładkach panelu.

Stronę artysty urządzasz na niej samej: Artyści → „Strona i wygląd”. Po zalogowaniu
na dole jest pasek edycji: wygląd (ikona, logo, baner, opis, ikony w tle, kolory,
czcionki, kształt kart), a przy koncertach przyciski do dodawania zdjęć, nagrań,
biletów i folderów z Dysku Google. Każdą rzecz można ustawić jako publiczną
albo prywatną (kłódka). Bilety są zawsze prywatne.

**Bloki:** przycisk „+ Blok” dodaje nagłówek, tekst, zdjęcie, galerię, cytat, wideo,
Spotify, naklejkę, kolaż, setlistę, koncerty albo odstęp. Blok przesuwasz uchwytem ⠿,
rozmiar zmieniasz, ciągnąc za prawy dolny róg, a ⚙ otwiera ustawienia (tło ze zdjęcia,
tekstura, ramka, czcionka, efekt, animacja). Na koniec „Zapisz układ”.

## Publikacja na GitHub Pages

1. Na github.com: **New repository** → nazwa np. `koncertownik` → **Public**.
2. **Add file → Upload files** → przeciągnij całą zawartość tego folderu.
3. **Settings → Pages** → Source: *Deploy from a branch* → `main` / `(root)` → Save.
4. Po minucie strona działa pod `https://TWOJ-NICK.github.io/koncertownik/`.

⚠️ Repozytorium jest publiczne – nie wrzucaj tu biletów ani innych prywatnych plików.
Bilety trzymamy w prywatnym schowku Supabase (wgrywasz je w panelu).

## Plan

- [x] Podział kodu, jedno miejsce na dane, motywy artystów
- [x] Konto Supabase
- [x] Panel admina: koncerty, filmy, motywy, wygląd całej strony
- [x] Prywatne bilety
- [x] Zapisywanie księgi gości
- [x] Kafelki artystów i ikony
- [x] Strona artysty w klimacie zespołu + zdjęcia/nagrania/bilety publiczne i prywatne
- [x] Bloki i kolaż na stronach artystów (edytor bez kodu)
