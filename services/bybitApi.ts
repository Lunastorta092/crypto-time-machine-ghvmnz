
import { CryptoPrice } from '@/types/crypto';

const BYBIT_API_BASE = 'https://api.bybit.com';

export class BybitApiService {
  private apiKey: string;
  private apiSecret: string;

  constructor(apiKey: string = '', apiSecret: string = '') {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  setCredentials(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  async getTickerPrice(symbol: string): Promise<CryptoPrice | null> {
    try {
      const response = await fetch(
        `${BYBIT_API_BASE}/v5/market/tickers?category=spot&symbol=${symbol}`
      );
      
      if (!response.ok) {
        console.log('API Error:', response.status);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Bybit API Response:', data);

      if (data.retCode !== 0 || !data.result?.list?.[0]) {
        console.log('Invalid response format');
        return null;
      }

      const ticker = data.result.list[0];
      
      return {
        symbol: ticker.symbol,
        lastPrice: ticker.lastPrice,
        priceChange: ticker.price24hPcnt,
        priceChangePercent: (parseFloat(ticker.price24hPcnt) * 100).toFixed(2),
        highPrice: ticker.highPrice24h,
        lowPrice: ticker.lowPrice24h,
        volume: ticker.volume24h,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error fetching ticker price:', error);
      return null;
    }
  }

  async getHistoricalKlines(
    symbol: string,
    interval: string = '1h',
    limit: number = 200
  ): Promise<any[]> {
    try {
      const response = await fetch(
        `${BYBIT_API_BASE}/v5/market/kline?category=spot&symbol=${symbol}&interval=${interval}&limit=${limit}`
      );

      if (!response.ok) {
        console.log('Klines API Error:', response.status);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Klines data received:', data.result?.list?.length || 0, 'candles');

      if (data.retCode !== 0 || !data.result?.list) {
        return [];
      }

      return data.result.list;
    } catch (error) {
      console.error('Error fetching historical klines:', error);
      return [];
    }
  }

  async getMultipleTickers(symbols: string[]): Promise<CryptoPrice[]> {
    const promises = symbols.map(symbol => this.getTickerPrice(symbol));
    const results = await Promise.all(promises);
    return results.filter((price): price is CryptoPrice => price !== null);
  }
}

export const bybitApi = new BybitApiService();
