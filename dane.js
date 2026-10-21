// =====================================================
//  DANE KONCERTOWNIKA – jedyne miejsce z treścią strony
// =====================================================
// Wszystko, co widać na stronie (tytuł, miasta, artyści,
// koncerty, motywy), bierze się z tego pliku.
// W kolejnym kroku przeniesiemy te dane do bazy Supabase
// i będziesz je edytować w panelu admina.

window.Koncertownik = window.Koncertownik || {};

Koncertownik.dane = {

  // --- Ustawienia całej strony ---
  ustawienia: {
    tytul: '🎵 KONCERTOWNIK',
    opis: 'Witaj w moim cyfrowym pamiętniku muzycznym! To miejsce na moje koncertowe wspomnienia, setlisty i zdjęcia.',
    stopka: 'Stworzone z pasji do muzyki ✨ | Koncertownik',

    // Motyw domyślny. Każdy artysta może nadpisać dowolną z tych wartości.
    motyw: {
      tlo: '#0a0814',                                   // kolor tła
      tloGradient: 'linear-gradient(135deg, #050508 0%, #120924 50%, #050508 100%)',
      tloObraz: '',                                     // np. 'img/tlo.jpg' (puste = brak)
      karta: 'rgba(26, 20, 42, 0.75)',                  // tło kart / sekcji
      ramka: 'rgba(168, 85, 247, 0.25)',                // obramowania
      akcent: '#9333ea',                                // główny kolor
      akcentJasny: '#c084fc',
      akcent2: '#e879f9',                               // pinezki, plakietki
      tekst: '#f3e8ff',
      tekstSlaby: '#d8b4fe',
      font: '',                                         // nazwa z Google Fonts, np. 'Poppins' (puste = systemowy)
      fontNaglowkow: '',                                // np. 'Bebas Neue'
      globusLad: '#6d28d9',
      globusOcean: '#2a0f4f'
    }
  },

  // --- Miasta, w których byłam na koncertach (pinezki na globusie) ---
  // wsp: [długość geograficzna, szerokość geograficzna]
  miasta: [
    { nazwa: 'Wrocław',   wsp: [17.0385, 51.1079] },
    { nazwa: 'Kraków',    wsp: [19.9450, 50.0647] },
    { nazwa: 'Warszawa',  wsp: [21.0122, 52.2297] },
    { nazwa: 'Lublin',    wsp: [22.5684, 51.2465] },
    { nazwa: 'Kopenhaga', wsp: [12.5683, 55.6761] }
  ],

  // --- Artyści ---
  // id: krótka nazwa do linku (bez spacji i polskich znaków)
  // motyw: tylko to, co ma się różnić od motywu domyślnego
  artysci: [
    { id: 'palaye-royale', nazwa: 'Palaye Royale',
      motyw: { akcent: '#b91c1c', akcentJasny: '#f87171', akcent2: '#fca5a5', tekstSlaby: '#fecaca',
               ramka: 'rgba(248, 113, 113, 0.3)', karta: 'rgba(30, 10, 10, 0.75)',
               tloGradient: 'linear-gradient(135deg, #050505 0%, #2a0606 50%, #050505 100%)',
               fontNaglowkow: 'Bebas Neue' } },
    { id: 'all-for-metal', nazwa: 'All for Metal',
      motyw: { akcent: '#a16207', akcentJasny: '#facc15', akcent2: '#fde047', tekstSlaby: '#fef08a',
               ramka: 'rgba(250, 204, 21, 0.3)', karta: 'rgba(25, 20, 8, 0.75)',
               tloGradient: 'linear-gradient(135deg, #050505 0%, #231a05 50%, #050505 100%)',
               fontNaglowkow: 'Metal Mania' } },
    { id: 'kim-dracula',          nazwa: 'Kim Dracula' },
    { id: 'dpr',                  nazwa: 'DPR Ian, DPR Cream, DPR Arctic' },
    { id: 'dead-poet-society',    nazwa: 'Dead Poet Society' },
    { id: 'des-rocs',             nazwa: 'Des Rocs' },
    { id: 'grandson',             nazwa: 'Grandson' },
    { id: 'lordi',                nazwa: 'Lordi' },
    { id: 'kpop-nation',          nazwa: 'Kpop Nation' },
    { id: 'lordofon',             nazwa: 'Lordofon' },
    { id: 'nothing-but-thieves',  nazwa: 'Nothing but Thieves' },
    { id: 'sbm-festiwal',         nazwa: 'SBM Festiwal' },
    { id: 'the-rose',             nazwa: 'The Rose' },
    { id: 'wind-rose',            nazwa: 'Wind Rose' },
    { id: 'zdechly-osa',          nazwa: 'Zdechły Osa' },
    { id: 'yann',                 nazwa: 'Yann' },
    { id: 'tabber',               nazwa: 'Tabber' }
  ],

  // --- Koncerty ---
  // artysta: id artysty z listy wyżej
  // data:    'RRRR-MM-DD'
  // miasto:  nazwa z listy miast wyżej
  // filmy:   linki do YouTube (mogą być „niepubliczne”)
  koncerty: [
    { // PRZYKŁAD – podmień na prawdziwe dane
      artysta: 'palaye-royale',
      data: '',
      miasto: '',
      miejsce: 'Nazwa klubu',
      setlista: ['Piosenka 1', 'Piosenka 2', 'Piosenka 3'],
      filmy: []
    }
  ]
};
