
import { PricePrediction } from '@/types/crypto';

export class PricePredictionService {
  /**
   * Simple linear regression based price prediction
   * This is a basic implementation - in production you'd want more sophisticated models
   */
  predictPrice(
    historicalPrices: number[],
    timestamps: number[],
    targetTimestamp: number
  ): number {
    console.log('=== PREDICTION CALCULATION START ===');
    console.log('Historical prices count:', historicalPrices.length);
    console.log('First price:', historicalPrices[0]);
    console.log('Last price:', historicalPrices[historicalPrices.length - 1]);
    console.log('First timestamp:', new Date(timestamps[0]).toISOString());
    console.log('Last timestamp:', new Date(timestamps[timestamps.length - 1]).toISOString());
    console.log('Target timestamp:', new Date(targetTimestamp).toISOString());

    if (historicalPrices.length < 2) {
      console.log('Not enough data points, returning last price');
      return historicalPrices[historicalPrices.length - 1] || 0;
    }

    // Normalize timestamps to avoid overflow in calculations
    // Use hours since first timestamp as the unit
    const firstTimestamp = timestamps[0];
    const normalizedTimestamps = timestamps.map(t => (t - firstTimestamp) / (1000 * 60 * 60)); // Convert to hours
    const normalizedTarget = (targetTimestamp - firstTimestamp) / (1000 * 60 * 60);

    console.log('Normalized timestamps (hours):', normalizedTimestamps.slice(0, 3), '...', normalizedTimestamps.slice(-3));
    console.log('Normalized target (hours):', normalizedTarget);

    // Calculate linear regression
    const n = historicalPrices.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (let i = 0; i < n; i++) {
      sumX += normalizedTimestamps[i];
      sumY += historicalPrices[i];
      sumXY += normalizedTimestamps[i] * historicalPrices[i];
      sumXX += normalizedTimestamps[i] * normalizedTimestamps[i];
    }

    console.log('Regression sums:', { sumX, sumY, sumXY, sumXX });

    const denominator = (n * sumXX - sumX * sumX);
    console.log('Denominator:', denominator);

    if (Math.abs(denominator) < 0.0001) {
      console.log('Denominator too small, using average price');
      return sumY / n;
    }

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    console.log('Slope:', slope);
    console.log('Intercept:', intercept);

    // Predict price at target timestamp
    const predictedPrice = slope * normalizedTarget + intercept;

    console.log('Raw predicted price:', predictedPrice);

    // Sanity check: predicted price should be within reasonable bounds
    const currentPrice = historicalPrices[historicalPrices.length - 1];
    const minHistoricalPrice = Math.min(...historicalPrices);
    const maxHistoricalPrice = Math.max(...historicalPrices);
    
    console.log('Current price:', currentPrice);
    console.log('Historical range:', minHistoricalPrice, '-', maxHistoricalPrice);

    // If prediction is wildly off (more than 10x the historical range), use a more conservative estimate
    const historicalRange = maxHistoricalPrice - minHistoricalPrice;
    const maxReasonableChange = historicalRange * 5; // Allow up to 5x the historical range
    
    if (Math.abs(predictedPrice - currentPrice) > maxReasonableChange) {
      console.log('Prediction too extreme, using trend-based estimate');
      // Use a simple trend-based estimate instead
      const recentPrices = historicalPrices.slice(-20);
      const recentChange = recentPrices[recentPrices.length - 1] - recentPrices[0];
      const avgChangePerHour = recentChange / 20;
      const hoursToTarget = normalizedTarget - normalizedTimestamps[normalizedTimestamps.length - 1];
      const trendBasedPrediction = currentPrice + (avgChangePerHour * hoursToTarget);
      console.log('Trend-based prediction:', trendBasedPrediction);
      return Math.max(0, trendBasedPrediction);
    }

    console.log('=== PREDICTION CALCULATION END ===');
    return Math.max(0, predictedPrice);
  }

  /**
   * Calculate moving average
   */
  calculateMovingAverage(prices: number[], period: number): number {
    if (prices.length < period) {
      period = prices.length;
    }

    const recentPrices = prices.slice(-period);
    const sum = recentPrices.reduce((acc, price) => acc + price, 0);
    return sum / period;
  }

