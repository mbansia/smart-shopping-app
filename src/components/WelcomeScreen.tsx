
import React from 'react';
import { SparklesIcon } from './icons/Icons';

export const WelcomeScreen: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="p-4 bg-gradient-to-br from-brand-teal to-brand-blue rounded-full mb-6">
                 <SparklesIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-text">Smart Shopping Assistant</h1>
            <p className="mt-2 max-w-md text-gray-600">
                Find the best deals across all your favorite stores.
                Just tell me what you're looking for, and I'll handle the rest.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-2 text-sm text-gray-500">
                <div className="bg-white p-3 rounded-lg border border-gray-200">Compare prices instantly</div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">Find the fastest delivery</div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">Earn cashback on purchases</div>
            </div>
        </div>
    );
};
