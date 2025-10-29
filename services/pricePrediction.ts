
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
    if (historicalPrices.length < 2) {
      return historicalPrices[historicalPrices.length - 1] || 0;
    }

    // Calculate linear regression
    const n = historicalPrices.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (let i = 0; i < n; i++) {
      sumX += timestamps[i];
      sumY += historicalPrices[i];
      sumXY += timestamps[i] * historicalPrices[i];
      sumXX += timestamps[i] * timestamps[i];
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict price at target timestamp
    const predictedPrice = slope * targetTimestamp + intercept;

    return predictedPrice;
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

    // Lower volatility = higher confidence
    let confidence = 100 - Math.min(volatility * 2, 70);
    
    // More data points = higher confidence
    const dataBonus = Math.min((prices.length / 200) * 20, 20);
    confidence += dataBonus;

    return Math.max(30, Math.min(95, confidence));
  }

  async generatePrediction(
    symbol: string,
    currentPrice: number,
    historicalData: any[],
    targetDate: Date
  ): Promise<PricePrediction> {
    console.log('Generating prediction for', symbol, 'with', historicalData.length, 'data points');

    // Extract prices and timestamps from historical data
    const prices = historicalData.map(candle => parseFloat(candle[4])); // Close price
    const timestamps = historicalData.map(candle => parseInt(candle[0])); // Timestamp

    // Predict price
    const targetTimestamp = targetDate.getTime();
    const predictedPrice = this.predictPrice(prices, timestamps, targetTimestamp);

    // Calculate additional metrics
    const trend = this.determineTrend(prices);
    const confidence = this.calculateConfidence(prices);

    return {
      symbol,
      currentPrice,
      predictedPrice: Math.max(0, predictedPrice), // Ensure non-negative
      targetDate,
      confidence,
      trend,
    };
  }
}

export const predictionService = new PricePredictionService();
