export type OpportunityScoreType = 'Great Deal' | 'Limited Stock' | 'Price Drop';

export interface Offer {
  retailer: string;
  retailerLogoUrl: string;
  price: number;
  deliveryTime: string;
  affiliateLink: string;
  stockStatus: string;
}

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  opportunityScore: OpportunityScoreType;
  bestPrice: number;
  fastestDelivery: string;
  bestRetailerName: string;
  bestRetailerLogoUrl: string;
  cashback: number;
  offers: Offer[];
}

export interface InsightMessage {
    texts: string[];
    type: 'info' | 'loading' | 'success' | 'error' | 'prompt';
}

export type AssistantResponse = {
  products?: Product[];
  insights?: string[];
  followUpQuestion?: string;
};
