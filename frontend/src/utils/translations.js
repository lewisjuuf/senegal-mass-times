/**
 * Translation utilities for French UI
 */

// French day names
export const DAYS_FR = {
  Sunday: 'Dimanche',
  Monday: 'Lundi',
  Tuesday: 'Mardi',
  Wednesday: 'Mercredi',
  Thursday: 'Jeudi',
  Friday: 'Vendredi',
  Saturday: 'Samedi',
};

// Day order for sorting
export const DAY_ORDER = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// Language translations
export const LANGUAGES_FR = {
  French: 'Français',
  Wolof: 'Wolof',
  English: 'Anglais',
  Serer: 'Sérère',
  Portuguese: 'Portugais',
  Spanish: 'Espagnol',
  Italian: 'Italien',
};

// Mass type translations
export const translateMassType = (massType) => {
  if (!massType) return '';

  const translations = {
    // English patterns
    'Mass in Wolof': 'Messe en Wolof',
    'Mass in French': 'Messe en Français',
    'Mass in English': 'Messe en Anglais',
    'Mass in Portuguese': 'Messe en Portugais',
    'Mass in Serer': 'Messe en Sérère',

    'Main Mass': 'Messe principale',
    'Early Mass': 'Messe du matin',
    'Evening Mass': 'Messe du soir',
    'Vigil Mass': 'Messe de vigile',
    'Weekday Mass': 'Messe en semaine',
    'Family Mass': 'Messe des familles',
    'Youth Mass': 'Messe des jeunes',
    'Children Mass': 'Messe des enfants',

    // Additional patterns
    'Sunday Mass': 'Messe dominicale',
    'Daily Mass': 'Messe quotidienne',
    'Morning Mass': 'Messe du matin',
    'Afternoon Mass': 'Messe de l\'après-midi',
  };

  return translations[massType] || massType;
};

// Get translated language name
export const getLanguageName = (language) => {
  return LANGUAGES_FR[language] || language;
};

// Get translated day name
export const getDayName = (day) => {
  return DAYS_FR[day] || day;
};
