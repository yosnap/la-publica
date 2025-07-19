import { useState, useEffect } from 'react';
import { createSlug, createUniqueSlug, SlugMapping } from '@/utils/createSlug';

// Hook per gestionar el mapeig de slugs a IDs per empreses
export const useCompanySlugMapping = () => {
  const [slugMappings, setSlugMappings] = useState<SlugMapping[]>([]);

  const generateCompanySlugMappings = (companies: any[]): SlugMapping[] => {
    const existingSlugs: string[] = [];
    const mappings: SlugMapping[] = [];

    companies.forEach(company => {
      const uniqueSlug = createUniqueSlug(company.name, existingSlugs);
      existingSlugs.push(uniqueSlug);
      mappings.push({
        slug: uniqueSlug,
        id: company._id,
        title: company.name
      });
    });

    return mappings;
  };

  const updateCompanyMappings = (companies: any[]) => {
    const mappings = generateCompanySlugMappings(companies);
    setSlugMappings(mappings);
  };

  const getCompanyUrlByName = (name: string): string => {
    const mapping = slugMappings.find(m => m.title === name);
    return mapping ? `/empresa/${mapping.slug}` : '#';
  };

  const getCompanyIdBySlug = (slug: string): string | null => {
    const mapping = slugMappings.find(m => m.slug === slug);
    return mapping ? mapping.id : null;
  };

  return {
    slugMappings,
    updateCompanyMappings,
    getCompanyUrlByName,
    getCompanyIdBySlug
  };
};

// Hook per gestionar el mapeig de slugs a IDs per anuncis
export const useAnnouncementSlugMapping = () => {
  const [slugMappings, setSlugMappings] = useState<SlugMapping[]>([]);

  const generateAnnouncementSlugMappings = (announcements: any[]): SlugMapping[] => {
    const existingSlugs: string[] = [];
    const mappings: SlugMapping[] = [];

    announcements.forEach(announcement => {
      const uniqueSlug = createUniqueSlug(announcement.title, existingSlugs);
      existingSlugs.push(uniqueSlug);
      mappings.push({
        slug: uniqueSlug,
        id: announcement._id,
        title: announcement.title
      });
    });

    return mappings;
  };

  const updateAnnouncementMappings = (announcements: any[]) => {
    const mappings = generateAnnouncementSlugMappings(announcements);
    setSlugMappings(mappings);
  };

  const getAnnouncementUrlByTitle = (title: string): string => {
    const mapping = slugMappings.find(m => m.title === title);
    return mapping ? `/anunci/${mapping.slug}` : '#';
  };

  const getAnnouncementIdBySlug = (slug: string): string | null => {
    const mapping = slugMappings.find(m => m.slug === slug);
    return mapping ? mapping.id : null;
  };

  return {
    slugMappings,
    updateAnnouncementMappings,
    getAnnouncementUrlByTitle,
    getAnnouncementIdBySlug
  };
};