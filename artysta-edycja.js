// =====================================================
//  STRONA ARTYSTY – TRYB EDYCJI (tylko po zalogowaniu)
// =====================================================
// Pasek na dole ekranu + wysuwana szuflada z wyglądem strony.
// Każdą zmianę widać od razu na prawdziwej stronie artysty.

Koncertownik.edycjaArtysty = {

  start() {
    const S = Koncertownik.stronaArtysty;
    document.body.classList.add('tryb-edycji');
    document.body.insertAdjacentHTML('beforeend', `
      <div id="komunikat" class="komunikat" aria-live="polite"></div>
      <nav class="pasek-edycji">
        <span class="pasek-tytul"><i class="ph ph-pencil-simple-line"></i> Tryb edycji</span>
        <button type="button" class="btn" data-pasek="wyglad"><i class="ph ph-palette"></i> Wygląd strony</button>
        <a class="btn btn-szary" href="admin.html"><i class="ph ph-gear-six"></i> Panel</a>
      </nav>
      <aside id="szuflada" class="szuflada" hidden></aside>`);

    document.querySelector('[data-pasek="wyglad"]').onclick = () => this.otworzWyglad();

    // Wszystkie przyciski przy koncertach obsługujemy w jednym miejscu
    // (węzeł koncertów istnieje zawsze, nawet gdy blok „Koncerty” jest usunięty)
    Koncertownik.bloki.wezelKoncertow().addEventListener('click', e => {
      const btn = e.target.closest('[data-akcja]');
      if (!btn) return;
      const koncertId = btn.closest('[data-koncert]')?.dataset.koncert;
      const mediaId = btn.closest('[data-media]')?.dataset.media;
      const koncert = Koncertownik.dane.koncerty.find(k => k.id === koncertId);
      const media = S.media.find(m => m.id === mediaId);
      const E = Koncertownik.edycjaArtysty;
      ({
        'nowy-koncert':   () => E.koncert.otworz({ artysta: S.artysta.id }),
        'edytuj-koncert': () => E.koncert.otworz(koncert),
        'dodaj-media':    () => E.media.otworz(koncert),
        'przelacz':       () => E.media.przelacz(media),
        'usun-media':     () => E.media.usun(media)
      })[btn.dataset.akcja]?.();
    });
  },

  // Pobiera świeże dane i rysuje stronę od nowa
  async odswiez() {
    const S = Koncertownik.stronaArtysty;
    await Koncertownik.wczytajDane();
    S.artysta = Koncertownik.dane.artysci.find(a => a.id === S.artysta.id);
    S.zastosujWyglad(S.artysta.motyw, S.artysta.opis);
    await S.pokazKoncerty();
  },

  // --- Szuflada „Wygląd strony” ---
  otworzWyglad() {
    const S = Koncertownik.stronaArtysty;
    const A = Koncertownik.admin;
    const { esc } = Koncertownik.narzedzia;
    const motywStrony = Koncertownik.motyw.strony();
    const m = { ...motywStrony, ...(S.artysta.motyw || {}) };
    const szuflada = document.getElementById('szuflada');
    const pole = (klucz, nazwa) => `
      <div class="pole-obraz">${nazwa}
        <input type="hidden" data-motyw="${klucz}" value="${esc(m[klucz] || '')}">
        <img class="podglad-obrazu" src="${esc(m[klucz] || '')}" alt="" ${m[klucz] ? '' : 'hidden'}>
        <div class="rzad">
          <label class="btn btn-maly">Wybierz obraz <input type="file" accept="image/*" hidden data-wgraj="${klucz}"></label>
          <button type="button" class="btn btn-maly btn-usun" data-wyczysc="${klucz}">Usuń</button>
        </div>
      </div>`;

    szuflada.innerHTML = `
      <form class="formularz">
        <div class="szuflada-naglowek">
          <h2><i class="ph ph-palette"></i> Wygląd: ${esc(S.artysta.nazwa)}</h2>
          <button type="button" class="btn-ikona" data-zamknij title="Zamknij"><i class="ph ph-x"></i></button>
        </div>

        <details open><summary><i class="ph ph-star-four"></i> Ikona i logo</summary>
          <input type="hidden" data-motyw="ikona" value="${esc(m.ikona || '')}">
          <div data-wybierak="ikona"></div>
          ${pole('logo', 'Logo zespołu (np. PNG z przezroczystym tłem) – pokaże się zamiast ikony')}
          <label class="pole-wyboru"><input type="checkbox" name="ukryjNazwe" ${m.ukryjNazwe ? 'checked' : ''}> Ukryj napis z nazwą, gdy jest logo</label>
        </details>

        <details open><summary><i class="ph ph-image"></i> Baner i opis</summary>
          ${pole('baner', 'Baner – szerokie zdjęcie na górze strony')}
          <label>Opis / kilka słów o zespole
            <textarea name="opis" rows="4" placeholder="Np. jak ich poznałaś, ulubiona płyta…">${esc(S.artysta.opis || '')}</textarea>
          </label>
        </details>

        <details><summary><i class="ph ph-sparkle"></i> Ikony w tle</summary>
          <input type="hidden" data-motyw="ikonyDekor" value="${esc(m.ikonyDekor || '')}">
          <div class="wybrane-dekor"></div>
          <small class="podpowiedz">Kliknij ikony poniżej, żeby rozsypać je w tle strony (kliknięcie wybranej usuwa ją).</small>
          <div data-wybierak="dekor"></div>
        </details>

        <details><summary><i class="ph ph-paint-brush"></i> Kolory, tło i czcionki</summary>
          ${A.edytorMotywu.html(m)}
          <label>Przyciemnienie zdjęcia tła: <b data-wartosc="przyciemnienie">${m.przyciemnienie || 0}%</b>
            <input type="range" min="0" max="90" step="5" data-motyw="przyciemnienie" value="${m.przyciemnienie || 0}">
          </label>
          <label>Kształt kart
            <select data-motyw="promien">
              ${[[2, 'Ostre'], [8, 'Lekko zaokrąglone'], [16, 'Zaokrąglone'], [28, 'Bardzo okrągłe']]
                .map(([v, n]) => `<option value="${v}" ${Number(m.promien) === v ? 'selected' : ''}>${n}</option>`).join('')}
            </select>
          </label>
        </details>

        <div class="szuflada-stopka">
          <button type="submit" class="btn"><i class="ph ph-floppy-disk"></i> Zapisz</button>
          <button type="button" class="btn btn-szary" data-zamknij>Anuluj</button>
        </div>
      </form>`;
    szuflada.hidden = false;

    const form = szuflada.querySelector('form');
    const podglad = () => S.zastosujWyglad(this.odczytaj(form), form.opis.value.trim());

    // Ikona główna
    A.bibliotekaIkon.wybierak(form.querySelector('[data-wybierak="ikona"]'), {
      aktualna: m.ikona, podpis: 'Ikona artysty',
      przyNazwie: n => { form.querySelector('[data-motyw="ikona"]').value = n; podglad(); }
    });

    // Ikony w tle – lista „żetonów”
    const dekorPole = form.querySelector('[data-motyw="ikonyDekor"]');
    const dekorLista = () => dekorPole.value.split(',').map(s => s.trim()).filter(Boolean);
    const pokazZetony = () => {
      form.querySelector('.wybrane-dekor').innerHTML = dekorLista().map(n =>
        `<button type="button" class="zeton" data-usun-dekor="${esc(n)}">${Koncertownik.ikony.html(n, 'duotone')} <i class="ph ph-x"></i></button>`).join('')
        || '<small class="podpowiedz">Brak ikon w tle.</small>';
    };
    const przelaczDekor = n => {
      const lista = dekorLista();
      dekorPole.value = (lista.includes(n) ? lista.filter(x => x !== n) : [...lista, n]).join(',');
      pokazZetony(); podglad();
    };
    form.querySelector('.wybrane-dekor').addEventListener('click', e => {
      const b = e.target.closest('[data-usun-dekor]');
      if (b) przelaczDekor(b.dataset.usunDekor);
    });
    A.bibliotekaIkon.wybierak(form.querySelector('[data-wybierak="dekor"]'), { podpis: '', przyNazwie: przelaczDekor });
    pokazZetony();

    // Kolory, obrazy, suwaki – podgląd na żywo
    A.edytorMotywu.podepnij(form, motywStrony);
    form.addEventListener('input', e => {
      if (e.target.dataset.motyw === 'przyciemnienie') {
        form.querySelector('[data-wartosc="przyciemnienie"]').textContent = e.target.value + '%';
      }
      if (!e.target.classList.contains('szukaj-ikon')) podglad();
    });
    form.addEventListener('change', podglad);

    form.querySelectorAll('[data-zamknij]').forEach(b => b.onclick = () => this.zamknijWyglad());
    form.onsubmit = e => { e.preventDefault(); this.zapiszWyglad(form, motywStrony); };
  },

  // Motyw z formularza szuflady
  odczytaj(form) {
    const m = Koncertownik.admin.edytorMotywu.odczytaj(form);
    m.ukryjNazwe = form.ukryjNazwe.checked;
    return m;
  },

  async zapiszWyglad(form, motywStrony) {
    const S = Koncertownik.stronaArtysty;
    const A = Koncertownik.admin;
    // Zapisujemy tylko to, co jest ustawione i różni się od wyglądu całej strony
    const motyw = Object.fromEntries(Object.entries(this.odczytaj(form))
      .filter(([k, v]) => v !== '' && v !== false && String(v) !== String(motywStrony[k] ?? '')));
    const opis = form.opis.value.trim();

    const { error } = await Koncertownik.db.from('artysci').update({ motyw, opis }).eq('id', S.artysta.id);
    if (A.blad(error, 'Nie udało się zapisać')) return;
    S.artysta.motyw = motyw;
    S.artysta.opis = opis;
    document.getElementById('szuflada').hidden = true;
    A.komunikat('Zapisano wygląd ✔');
  },

  // Anulowanie przywraca zapisany wygląd
  zamknijWyglad() {
    const S = Koncertownik.stronaArtysty;
    document.getElementById('szuflada').hidden = true;
    S.zastosujWyglad(S.artysta.motyw, S.artysta.opis);
  }
};
