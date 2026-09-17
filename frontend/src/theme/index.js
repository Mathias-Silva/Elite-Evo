/**
 * Background: #0A0A0A (Preto profundo)

Primary: #FF6B00 (Laranja vibrante)

Card Background: #1A1A1A (Cinza escuro)

Text: #FFFFFF
 * 
 */
export const DARK_COLORS = {
  background: '#0A0A0A',
  surface: '#000000',
  cardBackground: '#1A1A1A',
  primary: '#FF6B00',      
  secondary: '#252525',
  border: '#1A1A1A',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  success: '#00C853',      
};

export const LIGHT_COLORS = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  cardBackground: '#FFFFFF',
  primary: '#FF6B00',
  secondary: '#E8E8E8',
  border: '#E0E0E0',
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  success: '#00C853',
};

export const COLORS = DARK_COLORS;

/** Espaçamentos padronizados (UI/UX — respiro entre blocos) */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  /** Margem horizontal padrão das telas */
  screen: 20,
  /** Entre seções principais (ex.: header → filtros → lista) */
  section: 24,
  /** Entre blocos relacionados (ex.: chip → busca) */
  block: 16,
};
