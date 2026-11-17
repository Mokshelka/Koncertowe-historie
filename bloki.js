// =====================================================
//  BLOKI – klocki, z których składa się strona artysty
// =====================================================
// Każdy blok to obiekt zapisany w bazie (kolumna artysci.bloki):
//   { id, typ, szer (1–12 kolumn), wys (px, 0 = auto), dane: {…}, styl: {…} }
// Ten plik tylko RYSUJE bloki. Edycję dokłada bloki-edycja.js.

window.Koncertownik = window.Koncertownik || {};

Koncertownik.bloki = {

  // --- Rodzaje bloków: nazwa, ikona i ustawienia na start ---
  TYPY: {
    naglowek: { nazwa: 'Nagłówek',  ikona: 'text-h',            dane: { tekst: 'Nowy nagłówek' }, styl: { przezroczysty: true, wyrownanie: 'srodek', efekt: 'poswiata' } },
    tekst:    { nazwa: 'Tekst',     ikona: 'text-align-left',   dane: { html: 'Kliknij i pisz…' } },
    zdjecie:  { nazwa: 'Zdjęcie',   ikona: 'image',             dane: { src: '', podpis: '', dopasowanie: 'cover' }, szer: 6, styl: { odstep: 0 } },
    galeria:  { nazwa: 'Galeria',   ikona: 'images-square',     dane: { zdjecia: [], kolumny: 3 } },
    cytat:    { nazwa: 'Cytat',     ikona: 'quotes',            dane: { tekst: 'Fragment ulubionej piosenki…', autor: '' }, styl: { wyrownanie: 'srodek' } },
    wideo:    { nazwa: 'Wideo',     ikona: 'film-strip',        dane: { link: '' } },
    spotify:  { nazwa: 'Spotify',   ikona: 'spotify-logo',      dane: { link: '' } },
    naklejka: { nazwa: 'Naklejka',  ikona: 'sticker',           dane: { ikona: 'star', rozmiar: 5 }, szer: 3, styl: { przezroczysty: true, wyrownanie: 'srodek', animacja: 'unoszenie' } },
    kolaz:    { nazwa: 'Kolaż',     ikona: 'squares-four',      dane: { elementy: [], proporcja: 1.6 } },
    setlista: { nazwa: 'Setlista',  ikona: 'music-notes',       dane: { koncertId: '' }, szer: 6 },
    koncerty: { nazwa: 'Koncerty',  ikona: 'ticket',            dane: {}, styl: { przezroczysty: true, odstep: 0 } },
    odstep:   { nazwa: 'Odstęp',    ikona: 'arrows-vertical',   dane: {}, wys: 60, styl: { przezroczysty: true } }
  },

  // Nowy blok danego typu
  nowy(typ) {
    const t = this.TYPY[typ];
    return {
      id: 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      typ,
      szer: t.szer || 12,
      wys: t.wys || 0,
      dane: structuredClone(t.dane),
      styl: { ...(t.styl || {}) }
    };
  },

  // Układ na start, gdy artysta nie ma jeszcze żadnych bloków
  domyslne() {
    return [this.nowy('koncerty')];
  },

  // --- Rysowanie ---
  // kontener: element #bloki, edycja: true = pokaż uchwyty i przyciski
  rysuj(bloki, kontener, edycja = false) {
    this.edycja = edycja;
    kontener.innerHTML = '';
    bloki.forEach(b => kontener.appendChild(this.element(b)));
    this.obserwujWejscia(kontener);
  },

  // Rysuje od nowa jeden blok (np. po zmianie ustawień)
  odswiezJeden(b) {
    const stary = document.querySelector(`[data-blok="${b.id}"]`);
    if (!stary) return;
    const nowy = this.element(b);
    stary.replaceWith(nowy);
    this.obserwujWejscia(nowy.parentElement);
  },

  element(b) {
    const s = b.styl || {};
    const el = document.createElement('div');
    el.dataset.blok = b.id;
    el.className = [
      'blok', `blok-${b.typ}`,
      s.przezroczysty ? 'bez-karty' : '',
      s.tekstura ? `tekstura-${s.tekstura}` : '',
      s.ramka ? `ramka-${s.ramka}` : '',
      s.efekt ? `efekt-${s.efekt}` : '',
      s.animacja ? `anim-${s.animacja}` : '',
      `wyr-${s.wyrownanie || 'lewo'}`
    ].filter(Boolean).join(' ');

    const v = {
      '--szer': b.szer || 12,
      '--wys': b.wys ? b.wys + 'px' : '',
      '--b-tlo': s.tlo || '',
      '--b-przyc': (Number(s.przyciemnienie) || 0) / 100,
      '--b-rozmycie': (Number(s.rozmycie) || 0) + 'px',
      '--b-zaokr': s.zaokraglenie != null && s.zaokraglenie !== '' ? s.zaokraglenie + 'px' : '',
      '--b-pad': s.odstep != null && s.odstep !== '' ? s.odstep + 'px' : '',
      '--b-font': s.czcionka ? Koncertownik.motyw.naCss('font', s.czcionka) : '',
      '--b-rozmiar': s.rozmiar || '',
      '--b-kolor': s.kolor || ''
    };
    Object.entries(v).forEach(([k, w]) => { if (w !== '') el.style.setProperty(k, w); });
    Koncertownik.motyw.wczytajFont(s.czcionka);

    el.innerHTML =
      (s.tloObraz ? `<div class="blok-tlo" style="background-image:url('${this.url(s.tloObraz)}')"></div>` : '') +
      `<div class="blok-tresc">${this.tresc(b)}</div>` +
      (this.edycja ? this.narzedzia(b) : '');

    // Koncerty to „żywy” element – przenosimy go zamiast rysować od nowa
    if (b.typ === 'koncerty') el.querySelector('.blok-tresc').appendChild(this.wezelKoncertow());
    return el;
  },

  // Kontener na karty koncertów (tworzony raz, przenoszony między rysowaniami)
  wezelKoncertow() {
    if (!this._koncerty) {
      this._koncerty = document.createElement('div');
      this._koncerty.id = 'koncerty';
    }
    return this._koncerty;
  },

  // Przyciski i uchwyty widoczne tylko w trybie edycji
  narzedzia(b) {
    const ik = n => Koncertownik.ikony.html(n);
    return `
      <div class="blok-narzedzia">
        <button type="button" class="blok-uchwyt" title="Przeciągnij, żeby przesunąć">${ik('dots-six-vertical')}</button>
        <span class="blok-nazwa">${this.TYPY[b.typ]?.nazwa || b.typ}</span>
        ${b.typ === 'kolaz' ? `
          <button type="button" data-kolaz-akcja="zdjecie" title="Dodaj zdjęcia do kolażu">${ik('image')}<small>+</small></button>
          <button type="button" data-kolaz-akcja="tekst" title="Dodaj tekst do kolażu">${ik('text-t')}<small>+</small></button>
          <button type="button" data-kolaz-akcja="ikona" title="Dodaj naklejkę do kolażu">${ik('sticker')}<small>+</small></button>` : ''}
        <button type="button" data-blok-akcja="ustawienia" title="Ustawienia">${ik('sliders-horizontal')}</button>
        <button type="button" data-blok-akcja="duplikuj" title="Duplikuj">${ik('copy')}</button>
        <button type="button" data-blok-akcja="usun" title="Usuń">${ik('trash')}</button>
      </div>
      <div class="blok-rozmiar" title="Ciągnij, żeby zmienić rozmiar">${ik('arrows-out-simple')}</div>`;
  },

  // Pole tekstowe: w trybie edycji można w nim pisać
  pole(klucz, wartosc, tag = 'div', bogaty = false, klasa = '') {
    const tresc = bogaty ? this.oczysc(wartosc || '') : Koncertownik.narzedzia.esc(wartosc || '');
    const edyt = this.edycja ? ` contenteditable="true" data-pole="${klucz}"${bogaty ? ' data-bogaty' : ''}` : '';
    return `<${tag} class="${klasa}"${edyt}>${tresc}</${tag}>`;
  },

  // --- Treść każdego rodzaju bloku ---
  tresc(b) {
    const d = b.dane || {};
    const { esc } = Koncertownik.narzedzia;
    const ik = (n, s) => Koncertownik.ikony.html(n, s);
    const pusto = (ikona, tekst) => this.edycja
      ? `<div class="blok-pusty">${ik(ikona, 'duotone')}<span>${tekst}</span></div>` : '';

    switch (b.typ) {
      case 'naglowek':
        return this.pole('tekst', d.tekst, 'h2', false, 'tekst-glowny');

      case 'tekst':
        return this.pole('html', d.html, 'div', true, 'tekst-blok');

      case 'zdjecie':
        if (!d.src) return pusto('image', 'Dodaj zdjęcie w ustawieniach ⚙');
        return `<figure class="zdjecie-blok">
            <img src="${this.url(d.src)}" alt="${esc(d.podpis || '')}" loading="lazy" data-powieksz
                 style="object-fit:${d.dopasowanie === 'contain' ? 'contain' : 'cover'}">
            ${d.podpis || this.edycja ? this.pole('podpis', d.podpis, 'figcaption') : ''}
          </figure>`;

      case 'galeria':
        if (!d.zdjecia?.length) return pusto('images-square', 'Dodaj zdjęcia w ustawieniach ⚙');
        return `<div class="galeria-blok" style="--kolumny:${Number(d.kolumny) || 3}">
            ${d.zdjecia.map(z => `<img src="${this.url(z.src)}" alt="" loading="lazy" data-powieksz>`).join('')}</div>`;

      case 'cytat':
        return `<blockquote class="cytat-blok">
            ${ik('quotes', 'duotone')}
            ${this.pole('tekst', d.tekst, 'p', false, 'tekst-glowny')}
            ${d.autor || this.edycja ? this.pole('autor', d.autor, 'cite') : ''}
          </blockquote>`;

      case 'wideo': {
        const src = this.wideoEmbed(d.link);
        return src ? `<iframe class="wideo-blok" src="${esc(src)}" loading="lazy" allowfullscreen
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" title="Wideo"></iframe>`
          : pusto('film-strip', 'Wklej link YouTube lub Dysku Google w ustawieniach ⚙');
      }

      case 'spotify': {
        const sp = this.spotifyEmbed(d.link);
        return sp ? `<iframe class="spotify-blok" src="${esc(sp.src)}" style="height:${sp.wys}px" loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" title="Spotify"></iframe>`
          : pusto('spotify-logo', 'Wklej link do piosenki, płyty lub playlisty w ustawieniach ⚙');
      }

      case 'naklejka':
        return `<div class="naklejka-blok" style="font-size:${Number(d.rozmiar) || 5}rem">${ik(d.ikona || 'star', 'duotone')}</div>`;

      case 'kolaz':
        return this.kolaz(b);

      case 'setlista': {
        const k = Koncertownik.dane.koncerty.find(x => x.id === d.koncertId);
        if (!k) return pusto('music-notes', 'Wybierz koncert w ustawieniach ⚙');
        return `<h3>${ik('music-notes')} Setlista · ${esc(Koncertownik.narzedzia.data(k.data))}${k.miasto ? ', ' + esc(k.miasto) : ''}</h3>
          <ol class="setlista">${(k.setlista || []).map(u => `<li>${esc(u)}</li>`).join('')}</ol>`;
      }

      case 'odstep':
        return this.edycja ? '<div class="odstep-podglad">odstęp</div>' : '';

      default:
        return '';
    }
  },

  // --- Kolaż: elementy położone swobodnie (pozycje w % rozmiaru kolażu) ---
  kolaz(b) {
    const d = b.dane;
    const { esc } = Koncertownik.narzedzia;
    const el = (e) => {
      const styl = `left:${e.x}%;top:${e.y}%;width:${e.w}%;transform:rotate(${e.obrot || 0}deg);z-index:${e.z || 1};`
        + (e.kolor ? `--el-kolor:${e.kolor};` : '')
        + (e.czcionka ? `--el-font:${Koncertownik.motyw.naCss('font', e.czcionka)};` : '')
        + (e.rozmiar ? `--el-rozmiar:${e.rozmiar};` : '');
      Koncertownik.motyw.wczytajFont(e.czcionka);
      let srodek = '';
      if (e.typ === 'zdjecie') srodek = `<img src="${this.url(e.src)}" alt="" draggable="false">`;
      if (e.typ === 'tekst') srodek = `<span class="kolaz-tekst">${esc(e.tekst || '')}</span>`;
      if (e.typ === 'ikona') srodek = Koncertownik.ikony.html(e.ikona || 'star', 'duotone');
      return `<div class="kolaz-el kolaz-${e.typ} ${e.ramka ? 'el-' + e.ramka : ''}" data-el="${e.id}" style="${styl}">${srodek}</div>`;
    };
    const pusty = this.edycja && !d.elementy?.length
      ? '<div class="blok-pusty kolaz-pusty">Dodaj zdjęcia, teksty i naklejki przyciskami nad kolażem</div>' : '';
    return `<div class="kolaz" style="aspect-ratio:${Number(d.proporcja) || 1.6}">${(d.elementy || []).map(el).join('')}${pusty}</div>`;
  },

  // --- Animacja „pojawianie się” – blok wjeżdża, gdy pojawi się na ekranie ---
  obserwujWejscia(kontener) {
    if (!('IntersectionObserver' in window)) return;
    this._obs ||= new IntersectionObserver(wpisy => wpisy.forEach(w => {
      if (w.isIntersecting) { w.target.classList.add('widoczny'); this._obs.unobserve(w.target); }
    }), { threshold: 0.15 });
    kontener.querySelectorAll('.anim-wejscie:not(.widoczny)').forEach(el => this._obs.observe(el));
  },

  // --- Pomocnicze ---
  // Adres obrazka tylko http(s) – zabezpieczenie przed dziwnymi wartościami
  url(adres) {
    return /^https?:\/\//i.test(adres || '') ? String(adres).replace(/["'()\\]/g, encodeURIComponent) : '';
  },

  wideoEmbed(link) {
    const r = link && Koncertownik.media.rozpoznajLink(link);
    if (!r || r.zrodlo === 'link') return '';
    return Koncertownik.media.adresy({ zrodlo: r.zrodlo, adres: r.adres, typ: 'film' }).embed || '';
  },

  spotifyEmbed(link) {
    const m = String(link || '').match(/open\.spotify\.com\/(?:intl-[\w-]+\/)?(track|album|playlist|artist|episode|show)\/([A-Za-z0-9]+)/);
    if (!m) return null;
    return { src: `https://open.spotify.com/embed/${m[1]}/${m[2]}`, wys: m[1] === 'track' || m[1] === 'episode' ? 152 : 352 };
  },

  // Czyści tekst z formatowaniem – zostawia tylko bezpieczne znaczniki i style
  oczysc(html) {
    const TAGI = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'S', 'BR', 'P', 'DIV', 'SPAN', 'A', 'UL', 'OL', 'LI', 'H3', 'FONT']);
    const STYLE = ['color', 'background-color', 'font-weight', 'font-style', 'text-decoration', 'text-align', 'font-size'];
    const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
    const czysc = el => [...el.childNodes].forEach(n => {
      if (n.nodeType === 3) return;                       // zwykły tekst – OK
      if (n.nodeType !== 1 || ['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT'].includes(n.tagName)) { n.remove(); return; }
      czysc(n);
      if (!TAGI.has(n.tagName)) { n.replaceWith(...n.childNodes); return; }
      const zachowaj = STYLE.map(p => [p, n.style.getPropertyValue(p)]).filter(([, w]) => w && !/url|expression/i.test(w));
      const href = n.tagName === 'A' && /^https?:\/\//i.test(n.getAttribute('href') || '') ? n.getAttribute('href') : null;
      const kolor = n.tagName === 'FONT' ? n.getAttribute('color') : null;
      [...n.attributes].forEach(a => n.removeAttribute(a.name));
      zachowaj.forEach(([p, w]) => n.style.setProperty(p, w));
      if (kolor && /^#?[\w]+$/.test(kolor)) n.setAttribute('color', kolor);
      if (href) { n.setAttribute('href', href); n.setAttribute('target', '_blank'); n.setAttribute('rel', 'noopener'); }
    });
    const korzen = doc.body.firstChild;
    czysc(korzen);
    return korzen.innerHTML;
  }
};
