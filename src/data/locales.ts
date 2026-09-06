import { LocaleCode } from '../types';

export interface LocaleStrings {
  appName: string;
  appTagline: string;
  navEditor: string;
  navVoices: string;
  navHistory: string;
  navPricing: string;
  navSettings: string;
  generateBtn: string;
  generating: string;
  characters: string;
  speed: string;
  pitch: string;
  tone: string;
  insertPause: string;
  pronunciation: string;
  uploadDoc: string;
  presets: string;
  clearText: string;
  searchVoices: string;
  allLanguages: string;
  allStyles: string;
  allGenders: string;
  preview: string;
  download: string;
  share: string;
  upgradeToPro: string;
  usageLimit: string;
  historyEmpty: string;
  errorEmptyText: string;
  errorOverLimit: string;
  errorHarmfulContent: string;
}

export const LOCALES: Record<LocaleCode, LocaleStrings> = {
  en: {
    appName: 'Voxaro',
    appTagline: 'Turn Text Into Voice — Natural • Real • Limitless',
    navEditor: 'Studio',
    navVoices: 'Voice Library',
    navHistory: 'History',
    navPricing: 'Upgrade',
    navSettings: 'Settings',
    generateBtn: 'Generate Audio',
    generating: 'Synthesizing Audio...',
    characters: 'characters',
    speed: 'Speed',
    pitch: 'Pitch',
    tone: 'Tone & Emotion',
    insertPause: 'Insert Pause',
    pronunciation: 'Pronunciation',
    uploadDoc: 'Import File',
    presets: 'Sample Presets',
    clearText: 'Clear',
    searchVoices: 'Search voices by name, accent, or style...',
    allLanguages: 'All Languages',
    allStyles: 'All Styles',
    allGenders: 'All Genders',
    preview: 'Preview',
    download: 'Export Audio',
    share: 'Share',
    upgradeToPro: 'Upgrade to Pro',
    usageLimit: 'Monthly Usage',
    historyEmpty: 'No audio generations yet. Create your first voiceover above!',
    errorEmptyText: 'Please enter or paste text to generate speech.',
    errorOverLimit: 'Character limit exceeded. Please shorten your text or upgrade.',
    errorHarmfulContent: 'Text contains flagged keywords. Please revise to meet safety guidelines.'
  },
  es: {
    appName: 'Voxaro',
    appTagline: 'Convierte Texto en Voz — Natural • Real • Ilimitado',
    navEditor: 'Estudio',
    navVoices: 'Biblioteca de Voces',
    navHistory: 'Historial',
    navPricing: 'Planes',
    navSettings: 'Ajustes',
    generateBtn: 'Generar Audio',
    generating: 'Sintetizando Audio...',
    characters: 'caracteres',
    speed: 'Velocidad',
    pitch: 'Tono',
    tone: 'Emoción y Tono',
    insertPause: 'Insertar Pausa',
    pronunciation: 'Pronunciación',
    uploadDoc: 'Importar Archivo',
    presets: 'Plantillas',
    clearText: 'Limpiar',
    searchVoices: 'Buscar voces por nombre, acento o estilo...',
    allLanguages: 'Todos los Idiomas',
    allStyles: 'Todos los Estilos',
    allGenders: 'Todos los Géneros',
    preview: 'Escuchar',
    download: 'Exportar Audio',
    share: 'Compartir',
    upgradeToPro: 'Mejorar a Pro',
    usageLimit: 'Uso Mensual',
    historyEmpty: 'Aún no hay generaciones de audio. ¡Crea tu primera voz arriba!',
    errorEmptyText: 'Por favor, ingresa o pega texto para generar voz.',
    errorOverLimit: 'Límite de caracteres excedido.',
    errorHarmfulContent: 'El texto contiene palabras inapropiadas.'
  },
  fr: {
    appName: 'Voxaro',
    appTagline: 'Transformez le Texte en Voix — Naturel • Réel • Illimité',
    navEditor: 'Studio',
    navVoices: 'Bibliothèque de Voix',
    navHistory: 'Historique',
    navPricing: 'Abonnement',
    navSettings: 'Paramètres',
    generateBtn: 'Générer l’Audio',
    generating: 'Synthèse en cours...',
    characters: 'caractères',
    speed: 'Vitesse',
    pitch: 'Hauteur',
    tone: 'Émotion & Ton',
    insertPause: 'Insérer Pause',
    pronunciation: 'Prononciation',
    uploadDoc: 'Importer Fichier',
    presets: 'Exemples',
    clearText: 'Effacer',
    searchVoices: 'Rechercher par nom, accent ou style...',
    allLanguages: 'Toutes les Langues',
    allStyles: 'Tous les Styles',
    allGenders: 'Tous les Genres',
    preview: 'Aperçu',
    download: 'Exporter Audio',
    share: 'Partager',
    upgradeToPro: 'Passer à Pro',
    usageLimit: 'Utilisation Mensuelle',
    historyEmpty: 'Aucun enregistrement audio pour le moment.',
    errorEmptyText: 'Veuillez saisir du texte pour générer la voix.',
    errorOverLimit: 'Limite de caractères dépassée.',
    errorHarmfulContent: 'Le texte contient du contenu restreint.'
  },
  de: {
    appName: 'Voxaro',
    appTagline: 'Verwandeln Sie Text in Sprache — Natürlich • Real • Grenzenlos',
    navEditor: 'Studio',
    navVoices: 'Stimmen-Bibliothek',
    navHistory: 'Verlauf',
    navPricing: 'Upgraden',
    navSettings: 'Einstellungen',
    generateBtn: 'Audio Generieren',
    generating: 'Sprache wird synthetisiert...',
    characters: 'Zeichen',
    speed: 'Geschwindigkeit',
    pitch: 'Tonhöhe',
    tone: 'Emotion & Ton',
    insertPause: 'Pause Einfügen',
    pronunciation: 'Aussprache',
    uploadDoc: 'Datei Importieren',
    presets: 'Vorlagen',
    clearText: 'Löschen',
    searchVoices: 'Stimmen nach Name, Akzent oder Stil suchen...',
    allLanguages: 'Alle Sprachen',
    allStyles: 'Alle Stile',
    allGenders: 'Alle Geschlechter',
    preview: 'Vorschau',
    download: 'Audio Exportieren',
    share: 'Teilen',
    upgradeToPro: 'Auf Pro upgraden',
    usageLimit: 'Monatliche Nutzung',
    historyEmpty: 'Noch keine Sprachaufnahmen vorhanden.',
    errorEmptyText: 'Bitte Text eingeben oder einfügen.',
    errorOverLimit: 'Zeichenlimit überschritten.',
    errorHarmfulContent: 'Der Text enthält unzulässigen Inhalt.'
  },
  hi: {
    appName: 'Voxaro',
    appTagline: 'टेक्स्ट को दें असली आवाज़ — नैचुरल • रियल • असीमित',
    navEditor: 'स्टूडियो',
    navVoices: 'वॉइस लाइब्रेरी',
    navHistory: 'इतिहास',
    navPricing: 'अपग्रेड करें',
    navSettings: 'सेटिंग्स',
    generateBtn: 'ऑडियो बनाएं',
    generating: 'ऑडियो तैयार हो रहा है...',
    characters: 'अक्षर',
    speed: 'गति',
    pitch: 'पिच',
    tone: 'भाव व अंदाज़',
    insertPause: 'विराम जोड़ें',
    pronunciation: 'उच्चारण नियम',
    uploadDoc: 'फ़ाइल अपलोड',
    presets: 'नमूना स्क्रिप्ट',
    clearText: 'हटाएं',
    searchVoices: 'नाम, भाषा या शैली से आवाज़ें खोजें...',
    allLanguages: 'सभी भाषाएं',
    allStyles: 'सभी शैलियां',
    allGenders: 'सभी लिंग',
    preview: 'सुनें',
    download: 'डाउनलोड करें',
    share: 'साझा करें',
    upgradeToPro: 'प्रो प्लान लें',
    usageLimit: 'मासिक उपयोग',
    historyEmpty: 'अभी तक कोई ऑडियो नहीं बनाया गया है।',
    errorEmptyText: 'कृपया ऑडियो बनाने के लिए टेक्स्ट दर्ज करें।',
    errorOverLimit: 'अक्षर सीमा समाप्त हो गई है।',
    errorHarmfulContent: 'टेक्स्ट में अनुपयुक्त शब्द पाए गए हैं।'
  }
};
