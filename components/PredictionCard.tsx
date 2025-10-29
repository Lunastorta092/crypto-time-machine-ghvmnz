
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { PricePrediction } from '@/types/crypto';

interface PredictionCardProps {
  prediction: PricePrediction;
}

export default function PredictionCard({ prediction }: PredictionCardProps) {
  const priceChange = prediction.predictedPrice - prediction.currentPrice;
  const priceChangePercent = (priceChange / prediction.currentPrice) * 100;
  const isPositive = priceChange >= 0;

  const getTrendColor = () => {
    switch (prediction.trend) {
      case 'bullish':
        return colors.success;
      case 'bearish':
        return colors.danger;
      default:
        return colors.secondary;
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

  return (
    <View style={[commonStyles.card, styles.card]}>
      <View style={styles.header}>
        <Text style={commonStyles.subtitle}>Price Prediction</Text>
        <Text style={styles.emoji}>{getTrendEmoji()}</Text>
      </View>

      <View style={styles.priceContainer}>
        <View style={styles.priceSection}>
          <Text style={commonStyles.textSecondary}>Current Price</Text>
          <Text style={styles.currentPrice}>
            ${prediction.currentPrice.toLocaleString()}
          </Text>
        </View>

        <View style={styles.arrow}>
          <Text style={styles.arrowText}>→</Text>
        </View>

        <View style={styles.priceSection}>
          <Text style={commonStyles.textSecondary}>Predicted Price</Text>
          <Text style={[styles.predictedPrice, { color: isPositive ? colors.success : colors.danger }]}>
            ${prediction.predictedPrice.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.changeContainer}>
        <Text style={[styles.changeText, { color: isPositive ? colors.success : colors.danger }]}>
          {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
        </Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={commonStyles.textSecondary}>Target Date</Text>
          <Text style={styles.detailValue}>
            {prediction.targetDate.toLocaleDateString()} {prediction.targetDate.toLocaleTimeString()}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={commonStyles.textSecondary}>Trend</Text>
          <View style={[styles.trendBadge, { backgroundColor: getTrendColor() + '20' }]}>
            <Text style={[styles.trendText, { color: getTrendColor() }]}>
              {prediction.trend.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={commonStyles.textSecondary}>Confidence</Text>
          <View style={styles.confidenceContainer}>
            <View style={styles.confidenceBar}>
              <View
                style={[
                  styles.confidenceFill,
                  { width: `${prediction.confidence}%`, backgroundColor: getTrendColor() }
                ]}
              />
            </View>
            <Text style={styles.confidenceText}>{prediction.confidence.toFixed(0)}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⚠️ This is a basic prediction model. Cryptocurrency markets are highly volatile. 
          Always do your own research before making investment decisions.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 24,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceSection: {
    flex: 1,
  },
  arrow: {
    paddingHorizontal: 8,
  },
  arrowText: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  predictedPrice: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  changeContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  changeText: {
    fontSize: 18,
    fontWeight: '700',
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  trendBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confidenceBar: {
    width: 100,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  disclaimer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.warning + '20',
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
  },
});
