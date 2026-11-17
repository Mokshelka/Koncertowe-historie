// =====================================================
//  PODSTRONA ARTYSTY – artysta.html?id=palaye-royale
// =====================================================
// Jeden szablon dla wszystkich artystów. Rysuje nagłówek
// w klimacie artysty i jego koncerty z setlistami,
// zdjęciami i nagraniami. Po zalogowaniu dociąga tryb edycji.

Koncertownik.stronaArtysty = {

  edycja: false,   // true = jesteś zalogowana, widać prywatne rzeczy i przyciski

  async start() {
    try {
      await Koncertownik.wczytajDane();
    } catch (blad) {
      Koncertownik.bladLadowania(blad);
      return;
    }
    const id = new URLSearchParams(location.search).get('id');
    this.artysta = Koncertownik.dane.artysci.find(a => a.id === id);
    document.getElementById('stopka').textContent = Koncertownik.dane.ustawienia.stopka;

    if (!this.artysta) {
      Koncertownik.motyw.zastosuj();
      document.getElementById('nazwaArtysty').textContent = 'Nie znaleziono artysty';
      return;
    }

    const { data } = await Koncertownik.db.auth.getSession();
    this.edycja = !!data.session;

    this.zastosujWyglad(this.artysta.motyw, this.artysta.opis);

    // Bloki: zapisany układ albo na start sam blok z koncertami
    this.bloki = this.artysta.bloki?.length ? structuredClone(this.artysta.bloki) : Koncertownik.bloki.domyslne();
    Koncertownik.bloki.rysuj(this.bloki, document.getElementById('bloki'), this.edycja);
    await this.pokazKoncerty();
    this.podepnijLightbox();

    if (this.edycja) this.zaladujEdycje();
  },

  // --- Wygląd: motyw + nagłówek + ikony w tle ---
  zastosujWyglad(motywArtysty = {}, opis = '') {
    const m = Koncertownik.motyw.zastosuj(motywArtysty);
    const a = this.artysta;
    document.title = `${a.nazwa} – Koncertownik`;

    const baner = document.getElementById('banerArtysty');
    baner.hidden = !m.baner;
    baner.style.backgroundImage = m.baner ? `url("${m.baner}")` : '';

    const logo = document.getElementById('logoArtysty');
    logo.hidden = !m.logo;
    if (m.logo) { logo.src = m.logo; logo.alt = a.nazwa; }

    document.getElementById('ikonaArtysty').hidden = !!m.logo;
    document.getElementById('ikonaArtysty').innerHTML = Koncertownik.ikony.html(m.ikona, 'duotone');

    const nazwa = document.getElementById('nazwaArtysty');
    nazwa.textContent = a.nazwa;
    nazwa.classList.toggle('ukryta', !!(m.logo && m.ukryjNazwe));

    const opisEl = document.getElementById('opisArtysty');
    opisEl.hidden = !opis;
    opisEl.textContent = opis;

    this.pokazDekor(m.ikonyDekor);
  },

  // Ikony rozsiane po tle – pozycje są stałe, ale wyglądają losowo
  pokazDekor(lista) {
    const ikony = String(lista || '').split(',').map(s => s.trim()).filter(Boolean);
    const dekor = document.getElementById('dekor');
    if (!ikony.length) { dekor.innerHTML = ''; return; }
    const ile = Math.max(12, ikony.length * 4);
    dekor.innerHTML = Array.from({ length: ile }, (_, i) => {
      const x = (i * 61.8) % 100, y = (i * 38.2 + 7) % 100;
      const rozmiar = 1.6 + ((i * 7) % 5) * 0.7, obrot = ((i * 47) % 70) - 35;
      return `<span style="left:${x}%;top:${y}%;font-size:${rozmiar}rem;transform:rotate(${obrot}deg)">
        ${Koncertownik.ikony.html(ikony[i % ikony.length], 'duotone')}</span>`;
    }).join('');
  },

  // --- Koncerty ---
  async pokazKoncerty() {
    const { koncertyArtysty } = Koncertownik.narzedzia;
    const lista = Koncertownik.bloki.wezelKoncertow();
    const koncerty = koncertyArtysty(this.artysta.id);
    const media = await Koncertownik.media.pobierz(koncerty.map(k => k.id));
    this.media = media;

    const dodaj = this.edycja ? `
      <button type="button" class="btn-edycji btn-dodaj-koncert" data-akcja="nowy-koncert">
        <i class="ph ph-plus-circle"></i> Dodaj koncert
      </button>` : '';

    lista.innerHTML = dodaj + (koncerty.length
      ? koncerty.map(k => this.kartaKoncertu(k, media.filter(m => m.koncert_id === k.id))).join('')
      : '<section><p class="pusto">Koncerty do uzupełnienia.</p></section>');
  },

  kartaKoncertu(k, media) {
    const { esc, data } = Koncertownik.narzedzia;
    const ik = n => Koncertownik.ikony.html(n);
    const typu = t => media.filter(m => m.typ === t);

    return `
      <section class="koncert" data-koncert="${k.id}">
        <div class="koncert-naglowek">
          <div>
            <h2>${ik('calendar-blank')} ${esc(data(k.data))}</h2>
            <p class="miejsce">${ik('map-pin')} ${esc(k.miasto || 'miasto do uzupełnienia')}${k.miejsce ? ' · ' + esc(k.miejsce) : ''}</p>
          </div>
          ${this.edycja ? `
            <div class="koncert-akcje">
              <button type="button" class="btn-edycji" data-akcja="edytuj-koncert" title="Edytuj koncert">${ik('pencil-simple')}</button>
              <button type="button" class="btn-edycji" data-akcja="dodaj-media">${ik('plus')} Dodaj</button>
            </div>` : ''}
        </div>
        ${this.setlista(k.setlista)}
        ${this.zdjecia(typu('zdjecie'))}
        ${this.filmy(typu('film'))}
        ${this.foldery(typu('folder'))}
        ${this.edycja ? this.bilety(typu('bilet')) : ''}
      </section>`;
  },

  setlista(utwory = []) {
    if (!utwory?.length) return '';
    const { esc } = Koncertownik.narzedzia;
    return `<h3>${Koncertownik.ikony.html('music-notes')} Setlista</h3>
      <ol class="setlista">${utwory.map(u => `<li>${esc(u)}</li>`).join('')}</ol>`;
  },

  // Wspólna „ramka” elementu: kłódka i przyciski w trybie edycji
  ramka(m, srodek) {
    const { esc } = Koncertownik.narzedzia;
    const prywatne = !m.publiczne;
    const akcje = this.edycja ? `
      <div class="media-akcje">
        ${m.typ !== 'bilet' ? `<button type="button" data-akcja="przelacz" title="${prywatne ? 'Prywatne – kliknij, żeby upublicznić' : 'Publiczne – kliknij, żeby ukryć'}">
          ${Koncertownik.ikony.html(prywatne ? 'lock-simple' : 'globe-simple')}</button>` : ''}
        <button type="button" data-akcja="usun-media" title="Usuń">${Koncertownik.ikony.html('trash')}</button>
      </div>` : '';
    return `
      <figure class="media media-${m.typ} ${prywatne && this.edycja ? 'prywatne' : ''}" data-media="${m.id}">
        ${srodek}${akcje}
        ${m.opis ? `<figcaption>${esc(m.opis)}</figcaption>` : ''}
      </figure>`;
  },

  zdjecia(lista) {
    if (!lista.length) return '';
    const { esc } = Koncertownik.narzedzia;
    return `<h3>${Koncertownik.ikony.html('camera')} Zdjęcia</h3>
      <div class="galeria">${lista.map(m => this.ramka(m,
        `<img src="${esc(m.src || '')}" alt="${esc(m.opis || 'Zdjęcie z koncertu')}" loading="lazy" data-powieksz>`)).join('')}</div>`;
  },

  filmy(lista) {
    if (!lista.length) return '';
    const { esc } = Koncertownik.narzedzia;
    return `<h3>${Koncertownik.ikony.html('film-strip')} Nagrania</h3>
      <div class="filmy">${lista.map(m => this.ramka(m, m.embed
        ? `<iframe src="${esc(m.embed)}" title="${esc(m.opis || 'Nagranie z koncertu')}" loading="lazy" allowfullscreen
             allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"></iframe>`
        : `<video src="${esc(m.src || '')}" controls preload="metadata" playsinline></video>`)).join('')}</div>`;
  },

  foldery(lista) {
    if (!lista.length) return '';
    const { esc } = Koncertownik.narzedzia;
    return `<h3>${Koncertownik.ikony.html('folder-simple')} Z Dysku Google</h3>
      ${lista.map(m => this.ramka(m,
        `<iframe class="folder-drive" src="${esc(m.embed)}" title="${esc(m.opis || 'Folder z Dysku Google')}" loading="lazy"></iframe>`)).join('')}`;
  },

  bilety(lista) {
    if (!lista.length) return '';
    const { esc } = Koncertownik.narzedzia;
    return `<h3>${Koncertownik.ikony.html('ticket')} Bilety <small>(widzisz tylko Ty)</small></h3>
      <div class="galeria galeria-bilety">${lista.map(m => this.ramka(m,
        /\.pdf$/i.test(m.adres)
          ? `<a class="bilet-pdf" href="${esc(m.src || '#')}" target="_blank">${Koncertownik.ikony.html('file-pdf', 'duotone')}<span>${esc(m.opis || 'Bilet PDF')}</span></a>`
          : `<img src="${esc(m.src || '')}" alt="Bilet" loading="lazy" data-powieksz>`)).join('')}</div>`;
  },

  // --- Powiększanie zdjęć ---
  podepnijLightbox() {
    const box = document.getElementById('lightbox');
    document.addEventListener('click', e => {
      const img = e.target.closest('[data-powieksz]');
      if (!img || document.body.classList.contains('tryb-edycji') && img.closest('.blok') && !img.closest('#koncerty')) return;
      box.querySelector('img').src = img.src;
      box.hidden = false;
    });
    box.addEventListener('click', () => { box.hidden = true; });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') box.hidden = true; });
  },

  // --- Tryb edycji: dociąga skrypty i style tylko dla zalogowanej ---
  async zaladujEdycje() {
    ['admin.css', 'artysta-edycja.css', 'bloki-edycja.css'].forEach(href => {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = href;
      document.head.appendChild(css);
    });

    const skrypty = ['admin-wspolne.js', 'admin-edytor-motywu.js', 'admin-ikony.js',
                     'artysta-edycja.js', 'artysta-edycja-koncert.js', 'artysta-edycja-media.js',
                     'bloki-edycja.js', 'bloki-ustawienia.js', 'bloki-kolaz.js'];
    for (const src of skrypty) {
      await new Promise((ok, blad) => {
        const s = document.createElement('script');
        s.src = src; s.onload = ok; s.onerror = blad;
        document.body.appendChild(s);
      });
    }
    Koncertownik.edycjaArtysty.start();
    Koncertownik.edycjaBlokow.start();
  }
};

Koncertownik.stronaArtysty.start();
