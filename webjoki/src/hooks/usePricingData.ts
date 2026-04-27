'use client';

import { useState, useEffect, useMemo } from 'react';
import { JOKI_PACKAGES } from '@/data/dummyData';
import { JokiPackage, PackageCategory } from '@/types';

/**
 * Custom hook to fetch pricing data from API.
 * Supports filtering by category and loading state.
 */
export function usePricingData(initialCategory: PackageCategory = 'solo') {
  const [category, setCategory] = useState<PackageCategory>(initialCategory);
  const [isLoading, setIsLoading] = useState(true);
  const [packages, setPackages] = useState<JokiPackage[]>([]);
  const [apiPackages, setApiPackages] = useState<JokiPackage[]>([]);

  useEffect(() => {
    // Fetch from API
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        setApiPackages(Array.isArray(data.packages) ? data.packages : JOKI_PACKAGES);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch services:', err);
        setApiPackages(JOKI_PACKAGES); // Fallback to dummy
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (apiPackages.length > 0) {
      const filtered = apiPackages.filter((pkg) => pkg.category === category);
      setPackages(filtered);
    }
  }, [category, apiPackages]);

  const allPackages = useMemo(() => apiPackages, [apiPackages]);

  const getPackageById = (id: string): JokiPackage | undefined => {
    return allPackages.find((pkg) => pkg.id === id);
  };

  return {
    packages,
    isLoading,
    category,
    setCategory,
    allPackages,
    getPackageById,
  };
}
