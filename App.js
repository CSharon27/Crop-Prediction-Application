import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
  Animated,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { getWeather, getWeatherByCity } from './services/weatherService';
import { getPretrainedPlantingAdvice } from './services/aiService';

export default function App() {
  const { width } = useWindowDimensions();
  const [currentWeather, setCurrentWeather] = useState(null);
  const [cityWeather, setCityWeather] = useState(null);
  const [locationAdvice, setLocationAdvice] = useState(null);
  const [cityAdvice, setCityAdvice] = useState(null);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedCards, setExpandedCards] = useState({});
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [theme, setTheme] = useState('light');
  const isDark = theme === 'dark';

  const colors = {
    bg: isDark ? '#071022' : '#fff',
    card: isDark ? '#0f1724' : '#f8f9fa',
    text: isDark ? '#e6eef8' : '#111',
    muted: isDark ? '#9aa6b2' : '#666',
    primary: '#2e86de',
  };

  useEffect(() => {
    fetchCurrentLocationWeather();
  }, []);

  useEffect(() => {
    // simple fade-in when weather data loads
    if (currentWeather || cityWeather) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }
  }, [currentWeather, cityWeather]);

  const fetchCurrentLocationWeather = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMessage('Permission to access location was denied');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const weatherData = await getWeather(
        location.coords.latitude,
        location.coords.longitude,
        Constants.expoConfig.extra.WEATHER_API_KEY
      );
      setCurrentWeather(weatherData);
      setLocationAdvice(getPretrainedPlantingAdvice(weatherData)); // Getting planting advice for current location
    } catch (error) {
      setErrorMessage('Failed to get weather for current location');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherForCity = async () => {
    if (!city) return;

    try {
      setLoading(true);
      setErrorMessage('');
      const weatherData = await getWeatherByCity(city, Constants.expoConfig.extra.WEATHER_API_KEY);
      setCityWeather(weatherData);
      setCityAdvice(getPretrainedPlantingAdvice(weatherData)); // Getting planting advice for city
    } catch (error) {
      setErrorMessage('City not found or weather data unavailable');
    } finally {
      setLoading(false);
    }
  };

  const toggleCard = (key) => {
    setExpandedCards((s) => ({ ...s, [key]: !s[key] }));
  };

  const renderWeatherBlock = (key, title, weather, advice) => (
    <Animated.View
      key={key}
      style={[
        styles.card,
        { backgroundColor: colors.card, opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] },
      ]}
    >
      <Pressable onPress={() => toggleCard(key)} style={({ pressed }) => [styles.cardHeader, pressed && { transform: [{ scale: 0.985 }], opacity: 0.85 }]}>
        <Text style={[styles.sectionTitle, { fontSize: width > 400 ? 20 : 16, color: colors.text }]}>{title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.smallText, { color: colors.muted, marginRight: 8 }]}>Tap to {expandedCards[key] ? 'collapse' : 'expand'}</Text>
          <Ionicons name={expandedCards[key] ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
        </View>
      </Pressable>

      <View style={styles.row}>
        <Text style={[styles.infoText, { color: colors.text }]}>🌡️ {weather.main.temp}°C</Text>
        <Text style={[styles.infoText, { color: colors.text }]}>💧 {weather.main.humidity}%</Text>
        <Text style={[styles.infoText, { color: colors.text }]}>{weather.weather[0].main}</Text>
      </View>

      {expandedCards[key] && (
        <View style={styles.expandedArea}>
          <Text style={{ color: colors.text }}>📍 Location: {weather.name}</Text>
          <Text style={{ color: colors.text }}>🌤️ Condition: {weather.weather[0].description}</Text>

          {advice?.planting && (
            <View style={styles.adviceBlock}>
              <Text style={[styles.adviceTitle, { color: colors.text }]}>🌱 Planting Advice</Text>
              <Text style={[styles.adviceText, { color: colors.muted }]}>{advice.planting}</Text>
            </View>
          )}

          {advice?.pesticide && (
            <View style={styles.adviceBlock}>
              <Text style={[styles.adviceTitle, { color: colors.text }]}>🧪 Pesticide Control</Text>
              <Text style={[styles.adviceText, { color: colors.muted }]}>{advice.pesticide}</Text>
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}> 
      <ScrollView contentContainerStyle={[styles.container, { paddingHorizontal: width > 600 ? 40 : 20, backgroundColor: colors.bg }]}> 
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[styles.title, { fontSize: width > 420 ? 28 : 22, color: colors.text }]}>🌿 Smart Farming Assistant</Text>
          <Pressable onPress={() => setTheme(isDark ? 'light' : 'dark')} style={({ pressed }) => [{ padding: 8, borderRadius: 8, opacity: pressed ? 0.7 : 1 }] }>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={22} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Enter city name"
            placeholderTextColor={colors.muted}
            style={[styles.input, { backgroundColor: isDark ? '#071827' : '#fff', color: colors.text }]}
            value={city}
            onChangeText={setCity}
          />

          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={fetchWeatherForCity} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="search" size={16} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Check City Weather</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.ghostButton} onPress={fetchCurrentLocationWeather} disabled={loading}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="refresh" size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.ghostButtonText, { color: colors.primary }]}>Refresh Current Location</Text>
          </View>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#2e86de" style={{ marginTop: 12 }} />}

        {errorMessage !== '' && (
          <Text style={[styles.errorText, { color: '#ff6b6b' }]}>{errorMessage}</Text>
        )}

        {currentWeather && renderWeatherBlock('current', `📍 Current Location`, currentWeather, locationAdvice)}
        {cityWeather && renderWeatherBlock('city', `🏙️ ${cityWeather.name}`, cityWeather, cityAdvice)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20, paddingTop: Platform.OS === 'android' ? 24 : 40, backgroundColor: '#fff' },
  title: { fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  inputContainer: { marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff'
  },
  primaryButton: {
    backgroundColor: '#2e86de',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  ghostButton: { paddingVertical: 10, alignItems: 'center', marginBottom: 10 },
  ghostButtonText: { color: '#2e86de', fontWeight: '600' },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  smallText: { color: '#666', fontSize: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  infoText: { fontSize: 14, color: '#333' },
  expandedArea: { marginTop: 10 },
  sectionTitle: { fontWeight: '700' },
  adviceBlock: { marginTop: 12 },
  adviceTitle: { fontWeight: 'bold', color: '#2c3e50' },
  adviceText: { marginTop: 5, fontStyle: 'italic' },
  errorText: { color: 'red', marginTop: 10 },
});
