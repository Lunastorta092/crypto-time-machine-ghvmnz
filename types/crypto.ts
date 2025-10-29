
export interface CryptoPrice {
  symbol: string;
  lastPrice: string;
  priceChange: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  timestamp: number;
}

export interface BybitApiConfig {
  apiKey: string;
  apiSecret: string;
}

export interface PricePrediction {
  symbol: string;
  currentPrice: number;
  predictedPrice: number;
  targetDate: Date;
  confidence: number;
  trend: 'bullish' | 'bearish' | 'neutral';
}
