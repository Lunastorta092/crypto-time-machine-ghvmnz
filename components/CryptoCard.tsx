
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { CryptoPrice } from '@/types/crypto';

interface CryptoCardProps {
  crypto: CryptoPrice;
  onPress?: () => void;
}

export default function CryptoCard({ crypto, onPress }: CryptoCardProps) {
  const priceChangeNum = parseFloat(crypto.priceChangePercent);
  const isPositive = priceChangeNum >= 0;

  return (
    <Pressable
      style={[commonStyles.card, styles.card]}
      onPress={onPress}
      android_ripple={{ color: colors.highlight }}
    >
      <View style={styles.header}>
        <Text style={styles.symbol}>{crypto.symbol}</Text>
        <View style={[styles.changeBadge, isPositive ? styles.positive : styles.negative]}>
          <Text style={styles.changeText}>
            {isPositive ? '+' : ''}{crypto.priceChangePercent}%
          </Text>
        </View>
      </View>

      <Text style={styles.price}>${parseFloat(crypto.lastPrice).toLocaleString()}</Text>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={commonStyles.textSecondary}>24h High</Text>
          <Text style={styles.detailValue}>${parseFloat(crypto.highPrice).toLocaleString()}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={commonStyles.textSecondary}>24h Low</Text>
          <Text style={styles.detailValue}>${parseFloat(crypto.lowPrice).toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.volumeContainer}>
        <Text style={commonStyles.textSecondary}>24h Volume</Text>
        <Text style={styles.volume}>{parseFloat(crypto.volume).toLocaleString()}</Text>
      </View>
    </Pressable>
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
    marginBottom: 12,
  },
  symbol: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  changeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  positive: {
    backgroundColor: '#d4edda',
  },
  negative: {
    backgroundColor: '#f8d7da',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
  },
  volumeContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  volume: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
  },
});
