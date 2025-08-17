import React, { useState, useEffect } from 'react';
import { InfoIcon, LightBulbIcon, SparklesIcon, ExclamationTriangleIcon } from './icons/Icons';
import { InsightMessage } from '../types';

interface InsightBarProps {
  messages: string[];
  type: InsightMessage['type'];
}

const InsightBar: React.FC<InsightBarProps> = ({ messages, type }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        // Reset index to 0 whenever messages array changes to start from the beginning.
        setCurrentIndex(0);
        
        if (messages.length <= 1) {
            return;
        }

        const intervalId = setInterval(() => {
            setIsFading(true);
            // Wait for fade-out transition to complete before changing the text
            setTimeout(() => {
                setCurrentIndex(prevIndex => (prevIndex + 1) % messages.length);
                setIsFading(false);
            }, 300); // This should match the CSS transition duration
        }, 5000); // 5 seconds per message

        return () => clearInterval(intervalId);
    }, [messages]);


    const getIcon = () => {
        switch (type) {
            case 'loading':
                return <SparklesIcon className="w-5 h-5 text-blue-500 animate-pulse" />;
            case 'success':
                return <SparklesIcon className="w-5 h-5 text-green-500" />;
            case 'error':
                return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
            case 'prompt':
                return <LightBulbIcon className="w-5 h-5 text-yellow-500" />;
            case 'info':
            default:
                return <InfoIcon className="w-5 h-5 text-gray-500" />;
        }
    };
  
  return (
    <div className="bg-white/80 backdrop-blur-lg px-4 py-2 flex items-center space-x-3 border-t border-b border-gray-200 min-h-[44px]">
      <div className="flex-shrink-0">{getIcon()}</div>
      <p 
        className={`text-sm text-neutral-text flex-1 line-clamp-2 transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}
      >
        {messages[currentIndex] || ''}
      </p>
    </div>
  );
};

export default InsightBar;
