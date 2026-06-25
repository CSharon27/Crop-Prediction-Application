// services/aiService.js

export function getPretrainedPlantingAdvice(weatherData) {
    if (!weatherData || !weatherData.weather || !weatherData.main) {
      return {
        planting: "No weather data available.",
        pesticide: "No pesticide recommendation available."
      };
    }
  
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
  
    // 🌱 Planting Suggestions (based on temperature)
    let plantingAdvice = "🌱 General planting advice.";
    if (temp < 10) {
      plantingAdvice = "🥶 Too cold — protect soil and consider greenhouses.";
    } else if (temp >= 10 && temp < 20) {
      plantingAdvice = "🌿 Ideal for cool-season crops: spinach 🥬, lettuce 🥗, and cabbage 🥬.";
    } else if (temp >= 20 && temp < 30) {
      plantingAdvice = "🔥 Hot-weather crops: eggplant 🍆, chili 🌶️, and amaranth 🌿.";
    } else if (temp >= 30 && temp < 36) {
      plantingAdvice = "🌞 Suitable for tomatoes 🍅, okra 🌶️, maize 🌽, and beans 🌱.";
    } else {
      plantingAdvice = "🥵 Too hot — choose drought-resistant crops like sorghum 🌾, millet 🌿, and aloe vera 🌵.";
    }
  
    // 🧪 Pesticide Measures (based on humidity in 10% intervals)
    let pesticideAdvice = "🧪 General pest monitoring recommended.";
    if (humidity >= 90) {
      pesticideAdvice = "🍄 Very high humidity — use Carbendazim 2g/liter 💧 to prevent rot.";
    } else if (humidity >= 80) {
      pesticideAdvice = "🦠 Fungal risk — apply Mancozeb 2.5g/liter 💧 weekly 🗓️.";
    } else if (humidity >= 70) {
      pesticideAdvice = "🐜 Aphid risk — use Neem oil 🌿 5ml/liter 💧 every 10 days 🗓️.";
    } else if (humidity >= 60) {
      pesticideAdvice = "🪰 Whitefly prevention — spray Imidacloprid 1ml/liter 💧 biweekly 📅.";
    } else if (humidity >= 50) {
      pesticideAdvice = "🕷️ Mite control — apply Abamectin 1.5ml/liter 💧 if symptoms show.";
    } else if (humidity >= 40) {
      pesticideAdvice = "🪲 Dry conditions — monitor for beetles, use organic insect traps.";
    } else {
      pesticideAdvice = "🌵 Very dry — inspect regularly and use minimal intervention methods.";
    }
  
    return {
      planting: plantingAdvice,
      pesticide: pesticideAdvice
    };
  }
  