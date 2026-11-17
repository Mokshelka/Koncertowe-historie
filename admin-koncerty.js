// =====================================================
//  PANEL – zakładka KONCERTY (+ prywatne bilety)
// =====================================================

Koncertownik.admin.koncerty = {

  pokaz(el) {
    const { esc, data } = Koncertownik.narzedzia;
    const { artysci, koncerty } = Koncertownik.dane;
    const nazwa = id => artysci.find(a => a.id === id)?.nazwa || id;

    el.innerHTML = `
      <section>
        <div class="naglowek-sekcji">
          <h2>Koncerty (${koncerty.length})</h2>
          <button type="button" class="btn" id="nowyKoncert">+ Dodaj koncert</button>
        </div>
        <div id="formKoncertu"></div>
        <ul class="lista-admin">
          ${koncerty.map(k => `
            <li>
              <span><b>${esc(nazwa(k.artysta))}</b><br>
                <small>${esc(data(k.data))} · ${esc(k.miasto || '—')}${k.miejsce ? ' · ' + esc(k.miejsce) : ''}</small></span>
              <span class="akcje">
                <button type="button" class="btn btn-maly" data-edytuj="${k.id}">Edytuj</button>
                <button type="button" class="btn btn-maly btn-usun" data-usun="${k.id}">Usuń</button>
              </span>
            </li>`).join('') || '<li>Nie ma jeszcze koncertów.</li>'}
        </ul>
      </section>`;

    const miejsceFormularza = el.querySelector('#formKoncertu');
    el.querySelector('#nowyKoncert').onclick = () => this.formularz(miejsceFormularza, {});
    el.querySelectorAll('[data-edytuj]').forEach(b => b.onclick = () =>
      this.formularz(miejsceFormularza, koncerty.find(k => k.id === b.dataset.edytuj)));
    el.querySelectorAll('[data-usun]').forEach(b => b.onclick = () => this.usun(b.dataset.usun));
  },

  // --- Formularz dodawania / edycji ---
  async formularz(el, k) {
    const { esc } = Koncertownik.narzedzia;
    const { artysci, miasta } = Koncertownik.dane;
    const opcje = (lista, wybrane, wartosc, etykieta) => lista.map(x =>
      `<option value="${esc(wartosc(x))}" ${wartosc(x) === wybrane ? 'selected' : ''}>${esc(etykieta(x))}</option>`).join('');

    el.innerHTML = `
      <form class="formularz ramka-formularza">
        <h3>${k.id ? 'Edycja koncertu' : 'Nowy koncert'}</h3>
        <label>Artysta
          <select name="artysta_id" required>${opcje(artysci, k.artysta, a => a.id, a => a.nazwa)}</select>
        </label>
        <div class="rzad">
          <label>Data <input type="date" name="data" value="${esc(k.data || '')}"></label>
          <label>Miasto
            <select name="miasto"><option value="">— wybierz —</option>${opcje(miasta, k.miasto, m => m.nazwa, m => m.nazwa)}</select>
          </label>
        </div>
        <small class="podpowiedz">Brakuje miasta? Dodaj je w zakładce Miasta.</small>
        <label>Miejsce (klub, hala) <input type="text" name="miejsce" value="${esc(k.miejsce || '')}"></label>
        <label>Setlista <small>(jedna piosenka w linii)</small>
          <textarea name="setlista" rows="6">${esc((k.setlista || []).join('\n'))}</textarea>
        </label>
        <fieldset class="bilety">
          <legend><i class="ph ph-lock-simple"></i> Bilety (prywatne – widzisz je tylko Ty)</legend>
          <ul class="lista-biletow"></ul>
          <input type="file" name="bilety" multiple accept="image/*,application/pdf">
        </fieldset>
        <small class="podpowiedz"><i class="ph ph-info"></i> Zdjęcia, nagrania i foldery z Dysku dodajesz na stronie artysty (przycisk „Dodaj” przy koncercie).</small>
        <div class="rzad">
          <button type="submit" class="btn">Zapisz</button>
          <button type="button" class="btn btn-szary" data-anuluj>Anuluj</button>
        </div>
      </form>`;

    const form = el.querySelector('form');
    form.querySelector('[data-anuluj]').onclick = () => { el.innerHTML = ''; };
    form.onsubmit = e => { e.preventDefault(); this.zapisz(form, k); };
    if (k.id) this.pokazBilety(form.querySelector('.lista-biletow'), k.id);
    el.scrollIntoView({ behavior: 'smooth' });
  },

  async zapisz(form, k) {
    const A = Koncertownik.admin;
    const wiersz = {
      artysta_id: form.artysta_id.value,
      data:       form.data.value || null,
      miasto:     form.miasto.value || null,
      miejsce:    form.miejsce.value.trim() || null,
      setlista:   A.linie(form.setlista.value)
    };

    const zapytanie = k.id
      ? Koncertownik.db.from('koncerty').update(wiersz).eq('id', k.id).select().single()
      : Koncertownik.db.from('koncerty').insert(wiersz).select().single();
    const { data: zapisany, error } = await zapytanie;
    if (A.blad(error, 'Nie udało się zapisać')) return;

    // Nowe bilety wgrywamy dopiero, gdy koncert ma już swoje id
    for (const plik of form.bilety.files) {
      const sciezka = await A.wgrajPlik('media', plik, zapisany.id);
      if (sciezka) {
        await Koncertownik.db.from('media').insert({ koncert_id: zapisany.id, typ: 'bilet', zrodlo: 'plik',
          schowek: 'media', adres: sciezka, opis: plik.name, publiczne: false });
      }
    }

    A.komunikat('Zapisano ✔');
    A.odswiez();
  },

  async usun(id) {
    if (!confirm('Na pewno usunąć ten koncert razem ze zdjęciami, nagraniami i biletami?')) return;
    const A = Koncertownik.admin;
    const { data: media } = await Koncertownik.db.from('media').select('*').eq('koncert_id', id);
    if (media?.length) await Koncertownik.media.usunPliki(media);
    const { error } = await Koncertownik.db.from('koncerty').delete().eq('id', id);
    if (A.blad(error, 'Nie udało się usunąć')) return;
    A.komunikat('Usunięto');
    A.odswiez();
  },

  // --- Bilety ---
  async pokazBilety(ul, koncertId) {
    const { esc } = Koncertownik.narzedzia;
    const { data, error } = await Koncertownik.db.from('media').select('*')
      .eq('koncert_id', koncertId).eq('typ', 'bilet').order('utworzono');
    if (error) { ul.innerHTML = '<li>Nie udało się wczytać biletów</li>'; return; }
    ul.innerHTML = data.map(b => `
      <li>
        <span><i class="ph ph-ticket"></i> ${esc(b.opis || 'bilet')}</span>
        <span class="akcje">
          <button type="button" class="btn btn-maly" data-otworz="${b.id}">Otwórz</button>
          <button type="button" class="btn btn-maly btn-usun" data-usun-bilet="${b.id}">Usuń</button>
        </span>
      </li>`).join('') || '<li><small>Brak biletów</small></li>';

    // Prywatny plik otwieramy przez link ważny 60 sekund
    ul.querySelectorAll('[data-otworz]').forEach(b => b.onclick = async () => {
      const okno = window.open('', '_blank');
      const bilet = data.find(x => x.id === b.dataset.otworz);
      const { data: link, error } = await Koncertownik.db.storage.from(bilet.schowek).createSignedUrl(bilet.adres, 60);
      if (Koncertownik.admin.blad(error, 'Nie udało się otworzyć')) { okno?.close(); return; }
      okno.location = link.signedUrl;
    });
    ul.querySelectorAll('[data-usun-bilet]').forEach(b => b.onclick = async () => {
      if (!confirm('Usunąć ten bilet?')) return;
      await Koncertownik.media.usunPliki(data.filter(x => x.id === b.dataset.usunBilet));
      await Koncertownik.db.from('media').delete().eq('id', b.dataset.usunBilet);
      this.pokazBilety(ul, koncertId);
    });
  }
};
