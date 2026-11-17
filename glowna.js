// =====================================================
//  STRONA GŁÓWNA – uruchamia wszystko po kolei
// =====================================================
// 1. pobiera dane z bazy  2. nakłada motyw
// 3. uruchamia globus, miasta, listę artystów i księgę gości

(async function () {
  try {
    await Koncertownik.wczytajDane();
  } catch (blad) {
    // Baza nie odpowiada (np. projekt w Supabase jest uśpiony).
    // Pokazujemy komunikat, ale reszta strony (globus!) i tak startuje.
    Koncertownik.bladLadowania(blad);
    Koncertownik.dane = {
      ustawienia: { tytul: 'KONCERTOWNIK', opis: '', stopka: '', motyw: {} },
      miasta: [], artysci: [], koncerty: []
    };
  }

  const u = Koncertownik.dane.ustawienia;
  Koncertownik.motyw.zastosuj();
  // emotka na początku tytułu nie jest potrzebna – jest ikona
  document.getElementById('tytulStrony').textContent = u.tytul.replace(/^[\p{Extended_Pictographic}\uFE0F\s]+/u, '');
  document.getElementById('opisStrony').textContent = u.opis;
  document.getElementById('stopka').textContent = u.stopka;

  Koncertownik.globus.start();
  Koncertownik.miasta.start();
  Koncertownik.lista.start();
  Koncertownik.ksiega.start();
})();
