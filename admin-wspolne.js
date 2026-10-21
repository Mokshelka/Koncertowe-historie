// =====================================================
//  PANEL – wspólne narzędzia dla wszystkich zakładek
// =====================================================

Koncertownik.admin = {

  // Krótki komunikat na dole ekranu
  komunikat(tekst, blad = false) {
    const el = document.getElementById('komunikat');
    el.textContent = tekst;
    el.className = 'komunikat widoczny' + (blad ? ' blad' : '');
    clearTimeout(this._timer);
    this._timer = setTimeout(() => { el.className = 'komunikat'; }, 3500);
  },

  // Pokazuje błąd z bazy po ludzku i zwraca true, jeśli był
  blad(error, opis = 'Coś poszło nie tak') {
    if (!error) return false;
    console.error(error);
    this.komunikat(`${opis}: ${error.message}`, true);
    return true;
  },

  // 'Nothing but Thieves' -> 'nothing-but-thieves'
  slug(tekst) {
    return tekst.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/ł/g, 'l')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  },

  // Wgrywa plik do schowka i zwraca jego ścieżkę
  async wgrajPlik(schowek, plik, folder = '') {
    const bezpiecznaNazwa = plik.name.normalize('NFD').replace(/[^\w.-]+/g, '_');
    const sciezka = `${folder ? folder + '/' : ''}${Date.now()}-${bezpiecznaNazwa}`;
    const { error } = await Koncertownik.db.storage.from(schowek).upload(sciezka, plik);
    if (this.blad(error, 'Nie udało się wgrać pliku')) return null;
    return sciezka;
  },

  // Tekst z pola (jedna rzecz w linii) -> lista
  linie(tekst) {
    return tekst.split('\n').map(l => l.trim()).filter(Boolean);
  },

  // Pobiera świeże dane i odświeża bieżącą zakładkę
  async odswiez() {
    await Koncertownik.wczytajDane();
    Koncertownik.motyw.zastosuj();
    this.pokazZakladke(this.biezaca);
  },

  pokazZakladke(nazwa) {
    this.biezaca = nazwa;
    document.querySelectorAll('[data-zakladka]').forEach(b =>
      b.classList.toggle('aktywna', b.dataset.zakladka === nazwa));
    Koncertownik.motyw.zastosuj();
    this[nazwa].pokaz(document.getElementById('tresc'));
  }
};
