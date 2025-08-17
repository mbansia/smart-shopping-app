
import React from 'react';
import { Product } from '../types';
import { XMarkIcon } from './icons/Icons';

interface ComparisonViewProps {
  product: Product | null;
  onClose: () => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-end animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-neutral-bg w-full max-w-4xl max-h-[90vh] rounded-t-2xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-bold text-neutral-text truncate pr-4">{product.name}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="overflow-y-auto p-4 flex-grow">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 flex-shrink-0">
              <img src={product.imageUrl} alt={product.name} className="w-full rounded-lg object-cover" />
            </div>
            <div className="md:w-2/3">
              <h3 className="text-md font-semibold mb-3">Compare Offers</h3>
              <div className="space-y-3">
                {product.offers.sort((a,b) => a.price - b.price).map((offer, index) => (
                  <a 
                    href={offer.affiliateLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    key={index}
                    className="flex items-center bg-white p-3 rounded-lg border border-gray-200 hover:border-brand-blue hover:shadow-lg transition-all"
                  >
                    <img src={offer.retailerLogoUrl} alt={offer.retailer} className="h-8 w-16 object-contain mr-4 flex-shrink-0" />
                    <div className="flex-grow grid grid-cols-2 md:grid-cols-3 gap-2 items-center text-sm">
                        <div className="font-semibold text-brand-teal">
                            AED {offer.price.toFixed(2)}
                        </div>
                        <div className="text-gray-600">
                            {offer.deliveryTime}
                        </div>
                        <div className={`${offer.stockStatus === 'In Stock' ? 'text-green-600' : 'text-orange-500'}`}>
                            {offer.stockStatus}
                        </div>
                    </div>
                    <div className="ml-4 text-xs font-bold text-white bg-gradient-to-r from-brand-teal to-brand-blue px-3 py-2 rounded-full hidden md:block">
                        Shop
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;
