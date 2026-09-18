import type { RailLegId } from './commuteRoute';

export interface RailStopFact {
  fact: string;
  station: string;
}

// Keep each station open long enough for a standing or seated passenger to
// physically walk to a carriage door, while the short between-stop animation
// keeps the overall journey moving.
export const RAIL_STOP_DWELL_MS = 6000;

export function nextBouncingStopIndex(index: number, total: number, direction: 1 | -1) {
  let nextDirection = direction;
  let nextIndex = index + nextDirection;
  if (nextIndex < 0 || nextIndex >= total) {
    nextDirection = nextDirection === 1 ? -1 : 1;
    nextIndex = index + nextDirection;
  }
  return { direction: nextDirection, index: nextIndex };
}

export const RAIL_STOP_FACTS: Record<RailLegId, RailStopFact[]> = {
  'kadaloor-lrt': [
    {
      station: 'Oasis',
      fact: 'Oasis Terraces was designed as a waterfront neighbourhood centre beside Punggol Waterway.',
    },
    {
      station: 'Damai',
      fact: 'Damai means “peace” in Malay—a calm name for this residential part of Punggol.',
    },
    {
      station: 'Punggol',
      fact: 'Punggol grew from old fishing and farming settlements into one of Singapore’s newest waterfront towns.',
    },
  ],
  'punggol-nel': [
    {
      station: 'Sengkang',
      fact: 'Sengkang was once known as Kangkar, a river-port settlement beside Sungei Serangoon.',
    },
    {
      station: 'Buangkok',
      fact: 'Nearby Kampong Lorong Buangkok is Singapore’s last surviving mainland kampong.',
    },
    {
      station: 'Hougang',
      fact: 'Hougang comes from the Teochew “Au Kang”, referring to the river-end settlements of old Upper Serangoon.',
    },
    {
      station: 'Kovan',
      fact: 'Kovan grew around Upper Serangoon’s old sixth-milestone market and transport hub.',
    },
    {
      station: 'Serangoon',
      fact: 'One theory links Serangoon’s name to the ranggong, a marsh bird once found around the area.',
    },
    {
      station: 'Woodleigh',
      fact: 'Woodleigh now serves Bidadari, built around a green heritage park and the preserved Alkaff Lake.',
    },
    {
      station: 'Potong Pasir',
      fact: 'Potong Pasir means “cut sand” in Malay, recalling the sand quarries that once shaped the area.',
    },
    {
      station: 'Boon Keng',
      fact: 'The area honours Dr Lim Boon Keng, a physician, reformer and major figure in Singapore education.',
    },
    {
      station: 'Farrer Park',
      fact: 'Singapore’s first racecourse and its first public aeroplane demonstration were held at Farrer Park.',
    },
    {
      station: 'Little India',
      fact: 'Before the name “Little India” became common in the 1980s, the precinct was generally called Serangoon.',
    },
    {
      station: 'Dhoby Ghaut',
      fact: 'Dhoby Ghaut takes its name from the washermen who once worked beside the freshwater stream near this area.',
    },
    {
      station: 'Clarke Quay',
      fact: 'Clarke Quay is named after Sir Andrew Clarke and preserves warehouses from Singapore’s river-trading era.',
    },
    {
      station: 'Chinatown',
      fact: 'Chinatown preserves temples, mosques and shophouses associated with Singapore’s early immigrant communities.',
    },
    {
      station: 'Outram Park',
      fact: 'Outram Park takes its name from Sir James Outram and now links several major MRT lines near the city centre.',
    },
    {
      station: 'HarbourFront',
      fact: 'HarbourFront grew around Singapore’s former World Trade Centre and remains a gateway to Sentosa and the port.',
    },
  ],
  'little-india-dtl': [
    {
      station: 'Rochor',
      fact: 'Rochor developed around the Rochor River, an early waterway for trade, workshops and kampongs.',
    },
    {
      station: 'Bugis',
      fact: 'Bugis takes its name from seafaring Bugis traders from Sulawesi who settled and traded nearby.',
    },
    {
      station: 'Promenade',
      fact: 'Promenade station sits beside the Marina Bay waterfront and its long pedestrian promenade.',
    },
    {
      station: 'Bayfront',
      fact: 'Bayfront serves Marina Bay Sands and Gardens by the Bay on land created through reclamation.',
    },
    {
      station: 'Downtown',
      fact: 'Downtown station is beneath Marina Bay’s modern financial district and the Marina Bay Link Mall.',
    },
    {
      station: 'Telok Ayer',
      fact: 'Telok Ayer means “water bay” in Malay; the street once followed Singapore’s original shoreline.',
    },
    {
      station: 'Chinatown',
      fact: 'Chinatown preserves temples, mosques and shophouses from Singapore’s early immigrant quarters.',
    },
    {
      station: 'Fort Canning',
      fact: 'Fort Canning Hill was once a Malay royal centre and later the site of a British military fort.',
    },
    {
      station: 'Bencoolen',
      fact: 'Bencoolen Street was named after the British settlement of Bencoolen on the island of Sumatra.',
    },
    {
      station: 'Jalan Besar',
      fact: 'Jalan Besar simply means “big road” in Malay and became the spine of a busy shophouse district.',
    },
    {
      station: 'Bendemeer',
      fact: 'Bendemeer sits in the Kallang basin, an area long associated with riverside industry and housing.',
    },
    {
      station: 'Geylang Bahru',
      fact: 'Geylang Bahru means “New Geylang” in Malay and grew as a public-housing neighbourhood beside Kallang.',
    },
    {
      station: 'Mattar',
      fact: 'Mattar station serves the MacPherson estate and the food stalls around Circuit Road.',
    },
    {
      station: 'MacPherson',
      fact: 'MacPherson Road was named after Colonel Ronald MacPherson, Singapore’s first Colonial Secretary.',
    },
    {
      station: 'Ubi',
      fact: 'Ubi means “tapioca” in Malay, recalling a crop once cultivated around this eastern district.',
    },
    {
      station: 'Kaki Bukit',
      fact: 'Kaki Bukit means “foothill” in Malay, even though today it is best known as an industrial estate.',
    },
    {
      station: 'Bedok North',
      fact: 'Bedok became one of Singapore’s earliest large new towns, planned with housing, parks and industry.',
    },
    {
      station: 'Bedok Reservoir',
      fact: 'Bedok Reservoir was created from a former sand quarry and is now popular for water sports and running.',
    },
    {
      station: 'Tampines West',
      fact: 'Tampines is named after the tempinis trees that once grew abundantly across the eastern landscape.',
    },
    {
      station: 'Tampines',
      fact: 'Tampines received the United Nations World Habitat Award for its town planning in 1992.',
    },
    {
      station: 'Tampines East',
      fact: 'Tampines East links mature housing estates with parks and the green spaces around Tampines Eco Green.',
    },
    {
      station: 'Upper Changi',
      fact: 'Upper Changi has long been connected with aviation, military camps and Singapore’s eastern gateway.',
    },
    {
      station: 'Expo',
      fact: 'Singapore EXPO opened in 1999 and is the country’s largest purpose-built convention and exhibition venue.',
    },
  ],
};

// The full arrays above remain the route/fact authority. Gameplay samples key
// stations so the commute teaches the line without turning every intermediate
// dwell into a long repetition. Target stops are always retained.
const PLAYABLE_STOP_INDEXES: Record<RailLegId, readonly number[]> = {
  'kadaloor-lrt': [0, 1, 2],
  'punggol-nel': [0, 4, 7, 8, 9],
  'little-india-dtl': [0, 1, 3, 6, 13, 19, 21, 22],
};

export const RAIL_PLAYABLE_STOP_FACTS: Record<RailLegId, RailStopFact[]> = {
  'kadaloor-lrt': PLAYABLE_STOP_INDEXES['kadaloor-lrt'].map(
    (index) => RAIL_STOP_FACTS['kadaloor-lrt'][index],
  ),
  'punggol-nel': PLAYABLE_STOP_INDEXES['punggol-nel'].map(
    (index) => RAIL_STOP_FACTS['punggol-nel'][index],
  ),
  'little-india-dtl': PLAYABLE_STOP_INDEXES['little-india-dtl'].map(
    (index) => RAIL_STOP_FACTS['little-india-dtl'][index],
  ),
};
