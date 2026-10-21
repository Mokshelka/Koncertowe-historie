// =====================================================
//  IKONY – Phosphor Icons (phosphoricons.com)
// =====================================================
// Ikona artysty jest zapisana w jego motywie jako „ikona”,
// np. 'skull'. Pełna lista nazw: https://phosphoricons.com

window.Koncertownik = window.Koncertownik || {};

Koncertownik.ikony = {

  DOMYSLNA: 'microphone-stage',

  // Podpowiedzi do wyboru w panelu (można wpisać też dowolną inną)
  LISTA: [
    'microphone-stage', 'guitar', 'piano-keys', 'vinyl-record', 'headphones', 'music-notes',
    'skull', 'ghost', 'crown', 'sword', 'shield', 'axe',
    'lightning', 'fire', 'drop', 'flame', 'heartbeat', 'heart',
    'flower', 'flower-lotus', 'butterfly', 'feather', 'bird', 'leaf',
    'moon-stars', 'sun', 'star', 'sparkle', 'planet', 'cloud-lightning',
    'mask-happy', 'detective', 'eye', 'bug', 'spiral', 'diamond',
    'compass', 'anchor', 'wind', 'megaphone', 'confetti', 'rocket'
  ],

  // Zwraca <i> z ikoną; styl: 'regular' albo 'duotone'
  html(nazwa, styl = 'regular', klasa = '') {
    const bezpieczna = String(nazwa || this.DOMYSLNA).replace(/[^a-z0-9-]/g, '') || this.DOMYSLNA;
    const prefiks = styl === 'duotone' ? 'ph-duotone' : 'ph';
    return `<i class="${prefiks} ph-${bezpieczna} ${klasa}" aria-hidden="true"></i>`;
  }
};
