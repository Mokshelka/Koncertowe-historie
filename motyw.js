// =====================================================
//  MOTYW – zamienia ustawienia z dane.js na wygląd strony
// =====================================================
// Każda wartość motywu staje się zmienną CSS, np.
//   akcentJasny  ->  --akcent-jasny
// Pliki CSS korzystają tylko z tych zmiennych, więc zmiana
// motywu nie wymaga grzebania w CSS.

window.Koncertownik = window.Koncertownik || {};

Koncertownik.motyw = {

  // Łączy motyw domyślny z motywem artysty i nakłada go na stronę
  zastosuj(nadpisanie = {}) {
    const motyw = { ...Koncertownik.dane.ustawienia.motyw, ...nadpisanie };
    const root = document.documentElement.style;

    Object.entries(motyw).forEach(([klucz, wartosc]) => {
      const nazwa = '--' + klucz.replace(/[A-Z]/g, l => '-' + l.toLowerCase());
      root.setProperty(nazwa, this.naCss(klucz, wartosc));
    });

    this.wczytajFont(motyw.font);
    this.wczytajFont(motyw.fontNaglowkow);
    this.aktualny = motyw;
  },

  // Niektóre wartości trzeba zamienić na składnię CSS
  naCss(klucz, wartosc) {
    if (klucz === 'tloObraz')    return wartosc ? `url("${wartosc}")` : 'none';
    if (klucz === 'tloGradient') return wartosc || 'none';
    if (klucz.startsWith('font')) {
      return wartosc ? `'${wartosc}', system-ui, sans-serif` : 'system-ui, -apple-system, sans-serif';
    }
    return wartosc;
  },

  // Dociąga czcionkę z Google Fonts (tylko raz)
  wczytajFont(nazwa) {
    if (!nazwa || document.querySelector(`link[data-font="${nazwa}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.dataset.font = nazwa;
    link.href = `https://fonts.googleapis.com/css2?family=${nazwa.trim().replace(/ /g, '+')}&display=swap`;
    document.head.appendChild(link);
  }
};
