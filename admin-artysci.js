// =====================================================
//  PANEL – zakładka ARTYŚCI (nazwa, kolejność, motyw)
// =====================================================

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
        <div id="formArtysty"></div>
        <ul class="lista-admin">
          ${artysci.map(a => `
            <li>
              <span class="z-ikona">${Koncertownik.ikony.html(a.motyw?.ikona, 'duotone', 'ikona-listy')}<span><b>${esc(a.nazwa)}</b><br><small>koncertów: ${ile(a.id)}${Object.keys(a.motyw || {}).some(k => k !== 'ikona') ? ' · własny motyw' : ''}</small></span></span>
              <span class="akcje">
                <button type="button" class="btn btn-maly" data-edytuj="${esc(a.id)}">Edytuj</button>
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
    const E = Koncertownik.admin.edytorMotywu;
    const motywStrony = Koncertownik.motyw.strony();

    el.innerHTML = `
      <form class="formularz ramka-formularza">
        <h3>${a.id ? 'Edycja: ' + esc(a.nazwa) : 'Nowy artysta'}</h3>
        <label>Nazwa <input type="text" name="nazwa" value="${esc(a.nazwa || '')}" required></label>
        <label>Kolejność na liście <input type="number" name="kolejnosc" value="${a.kolejnosc ?? 0}"></label>
        <h3><i class="ph ph-shapes"></i> Ikona</h3>
        ${this.wyborIkony(a.motyw?.ikona || Koncertownik.ikony.DOMYSLNA)}
        <h3><i class="ph ph-palette"></i> Motyw podstrony</h3>
        <small class="podpowiedz">Zmieniaj kolory – panel od razu pokazuje podgląd. Zapisane zostaną tylko wartości inne niż wygląd całej strony.</small>
        ${E.html({ ...motywStrony, ...(a.motyw || {}) })}
        <div class="rzad">
          <button type="submit" class="btn">Zapisz</button>
          <button type="button" class="btn btn-szary" data-reset>Przywróć wygląd strony</button>
          <button type="button" class="btn btn-szary" data-anuluj>Anuluj</button>
          ${a.id ? `<a class="btn btn-szary" href="artysta.html?id=${encodeURIComponent(a.id)}" target="_blank">Podgląd ↗</a>` : ''}
        </div>
      </form>`;

    const form = el.querySelector('form');
    E.podepnij(form, motywStrony);
    this.podepnijIkony(form);
    Koncertownik.motyw.zastosuj(a.motyw);
    form.querySelector('[data-anuluj]').onclick = () => { el.innerHTML = ''; Koncertownik.motyw.zastosuj(); };
    form.querySelector('[data-reset]').onclick = () => this.formularz(el, { ...a, motyw: {} });
    form.onsubmit = e => { e.preventDefault(); this.zapisz(form, a, motywStrony); };
    el.scrollIntoView({ behavior: 'smooth' });
  },

  async zapisz(form, a, motywStrony) {
    const A = Koncertownik.admin;
    // Zapisujemy tylko to, co różni się od wyglądu strony
    const motyw = Object.fromEntries(Object.entries(A.edytorMotywu.odczytaj(form))
      .filter(([k, v]) => v !== (motywStrony[k] ?? '')));
    const ikona = form.ikona.value.trim().toLowerCase();
    if (ikona && ikona !== Koncertownik.ikony.DOMYSLNA) motyw.ikona = ikona;

    const wiersz = {
      nazwa: form.nazwa.value.trim(),
      kolejnosc: Number(form.kolejnosc.value) || 0,
      motyw
    };

    let error;
    if (a.id) {
      ({ error } = await Koncertownik.db.from('artysci').update(wiersz).eq('id', a.id));
    } else {
      wiersz.id = A.slug(wiersz.nazwa) || 'artysta-' + Date.now();
      ({ error } = await Koncertownik.db.from('artysci').insert(wiersz));
    }
    if (A.blad(error, 'Nie udało się zapisać')) return;
    A.komunikat('Zapisano ✔');
    A.odswiez();
  },

  // --- Wybór ikony ---
  wyborIkony(aktualna) {
    const I = Koncertownik.ikony;
    return `
      <div class="wybor-ikon">
        ${I.LISTA.map(n => `
          <button type="button" class="ikona-opcja ${n === aktualna ? 'wybrana' : ''}" data-ikona="${n}" title="${n}">
            ${I.html(n, 'duotone')}
          </button>`).join('')}
      </div>
      <label>Albo wpisz dowolną nazwę z <a href="https://phosphoricons.com" target="_blank">phosphoricons.com</a>
        <input type="text" name="ikona" value="${Koncertownik.narzedzia.esc(aktualna)}">
      </label>`;
  },

  podepnijIkony(form) {
    const zaznacz = nazwa => form.querySelectorAll('.ikona-opcja').forEach(b =>
      b.classList.toggle('wybrana', b.dataset.ikona === nazwa));
    form.querySelectorAll('.ikona-opcja').forEach(b => b.onclick = () => {
      form.ikona.value = b.dataset.ikona;
      zaznacz(b.dataset.ikona);
    });
    form.ikona.addEventListener('input', () => zaznacz(form.ikona.value.trim()));
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
