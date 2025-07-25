import { tool } from 'ai';
import { z } from 'zod';

export const getWeather = tool({
  description: 'Get the current weather at a location',
  parameters: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  execute: async ({ latitude, longitude }) => {
    // guard for exception from the Open Meteo API
    // execution must be returned as an error
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
      );
      const weatherData = await response.json();
      return weatherData;
    } catch (error) {
      return {
        error: true,
        reason: (error as any).toString(),
      };
    }
  },
});
