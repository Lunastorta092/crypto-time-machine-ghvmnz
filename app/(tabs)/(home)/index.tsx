
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { bybitApi } from '@/services/bybitApi';
import { predictionService } from '@/services/pricePrediction';
import { CryptoPrice, PricePrediction } from '@/types/crypto';
import CryptoCard from '@/components/CryptoCard';
import PredictionCard from '@/components/PredictionCard';
import { IconSymbol } from '@/components/IconSymbol';

const POPULAR_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'];

export default function HomeScreen() {
  const theme = useTheme();
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [prediction, setPrediction] = useState<PricePrediction | null>(null);
  
  // Date/Time state
  const [targetDate, setTargetDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Default: 24 hours from now
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // API Configuration
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');

  useEffect(() => {
    loadCryptoPrices();
    const interval = setInterval(loadCryptoPrices, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadCryptoPrices = async () => {
    try {
      setLoading(true);
      const prices = await bybitApi.getMultipleTickers(POPULAR_SYMBOLS);
      setCryptoPrices(prices);
      console.log('Loaded', prices.length, 'crypto prices');
    } catch (error) {
      console.error('Error loading crypto prices:', error);
      Alert.alert('Error', 'Failed to load cryptocurrency prices. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePrediction = async () => {
    if (targetDate <= new Date()) {
      Alert.alert('Invalid Date', 'Please select a future date and time for prediction.');
      return;
    }

    try {
      setPredictionLoading(true);
      console.log('Generating prediction for', selectedSymbol, 'at', targetDate);

      // Get current price
      const currentPriceData = await bybitApi.getTickerPrice(selectedSymbol);
      if (!currentPriceData) {
        Alert.alert('Error', 'Failed to fetch current price data.');
        return;
      }

      const currentPrice = parseFloat(currentPriceData.lastPrice);

      // Get historical data
      const historicalData = await bybitApi.getHistoricalKlines(selectedSymbol, '1h', 200);
      if (historicalData.length === 0) {
        Alert.alert('Error', 'Failed to fetch historical data for prediction.');
        return;
      }

      // Generate prediction
      const predictionResult = await predictionService.generatePrediction(
        selectedSymbol,
        currentPrice,
        historicalData,
        targetDate
      );

      setPrediction(predictionResult);
      console.log('Prediction generated:', predictionResult);
    } catch (error) {
      console.error('Error generating prediction:', error);
      Alert.alert('Error', 'Failed to generate price prediction. Please try again.');
    } finally {
      setPredictionLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(targetDate);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setTargetDate(newDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(targetDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setTargetDate(newDate);
    }
  };

  const handleSaveApiConfig = () => {
    if (apiKey.trim() && apiSecret.trim()) {
      bybitApi.setCredentials(apiKey.trim(), apiSecret.trim());
      Alert.alert('Success', 'API credentials saved successfully!');
      setShowApiConfig(false);
    } else {
      Alert.alert('Error', 'Please enter both API Key and API Secret.');
    }
  };

  const renderHeaderRight = () => (
    <Pressable
      onPress={() => setShowApiConfig(!showApiConfig)}
      style={styles.headerButton}
    >
      <IconSymbol name="gear" color={colors.primary} size={24} />
    </Pressable>
  );

  const renderHeaderLeft = () => (
    <Pressable
      onPress={loadCryptoPrices}
      style={styles.headerButton}
    >
      <IconSymbol name="arrow.clockwise" color={colors.primary} size={24} />
    </Pressable>
  );

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: 'Crypto Price Predictor',
            headerRight: renderHeaderRight,
            headerLeft: renderHeaderLeft,
          }}
        />
      )}
      <View style={[commonStyles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* API Configuration Section */}
          {showApiConfig && (
            <View style={[commonStyles.card, styles.apiConfigCard]}>
              <Text style={commonStyles.subtitle}>Bybit API Configuration</Text>
              <Text style={[commonStyles.textSecondary, styles.apiNote]}>
                Note: API credentials are optional. The app works with public endpoints for price data.
              </Text>
              
              <TextInput
                style={commonStyles.input}
                placeholder="API Key (Optional)"
                placeholderTextColor={colors.textSecondary}
                value={apiKey}
                onChangeText={setApiKey}
                autoCapitalize="none"
              />
              
              <TextInput
                style={commonStyles.input}
                placeholder="API Secret (Optional)"
                placeholderTextColor={colors.textSecondary}
                value={apiSecret}
                onChangeText={setApiSecret}
                secureTextEntry
                autoCapitalize="none"
              />
              
              <Pressable
                style={[buttonStyles.primary, styles.saveButton]}
                onPress={handleSaveApiConfig}
              >
                <Text style={buttonStyles.text}>Save Configuration</Text>
              </Pressable>
            </View>
          )}

          {/* Real-time Market Data */}
          <View style={styles.section}>
            <Text style={[commonStyles.title, styles.sectionTitle]}>
              Real-time Market Data
            </Text>
            
            {loading && cryptoPrices.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[commonStyles.textSecondary, styles.loadingText]}>
                  Loading market data...
                </Text>
              </View>
            ) : (
              cryptoPrices.map((crypto) => (
                <CryptoCard
                  key={crypto.symbol}
                  crypto={crypto}
                  onPress={() => setSelectedSymbol(crypto.symbol)}
                />
              ))
            )}
          </View>

          {/* Price Prediction Section */}
          <View style={styles.section}>
            <Text style={[commonStyles.title, styles.sectionTitle]}>
              Price Prediction
            </Text>

            <View style={[commonStyles.card, styles.predictionInputCard]}>
              <Text style={commonStyles.subtitle}>Select Cryptocurrency</Text>
              <View style={styles.symbolSelector}>
                {POPULAR_SYMBOLS.map((symbol) => (
                  <Pressable
                    key={symbol}
                    style={[
                      styles.symbolButton,
                      selectedSymbol === symbol && styles.symbolButtonActive,
                    ]}
                    onPress={() => setSelectedSymbol(symbol)}
                  >
                    <Text
                      style={[
                        styles.symbolButtonText,
                        selectedSymbol === symbol && styles.symbolButtonTextActive,
                      ]}
                    >
                      {symbol.replace('USDT', '')}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[commonStyles.subtitle, styles.dateTimeTitle]}>
                Target Date & Time
              </Text>

              <View style={styles.dateTimeContainer}>
                <Pressable
                  style={styles.dateTimeButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateTimeLabel}>Date</Text>
                  <Text style={styles.dateTimeValue}>
                    {targetDate.toLocaleDateString()}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.dateTimeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.dateTimeLabel}>Time</Text>
                  <Text style={styles.dateTimeValue}>
                    {targetDate.toLocaleTimeString()}
                  </Text>
                </Pressable>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={targetDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={targetDate}
                  mode="time"
                  display="default"
                  onChange={handleTimeChange}
                />
              )}

              <Pressable
                style={[buttonStyles.primary, styles.predictButton]}
                onPress={handleGeneratePrediction}
                disabled={predictionLoading}
              >
                {predictionLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={buttonStyles.text}>Generate Prediction</Text>
                )}
              </Pressable>
            </View>

            {/* Prediction Result */}
            {prediction && <PredictionCard prediction={prediction} />}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'android' ? 100 : 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
  },
  headerButton: {
    padding: 8,
  },
  apiConfigCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  apiNote: {
    marginBottom: 16,
    fontStyle: 'italic',
  },
  saveButton: {
    marginTop: 8,
  },
  predictionInputCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  symbolSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    marginBottom: 24,
  },
  symbolButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  symbolButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  symbolButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  symbolButtonTextActive: {
    color: colors.primary,
  },
  dateTimeTitle: {
    marginBottom: 12,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  dateTimeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  dateTimeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dateTimeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  predictButton: {
    marginTop: 8,
  },
  bottomSpacer: {
    height: 40,
  },
});
