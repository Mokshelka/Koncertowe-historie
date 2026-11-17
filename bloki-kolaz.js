// =====================================================
//  BLOKI – EDYTOR KOLAŻU (swobodne układanie)
// =====================================================
// Kliknij element → przesuwasz go; róg ↘ zmienia rozmiar,
// kółko u góry obraca; dwuklik na tekście → piszesz.
// Pozycje są w % rozmiaru kolażu, więc na telefonie
// wszystko skaluje się razem.

Koncertownik.edycjaKolazu = {

  start() {
    const bloki = document.getElementById('bloki');
    document.body.insertAdjacentHTML('beforeend', `
      <div class="pasek-elementu" hidden>
        <button type="button" data-el-akcja="mniejszy" title="Mniejszy tekst"><i class="ph ph-text-aa"></i>−</button>
        <button type="button" data-el-akcja="wiekszy" title="Większy tekst"><i class="ph ph-text-aa"></i>+</button>
        <label title="Kolor"><i class="ph ph-palette"></i><input type="color" data-el-kolor></label>
        <select data-el-czcionka title="Czcionka"><option value="">Czcionka…</option>
          ${Koncertownik.edycjaBlokow.CZCIONKI.map(f => `<option>${f}</option>`).join('')}</select>
        <button type="button" data-el-akcja="ramka" title="Ramka zdjęcia"><i class="ph ph-frame-corners"></i></button>
        <button type="button" data-el-akcja="wierzch" title="Na wierzch"><i class="ph ph-stack-plus"></i></button>
        <button type="button" data-el-akcja="spod" title="Pod spód"><i class="ph ph-stack-minus"></i></button>
        <button type="button" data-el-akcja="usun" title="Usuń"><i class="ph ph-trash"></i></button>
      </div>`);

    bloki.addEventListener('click', e => {
      const btn = e.target.closest('[data-kolaz-akcja]');
      if (btn) this.dodaj(btn.closest('.blok').dataset.blok, btn.dataset.kolazAkcja);
    });
    bloki.addEventListener('pointerdown', e => this.nacisniecie(e));
    bloki.addEventListener('dblclick', e => this.edytujTekst(e.target.closest('.kolaz-tekst')));
    document.addEventListener('pointerdown', e => {
      if (!e.target.closest('.kolaz-el, .pasek-elementu')) this.odznacz();
    });
    document.addEventListener('keydown', e => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && this.wybrany && !document.activeElement?.isContentEditable
          && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)) this.akcja('usun');
    });

    const pasek = document.querySelector('.pasek-elementu');
    pasek.addEventListener('click', e => { const b = e.target.closest('[data-el-akcja]'); if (b) this.akcja(b.dataset.elAkcja); });
    pasek.querySelector('[data-el-kolor]').addEventListener('input', e => this.zmien({ kolor: e.target.value }));
    pasek.querySelector('[data-el-czcionka]').addEventListener('change', e => this.zmien({ czcionka: e.target.value }));
  },

  get E() { return Koncertownik.edycjaBlokow; },

  // Element kolażu (dane) i jego blok
  dane(elDom) {
    const b = this.E.znajdz(elDom.closest('.blok').dataset.blok);
    return { b, e: b.dane.elementy.find(x => x.id === elDom.dataset.el) };
  },

  nowyId() { return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); },

  // --- Dodawanie elementów ---
  async dodaj(blokId, typ) {
    const b = this.E.znajdz(blokId);
    const z = Math.max(0, ...b.dane.elementy.map(x => x.z || 0)) + 1;
    const los = (a, c) => Math.round(a + Math.random() * (c - a));
    const baza = { id: this.nowyId(), x: los(10, 55), y: los(10, 50), obrot: los(-8, 8), z };

    if (typ === 'zdjecie') {
      const pliki = await this.wybierzPliki();
      for (const plik of pliki) {
        const src = await this.E.wgrajObraz(plik);
        if (src) b.dane.elementy.push({ ...baza, id: this.nowyId(), x: los(5, 60), y: los(5, 50), typ: 'zdjecie', src, w: 30, ramka: 'polaroid' });
      }
    }
    if (typ === 'tekst') b.dane.elementy.push({ ...baza, typ: 'tekst', tekst: 'Twój tekst', w: 45, rozmiar: 6, obrot: 0 });
    if (typ === 'ikona') {
      const ikona = await this.wybierzIkone();
      if (ikona) b.dane.elementy.push({ ...baza, typ: 'ikona', ikona, w: 14, rozmiar: 12 });
    }
    this.E.odswiez(b);
  },

  wybierzPliki() {
    return new Promise(ok => {
      const inp = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/*', multiple: true });
      inp.onchange = () => ok([...inp.files]);
      inp.click();
    });
  },

  wybierzIkone() {
    return new Promise(ok => {
      const okno = document.createElement('dialog');
      okno.className = 'okno';
      okno.innerHTML = `<h2>Wybierz naklejkę</h2><div data-wyb></div>
        <div class="rzad" style="margin-top:10px"><button type="button" class="btn btn-szary" data-anuluj>Anuluj</button></div>`;
      document.body.appendChild(okno);
      okno.showModal();
      const koniec = w => { okno.close(); okno.remove(); ok(w); };
      okno.querySelector('[data-anuluj]').onclick = () => koniec(null);
      okno.addEventListener('cancel', () => koniec(null));
      Koncertownik.admin.bibliotekaIkon.wybierak(okno.querySelector('[data-wyb]'), { podpis: '', przyNazwie: koniec });
    });
  },

  // --- Zaznaczanie ---
  zaznacz(elDom) {
    this.odznacz();
    this.wybrany = elDom;
    elDom.classList.add('wybrany-el');
    elDom.insertAdjacentHTML('beforeend', '<span class="uchwyt-el uchwyt-rozmiar-el"></span><span class="uchwyt-el uchwyt-obrot-el"></span>');
    const { e } = this.dane(elDom);
    const pasek = document.querySelector('.pasek-elementu');
    pasek.hidden = false;
    pasek.querySelectorAll('[data-el-akcja="mniejszy"], [data-el-akcja="wiekszy"], [data-el-kolor]')
      .forEach(x => (x.closest('label') || x).hidden = e.typ === 'zdjecie');
    pasek.querySelector('[data-el-czcionka]').hidden = e.typ !== 'tekst';
    pasek.querySelector('[data-el-czcionka]').value = e.czcionka || '';
    pasek.querySelector('[data-el-akcja="ramka"]').hidden = e.typ !== 'zdjecie';
    this.ustawPasek();
  },

  ustawPasek() {
    if (!this.wybrany) return;
    const pasek = document.querySelector('.pasek-elementu');
    const r = this.wybrany.getBoundingClientRect();
    // Pasek pod elementem (nad nim jest kółko do obracania); gdy brak miejsca – wyżej
    const podSpodem = r.bottom + 22;
    pasek.style.top = (podSpodem + pasek.offsetHeight < innerHeight - 80
      ? podSpodem : Math.max(8, r.top - pasek.offsetHeight - 50)) + 'px';
    pasek.style.left = Math.max(8, Math.min(r.left, innerWidth - pasek.offsetWidth - 8)) + 'px';
  },

  odznacz() {
    if (!this.wybrany) return;
    this.wybrany.classList.remove('wybrany-el');
    this.wybrany.querySelectorAll('.uchwyt-el').forEach(u => u.remove());
    this.wybrany = null;
    document.querySelector('.pasek-elementu').hidden = true;
  },

  // --- Przesuwanie, rozmiar, obrót ---
  nacisniecie(ev) {
    const elDom = ev.target.closest('.kolaz-el');
    if (!elDom || elDom.querySelector('[contenteditable="true"]')) return;
    ev.preventDefault();
    if (this.wybrany !== elDom) this.zaznacz(elDom);
    const { e } = this.dane(elDom);
    const kolaz = elDom.closest('.kolaz').getBoundingClientRect();
    const tryb = ev.target.closest('.uchwyt-rozmiar-el') ? 'rozmiar' : ev.target.closest('.uchwyt-obrot-el') ? 'obrot' : 'ruch';
    const start = { x: ev.clientX, y: ev.clientY, ex: e.x, ey: e.y, w: e.w, rozmiar: e.rozmiar };
    const r = elDom.getBoundingClientRect();
    const srodek = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    document.body.classList.add('przeciaganie');

    const ruch = m => {
      const dx = (m.clientX - start.x) / kolaz.width * 100;
      const dy = (m.clientY - start.y) / kolaz.height * 100;
      if (tryb === 'ruch') {
        e.x = Math.round(Math.max(-30, Math.min(100, start.ex + dx)) * 10) / 10;
        e.y = Math.round(Math.max(-30, Math.min(100, start.ey + dy)) * 10) / 10;
      } else if (tryb === 'rozmiar') {
        e.w = Math.round(Math.max(3, Math.min(150, start.w + dx)) * 10) / 10;
        if (e.typ === 'ikona') e.rozmiar = Math.round(e.w * 0.9 * 10) / 10;
      } else {
        let kat = Math.atan2(m.clientY - srodek.y, m.clientX - srodek.x) * 180 / Math.PI + 90;
        if (Math.abs(kat) < 4) kat = 0;                         // łatwo wrócić do prostego
        e.obrot = Math.round(kat);
      }
      this.ustawStyl(elDom, e);
      this.ustawPasek();
    };
    const koniec = () => {
      removeEventListener('pointermove', ruch);
      removeEventListener('pointerup', koniec);
      document.body.classList.remove('przeciaganie');
      this.E.zmieniono();
    };
    addEventListener('pointermove', ruch);
    addEventListener('pointerup', koniec);
  },

  ustawStyl(elDom, e) {
    Object.assign(elDom.style, { left: e.x + '%', top: e.y + '%', width: e.w + '%', transform: `rotate(${e.obrot || 0}deg)`, zIndex: e.z || 1 });
    if (e.rozmiar) elDom.style.setProperty('--el-rozmiar', e.rozmiar);
  },

  // --- Tekst ---
  edytujTekst(span) {
    if (!span) return;
    const elDom = span.closest('.kolaz-el');
    span.contentEditable = 'true';
    span.focus();
    document.getSelection().selectAllChildren(span);
    span.addEventListener('blur', () => {
      span.contentEditable = 'false';
      const { e } = this.dane(elDom);
      e.tekst = span.innerText.trim() || 'Tekst';
      this.E.zmieniono();
    }, { once: true });
  },

  // --- Przyciski paska elementu ---
  zmien(zmiany) {
    if (!this.wybrany) return;
    const { b, e } = this.dane(this.wybrany);
    Object.assign(e, zmiany);
    const id = e.id;
    this.E.odswiez(b);
    const nowy = document.querySelector(`[data-blok="${b.id}"] [data-el="${id}"]`);
    this.wybrany = null;
    if (nowy) this.zaznacz(nowy);
  },

  akcja(nazwa) {
    if (!this.wybrany) return;
    const { b, e } = this.dane(this.wybrany);
    const lista = b.dane.elementy;
    const ramki = ['', 'polaroid', 'tasma', 'okragle'];
    switch (nazwa) {
      case 'wiekszy':  return this.zmien({ rozmiar: Math.round((e.rozmiar || 6) * 1.15 * 10) / 10 });
      case 'mniejszy': return this.zmien({ rozmiar: Math.round((e.rozmiar || 6) / 1.15 * 10) / 10 });
      case 'ramka':    return this.zmien({ ramka: ramki[(ramki.indexOf(e.ramka || '') + 1) % ramki.length] });
      case 'wierzch':  return this.zmien({ z: Math.max(...lista.map(x => x.z || 0)) + 1 });
      case 'spod':     return this.zmien({ z: Math.min(...lista.map(x => x.z || 0)) - 1 });
      case 'usun':
        b.dane.elementy = lista.filter(x => x.id !== e.id);
        this.odznacz();
        this.E.odswiez(b);
    }
  }
};
