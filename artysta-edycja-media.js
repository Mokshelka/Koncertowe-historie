// =====================================================
//  STRONA ARTYSTY – zdjęcia, nagrania, bilety, foldery
// =====================================================
// Dodawanie z urządzenia albo z linku (YouTube, Dysk Google),
// przełączanie publiczne/prywatne i usuwanie.

Koncertownik.edycjaArtysty.media = {

  TYPY: {
    zdjecie: { nazwa: 'Zdjęcia',          ikona: 'camera',        akceptuj: 'image/*' },
    film:    { nazwa: 'Nagranie',         ikona: 'film-strip',    akceptuj: 'video/*' },
    bilet:   { nazwa: 'Bilet',            ikona: 'ticket',        akceptuj: 'image/*,application/pdf' },
    folder:  { nazwa: 'Folder z Dysku',   ikona: 'folder-simple', akceptuj: '' }
  },

  otworz(k) {
    const { esc, data } = Koncertownik.narzedzia;
    const I = Koncertownik.ikony;
    const okno = document.createElement('dialog');
    okno.className = 'okno';
    okno.innerHTML = `
      <form class="formularz">
        <h2>Dodaj do koncertu <small>${esc(data(k.data))}${k.miasto ? ' · ' + esc(k.miasto) : ''}</small></h2>

        <div class="wybor-typu">
          ${Object.entries(this.TYPY).map(([t, o], i) => `
            <label><input type="radio" name="typ" value="${t}" ${i === 0 ? 'checked' : ''}>
              <span>${I.html(o.ikona, 'duotone')} ${o.nazwa}</span></label>`).join('')}
        </div>

        <label data-tylko-pliki>Z urządzenia (możesz wybrać kilka)
          <input type="file" name="pliki" multiple accept="image/*">
        </label>
        <small class="podpowiedz" data-tylko-pliki>Zdjęcia są automatycznie zmniejszane. Filmy: max ${Koncertownik.media.LIMIT_MB} MB na plik – dłuższe wrzuć na YouTube lub Dysk.</small>

        <label>…albo link(i) – jeden w linii
          <textarea name="linki" rows="3" placeholder="https://drive.google.com/…  albo  https://youtu.be/…"></textarea>
        </label>
        <small class="podpowiedz">Dysk Google: w pliku/folderze kliknij „Udostępnij” → „Każdy, kto ma link”.</small>

        <label>Opis (opcjonalnie) <input type="text" name="opis" maxlength="200"></label>

        <label class="pole-wyboru" data-publiczne>
          <input type="checkbox" name="publiczne" checked> Publiczne – widoczne dla odwiedzających
        </label>
        <small class="podpowiedz" data-tylko-bilet hidden><i class="ph ph-lock-simple"></i> Bilety są zawsze prywatne.</small>

        <p class="postep" aria-live="polite"></p>
        <div class="rzad">
          <button type="submit" class="btn">Dodaj</button>
          <button type="button" class="btn btn-szary" data-anuluj>Anuluj</button>
        </div>
      </form>`;
    document.body.appendChild(okno);
    okno.showModal();

    const form = okno.querySelector('form');
    const zamknij = () => { okno.close(); okno.remove(); };
    okno.querySelector('[data-anuluj]').onclick = zamknij;
    okno.addEventListener('cancel', zamknij);

    // Dopasowanie formularza do wybranego typu
    const ustawTyp = () => {
      const t = form.typ.value;
      form.pliki.accept = this.TYPY[t].akceptuj;
      form.querySelectorAll('[data-tylko-pliki]').forEach(el => el.hidden = t === 'folder');
      form.querySelector('[data-publiczne]').hidden = t === 'bilet';
      form.querySelector('[data-tylko-bilet]').hidden = t !== 'bilet';
    };
    form.addEventListener('change', e => { if (e.target.name === 'typ') ustawTyp(); });

    form.onsubmit = async e => {
      e.preventDefault();
      const przycisk = form.querySelector('[type=submit]');
      przycisk.disabled = true;
      const ok = await this.dodaj(form, k);
      przycisk.disabled = false;
      if (ok) zamknij();
    };
  },

  async dodaj(form, k) {
    const A = Koncertownik.admin;
    const M = Koncertownik.media;
    const typ = form.typ.value;
    const opis = form.opis.value.trim();
    const publiczne = typ !== 'bilet' && form.publiczne.checked;
    const postep = form.querySelector('.postep');
    const pliki = typ === 'folder' ? [] : [...form.pliki.files];
    const linki = A.linie(form.linki.value);

    if (!pliki.length && !linki.length) {
      A.komunikat('Wybierz plik albo wklej link', true);
      return false;
    }

    const wiersze = [];

    // Linki
    for (const link of linki) {
      const r = M.rozpoznajLink(link);
      if (!r) { A.komunikat('To nie wygląda na link: ' + link, true); return false; }
      if (typ === 'folder' && !r.folder) { A.komunikat('To nie jest link do folderu z Dysku Google', true); return false; }
      wiersze.push({ koncert_id: k.id, typ, zrodlo: r.zrodlo, adres: r.adres, opis, publiczne });
    }

    // Pliki z urządzenia
    for (const [i, oryginal] of pliki.entries()) {
      postep.textContent = `Wgrywam ${i + 1} z ${pliki.length}…`;
      if (oryginal.size > M.LIMIT_MB * 1024 * 1024) {
        A.komunikat(`${oryginal.name} jest za duży (max ${M.LIMIT_MB} MB) – pominięty`, true);
        continue;
      }
      const plik = typ === 'zdjecie' ? await M.zmniejsz(oryginal) : oryginal;
      const sciezka = await A.wgrajPlik('media', plik, k.id);
      if (sciezka) {
        wiersze.push({ koncert_id: k.id, typ, zrodlo: 'plik', schowek: 'media', adres: sciezka,
                       opis: opis || (typ === 'bilet' ? oryginal.name : ''), publiczne });
      }
    }

    if (!wiersze.length) { postep.textContent = ''; return false; }
    const { error } = await Koncertownik.db.from('media').insert(wiersze);
    if (A.blad(error, 'Nie udało się zapisać')) return false;

    A.komunikat(`Dodano: ${wiersze.length} ✔`);
    await Koncertownik.edycjaArtysty.odswiez();
    return true;
  },

  // Publiczne <-> prywatne
  async przelacz(m) {
    const A = Koncertownik.admin;
    const { error } = await Koncertownik.db.from('media').update({ publiczne: !m.publiczne }).eq('id', m.id);
    if (A.blad(error, 'Nie udało się zmienić')) return;
    A.komunikat(m.publiczne ? 'Teraz prywatne – widzisz je tylko Ty' : 'Teraz publiczne – widzą je wszyscy');
    Koncertownik.edycjaArtysty.odswiez();
  },

  async usun(m) {
    if (!confirm('Usunąć na zawsze?')) return;
    const A = Koncertownik.admin;
    await Koncertownik.media.usunPliki([m]);
    const { error } = await Koncertownik.db.from('media').delete().eq('id', m.id);
    if (A.blad(error, 'Nie udało się usunąć')) return;
    A.komunikat('Usunięto');
    Koncertownik.edycjaArtysty.odswiez();
  }
};
