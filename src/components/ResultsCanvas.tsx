import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { SkeletonLoader } from './SkeletonLoader';

interface ResultsCanvasProps {
  products: Product[];
  isLoading: boolean;
  onProductSelect: (product: Product) => void;
}

const ResultsCanvas: React.FC<ResultsCanvasProps> = ({ products, isLoading, onProductSelect }) => {
  if (isLoading) {
    return (
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <SkeletonLoader key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0 && !isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-neutral-text">No Results Found</h3>
            <p className="mt-1 max-w-md">We couldn't find any deals based on your search. Try a different product or check your spelling.</p>
        </div>
    );
  }

  return (
    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-fade-in">
      {products.map(product => (
        <ProductCard key={product.id} product={product} onClick={() => onProductSelect(product)} />
      ))}
    </div>
  );
};

export default ResultsCanvas;
