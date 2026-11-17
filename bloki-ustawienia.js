// =====================================================
//  BLOKI – SZUFLADA Z USTAWIENIAMI BLOKU
// =====================================================
// Każde pole ma atrybut data-k z „adresem” w bloku, np.
//   data-k="styl.tlo"  albo  data-k="dane.podpis"  albo  data-k="szer"
// Zmiana pola od razu przerysowuje blok (podgląd na żywo).

Object.assign(Koncertownik.edycjaBlokow, {

  CZCIONKI: ['Bebas Neue', 'Metal Mania', 'Pirata One', 'Creepster', 'UnifrakturMaguntia', 'Cinzel',
             'Permanent Marker', 'Caveat', 'Rock Salt', 'Special Elite', 'Righteous', 'Monoton',
             'Poppins', 'Montserrat', 'Oswald', 'Playfair Display', 'Noto Sans JP', 'Zen Maru Gothic'],

  ustawienia(id) {
    const b = this.znajdz(id);
    if (!b) return;
    document.querySelectorAll('.blok.wybrany').forEach(x => x.classList.remove('wybrany'));
    document.querySelector(`[data-blok="${id}"]`)?.classList.add('wybrany');
    this.wybrany = id;

    const s = b.styl || (b.styl = {});
    const T = Koncertownik.bloki.TYPY[b.typ];
    const szuflada = document.getElementById('szuflada');
    const opcje = (lista, akt) => lista.map(([v, n]) => `<option value="${v}" ${String(akt ?? '') === String(v) ? 'selected' : ''}>${n}</option>`).join('');

    szuflada.innerHTML = `
      <form class="formularz" onsubmit="return false">
        <div class="szuflada-naglowek">
          <h2>${Koncertownik.ikony.html(T.ikona)} ${T.nazwa}</h2>
          <button type="button" class="btn-ikona" data-zamknij title="Zamknij"><i class="ph ph-x"></i></button>
        </div>

        ${this.poleTresci(b)}

        <details open><summary><i class="ph ph-arrows-out"></i> Rozmiar</summary>
          <label>Szerokość
            <select data-k="szer">${opcje([[3, '¼ strony'], [4, '⅓ strony'], [6, 'Połowa'], [8, '⅔ strony'], [9, '¾ strony'], [12, 'Cała szerokość']], b.szer)}</select>
          </label>
          ${b.typ === 'kolaz' ? '' : `
          <label>Wysokość: <b data-wartosc="wys">${b.wys ? b.wys + ' px' : 'automatyczna'}</b>
            <input type="range" min="0" max="900" step="10" data-k="wys" value="${b.wys || 0}">
          </label>`}
          <small class="podpowiedz">Rozmiar zmienisz też, ciągnąc za prawy dolny róg bloku.</small>
        </details>

        <details ${s.tloObraz || s.tlo ? 'open' : ''}><summary><i class="ph ph-image"></i> Tło bloku</summary>
          <label class="pole-wyboru"><input type="checkbox" data-k="styl.przezroczysty" ${s.przezroczysty ? 'checked' : ''}> Bez karty (przezroczysty)</label>
          ${this.poleKoloru('styl.tlo', 'Kolor tła', s.tlo)}
          ${this.poleObrazu('styl.tloObraz', 'Zdjęcie w tle', s.tloObraz)}
          ${this.suwak('styl.przyciemnienie', 'Przyciemnienie zdjęcia', s.przyciemnienie || 0, 0, 90, 5, '%')}
          ${this.suwak('styl.rozmycie', 'Rozmycie zdjęcia', s.rozmycie || 0, 0, 20, 1, 'px')}
          <label>Tekstura
            <select data-k="styl.tekstura">${opcje([['', 'Brak'], ['ziarno', 'Ziarno (jak na kliszy)'], ['papier', 'Papier'], ['kratka', 'Kratka'], ['linie', 'Linie z zeszytu'], ['kropki', 'Kropki'], ['brokat', 'Brokat ✨']], s.tekstura)}</select>
          </label>
        </details>

        <details><summary><i class="ph ph-frame-corners"></i> Ramka i kształt</summary>
          <label>Ramka
            <select data-k="styl.ramka">${opcje([['', 'Zwykła'], ['brak', 'Bez ramki'], ['gruba', 'Gruba'], ['przerywana', 'Przerywana'], ['neon', 'Neon'], ['polaroid', 'Polaroid'], ['tasma', 'Przyklejona taśmą']], s.ramka)}</select>
          </label>
          ${this.suwak('styl.zaokraglenie', 'Zaokrąglenie rogów', s.zaokraglenie ?? 16, 0, 48, 2, 'px')}
          ${this.suwak('styl.odstep', 'Odstęp od krawędzi', s.odstep ?? 18, 0, 60, 2, 'px')}
        </details>

        <details><summary><i class="ph ph-text-aa"></i> Tekst</summary>
          <label>Czcionka
            <input type="text" data-k="styl.czcionka" value="${Koncertownik.narzedzia.esc(s.czcionka || '')}" list="czcionkiBlokow" placeholder="jak na całej stronie">
            <datalist id="czcionkiBlokow">${this.CZCIONKI.map(f => `<option value="${f}">`).join('')}</datalist>
          </label>
          ${this.suwak('styl.rozmiar', 'Wielkość tekstu', s.rozmiar || 1, 0.6, 2.5, 0.1, '×')}
          ${this.poleKoloru('styl.kolor', 'Kolor tekstu', s.kolor)}
          <label>Wyrównanie
            <select data-k="styl.wyrownanie">${opcje([['lewo', 'Do lewej'], ['srodek', 'Do środka'], ['prawo', 'Do prawej']], s.wyrownanie || 'lewo')}</select>
          </label>
          <label>Efekt
            <select data-k="styl.efekt">${opcje([['', 'Brak'], ['poswiata', 'Poświata'], ['cien', 'Cień'], ['neon', 'Neon'], ['obrys', 'Sam obrys liter'], ['gradient', 'Kolorowy gradient']], s.efekt)}</select>
          </label>
        </details>

        <details><summary><i class="ph ph-sparkle"></i> Animacja</summary>
          <label>Ruch bloku
            <select data-k="styl.animacja">${opcje([['', 'Bez ruchu'], ['wejscie', 'Pojawia się przy przewijaniu'], ['unoszenie', 'Unosi się'], ['puls', 'Pulsuje'], ['kolysanie', 'Kołysze się']], s.animacja)}</select>
          </label>
        </details>

        <div class="szuflada-stopka">
          <button type="button" class="btn" data-zamknij><i class="ph ph-check"></i> Gotowe</button>
          <small class="podpowiedz">Na koniec kliknij „Zapisz układ” na dolnym pasku.</small>
        </div>
      </form>`;
    szuflada.hidden = false;

    const form = szuflada.querySelector('form');
    const zmien = () => { this.odczytajFormularz(form, b); this.odswiez(b); };
    form.addEventListener('input', e => { if (!e.target.closest('.szukaj-ikon, [data-bez-podgladu]')) zmien(); });
    form.addEventListener('change', e => { if (e.target.type === 'checkbox' || e.target.tagName === 'SELECT') zmien(); });
    form.querySelectorAll('[data-zamknij]').forEach(x => x.onclick = () => this.zamknijUstawienia());
    this.podepnijPolaSpecjalne(form, b, zmien);
  },

  zamknijUstawienia() {
    document.getElementById('szuflada').hidden = true;
    document.querySelectorAll('.blok.wybrany').forEach(x => x.classList.remove('wybrany'));
    this.wybrany = null;
  },

  // --- Pola treści zależne od rodzaju bloku ---
  poleTresci(b) {
    const d = b.dane;
    const { esc } = Koncertownik.narzedzia;
    const opcje = (lista, akt) => lista.map(([v, n]) => `<option value="${v}" ${String(akt ?? '') === String(v) ? 'selected' : ''}>${n}</option>`).join('');
    const sekcja = srodek => `<details open><summary><i class="ph ph-note-pencil"></i> Treść</summary>${srodek}</details>`;

    switch (b.typ) {
      case 'naglowek':
        return sekcja(`<small class="podpowiedz">Kliknij nagłówek na stronie i pisz bezpośrednio w nim.</small>`);
      case 'tekst':
        return sekcja(`<small class="podpowiedz">Kliknij tekst na stronie i pisz. Nad tekstem pojawi się pasek do pogrubienia, kolorów i list.</small>`);
      case 'zdjecie':
        return sekcja(`
          ${this.poleObrazu('dane.src', 'Zdjęcie', d.src)}
          <label>Podpis <input type="text" data-k="dane.podpis" value="${esc(d.podpis || '')}"></label>
          <label>Dopasowanie
            <select data-k="dane.dopasowanie">${opcje([['cover', 'Wypełnij blok (przytnij)'], ['contain', 'Pokaż całe zdjęcie']], d.dopasowanie)}</select>
          </label>`);
      case 'galeria':
        return sekcja(`
          <div class="miniatury">${(d.zdjecia || []).map((z, i) => `
            <div class="miniatura"><img src="${esc(z.src)}" alt=""><button type="button" data-usun-zdjecie="${i}" title="Usuń"><i class="ph ph-x"></i></button></div>`).join('')}</div>
          <label class="btn btn-maly">Dodaj zdjęcia <input type="file" accept="image/*" multiple hidden data-galeria-pliki></label>
          <label>…albo link (Dysk Google, https://…) <input type="text" data-galeria-link data-bez-podgladu placeholder="wklej i naciśnij Enter"></label>
          <label>Kolumny <select data-k="dane.kolumny">${opcje([[2, '2'], [3, '3'], [4, '4'], [5, '5']], d.kolumny || 3)}</select></label>`);
      case 'cytat':
        return sekcja(`<small class="podpowiedz">Kliknij cytat albo autora na stronie i pisz bezpośrednio.</small>`);
      case 'wideo':
        return sekcja(`<label>Link do YouTube albo Dysku Google <input type="text" data-k="dane.link" value="${esc(d.link || '')}" placeholder="https://youtu.be/…"></label>`);
      case 'spotify':
        return sekcja(`<label>Link ze Spotify (piosenka, płyta, playlista, artysta)
            <input type="text" data-k="dane.link" value="${esc(d.link || '')}" placeholder="https://open.spotify.com/…"></label>
          <small class="podpowiedz">W Spotify: ⋯ → Udostępnij → Kopiuj link.</small>`);
      case 'naklejka':
        return sekcja(`
          <input type="hidden" data-k="dane.ikona" value="${esc(d.ikona || 'star')}">
          <div data-wybierak-naklejki></div>
          ${this.suwak('dane.rozmiar', 'Wielkość naklejki', d.rozmiar || 5, 2, 14, 0.5, 'rem')}`);
      case 'kolaz':
        return sekcja(`
          <small class="podpowiedz">Elementy dodajesz przyciskami <i class="ph ph-image"></i> <i class="ph ph-text-t"></i> <i class="ph ph-sticker"></i> nad kolażem.
            Kliknij element, żeby go przesuwać, powiększać (róg) i obracać (kółko u góry). Dwuklik na tekście – edycja.</small>
          <label>Kształt kolażu
            <select data-k="dane.proporcja">${opcje([[2, 'Bardzo szeroki'], [1.6, 'Poziomy'], [1, 'Kwadrat'], [0.8, 'Pionowy'], [0.6, 'Wysoki']], d.proporcja)}</select>
          </label>`);
      case 'setlista': {
        const koncerty = Koncertownik.narzedzia.koncertyArtysty(this.S.artysta.id);
        return sekcja(`<label>Koncert
          <select data-k="dane.koncertId"><option value="">— wybierz —</option>
            ${koncerty.map(k => `<option value="${k.id}" ${k.id === d.koncertId ? 'selected' : ''}>${esc(Koncertownik.narzedzia.data(k.data))}${k.miasto ? ' · ' + esc(k.miasto) : ''}</option>`).join('')}
          </select></label>`);
      }
      case 'koncerty':
        return sekcja(`<small class="podpowiedz">Tu wyświetlają się Twoje koncerty z setlistami, zdjęciami i nagraniami. Możesz zmienić rozmiar i wygląd tego bloku.</small>`);
      default:
        return '';
    }
  },

  // --- Małe „klocki” formularza ---
  suwak(k, nazwa, wartosc, min, max, krok, jedn) {
    return `<label>${nazwa}: <b data-wartosc="${k}">${wartosc}${jedn}</b>
      <input type="range" min="${min}" max="${max}" step="${krok}" data-k="${k}" data-jedn="${jedn}" value="${wartosc}"></label>`;
  },

  poleKoloru(k, nazwa, wartosc) {
    return `<div class="pole-kolor-opc">${nazwa}
      <input type="color" data-kolor-dla="${k}" value="${/^#[0-9a-f]{6}$/i.test(wartosc || '') ? wartosc : '#000000'}">
      <input type="hidden" data-k="${k}" value="${wartosc || ''}">
      <button type="button" class="btn btn-maly btn-szary" data-wyczysc-k="${k}">${wartosc ? 'Usuń' : 'Brak'}</button>
    </div>`;
  },

  poleObrazu(k, nazwa, wartosc) {
    const { esc } = Koncertownik.narzedzia;
    return `<div class="pole-obraz">${nazwa}
      <input type="hidden" data-k="${k}" value="${esc(wartosc || '')}">
      <img class="podglad-obrazu" src="${esc(wartosc || '')}" alt="" ${wartosc ? '' : 'hidden'}>
      <div class="rzad">
        <label class="btn btn-maly">Wgraj z urządzenia <input type="file" accept="image/*" hidden data-wgraj-k="${k}"></label>
        <button type="button" class="btn btn-maly btn-usun" data-wyczysc-k="${k}">Usuń</button>
      </div>
      <input type="text" data-link-k="${k}" data-bez-podgladu placeholder="…albo wklej link (Dysk Google, https://…) i Enter">
    </div>`;
  },

  // Odczyt wszystkich pól data-k do bloku
  odczytajFormularz(form, b) {
    form.querySelectorAll('[data-k]').forEach(pole => {
      const sciezka = pole.dataset.k.split('.');
      let w;
      if (pole.type === 'checkbox') w = pole.checked;
      else if (pole.type === 'range' || ['szer', 'wys'].includes(pole.dataset.k) || /kolumny|proporcja|rozmiar/.test(pole.dataset.k)) w = pole.value === '' ? '' : Number(pole.value);
      else w = pole.value;
      if (sciezka.length === 1) b[sciezka[0]] = w;
      else (b[sciezka[0]] ||= {})[sciezka[1]] = w;
      const etykieta = form.querySelector(`[data-wartosc="${pole.dataset.k}"]`);
      if (etykieta) etykieta.textContent = pole.dataset.k === 'wys' ? (w ? w + ' px' : 'automatyczna') : w + (pole.dataset.jedn || '');
    });
  },

  // Kolory, obrazki, galeria i naklejka potrzebują własnej obsługi
  podepnijPolaSpecjalne(form, b, zmien) {
    const ustaw = (k, w) => { const p = form.querySelector(`[data-k="${k}"]`); p.value = w; return p; };
    const odswiezObraz = (k, url) => {
      ustaw(k, url);
      const img = form.querySelector(`[data-k="${k}"]`).parentElement.querySelector('.podglad-obrazu');
      if (img) { img.src = url; img.hidden = !url; }
      zmien();
    };

    form.querySelectorAll('[data-kolor-dla]').forEach(c => c.addEventListener('input', () => {
      ustaw(c.dataset.kolorDla, c.value);
      form.querySelector(`[data-wyczysc-k="${c.dataset.kolorDla}"]`).textContent = 'Usuń';
    }));
    form.querySelectorAll('[data-wyczysc-k]').forEach(btn => btn.onclick = () => {
      const k = btn.dataset.wyczyscK;
      if (form.querySelector(`[data-wgraj-k="${k}"]`)) odswiezObraz(k, '');
      else { ustaw(k, ''); btn.textContent = 'Brak'; zmien(); }
    });
    form.querySelectorAll('[data-wgraj-k]').forEach(inp => inp.addEventListener('change', async () => {
      if (!inp.files[0]) return;
      const url = await this.wgrajObraz(inp.files[0]);
      if (url) odswiezObraz(inp.dataset.wgrajK, url);
    }));
    form.querySelectorAll('[data-link-k]').forEach(inp => inp.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const url = this.obrazZLinku(inp.value);
      if (!url) return Koncertownik.admin.komunikat('To nie wygląda na link do zdjęcia', true);
      odswiezObraz(inp.dataset.linkK, url);
      inp.value = '';
    }));

    // Galeria
    const galeria = form.querySelector('[data-galeria-pliki]');
    if (galeria) {
      const przerysuj = () => { this.odswiez(b); this.ustawienia(b.id); };
      galeria.addEventListener('change', async () => {
        for (const plik of galeria.files) {
          const url = await this.wgrajObraz(plik);
          if (url) b.dane.zdjecia.push({ src: url });
        }
        przerysuj();
      });
      form.querySelector('[data-galeria-link]').addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const url = this.obrazZLinku(e.target.value);
        if (url) { b.dane.zdjecia.push({ src: url }); przerysuj(); }
      });
      form.querySelectorAll('[data-usun-zdjecie]').forEach(x => x.onclick = () => {
        b.dane.zdjecia.splice(Number(x.dataset.usunZdjecie), 1);
        przerysuj();
      });
    }

    // Naklejka – wybór ikony z biblioteki
    const wyb = form.querySelector('[data-wybierak-naklejki]');
    if (wyb) {
      Koncertownik.admin.bibliotekaIkon.wybierak(wyb, {
        aktualna: b.dane.ikona, podpis: 'Naklejka',
        przyNazwie: n => { ustaw('dane.ikona', n); zmien(); }
      });
    }
  }
});
