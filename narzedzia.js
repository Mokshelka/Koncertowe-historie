// =====================================================
//  NARZĘDZIA – małe funkcje używane w wielu miejscach
// =====================================================

window.Koncertownik = window.Koncertownik || {};

Koncertownik.narzedzia = {

  // Zabezpiecza tekst przed wstawieniem do HTML
  // (ważne, gdy treść przyjdzie z formularza lub bazy).
  esc(tekst) {
    return String(tekst ?? '').replace(/[&<>"']/g, z => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[z]);
  },

  // '2024-05-12' -> '12 maja 2024'
  data(tekst) {
    if (!tekst) return 'data do uzupełnienia';
    const d = new Date(tekst + 'T12:00:00');
    if (isNaN(d)) return tekst;
    return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
  },

  // Wyciąga ID filmu z linku YouTube (youtu.be/…, watch?v=…, shorts/…)
  youtubeId(link) {
    const m = String(link).match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);
    return m ? m[1] : null;
  },

  // Wszystkie koncerty danego artysty, od najnowszego
  koncertyArtysty(id) {
    return Koncertownik.dane.koncerty
      .filter(k => k.artysta === id)
      .sort((a, b) => (b.data || '').localeCompare(a.data || ''));
  }
};
