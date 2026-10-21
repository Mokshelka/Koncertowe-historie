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
lista.css      rozwijana lista artystów
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
artysta.js     podstrona artysty

admin.html     panel admina (logowanie)
admin.css      wygląd panelu
admin.js       logowanie i zakładki
admin-*.js     zakładki panelu: koncerty, artyści, miasta, wygląd, księga
baza.sql       budowa bazy w Supabase (uruchamiana raz)
```

## Jak dodać koncert, artystę, zmienić wygląd

Wejdź na `…/admin.html`, zaloguj się i korzystaj z zakładek.
Bilety wgrane przy koncercie są prywatne – widzisz je tylko Ty.

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
