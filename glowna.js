// =====================================================
//  STRONA GŁÓWNA – tytuł, opis, stopka i motyw domyślny
// =====================================================

(function () {
  const u = Koncertownik.dane.ustawienia;
  Koncertownik.motyw.zastosuj();

  document.getElementById('tytulStrony').textContent = u.tytul;
  document.getElementById('opisStrony').textContent = u.opis;
  document.getElementById('stopka').textContent = u.stopka;
})();
