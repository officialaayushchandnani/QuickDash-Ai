import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/contexts/CartContext';
import { useProductSearch } from '@/hooks/useProductSearch';
import { Search } from 'lucide-react';

interface SearchSuggestionsProps {
  query: string;
  products: Product[] | null; // Can be null during initial load
  isVisible: boolean;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({ query, products, isVisible }) => {
  const navigate = useNavigate();
  const searchResults = useProductSearch(products, query);

  if (!isVisible || !query) {
    return null;
  }

  // Slicing for previews
  const productPreviews = searchResults.slice(0, 3);
  const textSuggestions = searchResults.slice(0, 3).map(p => p.name);

  return (
    <div className="absolute top-full mt-2 w-full bg-background rounded-lg border shadow-lg z-50 overflow-hidden">
      {searchResults.length > 0 ? (
        <div className="p-4 space-y-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Suggestions</h4>
          <div className="space-y-2">
            {productPreviews.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-2 rounded-md hover:bg-muted cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                <div className="flex-1">
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                </div>
                <p className="font-bold text-brand-green">₹{product.price}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">No results found for "{query}"</p>
      )}
    </div>
  );
};