// =====================================================
//  DANE – pobieranie całej treści strony z bazy
// =====================================================
// Treść (ustawienia, miasta, artyści, koncerty) edytujesz
// w panelu admina (admin.html). Ten plik tylko ją pobiera
// i układa w Koncertownik.dane, z którego korzysta reszta.

window.Koncertownik = window.Koncertownik || {};

Koncertownik.wczytajDane = async function () {
  const db = Koncertownik.db;

  const [ustawienia, miasta, artysci, koncerty] = await Promise.all([
    db.from('ustawienia').select('*').eq('id', 1).maybeSingle(),
    db.from('miasta').select('*').order('nazwa'),
    db.from('artysci').select('*').order('kolejnosc').order('nazwa'),
    db.from('koncerty').select('*').order('data', { ascending: false, nullsFirst: false })
  ]);

  const blad = [ustawienia, miasta, artysci, koncerty].find(w => w.error);
  if (blad) throw blad.error;

  const u = ustawienia.data || {};
  Koncertownik.dane = {
    ustawienia: {
      tytul:  u.tytul  || 'KONCERTOWNIK',
      opis:   u.opis   || '',
      stopka: u.stopka || '',
      motyw:  u.motyw  || {}
    },
    miasta:   miasta.data.map(m => ({ ...m, wsp: [m.dlugosc, m.szerokosc] })),
    artysci:  artysci.data,
    koncerty: koncerty.data.map(k => ({ ...k, artysta: k.artysta_id }))
  };
  return Koncertownik.dane;
};

// Komunikat, gdy baza nie odpowiada
Koncertownik.bladLadowania = function (blad) {
  console.error(blad);
  const div = document.createElement('section');
  div.className = 'blad-ladowania';
  div.textContent = 'Nie udało się wczytać danych. Spróbuj odświeżyć stronę za chwilę.';
  document.querySelector('.container')?.prepend(div);
};
