// =====================================================
//  PANEL – edytor motywu (kolory, tło, czcionki)
// =====================================================
// Używany w zakładce „Wygląd” (cała strona) i u artystów.
// Zmiany od razu widać na panelu – to podgląd na żywo.

Koncertownik.admin.edytorMotywu = {

  POLA: [
    { k: 'tlo',           nazwa: 'Tło',                       typ: 'kolor' },
    { k: 'tlo2',          nazwa: 'Tło – środek gradientu',    typ: 'kolor' },
    { k: 'tloObraz',      nazwa: 'Zdjęcie tła',               typ: 'obraz' },
    { k: 'karta',         nazwa: 'Tło sekcji',                typ: 'kolor' },
    { k: 'ramka',         nazwa: 'Obramowania',               typ: 'kolor' },
    { k: 'akcent',        nazwa: 'Akcent główny',             typ: 'kolor' },
    { k: 'akcentJasny',   nazwa: 'Akcent jasny',              typ: 'kolor' },
    { k: 'akcent2',       nazwa: 'Akcent 2 (pinezki, linki)', typ: 'kolor' },
    { k: 'tekst',         nazwa: 'Tekst',                     typ: 'kolor' },
    { k: 'tekstSlaby',    nazwa: 'Tekst drugorzędny',         typ: 'kolor' },
    { k: 'font',          nazwa: 'Czcionka tekstu',           typ: 'font' },
    { k: 'fontNaglowkow', nazwa: 'Czcionka nagłówków',        typ: 'font' },
    { k: 'globusLad',     nazwa: 'Globus – ląd',              typ: 'kolor' },
    { k: 'globusOcean',   nazwa: 'Globus – ocean',            typ: 'kolor' }
  ],

  // Kilka podpowiedzi – można wpisać dowolną nazwę z fonts.google.com
  FONTY: ['Poppins', 'Montserrat', 'Bebas Neue', 'Metal Mania', 'Pirata One', 'Creepster',
          'Permanent Marker', 'Rubik', 'Oswald', 'Righteous', 'Cinzel', 'UnifrakturMaguntia',
          'Noto Sans JP', 'Zen Maru Gothic'],

  // HTML pól edytora dla podanego motywu
  html(motyw) {
    const { esc } = Koncertownik.narzedzia;
    const pola = this.POLA.map(p => {
      const v = motyw[p.k] ?? '';
      if (p.typ === 'kolor') return `
        <label class="pole-kolor">${p.nazwa}
          <input type="color" data-motyw="${p.k}" value="${esc(v)}">
        </label>`;
      if (p.typ === 'font') return `
        <label>${p.nazwa}
          <input type="text" data-motyw="${p.k}" value="${esc(v)}" list="listaFontow" placeholder="systemowa">
        </label>`;
      return `
        <div class="pole-obraz">${p.nazwa}
          <input type="hidden" data-motyw="${p.k}" value="${esc(v)}">
          <img class="podglad-obrazu" src="${esc(v)}" alt="" ${v ? '' : 'hidden'}>
          <div class="rzad">
            <label class="btn btn-maly">Wybierz zdjęcie <input type="file" accept="image/*" hidden data-wgraj="${p.k}"></label>
            <button type="button" class="btn btn-maly btn-usun" data-wyczysc="${p.k}">Usuń</button>
          </div>
        </div>`;
    }).join('');
    return `<div class="edytor-motywu">${pola}</div>
      <datalist id="listaFontow">${this.FONTY.map(f => `<option value="${f}">`).join('')}</datalist>`;
  },

  // Odczytuje motyw z pól
  odczytaj(kontener) {
    const motyw = {};
    kontener.querySelectorAll('[data-motyw]').forEach(i => { motyw[i.dataset.motyw] = i.value.trim(); });
    return motyw;
  },

  // Podpina podgląd na żywo i wgrywanie zdjęć.
  // bazowy = motyw, na który nakładamy zmiany (np. motyw strony dla artysty)
  podepnij(kontener, bazowy = {}) {
    const podglad = () => Koncertownik.motyw.zastosuj({ ...bazowy, ...this.odczytaj(kontener) });
    kontener.addEventListener('input', e => { if (e.target.dataset.motyw) podglad(); });

    kontener.querySelectorAll('[data-wgraj]').forEach(input => {
      input.addEventListener('change', async () => {
        const plik = input.files[0];
        if (!plik) return;
        Koncertownik.admin.komunikat('Wgrywam zdjęcie…');
        const sciezka = await Koncertownik.admin.wgrajPlik('obrazy', plik, 'tla');
        if (!sciezka) return;
        const url = Koncertownik.db.storage.from('obrazy').getPublicUrl(sciezka).data.publicUrl;
        this.ustawObraz(kontener, input.dataset.wgraj, url);
        podglad();
        Koncertownik.admin.komunikat('Zdjęcie wgrane – pamiętaj, żeby zapisać ✔');
      });
    });

    kontener.querySelectorAll('[data-wyczysc]').forEach(btn => {
      btn.addEventListener('click', () => { this.ustawObraz(kontener, btn.dataset.wyczysc, ''); podglad(); });
    });
  },

  ustawObraz(kontener, klucz, url) {
    const pole = kontener.querySelector(`[data-motyw="${klucz}"]`);
    const img = pole.parentElement.querySelector('.podglad-obrazu');
    pole.value = url;
    img.src = url;
    img.hidden = !url;
  }
};
