// =====================================================
//  KSIĘGA GOŚCI – zapis i wyświetlanie wpisów
// =====================================================

Koncertownik.ksiega = {

  start() {
    const form = document.getElementById('guestbookForm');
    if (!form) return;
    form.addEventListener('submit', e => { e.preventDefault(); this.wyslij(form); });
    this.pokazWpisy();
  },

  // Ostatnie 30 wpisów, od najnowszego
  async pokazWpisy() {
    const { esc } = Koncertownik.narzedzia;
    const lista = document.getElementById('wpisyKsiegi');
    const { data, error } = await Koncertownik.db
      .from('ksiega').select('imie, tresc, utworzono')
      .order('utworzono', { ascending: false }).limit(30);
    if (error || !data.length) { lista.innerHTML = ''; return; }

    lista.innerHTML = data.map(w => `
      <div class="wpis">
        <p class="wpis-tresc">${esc(w.tresc)}</p>
        <p class="wpis-autor">— ${esc(w.imie)}, ${new Date(w.utworzono).toLocaleDateString('pl-PL')}</p>
      </div>`).join('');
  },

  async wyslij(form) {
    const info = document.getElementById('guestbookInfo');
    // Pole-pułapka na boty: człowiek go nie widzi, bot je wypełnia
    if (form.www.value) return;

    const przycisk = form.querySelector('button');
    przycisk.disabled = true;
    const { error } = await Koncertownik.db.from('ksiega').insert({
      imie: form.imie.value.trim(),
      tresc: form.tresc.value.trim()
    });
    przycisk.disabled = false;

    if (error) {
      console.error(error);
      info.textContent = 'Ups, nie udało się wysłać. Spróbuj jeszcze raz.';
      return;
    }
    info.textContent = 'Dziękuję za wpis!';
    form.reset();
    this.pokazWpisy();
    setTimeout(() => { info.textContent = ''; }, 4000);
  }
};
