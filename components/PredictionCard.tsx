
import React from 'react';
import { PricePrediction } from '@/types/crypto';
import { View, Text, StyleSheet } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';

interface PredictionCardProps {
  prediction: PricePrediction;
}

export default function PredictionCard({ prediction }: PredictionCardProps) {
  const getTrendColor = () => {
    switch (prediction.trend) {
      case 'bullish':
        return colors.success;
      case 'bearish':
        return colors.danger;
      default:
        return colors.textSecondary;
    }
  };

  const getTrendEmoji = () => {
    switch (prediction.trend) {
      case 'bullish':
        return '📈';
      case 'bearish':
        return '📉';
      default:
        return '➡️';
    }
  };

  const priceChange = prediction.predictedPrice - prediction.currentPrice;
  const priceChangePercent = (priceChange / prediction.currentPrice) * 100;
  const isPositive = priceChange >= 0;

  return (
    <View style={[commonStyles.card, styles.container]}>
      <View style={styles.header}>
        <Text style={commonStyles.subtitle}>Price Prediction</Text>
        <View style={[styles.trendBadge, { backgroundColor: getTrendColor() + '20' }]}>
          <Text style={[styles.trendText, { color: getTrendColor() }]}>
            {getTrendEmoji()} {prediction.trend.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.symbolRow}>
        <Text style={styles.symbolText}>{prediction.symbol.replace('USDT', '')}</Text>
        <Text style={styles.confidenceText}>
          Confidence: {prediction.confidence.toFixed(0)}%
        </Text>
      </View>

      <View style={styles.priceContainer}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Current Price</Text>
          <Text style={styles.currentPrice}>
            ${prediction.currentPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Predicted Price</Text>
          <Text style={[styles.predictedPrice, { color: isPositive ? colors.success : colors.danger }]}>
            ${prediction.predictedPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>

        <View style={styles.changeContainer}>
          <Text style={[styles.changeText, { color: isPositive ? colors.success : colors.danger }]}>
            {isPositive ? '+' : ''}
            ${Math.abs(priceChange).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            {' '}
            ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
          </Text>
        </View>
      </View>

      <View style={styles.targetDateContainer}>
        <Text style={styles.targetDateLabel}>Target Date & Time</Text>
        <Text style={styles.targetDateValue}>
          {prediction.targetDate.toLocaleDateString()} at {prediction.targetDate.toLocaleTimeString()}
        </Text>
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⚠️ This prediction is based on historical data and linear regression analysis. 
          Cryptocurrency markets are highly volatile and unpredictable. 
          This is not financial advice.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trendBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
  },
  symbolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  symbolText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  priceContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  predictedPrice: {
    fontSize: 22,
    fontWeight: '700',
  },
  changeContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  changeText: {
    fontSize: 20,
    fontWeight: '700',
  },
  targetDateContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  targetDateLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  targetDateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  disclaimer: {
    backgroundColor: colors.warning + '10',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  disclaimerText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
