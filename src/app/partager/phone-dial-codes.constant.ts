/** Option indicatif téléphonique (liste non exhaustive, orientée Afrique / Europe). */
export interface PhoneDialCodeOption {
    country: string;
    code: string;
}

const RAW: PhoneDialCodeOption[] = [
    { country: 'États-Unis / Canada', code: '+1' },
    { country: 'Russie / Kazakhstan', code: '+7' },
    { country: 'Égypte', code: '+20' },
    { country: 'Afrique du Sud', code: '+27' },
    { country: 'Grèce', code: '+30' },
    { country: 'Pays-Bas', code: '+31' },
    { country: 'Belgique', code: '+32' },
    { country: 'France', code: '+33' },
    { country: 'Espagne', code: '+34' },
    { country: 'Italie', code: '+39' },
    { country: 'Roumanie', code: '+40' },
    { country: 'Suisse', code: '+41' },
    { country: 'Autriche', code: '+43' },
    { country: 'R.-U.', code: '+44' },
    { country: 'Danemark', code: '+45' },
    { country: 'Suède', code: '+46' },
    { country: 'Norvège', code: '+47' },
    { country: 'Pologne', code: '+48' },
    { country: 'Allemagne', code: '+49' },
    { country: 'Pérou', code: '+51' },
    { country: 'Mexique', code: '+52' },
    { country: 'Argentine', code: '+54' },
    { country: 'Brésil', code: '+55' },
    { country: 'Chili', code: '+56' },
    { country: 'Colombie', code: '+57' },
    { country: 'Venezuela', code: '+58' },
    { country: 'Malaisie', code: '+60' },
    { country: 'Australie', code: '+61' },
    { country: 'Indonésie', code: '+62' },
    { country: 'Philippines', code: '+63' },
    { country: 'Nouvelle-Zélande', code: '+64' },
    { country: 'Singapour', code: '+65' },
    { country: 'Thaïlande', code: '+66' },
    { country: 'Japon', code: '+81' },
    { country: 'Corée du Sud', code: '+82' },
    { country: 'Chine', code: '+86' },
    { country: 'Inde', code: '+91' },
    { country: 'Pakistan', code: '+92' },
    { country: 'Afghanistan', code: '+93' },
    { country: 'Sri Lanka', code: '+94' },
    { country: 'Myanmar', code: '+95' },
    { country: 'Iran', code: '+98' },
    { country: 'Maroc', code: '+212' },
    { country: 'Algérie', code: '+213' },
    { country: 'Tunisie', code: '+216' },
    { country: 'Libye', code: '+218' },
    { country: 'Gambie', code: '+220' },
    { country: 'Sénégal', code: '+221' },
    { country: 'Mauritanie', code: '+222' },
    { country: 'Mali', code: '+223' },
    { country: 'Guinée', code: '+224' },
    { country: "Côte d'Ivoire", code: '+225' },
    { country: 'Burkina Faso', code: '+226' },
    { country: 'Niger', code: '+227' },
    { country: 'Togo', code: '+228' },
    { country: 'Bénin', code: '+229' },
    { country: 'Maurice', code: '+230' },
    { country: 'Liberia', code: '+231' },
    { country: 'Sierra Leone', code: '+232' },
    { country: 'Ghana', code: '+233' },
    { country: 'Nigeria', code: '+234' },
    { country: 'Tchad', code: '+235' },
    { country: 'RCA', code: '+236' },
    { country: 'Cameroun', code: '+237' },
    { country: 'Cap-Vert', code: '+238' },
    { country: 'Gabon', code: '+241' },
    { country: 'Congo', code: '+242' },
    { country: 'RDC', code: '+243' },
    { country: 'Angola', code: '+244' },
    { country: 'Guinée-Bissau', code: '+245' },
    { country: 'Île de l’Ascension', code: '+247' },
    { country: 'Seychelles', code: '+248' },
    { country: 'Soudan', code: '+249' },
    { country: 'Éthiopie', code: '+251' },
    { country: 'Somalie', code: '+252' },
    { country: 'Djibouti', code: '+253' },
    { country: 'Kenya', code: '+254' },
    { country: 'Tanzanie', code: '+255' },
    { country: 'Ouganda', code: '+256' },
    { country: 'Burundi', code: '+257' },
    { country: 'Mozambique', code: '+258' },
    { country: 'Zambie', code: '+260' },
    { country: 'Madagascar', code: '+261' },
    { country: 'Mayotte / La Réunion', code: '+262' },
    { country: 'Zimbabwe', code: '+263' },
    { country: 'Namibie', code: '+264' },
    { country: 'Malawi', code: '+265' },
    { country: 'Lesotho', code: '+266' },
    { country: 'Botswana', code: '+267' },
    { country: 'Eswatini', code: '+268' },
    { country: 'Comores', code: '+269' },
    { country: 'Portugal', code: '+351' },
    { country: 'Luxembourg', code: '+352' },
    { country: 'Irlande', code: '+353' },
    { country: 'Islande', code: '+354' },
    { country: 'Malte', code: '+356' },
    { country: 'Chypre', code: '+357' },
    { country: 'Finlande', code: '+358' },
    { country: 'Bulgarie', code: '+359' },
    { country: 'Lituanie', code: '+370' },
    { country: 'Lettonie', code: '+371' },
    { country: 'Estonie', code: '+372' },
    { country: 'Biélorussie', code: '+375' },
    { country: 'Ukraine', code: '+380' },
    { country: 'Serbie', code: '+381' },
    { country: 'Monténégro', code: '+382' },
    { country: 'Kosovo', code: '+383' },
    { country: 'Croatie', code: '+385' },
    { country: 'Slovénie', code: '+386' },
    { country: 'Bosnie-Herzégovine', code: '+387' },
    { country: 'Macédoine du Nord', code: '+389' },
    { country: 'République tchèque', code: '+420' },
    { country: 'Slovaquie', code: '+421' },
    { country: 'Liechtenstein', code: '+423' },
    { country: 'Arabie saoudite', code: '+966' },
    { country: 'Émirats arabes unis', code: '+971' },
    { country: 'Israël', code: '+972' },
    { country: 'Bahreïn', code: '+973' },
    { country: 'Qatar', code: '+974' },
    { country: 'Bhoutan', code: '+975' },
    { country: 'Mongolie', code: '+976' },
    { country: 'Népal', code: '+977' },
    { country: 'Tadjikistan', code: '+992' },
    { country: 'Turkménistan', code: '+993' },
    { country: 'Azerbaïdjan', code: '+994' },
    { country: 'Géorgie', code: '+995' },
    { country: 'Kirghizistan', code: '+996' },
    { country: 'Ouzbékistan', code: '+998' },
];

