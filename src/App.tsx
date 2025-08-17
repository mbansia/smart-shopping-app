
import React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import SmartFilters from './components/SmartFilters';
import ResultsCanvas from './components/ResultsCanvas';
import InsightBar from './components/InsightBar';
import CommandBar from './components/CommandBar';
import ComparisonView from './components/ComparisonView';
import { fetchProductDeals } from './services/geminiService';
import { Product, InsightMessage } from './types';
import { INITIAL_FILTERS, WELCOME_MESSAGE } from './constants';
import { WelcomeScreen } from './components/WelcomeScreen';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [insightMessage, setInsightMessage] = useState<InsightMessage>(WELCOME_MESSAGE);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cashback, setCashback] = useState<number>(25.48);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [conversationContext, setConversationContext] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Perform a health check on the backend when the app loads.
    const checkApiHealth = async () => {
      try {
        const response = await fetch('/api/health');
        if (!response.ok) {
          throw new Error(`Health check failed with status ${response.status}`);
        }
        const data = await response.json();
        console.log("Health check successful:", data);
      } catch (error) {
        console.error("Health check failed:", error);
        setInsightMessage({
          texts: ["Could not connect to the backend services. Please refresh the page."],
          type: 'error',
        });
      }
    };
    checkApiHealth();
  }, []);

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    abortControllerRef.current = new AbortController();
    
    const fullQuery = conversationContext ? `${conversationContext} | User's new message: ${query}` : query;
    
    const onStatusUpdate = (message: string) => {
        setInsightMessage({ texts: [message], type: 'loading' });
    };
    
    onStatusUpdate('Thinking...');
    
    try {
      const result = await fetchProductDeals(
        fullQuery, 
        abortControllerRef.current.signal,
        onStatusUpdate
      );

      if (result.followUpQuestion) {
        setInsightMessage({ texts: [result.followUpQuestion], type: 'prompt' });
        setConversationContext(fullQuery);
      } else if (result.products) {
        setHasSearched(true); 
        setProducts(result.products);
        setInsightMessage({ 
          texts: result.insights && result.insights.length > 0 ? result.insights : [`Found ${result.products.length} top deals!`], 
          type: 'success' 
        });
        setConversationContext(''); 
        if (result.products.length > 0) {
            setCashback(prev => parseFloat((prev + result.products.length * 0.75).toFixed(2)));
        }
      } else {
         setProducts([]);
         setHasSearched(true); 
         setInsightMessage({ texts: ["I couldn't find any deals for that. Try a different search."], type: 'info' });
         setConversationContext('');
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log("Search was cancelled by the user.");
        setInsightMessage({ texts: ["Search cancelled."], type: 'info' });
        // No need to set conversation context or anything else, just stop.
        return; 
      }
      
      console.error("Caught error object:", error);
      let errorMessage = 'Sorry, something went wrong. Please try again.';
       if (error instanceof Error) {
        // More specific error messages for better UX
        if (error.message.includes("API key is not configured")) {
          errorMessage = "The AI assistant is not configured correctly. Please contact support.";
        } else if (error.message.includes("Invalid API key")) { 
          errorMessage = "The shopping search service isn't working correctly. Please try again later.";
        } else if (error.message.includes("Could not connect")) { 
            errorMessage = "Could not connect to the shopping service. Please check your network and try again."
        } else if (error.message.includes("service is not available")) {
            // This is the specific error for our local dev server not running
            errorMessage = "The shopping search feature isn't running. If you're developing locally, please ensure the backend service is started.";
        } else {
            // A generic fallback for other errors from the service layer
            errorMessage = error.message; 
        }
      }
      setInsightMessage({ texts: [errorMessage], type: 'error' });
      setConversationContext(''); // Reset context on error
      setHasSearched(true); // Show the error message in the main view
      setProducts([]); // Clear any old products
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [isLoading, conversationContext]);

  const handleFilterToggle = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseComparison = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="bg-neutral-bg font-sans text-neutral-text flex flex-col h-screen w-screen max-w-full overflow-hidden antialiased">
      <Header cashback={cashback} />
      
      <main className="flex-grow flex flex-col overflow-hidden">
        {hasSearched && <SmartFilters filters={INITIAL_FILTERS} activeFilters={activeFilters} onFilterToggle={handleFilterToggle} />}
        
        <div className="flex-grow overflow-y-auto pb-32">
          {hasSearched ? (
            <ResultsCanvas 
              products={products} 
              isLoading={isLoading} 
              onProductSelect={handleProductSelect} 
            />
          ) : (
            <WelcomeScreen />
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-20">
        <InsightBar messages={insightMessage.texts} type={insightMessage.type} />
        <CommandBar onSearch={handleSearch} isLoading={isLoading} onStop={handleStop} />
      </div>

      <ComparisonView product={selectedProduct} onClose={handleCloseComparison} />
    </div>
  );
};

export default App;
