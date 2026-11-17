// =====================================================
//  STRONA ARTYSTY – dodawanie i edycja koncertu
// =====================================================
// Okienko z datą, miastem, miejscem i setlistą.

Koncertownik.edycjaArtysty.koncert = {

  otworz(k) {
    const { esc } = Koncertownik.narzedzia;
    const { miasta } = Koncertownik.dane;
    const okno = document.createElement('dialog');
    okno.className = 'okno';
    okno.innerHTML = `
      <form class="formularz" method="dialog">
        <h2>${k.id ? 'Edycja koncertu' : 'Nowy koncert'}</h2>
        <div class="rzad">
          <label>Data <input type="date" name="data" value="${esc(k.data || '')}"></label>
          <label>Miasto
            <select name="miasto">
              <option value="">— wybierz —</option>
              ${miasta.map(m => `<option ${m.nazwa === k.miasto ? 'selected' : ''}>${esc(m.nazwa)}</option>`).join('')}
            </select>
          </label>
        </div>
        <small class="podpowiedz">Brakuje miasta? Dodaj je w panelu w zakładce Miasta.</small>
        <label>Miejsce (klub, hala) <input type="text" name="miejsce" value="${esc(k.miejsce || '')}"></label>
        <label>Setlista <small>(jedna piosenka w linii)</small>
          <textarea name="setlista" rows="8">${esc((k.setlista || []).join('\n'))}</textarea>
        </label>
        <div class="rzad">
          <button type="submit" class="btn" value="zapisz">Zapisz</button>
          <button type="button" class="btn btn-szary" data-anuluj>Anuluj</button>
          ${k.id ? '<button type="button" class="btn btn-usun" data-usun style="margin-left:auto">Usuń koncert</button>' : ''}
        </div>
      </form>`;
    document.body.appendChild(okno);
    okno.showModal();

    const form = okno.querySelector('form');
    const zamknij = () => { okno.close(); okno.remove(); };
    okno.querySelector('[data-anuluj]').onclick = zamknij;
    okno.addEventListener('cancel', zamknij);
    okno.querySelector('[data-usun]')?.addEventListener('click', () => this.usun(k, zamknij));
    form.onsubmit = async e => {
      e.preventDefault();
      if (await this.zapisz(form, k)) zamknij();
    };
  },

  async zapisz(form, k) {
    const A = Koncertownik.admin;
    const wiersz = {
      artysta_id: k.artysta,
      data:     form.data.value || null,
      miasto:   form.miasto.value || null,
      miejsce:  form.miejsce.value.trim() || null,
      setlista: A.linie(form.setlista.value)
    };
    const { error } = k.id
      ? await Koncertownik.db.from('koncerty').update(wiersz).eq('id', k.id)
      : await Koncertownik.db.from('koncerty').insert(wiersz);
    if (A.blad(error, 'Nie udało się zapisać')) return false;
    A.komunikat('Zapisano ✔');
    await Koncertownik.edycjaArtysty.odswiez();
    return true;
  },

  async usun(k, zamknij) {
    if (!confirm('Na pewno usunąć ten koncert razem ze zdjęciami, nagraniami i biletami?')) return;
    const A = Koncertownik.admin;
    const media = Koncertownik.stronaArtysty.media.filter(m => m.koncert_id === k.id);
    await Koncertownik.media.usunPliki(media);
    const { error } = await Koncertownik.db.from('koncerty').delete().eq('id', k.id);
    if (A.blad(error, 'Nie udało się usunąć')) return;
    zamknij();
    A.komunikat('Usunięto koncert');
    Koncertownik.edycjaArtysty.odswiez();
  }
};