/** Tri par longueur d’indicatif décroissante (nécessaire pour parser +225 vs +22). */
export const PHONE_DIAL_OPTIONS: PhoneDialCodeOption[] = [...RAW].sort(
    (a, b) => b.code.length - a.code.length
);

export const DEFAULT_PHONE_DIAL = '+225';

export const PHONE_DIAL_CODE_SET = new Set(PHONE_DIAL_OPTIONS.map((o) => o.code));

/**
 * Découpe un numéro international stocké (ex. +22507123456) en indicatif + partie locale.
 */
export function splitInternationalPhone(full: string): { dial: string; local: string } {
    const compact = (full || '').trim().replace(/[\s-]/g, '');
    if (!compact) {
        return { dial: DEFAULT_PHONE_DIAL, local: '' };
    }
    for (const { code } of PHONE_DIAL_OPTIONS) {
        if (compact.startsWith(code)) {
            return { dial: code, local: compact.slice(code.length) };
        }
    }
    if (compact.startsWith('+')) {
        return { dial: DEFAULT_PHONE_DIAL, local: compact.replace(/^\+/, '') };
    }
    return { dial: DEFAULT_PHONE_DIAL, local: compact };
}

/** Fusion indicatif + numéro saisi : uniquement les chiffres du numéro sont conservés (espaces retirés), le 0 initial est gardé (ex. +225 + 0777781030 → +2250777781030). */
export function mergeInternationalPhone(dial: string, local: string): string {
    const d = (dial || DEFAULT_PHONE_DIAL).trim();
    const digits = (local || '').replace(/\D/g, '');
    if (!digits) {
        return '';
    }
    return `${d}${digits}`;
}
