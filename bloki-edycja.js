// =====================================================
//  BLOKI – EDYTOR (tylko po zalogowaniu)
// =====================================================
// Dodawanie, przesuwanie (uchwyt ⠿), zmiana rozmiaru (róg),
// ustawienia w szufladzie, pisanie bezpośrednio w blokach.
// Zmiany zapisuje przycisk „Zapisz układ” na pasku.

Koncertownik.edycjaBlokow = {

  zmiany: false,

  start() {
    const pasek = document.querySelector('.pasek-edycji');
    pasek.querySelector('[data-pasek="wyglad"]').insertAdjacentHTML('beforebegin', `
      <button type="button" class="btn" data-pasek="blok"><i class="ph ph-plus"></i> Blok</button>`);
    pasek.insertAdjacentHTML('beforeend', `
      <button type="button" class="btn btn-zapisz" data-pasek="zapisz" hidden><i class="ph ph-floppy-disk"></i> Zapisz układ</button>`);
    document.body.insertAdjacentHTML('beforeend', this.htmlPaskaTekstu());

    pasek.querySelector('[data-pasek="blok"]').onclick = () => this.oknoDodawania();
    pasek.querySelector('[data-pasek="zapisz"]').onclick = () => this.zapisz();

    const bloki = document.getElementById('bloki');
    bloki.addEventListener('click', e => this.klik(e));
    bloki.addEventListener('pointerdown', e => {
      const el = e.target.closest('.blok');
      if (e.target.closest('.blok-uchwyt')) this.przeciagnij(e, el);
      if (e.target.closest('.blok-rozmiar')) this.rozciagnij(e, el);
    });
    bloki.addEventListener('input', e => this.pisanie(e));
    bloki.addEventListener('focusin', e => this.pokazPasekTekstu(e.target.closest('[data-bogaty]')));
    bloki.addEventListener('focusout', () => setTimeout(() => {
      if (!document.activeElement?.closest('[data-bogaty], .pasek-tekstu')) this.pokazPasekTekstu(null);
    }, 150));

    // Ostrzeżenie przy wyjściu ze strony bez zapisu
    window.addEventListener('beforeunload', e => { if (this.zmiany) { e.preventDefault(); e.returnValue = ''; } });

    Koncertownik.edycjaKolazu?.start();
  },

  // --- Stan ---
  get S() { return Koncertownik.stronaArtysty; },
  znajdz(id) { return this.S.bloki.find(b => b.id === id); },

  zmieniono() {
    this.zmiany = true;
    document.querySelector('[data-pasek="zapisz"]').hidden = false;
  },

  async zapisz() {
    const A = Koncertownik.admin;
    const { error } = await Koncertownik.db.from('artysci').update({ bloki: this.S.bloki }).eq('id', this.S.artysta.id);
    if (error) {
      A.blad(error, /bloki/.test(error.message) ? 'Brakuje kolumny „bloki” – uruchom bloki.sql w Supabase' : 'Nie udało się zapisać');
      return;
    }
    this.zmiany = false;
    document.querySelector('[data-pasek="zapisz"]').hidden = true;
    A.komunikat('Zapisano układ strony ✔');
  },

  // Rysuje blok od nowa i zaznacza zmianę
  odswiez(b) {
    Koncertownik.bloki.odswiezJeden(b);
    document.querySelector(`[data-blok="${b.id}"]`)?.classList.toggle('wybrany', this.wybrany === b.id);
    this.zmieniono();
  },

  // --- Przyciski na blokach ---
  klik(e) {
    const btn = e.target.closest('[data-blok-akcja]');
    if (!btn) return;
    const id = btn.closest('.blok').dataset.blok;
    ({
      ustawienia: () => this.ustawienia(id),
      duplikuj:   () => this.duplikuj(id),
      usun:       () => this.usun(id)
    })[btn.dataset.blokAkcja]?.();
  },

  oknoDodawania() {
    const B = Koncertownik.bloki;
    const okno = document.createElement('dialog');
    okno.className = 'okno';
    okno.innerHTML = `
      <h2>Dodaj blok</h2>
      <div class="wybor-typu wybor-bloku">
        ${Object.entries(B.TYPY).map(([t, o]) => `
          <button type="button" data-typ="${t}"><span>${Koncertownik.ikony.html(o.ikona, 'duotone')} ${o.nazwa}</span></button>`).join('')}
      </div>
      <div class="rzad" style="margin-top:12px"><button type="button" class="btn btn-szary" data-anuluj>Anuluj</button></div>`;
    document.body.appendChild(okno);
    okno.showModal();
    const zamknij = () => { okno.close(); okno.remove(); };
    okno.querySelector('[data-anuluj]').onclick = zamknij;
    okno.addEventListener('cancel', zamknij);
    okno.querySelectorAll('[data-typ]').forEach(b => b.onclick = () => { zamknij(); this.dodaj(b.dataset.typ); });
  },

  dodaj(typ) {
    if (typ === 'koncerty' && this.S.bloki.some(b => b.typ === 'koncerty')) {
      Koncertownik.admin.komunikat('Blok z koncertami już jest na stronie', true);
      return;
    }
    const b = Koncertownik.bloki.nowy(typ);
    this.S.bloki.push(b);
    document.getElementById('bloki').appendChild(Koncertownik.bloki.element(b));
    this.zmieniono();
    document.querySelector(`[data-blok="${b.id}"]`).scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (!['tekst', 'naglowek', 'odstep', 'koncerty'].includes(typ)) this.ustawienia(b.id);
  },

  duplikuj(id) {
    const i = this.S.bloki.findIndex(b => b.id === id);
    const kopia = structuredClone(this.S.bloki[i]);
    if (kopia.typ === 'koncerty') return Koncertownik.admin.komunikat('Bloku z koncertami nie da się powielić', true);
    kopia.id = Koncertownik.bloki.nowy(kopia.typ).id;
    this.S.bloki.splice(i + 1, 0, kopia);
    document.querySelector(`[data-blok="${id}"]`).after(Koncertownik.bloki.element(kopia));
    this.zmieniono();
  },

  usun(id) {
    const b = this.znajdz(id);
    const pytanie = b.typ === 'koncerty'
      ? 'Usunąć blok z koncertami? Koncerty zostaną w bazie, ale znikną z tej strony (możesz go dodać z powrotem).'
      : 'Usunąć ten blok?';
    if (!confirm(pytanie)) return;
    this.S.bloki = this.S.bloki.filter(x => x.id !== id);
    document.querySelector(`[data-blok="${id}"]`).remove();
    if (this.wybrany === id) document.getElementById('szuflada').hidden = true;
    this.zmieniono();
  },

  // --- Pisanie bezpośrednio w bloku ---
  pisanie(e) {
    const pole = e.target.closest('[data-pole]');
    if (!pole) return;
    const b = this.znajdz(pole.closest('.blok').dataset.blok);
    if (!b) return;
    b.dane[pole.dataset.pole] = pole.hasAttribute('data-bogaty')
      ? Koncertownik.bloki.oczysc(pole.innerHTML)
      : pole.innerText.trim();
    this.zmieniono();
  },

  // Pasek formatowania nad tekstem
  htmlPaskaTekstu() {
    const p = (k, ik, t) => `<button type="button" data-cmd="${k}" title="${t}"><i class="ph ph-${ik}"></i></button>`;
    return `<div class="pasek-tekstu" hidden>
      ${p('bold', 'text-b', 'Pogrubienie')}${p('italic', 'text-italic', 'Kursywa')}${p('underline', 'text-underline', 'Podkreślenie')}
      ${p('strikeThrough', 'text-strikethrough', 'Przekreślenie')}${p('h3', 'text-h-three', 'Śródtytuł')}
      ${p('insertUnorderedList', 'list-bullets', 'Lista')}${p('createLink', 'link', 'Link')}
      <label title="Kolor tekstu"><i class="ph ph-palette"></i><input type="color" data-cmd-kolor value="#ffffff"></label>
      ${p('removeFormat', 'text-t-slash', 'Wyczyść formatowanie')}
    </div>`;
  },

  pokazPasekTekstu(pole) {
    const pasek = document.querySelector('.pasek-tekstu');
    if (!pole) { pasek.hidden = true; return; }
    this.aktywnePole = pole;
    const r = pole.getBoundingClientRect();
    pasek.hidden = false;
    pasek.style.top = Math.max(8, r.top - pasek.offsetHeight - 8) + 'px';
    pasek.style.left = Math.max(8, Math.min(r.left, innerWidth - pasek.offsetWidth - 8)) + 'px';

    if (pasek.dataset.podpiety) return;
    pasek.dataset.podpiety = 1;
    pasek.addEventListener('mousedown', e => { if (!e.target.closest('input')) e.preventDefault(); });
    pasek.addEventListener('click', e => {
      const btn = e.target.closest('[data-cmd]');
      if (!btn) return;
      const cmd = btn.dataset.cmd;
      document.execCommand('styleWithCSS', false, true);
      if (cmd === 'h3') {
        const juz = document.queryCommandValue('formatBlock').toLowerCase() === 'h3';
        document.execCommand('formatBlock', false, juz ? 'div' : 'h3');
      } else if (cmd === 'createLink') {
        const url = prompt('Adres linku (https://…)');
        if (url && /^https?:\/\//.test(url)) document.execCommand('createLink', false, url);
      } else {
        document.execCommand(cmd);
      }
      this.aktywnePole?.dispatchEvent(new Event('input', { bubbles: true }));
    });
    pasek.querySelector('[data-cmd-kolor]').addEventListener('input', e => {
      this.aktywnePole?.focus();
      document.execCommand('styleWithCSS', false, true);
      document.execCommand('foreColor', false, e.target.value);
      this.aktywnePole?.dispatchEvent(new Event('input', { bubbles: true }));
    });
  },

  // --- Przesuwanie bloku (chwyć za uchwyt ⠿ i przeciągnij) ---
  przeciagnij(e, el) {
    e.preventDefault();
    const kontener = el.parentElement;
    el.classList.add('przeciagany');
    document.body.classList.add('przeciaganie');

    const ruch = ev => {
      // Przy krawędzi ekranu strona sama się przewija
      if (ev.clientY < 70) scrollBy(0, -18);
      else if (ev.clientY > innerHeight - 90) scrollBy(0, 18);
      const cel = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('.blok');
      if (!cel || cel === el || cel.parentElement !== kontener) return;
      const r = cel.getBoundingClientRect();
      const szeroki = r.width > r.height * 1.5;
      const przed = szeroki ? ev.clientY < r.top + r.height / 2 : ev.clientX < r.left + r.width / 2;
      kontener.insertBefore(el, przed ? cel : cel.nextSibling);
    };
    const koniec = () => {
      removeEventListener('pointermove', ruch);
      removeEventListener('pointerup', koniec);
      el.classList.remove('przeciagany');
      document.body.classList.remove('przeciaganie');
      const kolejnosc = [...kontener.children].map(x => x.dataset.blok);
      this.S.bloki.sort((a, b) => kolejnosc.indexOf(a.id) - kolejnosc.indexOf(b.id));
      this.zmieniono();
    };
    addEventListener('pointermove', ruch);
    addEventListener('pointerup', koniec);
  },

  // --- Zmiana rozmiaru (ciągnij za prawy dolny róg) ---
  rozciagnij(e, el) {
    e.preventDefault();
    const b = this.znajdz(el.dataset.blok);
    const siatka = el.parentElement;
    const odstep = parseFloat(getComputedStyle(siatka).columnGap) || 15;
    const kolumna = (siatka.clientWidth - odstep * 11) / 12;
    const kolaz = el.querySelector('.kolaz');
    const start = { x: e.clientX, y: e.clientY, w: el.offsetWidth, h: el.offsetHeight, kh: kolaz?.offsetHeight };
    document.body.classList.add('przeciaganie');

    const ruch = ev => {
      const dx = ev.clientX - start.x, dy = ev.clientY - start.y;
      if (innerWidth > 700) {
        b.szer = Math.max(2, Math.min(12, Math.round((start.w + dx + odstep) / (kolumna + odstep))));
        el.style.setProperty('--szer', b.szer);
      }
      if (kolaz) {
        const wys = Math.max(80, start.kh + dy);
        b.dane.proporcja = Math.round(kolaz.offsetWidth / wys * 100) / 100;
        kolaz.style.aspectRatio = b.dane.proporcja;
      } else if (Math.abs(dy) > 6) {
        b.wys = Math.max(40, Math.round((start.h + dy) / 10) * 10);
        el.style.setProperty('--wys', b.wys + 'px');
      }
    };
    const koniec = () => {
      removeEventListener('pointermove', ruch);
      removeEventListener('pointerup', koniec);
      document.body.classList.remove('przeciaganie');
      this.zmieniono();
    };
    addEventListener('pointermove', ruch);
    addEventListener('pointerup', koniec);
  },

  // --- Wgrywanie obrazka (zmniejszony) do publicznego schowka ---
  async wgrajObraz(plik) {
    const A = Koncertownik.admin;
    A.komunikat('Wgrywam zdjęcie…');
    const maly = await Koncertownik.media.zmniejsz(plik, 2200);
    const sciezka = await A.wgrajPlik('obrazy', maly, 'artysci/' + this.S.artysta.id);
    if (!sciezka) return null;
    A.komunikat('Zdjęcie wgrane ✔');
    return Koncertownik.db.storage.from('obrazy').getPublicUrl(sciezka).data.publicUrl;
  },

  // Link z Dysku Google zamieniamy na adres obrazka
  obrazZLinku(link) {
    const url = String(link || '').trim();
    if (/drive\.google\.com/.test(url)) {
      const id = Koncertownik.media.driveId(url);
      if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w2000`;
    }
    return /^https?:\/\//.test(url) ? url : '';
  }
};
