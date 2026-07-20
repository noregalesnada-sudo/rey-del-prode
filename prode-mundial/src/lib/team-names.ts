const TEAM_ES: Record<string, string> = {
  // CONMEBOL
  'Argentina':              'Argentina',
  'Brazil':                 'Brasil',
  'Uruguay':                'Uruguay',
  'Colombia':               'Colombia',
  'Ecuador':                'Ecuador',
  'Paraguay':               'Paraguay',
  'Venezuela':              'Venezuela',
  'Peru':                   'Perú',
  'Chile':                  'Chile',
  'Bolivia':                'Bolivia',
  'Guyana':                 'Guyana',
  'Suriname':               'Surinam',

  // CONCACAF
  'Mexico':                 'México',
  'USA':                    'EE.UU.',
  'United States':          'EE.UU.',
  'Canada':                 'Canadá',
  'Honduras':               'Honduras',
  'Panama':                 'Panamá',
  'Costa Rica':             'Costa Rica',
  'Jamaica':                'Jamaica',
  'El Salvador':            'El Salvador',
  'Guatemala':              'Guatemala',
  'Trinidad and Tobago':    'Trinidad y Tobago',
  'Haiti':                  'Haití',
  'Cuba':                   'Cuba',
  'Nicaragua':              'Nicaragua',
  'Curaçao':                'Curazao',
  'Dominican Republic':     'Rep. Dominicana',

  // UEFA
  'Germany':                'Alemania',
  'France':                 'Francia',
  'Spain':                  'España',
  'England':                'Inglaterra',
  'Portugal':               'Portugal',
  'Netherlands':            'Países Bajos',
  'Italy':                  'Italia',
  'Belgium':                'Bélgica',
  'Croatia':                'Croacia',
  'Switzerland':            'Suiza',
  'Denmark':                'Dinamarca',
  'Poland':                 'Polonia',
  'Serbia':                 'Serbia',
  'Austria':                'Austria',
  'Czech Republic':         'Rep. Checa',
  'Czechia':                'Rep. Checa',
  'Romania':                'Rumania',
  'Slovakia':               'Eslovaquia',
  'Slovenia':               'Eslovenia',
  'Scotland':               'Escocia',
  'Wales':                  'Gales',
  'Turkey':                 'Turquía',
  'Türkiye':                'Turquía',
  'Hungary':                'Hungría',
  'Bosnia-H.':              'Bosnia',
  'Bosnia and Herzegovina': 'Bosnia',
  'Ukraine':                'Ucrania',
  'Greece':                 'Grecia',
  'Albania':                'Albania',
  'North Macedonia':        'Macedonia',
  'Iceland':                'Islandia',
  'Norway':                 'Noruega',
  'Sweden':                 'Suecia',
  'Finland':                'Finlandia',
  'Ireland':                'Irlanda',
  'Russia':                 'Rusia',
  'Montenegro':             'Montenegro',
  'Kosovo':                 'Kosovo',
  'Bulgaria':               'Bulgaria',
  'Georgia':                'Georgia',
  'Kazakhstan':             'Kazajistán',
  'Belarus':                'Bielorrusia',
  'Cyprus':                 'Chipre',
  'Israel':                 'Israel',
  'Luxembourg':             'Luxemburgo',
  'Azerbaijan':             'Azerbaiyán',
  'Armenia':                'Armenia',
  'Estonia':                'Estonia',
  'Latvia':                 'Letonia',
  'Lithuania':              'Lituania',
  'Malta':                  'Malta',
  'Faroe Islands':          'Islas Feroe',
  'Andorra':                'Andorra',

  // AFC
  'Japan':                  'Japón',
  'Korea Republic':         'Corea del Sur',
  'South Korea':            'Corea del Sur',
  'DPR Korea':              'Corea del Norte',
  'North Korea':            'Corea del Norte',
  'Saudi Arabia':           'Arabia Saudita',
  'Australia':              'Australia',
  'Iran':                   'Irán',
  'IR Iran':                'Irán',
  'Qatar':                  'Catar',
  'Uzbekistan':             'Uzbekistán',
  'China PR':               'China',
  'China':                  'China',
  'Indonesia':              'Indonesia',
  'Jordan':                 'Jordania',
  'Bahrain':                'Baréin',
  'Iraq':                   'Irak',
  'UAE':                    'Emiratos Árabes',
  'United Arab Emirates':   'Emiratos Árabes',
  'Oman':                   'Omán',
  'Syria':                  'Siria',
  'Lebanon':                'Líbano',
  'Palestine':              'Palestina',
  'India':                  'India',
  'Thailand':               'Tailandia',
  'Vietnam':                'Vietnam',
  'Philippines':            'Filipinas',
  'Malaysia':               'Malasia',
  'Singapore':              'Singapur',
  'Myanmar':                'Myanmar',
  'Mongolia':               'Mongolia',
  'Tajikistan':             'Tayikistán',
  'Kyrgyzstan':             'Kirguistán',
  'Turkmenistan':           'Turkmenistán',

  // CAF
  'Morocco':                'Marruecos',
  'Senegal':                'Senegal',
  'Nigeria':                'Nigeria',
  'Egypt':                  'Egipto',
  'Ghana':                  'Ghana',
  'Cameroon':               'Camerún',
  'Ivory Coast':            'Costa de Marfil',
  "Côte d'Ivoire":          'Costa de Marfil',
  'Algeria':                'Argelia',
  'South Africa':           'Sudáfrica',
  'Tunisia':                'Túnez',
  'Mali':                   'Malí',
  'Kenya':                  'Kenia',
  'DR Congo':               'Congo RD',
  'Congo':                  'Congo',
  'Burkina Faso':           'Burkina Faso',
  'Guinea':                 'Guinea',
  'Gabon':                  'Gabón',
  'Angola':                 'Angola',
  'Zimbabwe':               'Zimbabue',
  'Zambia':                 'Zambia',
  'Uganda':                 'Uganda',
  'Mozambique':             'Mozambique',
  'Rwanda':                 'Ruanda',
  'Tanzania':               'Tanzania',
  'Ethiopia':               'Etiopía',
  'Cape Verde':             'Cabo Verde',
  'Gambia':                 'Gambia',
  'Mauritania':             'Mauritania',
  'Togo':                   'Togo',
  'Benin':                  'Benín',
  'Niger':                  'Níger',
  'Chad':                   'Chad',
  'Namibia':                'Namibia',
  'Madagascar':             'Madagascar',
  'Comoros':                'Comoras',
  'Libya':                  'Libia',
  'Sudan':                  'Sudán',
  'South Sudan':            'Sudán del Sur',
  'Equatorial Guinea':      'Guinea Ecuatorial',
  'Guinea-Bissau':          'Guinea-Bisáu',
  'Sierra Leone':           'Sierra Leona',
  'Liberia':                'Liberia',
  'Malawi':                 'Malaui',
  'Botswana':               'Botsuana',
  'Lesotho':                'Lesoto',
  'Eswatini':               'Esuatini',
  'Eritrea':                'Eritrea',
  'Djibouti':               'Yibuti',
  'Burundi':                'Burundi',

  // OFC
  'New Zealand':            'Nueva Zelanda',
  'Tahiti':                 'Tahití',
  'Fiji':                   'Fiyi',
  'Papua New Guinea':       'Papúa Nueva Guinea',
  'Solomon Islands':        'Islas Salomón',
  'Vanuatu':                'Vanuatu',
  'New Caledonia':          'Nueva Caledonia',
  'Samoa':                  'Samoa',
  'American Samoa':         'Samoa Americana',
  'Cook Islands':           'Islas Cook',
  'Tonga':                  'Tonga',
}