  /**
   * Determine trend based on recent price movements
   */
  determineTrend(prices: number[]): 'bullish' | 'bearish' | 'neutral' {
    if (prices.length < 2) {
      return 'neutral';
    }

    const recentPrices = prices.slice(-10);
    const firstHalf = recentPrices.slice(0, Math.floor(recentPrices.length / 2));
    const secondHalf = recentPrices.slice(Math.floor(recentPrices.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;

    console.log('Trend analysis - Change percent:', changePercent.toFixed(2) + '%');

    if (changePercent > 2) return 'bullish';
    if (changePercent < -2) return 'bearish';
    return 'neutral';
  }

  /**
   * Calculate confidence score (0-100)
   */
  calculateConfidence(prices: number[]): number {
    if (prices.length < 10) {
      return 30; // Low confidence with limited data
    }

    // Calculate volatility
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((acc, price) => acc + Math.pow(price - mean, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);
    const volatility = (stdDev / mean) * 100;

    console.log('Volatility:', volatility.toFixed(2) + '%');

    // Lower volatility = higher confidence
    let confidence = 100 - Math.min(volatility * 2, 70);
    
    // More data points = higher confidence
    const dataBonus = Math.min((prices.length / 200) * 20, 20);
    confidence += dataBonus;

    const finalConfidence = Math.max(30, Math.min(95, confidence));
    console.log('Confidence score:', finalConfidence.toFixed(0) + '%');

    return finalConfidence;
  }

  async generatePrediction(
    symbol: string,
    currentPrice: number,
    historicalData: any[],
    targetDate: Date
  ): Promise<PricePrediction> {
    console.log('========================================');
    console.log('GENERATING PREDICTION');
    console.log('Symbol:', symbol);
    console.log('Current price:', currentPrice);
    console.log('Historical data points:', historicalData.length);
    console.log('Target date:', targetDate.toISOString());
    console.log('========================================');

    if (!historicalData || historicalData.length === 0) {
      console.error('ERROR: No historical data available');
      throw new Error('No historical data available for prediction');
    }

    // Bybit returns data in format: [timestamp, open, high, low, close, volume, turnover]
    // Extract prices and timestamps from historical data
    const prices: number[] = [];
    const timestamps: number[] = [];

    for (let i = 0; i < historicalData.length; i++) {
      const candle = historicalData[i];
      if (candle && candle.length >= 5) {
        const timestamp = parseInt(candle[0]);
        const closePrice = parseFloat(candle[4]);
        
        if (!isNaN(timestamp) && !isNaN(closePrice) && closePrice > 0) {
          timestamps.push(timestamp);
          prices.push(closePrice);
        }
      }
    }

    console.log('Extracted prices:', prices.length);
    console.log('Sample prices:', prices.slice(0, 5));
    console.log('Sample timestamps:', timestamps.slice(0, 5).map(t => new Date(t).toISOString()));

    if (prices.length < 2) {
      console.error('ERROR: Not enough valid price data');
      throw new Error('Not enough valid price data for prediction');
    }

    // Predict price
    const targetTimestamp = targetDate.getTime();
    const predictedPrice = this.predictPrice(prices, timestamps, targetTimestamp);

    // Calculate additional metrics
    const trend = this.determineTrend(prices);
    const confidence = this.calculateConfidence(prices);

    const result: PricePrediction = {
      symbol,
      currentPrice,
      predictedPrice: Math.max(0, predictedPrice),
      targetDate,
      confidence,
      trend,
    };

    console.log('========================================');
    console.log('PREDICTION RESULT:');
    console.log('Current Price:', currentPrice);
    console.log('Predicted Price:', predictedPrice.toFixed(2));
    console.log('Change:', ((predictedPrice - currentPrice) / currentPrice * 100).toFixed(2) + '%');
    console.log('Trend:', trend);
    console.log('Confidence:', confidence.toFixed(0) + '%');
    console.log('========================================');

    return result;
  }
}

export const predictionService = new PricePredictionService();
