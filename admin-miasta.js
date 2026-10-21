// =====================================================
//  PANEL – zakładka MIASTA (pinezki na globusie)
// =====================================================
// Współrzędne można znaleźć automatycznie (OpenStreetMap).

Koncertownik.admin.miasta = {

  pokaz(el) {
    const { esc } = Koncertownik.narzedzia;
    const { miasta, koncerty } = Koncertownik.dane;
    const ile = nazwa => koncerty.filter(k => k.miasto === nazwa).length;

    el.innerHTML = `
      <section>
        <div class="naglowek-sekcji">
          <h2>Miasta (${miasta.length})</h2>
          <button type="button" class="btn" id="noweMiasto">+ Dodaj miasto</button>
        </div>
        <div id="formMiasta"></div>
        <ul class="lista-admin">
          ${miasta.map(m => `
            <li>
              <span><b>${esc(m.nazwa)}</b><br><small>koncertów: ${ile(m.nazwa)} · ${m.szerokosc.toFixed(2)}, ${m.dlugosc.toFixed(2)}</small></span>
              <span class="akcje">
                <button type="button" class="btn btn-maly" data-edytuj="${m.id}">Edytuj</button>
                <button type="button" class="btn btn-maly btn-usun" data-usun="${m.id}">Usuń</button>
              </span>
            </li>`).join('')}
        </ul>
      </section>`;

    const miejsce = el.querySelector('#formMiasta');
    el.querySelector('#noweMiasto').onclick = () => this.formularz(miejsce, {});
    el.querySelectorAll('[data-edytuj]').forEach(b => b.onclick = () =>
      this.formularz(miejsce, miasta.find(m => m.id == b.dataset.edytuj)));
    el.querySelectorAll('[data-usun]').forEach(b => b.onclick = () => {
      const m = miasta.find(x => x.id == b.dataset.usun);
      this.usun(m, ile(m.nazwa));
    });
  },

  formularz(el, m) {
    const { esc } = Koncertownik.narzedzia;
    el.innerHTML = `
      <form class="formularz ramka-formularza">
        <h3>${m.id ? 'Edycja miasta' : 'Nowe miasto'}</h3>
        <label>Nazwa <input type="text" name="nazwa" value="${esc(m.nazwa || '')}" required></label>
        <button type="button" class="btn btn-szary" data-szukaj>🔎 Znajdź współrzędne</button>
        <div class="rzad">
          <label>Szerokość geogr. <input type="number" step="any" name="szerokosc" value="${m.szerokosc ?? ''}" required></label>
          <label>Długość geogr. <input type="number" step="any" name="dlugosc" value="${m.dlugosc ?? ''}" required></label>
        </div>
        <div class="rzad">
          <button type="submit" class="btn">Zapisz</button>
          <button type="button" class="btn btn-szary" data-anuluj>Anuluj</button>
        </div>
      </form>`;

    const form = el.querySelector('form');
    form.querySelector('[data-anuluj]').onclick = () => { el.innerHTML = ''; };
    form.querySelector('[data-szukaj]').onclick = () => this.szukaj(form);
    form.onsubmit = e => { e.preventDefault(); this.zapisz(form, m); };
    el.scrollIntoView({ behavior: 'smooth' });
  },

  // Szuka współrzędnych miasta w OpenStreetMap
  async szukaj(form) {
    const A = Koncertownik.admin;
    const nazwa = form.nazwa.value.trim();
    if (!nazwa) return A.komunikat('Najpierw wpisz nazwę miasta', true);
    try {
      const odp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(nazwa)}`);
      const [wynik] = await odp.json();
      if (!wynik) return A.komunikat('Nie znaleziono takiego miasta', true);
      form.szerokosc.value = (+wynik.lat).toFixed(4);
      form.dlugosc.value = (+wynik.lon).toFixed(4);
      A.komunikat('Znaleziono: ' + wynik.display_name.split(',').slice(0, 2).join(','));
    } catch {
      A.komunikat('Wyszukiwarka nie odpowiada – wpisz współrzędne ręcznie', true);
    }
  },

  async zapisz(form, m) {
    const A = Koncertownik.admin;
    const wiersz = {
      nazwa: form.nazwa.value.trim(),
      szerokosc: Number(form.szerokosc.value),
      dlugosc: Number(form.dlugosc.value)
    };
    const { error } = m.id
      ? await Koncertownik.db.from('miasta').update(wiersz).eq('id', m.id)
      : await Koncertownik.db.from('miasta').insert(wiersz);
    if (A.blad(error, 'Nie udało się zapisać')) return;

    // Zmiana nazwy -> poprawiamy też koncerty w tym mieście
    if (m.id && m.nazwa !== wiersz.nazwa) {
      await Koncertownik.db.from('koncerty').update({ miasto: wiersz.nazwa }).eq('miasto', m.nazwa);
    }
    A.komunikat('Zapisano ✔');
    A.odswiez();
  },

  async usun(m, ileKoncertow) {
    const A = Koncertownik.admin;
    const pytanie = ileKoncertow
      ? `W mieście ${m.nazwa} jest ${ileKoncertow} koncert(ów). Usunąć miasto? Koncerty zostaną, ale bez pinezki.`
      : `Usunąć miasto ${m.nazwa}?`;
    if (!confirm(pytanie)) return;
    const { error } = await Koncertownik.db.from('miasta').delete().eq('id', m.id);
    if (A.blad(error, 'Nie udało się usunąć')) return;
    A.komunikat('Usunięto');
    A.odswiez();
  }
};
