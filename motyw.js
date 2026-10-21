// =====================================================
//  MOTYW – zamienia ustawienia wyglądu na zmienne CSS
// =====================================================
// Kolejność ważności:
//   1. DOMYSLNY (poniżej)  2. wygląd strony z panelu  3. motyw artysty
// Każda wartość staje się zmienną CSS, np. akcentJasny -> --akcent-jasny

window.Koncertownik = window.Koncertownik || {};

Koncertownik.motyw = {

  DOMYSLNY: {
    tlo:          '#0a0814',
    tlo2:         '#120924',   // środek gradientu tła
    tloObraz:     '',          // link do zdjęcia tła (puste = brak)
    karta:        '#1a142a',   // tło sekcji
    ramka:        '#a855f7',   // obramowania
    akcent:       '#9333ea',
    akcentJasny:  '#c084fc',
    akcent2:      '#e879f9',   // pinezki, linki, plakietki
    tekst:        '#f3e8ff',
    tekstSlaby:   '#d8b4fe',
    font:         '',          // nazwa z Google Fonts (puste = systemowa)
    fontNaglowkow:'',
    globusLad:    '#6d28d9',
    globusOcean:  '#2a0f4f'
  },

  // Motyw strony (bez artysty)
  strony() {
    return { ...this.DOMYSLNY, ...bezPustych(Koncertownik.dane?.ustawienia?.motyw) };
  },

  // Nakłada motyw na stronę; nadpisanie = np. motyw artysty
  zastosuj(nadpisanie = {}) {
    const motyw = { ...this.strony(), ...bezPustych(nadpisanie) };
    const root = document.documentElement.style;

    Object.entries(motyw).forEach(([klucz, wartosc]) => {
      const nazwa = '--' + klucz.replace(/[A-Z]/g, l => '-' + l.toLowerCase());
      root.setProperty(nazwa, this.naCss(klucz, wartosc));
    });

    this.wczytajFont(motyw.font);
    this.wczytajFont(motyw.fontNaglowkow);
    this.aktualny = motyw;
    return motyw;
  },

  naCss(klucz, wartosc) {
    if (klucz === 'tloObraz') return wartosc ? `url("${wartosc}")` : 'none';
    if (klucz.startsWith('font')) {
      return wartosc ? `'${wartosc}', system-ui, sans-serif` : 'system-ui, -apple-system, sans-serif';
    }
    return wartosc;
  },

  // Dociąga czcionkę z Google Fonts (tylko raz)
  wczytajFont(nazwa) {
    if (!nazwa || document.querySelector(`link[data-font="${CSS.escape(nazwa)}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.dataset.font = nazwa;
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(nazwa.trim()).replace(/%20/g, '+')}&display=swap`;
    document.head.appendChild(link);
  }
};

// Pomija puste wartości, żeby nie zasłaniały domyślnych
function bezPustych(obj = {}) {
  return Object.fromEntries(Object.entries(obj || {}).filter(([, v]) => v !== '' && v != null));
}
