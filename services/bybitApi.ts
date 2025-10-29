
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
    console.log('API credentials updated');
  }

  async getTickerPrice(symbol: string): Promise<CryptoPrice | null> {
    try {
      console.log('Fetching ticker price for:', symbol);
      const url = `${BYBIT_API_BASE}/v5/market/tickers?category=spot&symbol=${symbol}`;
      console.log('API URL:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('API Error - Status:', response.status);
        console.error('API Error - Status Text:', response.statusText);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Ticker API Response:', JSON.stringify(data, null, 2));

      if (data.retCode !== 0) {
        console.error('API returned error code:', data.retCode);
        console.error('API error message:', data.retMsg);
        return null;
      }

      if (!data.result?.list?.[0]) {
        console.error('No ticker data in response');
        return null;
      }

      const ticker = data.result.list[0];
      console.log('Ticker data:', ticker);
      
      const cryptoPrice: CryptoPrice = {
        symbol: ticker.symbol,
        lastPrice: ticker.lastPrice,
        priceChange: ticker.price24hPcnt,
        priceChangePercent: (parseFloat(ticker.price24hPcnt) * 100).toFixed(2),
        highPrice: ticker.highPrice24h,
        lowPrice: ticker.lowPrice24h,
        volume: ticker.volume24h,
        timestamp: Date.now(),
      };

      console.log('Parsed crypto price:', cryptoPrice);
      return cryptoPrice;
    } catch (error) {
      console.error('Error fetching ticker price:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return null;
    }
  }

  async getHistoricalKlines(
    symbol: string,
    interval: string = '1h',
    limit: number = 200
  ): Promise<any[]> {
    try {
      console.log('========================================');
      console.log('Fetching historical klines');
      console.log('Symbol:', symbol);
      console.log('Interval:', interval);
      console.log('Limit:', limit);
      
      const url = `${BYBIT_API_BASE}/v5/market/kline?category=spot&symbol=${symbol}&interval=${interval}&limit=${limit}`;
      console.log('API URL:', url);

      const response = await fetch(url);

      if (!response.ok) {
        console.error('Klines API Error - Status:', response.status);
        console.error('Klines API Error - Status Text:', response.statusText);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Klines API Response - retCode:', data.retCode);
      console.log('Klines API Response - retMsg:', data.retMsg);

      if (data.retCode !== 0) {
        console.error('API returned error code:', data.retCode);
        console.error('API error message:', data.retMsg);
        return [];
      }

      if (!data.result?.list) {
        console.error('No klines data in response');
        return [];
      }

      const klines = data.result.list;
      console.log('Klines data received:', klines.length, 'candles');
      
      if (klines.length > 0) {
        console.log('First candle:', klines[0]);
        console.log('Last candle:', klines[klines.length - 1]);
        console.log('First candle date:', new Date(parseInt(klines[0][0])).toISOString());
        console.log('Last candle date:', new Date(parseInt(klines[klines.length - 1][0])).toISOString());
      }

      console.log('========================================');
      return klines;
    } catch (error) {
      console.error('Error fetching historical klines:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return [];
    }
  }

  async getMultipleTickers(symbols: string[]): Promise<CryptoPrice[]> {
    console.log('Fetching multiple tickers:', symbols);
    const promises = symbols.map(symbol => this.getTickerPrice(symbol));
    const results = await Promise.all(promises);
    const validResults = results.filter((price): price is CryptoPrice => price !== null);
    console.log('Successfully fetched', validResults.length, 'out of', symbols.length, 'tickers');
    return validResults;
  }
}

export const bybitApi = new BybitApiService();
