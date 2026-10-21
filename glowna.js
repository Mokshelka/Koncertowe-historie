// =====================================================
//  STRONA GŁÓWNA – uruchamia wszystko po kolei
// =====================================================
// 1. pobiera dane z bazy  2. nakłada motyw
// 3. uruchamia globus, miasta, listę artystów i księgę gości

(async function () {
  try {
    await Koncertownik.wczytajDane();
  } catch (blad) {
    Koncertownik.bladLadowania(blad);
    return;
  }

  const u = Koncertownik.dane.ustawienia;
  Koncertownik.motyw.zastosuj();
  document.getElementById('tytulStrony').textContent = u.tytul;
  document.getElementById('opisStrony').textContent = u.opis;
  document.getElementById('stopka').textContent = u.stopka;

  Koncertownik.globus.start();
  Koncertownik.miasta.start();
  Koncertownik.lista.start();
  Koncertownik.ksiega.start();
})();
