// =====================================================
//  PANEL – biblioteka ikon (wszystkie ~1500 ikon Phosphor)
// =====================================================
// Lista nazw jest pobierana z pliku stylów biblioteki,
// więc zawsze jest aktualna. Szukać można po angielsku
// albo po polsku (proste tłumaczenia poniżej).

Koncertownik.admin.bibliotekaIkon = {

  URL: 'https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/regular/style.css',
  MAX_WYNIKOW: 120,

  // Polskie słowa -> angielskie nazwy ikon
  SLOWNIK: {
    czaszka: 'skull', korona: 'crown', miecz: 'sword', tarcza: 'shield', topor: 'axe',
    piorun: 'lightning', ogien: 'fire', plomien: 'flame', kropla: 'drop', krew: 'drop',
    serce: 'heart', kwiat: 'flower', roza: 'flower', motyl: 'butterfly', pioro: 'feather',
    ptak: 'bird', lisc: 'leaf', ksiezyc: 'moon', slonce: 'sun', gwiazda: 'star',
    planeta: 'planet', chmura: 'cloud', maska: 'mask', oko: 'eye', robak: 'bug',
    owad: 'bug', diament: 'diamond', kompas: 'compass', kotwica: 'anchor', wiatr: 'wind',
    gitara: 'guitar', pianino: 'piano', mikrofon: 'microphone', sluchawki: 'headphones',
    plyta: 'vinyl', muzyka: 'music', nuta: 'music', duch: 'ghost', kot: 'cat', pies: 'dog',
    rakieta: 'rocket', klucz: 'key', zamek: 'castle', kamera: 'camera', film: 'film',
    kapelusz: 'hat', okulary: 'sunglasses', reka: 'hand', usmiech: 'smiley', fala: 'wave',
    gora: 'mountain', drzewo: 'tree', ryba: 'fish', pajak: 'spider', waz: 'snake',
    bilet: 'ticket', swieca: 'candle', krzyz: 'cross', paleta: 'palette'
  },

  // Pobiera nazwy ikon (tylko raz)
  async nazwy() {
    if (this._nazwy) return this._nazwy;
    const css = await fetch(this.URL).then(r => r.text());
    this._nazwy = [...new Set([...css.matchAll(/\.ph-([a-z0-9-]+):before/g)].map(m => m[1]))];
    return this._nazwy;
  },

  // Bez polskich znaków i wielkich liter
  normalizuj(tekst) {
    return tekst.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').trim();
  },

  async szukaj(fraza) {
    const wszystkie = await this.nazwy();
    const f = this.normalizuj(fraza);
    if (!f) return wszystkie.slice(0, this.MAX_WYNIKOW);
    const ang = Object.entries(this.SLOWNIK).filter(([pl]) => pl.startsWith(f)).map(([, en]) => en);
    const szukane = [f, ...ang];
    return wszystkie.filter(n => szukane.some(s => n.includes(s))).slice(0, this.MAX_WYNIKOW);
  },

  // Gotowy „wybierak” ikon: podgląd, wyszukiwarka, siatka.
  // przyNazwie(nazwa) wywołuje się po kliknięciu ikony.
  wybierak(kontener, { aktualna = '', podpis = 'Wybrana', przyNazwie }) {
    const I = Koncertownik.ikony;
    const esc = Koncertownik.narzedzia.esc;
    const przyciski = (nazwy, wybrana) => nazwy.map(n => `
      <button type="button" class="ikona-opcja ${n === wybrana ? 'wybrana' : ''}" data-ikona="${n}" title="${n}">
        ${I.html(n, 'duotone')}
      </button>`).join('');

    kontener.innerHTML = `
      ${podpis ? `<div class="wybrana-ikona">
        <span class="podglad-ikony">${I.html(aktualna || I.DOMYSLNA, 'duotone')}</span>
        <span>${podpis}: <b class="nazwa-ikony">${esc(aktualna || I.DOMYSLNA)}</b></span>
      </div>` : ''}
      <input type="search" class="szukaj-ikon" placeholder="Szukaj ikony: czaszka, róża, guitar, moon…" autocomplete="off">
      <div class="wybor-ikon">${przyciski(I.LISTA, aktualna)}</div>
      <small class="podpowiedz info-ikon">Propozycje na start – wpisz coś, żeby przeszukać ponad 1500 ikon.</small>`;

    const siatka = kontener.querySelector('.wybor-ikon');
    const info = kontener.querySelector('.info-ikon');
    const pole = kontener.querySelector('.szukaj-ikon');
    let wybrana = aktualna;

    siatka.addEventListener('click', e => {
      const b = e.target.closest('.ikona-opcja');
      if (!b) return;
      wybrana = b.dataset.ikona;
      siatka.querySelectorAll('.ikona-opcja').forEach(x => x.classList.toggle('wybrana', x === b));
      if (podpis) {
        kontener.querySelector('.nazwa-ikony').textContent = wybrana;
        kontener.querySelector('.podglad-ikony').innerHTML = I.html(wybrana, 'duotone');
      }
      przyNazwie?.(wybrana);
    });

    let timer;
    pole.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });
    pole.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const fraza = pole.value.trim();
        try {
          const lista = fraza ? await this.szukaj(fraza) : I.LISTA;
          siatka.innerHTML = przyciski(lista, wybrana);
          info.textContent = !fraza ? 'Propozycje na start.'
            : lista.length ? `Znaleziono: ${lista.length}${lista.length === this.MAX_WYNIKOW ? '+' : ''}`
            : 'Nic nie znaleziono – spróbuj innego słowa (np. po angielsku).';
        } catch {
          info.textContent = 'Nie udało się wczytać biblioteki ikon – sprawdź internet.';
        }
      }, 250);
    });
  }
};
