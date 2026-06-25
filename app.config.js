export default {
  expo: {
    name: "FarmingAssistant",
    slug: "farming-assistant",
    version: "1.0.0",
    platforms: ["android", "ios", "web"],
    web: {
      bundler: "metro"
    },
    extra: {
      WEATHER_API_KEY: process.env.WEATHER_API_KEY,
    },
  },
};
