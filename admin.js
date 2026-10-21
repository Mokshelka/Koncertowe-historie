// =====================================================
//  PANEL – logowanie i przełączanie zakładek
// =====================================================

(async function () {
  const A = Koncertownik.admin;
  const db = Koncertownik.db;
  const ekranLogowania = document.getElementById('ekranLogowania');
  const panel = document.getElementById('panel');

  // Pokazuje panel albo ekran logowania
  async function pokaz(zalogowana) {
    ekranLogowania.hidden = zalogowana;
    panel.hidden = !zalogowana;
    if (!zalogowana) return;
    try {
      await Koncertownik.wczytajDane();
    } catch (e) {
      A.blad(e, 'Nie udało się wczytać danych');
      return;
    }
    A.pokazZakladke(A.biezaca || 'koncerty');
  }

  // Logowanie
  document.getElementById('formLogowania').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target;
    const { error } = await db.auth.signInWithPassword({ email: f.email.value, password: f.haslo.value });
    if (error) return A.komunikat('Zły e-mail lub hasło', true);
    f.reset();
    pokaz(true);
  });

  // Wylogowanie
  document.getElementById('wyloguj').addEventListener('click', async () => {
    await db.auth.signOut();
    pokaz(false);
  });

  // Zakładki
  document.querySelectorAll('[data-zakladka]').forEach(b =>
    b.addEventListener('click', () => A.pokazZakladke(b.dataset.zakladka)));

  // Czy jesteś już zalogowana (sesja zostaje po odświeżeniu)
  const { data } = await db.auth.getSession();
  pokaz(!!data.session);
})();
