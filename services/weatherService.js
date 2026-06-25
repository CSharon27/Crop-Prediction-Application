import axios from 'axios';

export async function getWeather(latitude, longitude, apiKey) {
  const url = `https://api.openweathermap.org/data/2.5/weather`;
  const response = await axios.get(url, {
    params: {
      lat: latitude,
      lon: longitude,
      appid: apiKey,
      units: 'metric',
    },
  });
  return response.data;
}

export async function getWeatherByCity(city, apiKey) {
  const url = `https://api.openweathermap.org/data/2.5/weather`;
  const response = await axios.get(url, {
    params: {
      q: city,
      appid: apiKey,
      units: 'metric',
    },
  });
  return response.data;
}
