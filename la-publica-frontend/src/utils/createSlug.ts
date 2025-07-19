// Funció per crear slug sense IDs, amb numeració per duplicats
export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar accents
    .replace(/[^a-z0-9\s-]/g, '') // Només lletres, números, espais i guions
    .replace(/\s+/g, '-') // Espais a guions
    .replace(/-+/g, '-') // Múltiples guions a un sol
    .trim()
    .replace(/^-+|-+$/g, ''); // Eliminar guions al principi i final
};

// Funció per generar slug únic amb numeració si hi ha duplicats
export const createUniqueSlug = (text: string, existingSlugs: string[]): string => {
  const baseSlug = createSlug(text);
  
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  // Si existeix, buscar el següent número disponible
  let counter = 2;
  let uniqueSlug = `${baseSlug}-${counter}`;
  
  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
  
  return uniqueSlug;
};

// Funció per crear URL amigable per empreses
export const createCompanyFriendlyUrl = (name: string): string => {
  const slug = createSlug(name);
  return `/empresa/${slug}`;
};

// Funció per crear URL amigable per anuncis
export const createAnnouncementFriendlyUrl = (title: string): string => {
  const slug = createSlug(title);
  return `/anunci/${slug}`;
};

// Funció per extreure l'ID d'una URL antiga (per compatibilitat)
export const extractIdFromLegacyUrl = (url: string): string | null => {
  const match = url.match(/-([a-f0-9]{24})$/);
  return match ? match[1] : null;
};

// Crear mapa de slugs a IDs (per gestionar la navegació)
export interface SlugMapping {
  slug: string;
  id: string;
  title?: string;
}

// Funció per trobar ID per slug
export const findIdBySlug = (slug: string, mappings: SlugMapping[]): string | null => {
  const mapping = mappings.find(m => m.slug === slug);
  return mapping ? mapping.id : null;
};