// =====================================================
//  PANEL – zakładka KSIĘGA GOŚCI (przeglądanie i usuwanie)
// =====================================================

Koncertownik.admin.ksiega = {

  async pokaz(el) {
    const { esc } = Koncertownik.narzedzia;
    el.innerHTML = '<section><h2>Księga gości</h2><p>Wczytuję…</p></section>';

    const { data, error } = await Koncertownik.db.from('ksiega').select('*').order('utworzono', { ascending: false });
    if (Koncertownik.admin.blad(error, 'Nie udało się wczytać wpisów')) return;

    el.innerHTML = `
      <section>
        <h2>Księga gości (${data.length})</h2>
        <ul class="lista-admin">
          ${data.map(w => `
            <li>
              <span><b>${esc(w.imie)}</b> <small>${new Date(w.utworzono).toLocaleString('pl-PL')}</small><br>${esc(w.tresc)}</span>
              <span class="akcje"><button type="button" class="btn btn-maly btn-usun" data-usun="${w.id}">Usuń</button></span>
            </li>`).join('') || '<li>Brak wpisów.</li>'}
        </ul>
      </section>`;

    el.querySelectorAll('[data-usun]').forEach(b => b.onclick = async () => {
      if (!confirm('Usunąć ten wpis?')) return;
      const { error } = await Koncertownik.db.from('ksiega').delete().eq('id', b.dataset.usun);
      if (Koncertownik.admin.blad(error, 'Nie udało się usunąć')) return;
      this.pokaz(el);
    });
  }
};
