// =====================================================
//  PANEL – zakładka ARTYŚCI (lista, nazwa, kolejność)
// =====================================================
// Wygląd, ikony, zdjęcia i nagrania edytujesz na stronie
// artysty – przycisk „Strona i wygląd”.

Koncertownik.admin.artysci = {

  pokaz(el) {
    const { esc } = Koncertownik.narzedzia;
    const { artysci, koncerty } = Koncertownik.dane;
    const ile = id => koncerty.filter(k => k.artysta === id).length;

    el.innerHTML = `
      <section>
        <div class="naglowek-sekcji">
          <h2>Artyści (${artysci.length})</h2>
          <button type="button" class="btn" id="nowyArtysta">+ Dodaj artystę</button>
        </div>
        <small class="podpowiedz"><i class="ph ph-info"></i> Wygląd strony artysty, zdjęcia, nagrania i bilety edytujesz
          bezpośrednio na jego stronie – kliknij „Strona i wygląd”.</small>
        <div id="formArtysty"></div>
        <ul class="lista-admin">
          ${artysci.map(a => `
            <li>
              <span class="z-ikona">${Koncertownik.ikony.html(a.motyw?.ikona, 'duotone', 'ikona-listy')}
                <span><b>${esc(a.nazwa)}</b><br><small>koncertów: ${ile(a.id)}</small></span></span>
              <span class="akcje">
                <a class="btn btn-maly" href="artysta.html?id=${encodeURIComponent(a.id)}"><i class="ph ph-paint-brush"></i> Strona i wygląd</a>
                <button type="button" class="btn btn-maly btn-szary" data-edytuj="${esc(a.id)}">Nazwa</button>
                <button type="button" class="btn btn-maly btn-usun" data-usun="${esc(a.id)}">Usuń</button>
              </span>
            </li>`).join('')}
        </ul>
      </section>`;

    const miejsce = el.querySelector('#formArtysty');
    el.querySelector('#nowyArtysta').onclick = () => this.formularz(miejsce, { kolejnosc: artysci.length + 1 });
    el.querySelectorAll('[data-edytuj]').forEach(b => b.onclick = () =>
      this.formularz(miejsce, artysci.find(a => a.id === b.dataset.edytuj)));
    el.querySelectorAll('[data-usun]').forEach(b => b.onclick = () => this.usun(b.dataset.usun, ile(b.dataset.usun)));
  },

  formularz(el, a) {
    const { esc } = Koncertownik.narzedzia;
    el.innerHTML = `
      <form class="formularz ramka-formularza">
        <h3>${a.id ? 'Edycja: ' + esc(a.nazwa) : 'Nowy artysta'}</h3>
        <label>Nazwa <input type="text" name="nazwa" value="${esc(a.nazwa || '')}" required></label>
        <label>Kolejność na liście <input type="number" name="kolejnosc" value="${a.kolejnosc ?? 0}"></label>
        <div class="rzad">
          <button type="submit" class="btn">Zapisz</button>
          <button type="button" class="btn btn-szary" data-anuluj>Anuluj</button>
        </div>
      </form>`;

    const form = el.querySelector('form');
    form.querySelector('[data-anuluj]').onclick = () => { el.innerHTML = ''; };
    form.onsubmit = e => { e.preventDefault(); this.zapisz(form, a); };
    el.scrollIntoView({ behavior: 'smooth' });
  },

  async zapisz(form, a) {
    const A = Koncertownik.admin;
    const wiersz = { nazwa: form.nazwa.value.trim(), kolejnosc: Number(form.kolejnosc.value) || 0 };
    let error;
    if (a.id) {
      ({ error } = await Koncertownik.db.from('artysci').update(wiersz).eq('id', a.id));
    } else {
      wiersz.id = A.slug(wiersz.nazwa) || 'artysta-' + Date.now();
      ({ error } = await Koncertownik.db.from('artysci').insert(wiersz));
    }
    if (A.blad(error, 'Nie udało się zapisać')) return;
    A.komunikat(a.id ? 'Zapisano ✔' : 'Dodano – teraz kliknij „Strona i wygląd”, żeby go urządzić ✔');
    A.odswiez();
  },

  async usun(id, ileKoncertow) {
    const A = Koncertownik.admin;
    if (ileKoncertow) {
      A.komunikat('Najpierw usuń koncerty tego artysty (zakładka Koncerty).', true);
      return;
    }
    if (!confirm('Na pewno usunąć tego artystę?')) return;
    const { error } = await Koncertownik.db.from('artysci').delete().eq('id', id);
    if (A.blad(error, 'Nie udało się usunąć')) return;
    A.komunikat('Usunięto');
    A.odswiez();
  }
};
