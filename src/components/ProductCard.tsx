import React from 'react';
import { Product, OpportunityScoreType } from '../types';
import { Badge } from './Badge';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const getBadgeVariant = (score: OpportunityScoreType): 'green' | 'orange' | 'blue' => {
    switch (score) {
      case 'Great Deal':
        return 'green';
      case 'Limited Stock':
        return 'orange';
      case 'Price Drop':
        return 'blue';
      default:
        return 'green';
    }
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="relative">
        <img className="w-full h-32 sm:h-40 object-cover" src={product.imageUrl} alt={product.name} />
        <div className="absolute top-2 left-2">
            <Badge text={product.opportunityScore} variant={getBadgeVariant(product.opportunityScore)} />
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-neutral-text truncate" title={product.name}>
          {product.name}
        </h3>
        <div className="mt-2">
          <p className="text-xs text-gray-500">Your Price</p>
          <p className="text-lg font-bold text-brand-teal">AED {product.bestPrice.toFixed(2)}</p>
        </div>
        <div className="mt-2 flex justify-between items-center text-xs text-gray-600">
          <span>{product.fastestDelivery}</span>
          <div className="flex items-center gap-1">
             <span className="truncate">{product.bestRetailerName}</span>
             <img src={product.bestRetailerLogoUrl} alt={product.bestRetailerName} className="h-4 w-auto" />
          </div>
        </div>
        <div className="mt-2 text-center text-xs font-medium text-green-600 bg-green-100 rounded-full px-2 py-0.5">
          + AED {product.cashback.toFixed(2)} Cashback
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