export function translateTeam(name: string | null | undefined, lang: string): string {
  if (!name) return ''
  if (lang !== 'es') return name
  return TEAM_ES[name] ?? name
}

// Mapa inverso español → inglés, derivado de TEAM_ES. Ante colisiones (p.ej.
// 'USA' y 'United States' → 'EE.UU.') gana la primera clave, alcanza para
// canonicalizar.
const TEAM_EN: Record<string, string> = {}
for (const [en, es] of Object.entries(TEAM_ES)) {
  if (!(es in TEAM_EN)) TEAM_EN[es] = en
}

// Nombre canónico (inglés, igual que en la BD de partidos) de un equipo, venga
// guardado en inglés o en español. Los picks de campeón se guardaron en el idioma
// de la UI de cada quien ("Spain" vs "España"); esto los unifica para comparar y
// mostrar sin importar el idioma.
export function canonicalTeam(name: string | null | undefined): string | null {
  if (!name) return null
  if (name in TEAM_ES) return name        // ya es inglés canónico
  return TEAM_EN[name] ?? name            // español → inglés (o desconocido tal cual)
}

// Igualdad de equipos ignorando el idioma en que se guardó el nombre.
export function sameTeam(a: string | null | undefined, b: string | null | undefined): boolean {
  const ca = canonicalTeam(a)
  return ca != null && ca === canonicalTeam(b)
}

