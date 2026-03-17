import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { Product } from '@/contexts/CartContext';

const fuseOptions = {
  includeScore: true,
  threshold: 0.4,
  keys: [
    { name: 'name', weight: 2 },
    { name: 'tags', weight: 1.5 },
    { name: 'category', weight: 1 },
  ],
};

/**
 * A custom hook to perform fuzzy search on products.
 * This version is hardened to always accept an array and always return an array.
 * @param products The list of products to search through.
 * @param query The user's search query.
 */
export function useProductSearch(products: Product[], query: string): Product[] {
  // Guarantee that the input to Fuse is always an array.
  const productList = Array.isArray(products) ? products : [];
  
  const fuse = useMemo(() => new Fuse(productList, fuseOptions), [productList]);

  if (!query.trim()) {
    return productList;
  }

  const results = fuse.search(query);
  return results.map(result => result.item);
}