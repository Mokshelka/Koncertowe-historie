// =====================================================
//  PANEL – zakładka WYGLĄD (tytuł, opis, motyw całej strony)
// =====================================================

Koncertownik.admin.wyglad = {

  pokaz(el) {
    const { esc } = Koncertownik.narzedzia;
    const E = Koncertownik.admin.edytorMotywu;
    const u = Koncertownik.dane.ustawienia;

    el.innerHTML = `
      <section>
        <h2>Wygląd całej strony</h2>
        <form class="formularz">
          <label>Tytuł <input type="text" name="tytul" value="${esc(u.tytul)}"></label>
          <label>Opis pod tytułem <textarea name="opis" rows="3">${esc(u.opis)}</textarea></label>
          <label>Stopka <input type="text" name="stopka" value="${esc(u.stopka)}"></label>
          <h3>🎨 Kolory, tło i czcionki</h3>
          <small class="podpowiedz">Zmiany od razu widać na panelu. Artyści z własnym motywem nadpisują tylko swoje kolory.</small>
          ${E.html(Koncertownik.motyw.strony())}
          <div class="rzad">
            <button type="submit" class="btn">Zapisz</button>
            <button type="button" class="btn btn-szary" data-domyslne>Przywróć domyślne fioletowe</button>
          </div>
        </form>
      </section>`;

    const form = el.querySelector('form');
    E.podepnij(form);
    form.onsubmit = e => { e.preventDefault(); this.zapisz(form); };
    form.querySelector('[data-domyslne]').onclick = () => {
      if (!confirm('Przywrócić domyślne kolory i czcionki? (zapisze się od razu)')) return;
      this.zapisz(form, {});
    };
  },

  async zapisz(form, motyw) {
    const A = Koncertownik.admin;
    const { error } = await Koncertownik.db.from('ustawienia').upsert({
      id: 1,
      tytul:  form.tytul.value.trim(),
      opis:   form.opis.value.trim(),
      stopka: form.stopka.value.trim(),
      motyw:  motyw ?? A.edytorMotywu.odczytaj(form)
    });
    if (A.blad(error, 'Nie udało się zapisać')) return;
    A.komunikat('Zapisano ✔');
    A.odswiez();
  }
};
