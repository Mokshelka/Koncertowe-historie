// =====================================================
//  ARTYŚCI – siatka kafelków na stronie głównej
// =====================================================
// Każdy kafelek ma kolory, czcionkę i ikonę z motywu artysty
// i prowadzi do jego podstrony.

Koncertownik.lista = {

  start() {
    const kontener = document.getElementById('artistList');
    if (!kontener) return;
    const { esc, koncertyArtysty } = Koncertownik.narzedzia;
    const motywStrony = Koncertownik.motyw.strony();

    kontener.innerHTML = Koncertownik.dane.artysci.map(artysta => {
      const m = { ...motywStrony, ...bezPustych(artysta.motyw) };
      Koncertownik.motyw.wczytajFont(m.fontNaglowkow);
      const ile = koncertyArtysty(artysta.id).length;

      // Kolory artysty jako zmienne CSS tylko dla tego kafelka
      const styl = [
        `--k-akcent:${m.akcent}`, `--k-jasny:${m.akcentJasny}`, `--k-akcent2:${m.akcent2}`,
        `--k-karta:${m.karta}`, `--k-ramka:${m.ramka}`, `--k-tekst:${m.tekst}`,
        `--k-font:${Koncertownik.motyw.naCss('fontNaglowkow', m.fontNaglowkow)}`
      ].join(';');

      return `
        <a class="kafelek" href="artysta.html?id=${encodeURIComponent(artysta.id)}" style="${esc(styl)}">
          ${Koncertownik.ikony.html(m.ikona, 'duotone', 'kafelek-ikona')}
          <span class="kafelek-nazwa">${esc(artysta.nazwa)}</span>
          <span class="kafelek-licznik">${this.ileKoncertow(ile)}</span>
        </a>`;
    }).join('');

    document.getElementById('liczbaArtystow').textContent = Koncertownik.dane.artysci.length;
  },

  // 1 koncert, 2 koncerty, 5 koncertów
  ileKoncertow(n) {
    if (n === 0) return 'brak koncertów';
    if (n === 1) return '1 koncert';
    const r10 = n % 10, r100 = n % 100;
    return `${n} ${r10 >= 2 && r10 <= 4 && (r100 < 12 || r100 > 14) ? 'koncerty' : 'koncertów'}`;
  }
};