// Todas las variantes almacenadas (inglés + español) que refieren al mismo
// equipo. Permite filtrar champion_picks por cualquier idioma en una sola query.
export function teamAliases(name: string | null | undefined): string[] {
  const canonical = canonicalTeam(name)
  if (!canonical) return []
  const es = TEAM_ES[canonical] ?? canonical
  const set = new Set<string>([canonical, es])
  for (const [en, esName] of Object.entries(TEAM_ES)) {
    if (esName === es) set.add(en)
  }
  return [...set]
}

// Bandera (emoji) por selección. Keyed por el nombre en español canónico
// (el valor que produce translateTeam), con alias para las variantes que usa
// WC2026_TEAMS (p.ej. 'Estados Unidos' vs 'EE.UU.', 'DR Congo' vs 'Congo RD').
const TEAM_FLAGS: Record<string, string> = {
  // CONMEBOL
  'Argentina': '🇦🇷', 'Brasil': '🇧🇷', 'Uruguay': '🇺🇾', 'Colombia': '🇨🇴',
  'Ecuador': '🇪🇨', 'Paraguay': '🇵🇾', 'Venezuela': '🇻🇪', 'Perú': '🇵🇪',
  'Chile': '🇨🇱', 'Bolivia': '🇧🇴',
  // CONCACAF
  'México': '🇲🇽', 'EE.UU.': '🇺🇸', 'Estados Unidos': '🇺🇸', 'Canadá': '🇨🇦',
  'Panamá': '🇵🇦', 'Costa Rica': '🇨🇷', 'Jamaica': '🇯🇲', 'Honduras': '🇭🇳',
  // UEFA
  'Alemania': '🇩🇪', 'Francia': '🇫🇷', 'España': '🇪🇸', 'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Portugal': '🇵🇹', 'Países Bajos': '🇳🇱', 'Italia': '🇮🇹', 'Bélgica': '🇧🇪',
  'Croacia': '🇭🇷', 'Suiza': '🇨🇭', 'Dinamarca': '🇩🇰', 'Polonia': '🇵🇱',
  'Serbia': '🇷🇸', 'Austria': '🇦🇹', 'Escocia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Turquía': '🇹🇷',
  'Ucrania': '🇺🇦',
  // AFC
  'Japón': '🇯🇵', 'Corea del Sur': '🇰🇷', 'Arabia Saudita': '🇸🇦', 'Australia': '🇦🇺',
  'Irán': '🇮🇷', 'Catar': '🇶🇦', 'Uzbekistán': '🇺🇿', 'Jordania': '🇯🇴',
  // CAF
  'Marruecos': '🇲🇦', 'Senegal': '🇸🇳', 'Nigeria': '🇳🇬', 'Egipto': '🇪🇬',
  'Ghana': '🇬🇭', 'Costa de Marfil': '🇨🇮', 'Sudáfrica': '🇿🇦', 'Malí': '🇲🇱',
  'Mali': '🇲🇱', 'Congo RD': '🇨🇩', 'DR Congo': '🇨🇩',
  // OFC
  'Nueva Zelanda': '🇳🇿',
}

// Devuelve la bandera de un equipo aceptando el nombre en inglés o en español
// (cualquiera de las variantes almacenadas). '' si no se conoce.
export function teamFlag(name: string | null | undefined): string {
  if (!name) return ''
  const es = TEAM_ES[name] ?? name
  return TEAM_FLAGS[es] ?? TEAM_FLAGS[name] ?? ''
}
