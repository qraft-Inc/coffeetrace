import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

/**
 * GET /api/weather/forecast
 * Fetch weather forecast from OpenWeather API
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const location = searchParams.get('location'); // district name

    if (!lat && !lon && !location) {
      return NextResponse.json(
        { error: 'Location coordinates or name required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      // Return mock data if no API key
      return NextResponse.json({
        forecast: getMockForecast(),
        source: 'mock',
      });
    }

    let weatherUrl;
    if (lat && lon) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    } else {
      weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location},RW&appid=${apiKey}&units=metric`;
    }

    const response = await fetch(weatherUrl);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch weather data');
    }

    // Process and format the forecast data
    const forecast = processForecastData(data);

    return NextResponse.json({ forecast, source: 'openweather' });
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    
    // Return mock data as fallback
    return NextResponse.json({
      forecast: getMockForecast(),
      source: 'mock',
      error: error.message,
    });
  }
}

function processForecastData(data) {
  const dailyForecasts = {};

  // Group by date and calculate daily stats
  data.list.forEach(item => {
    const date = new Date(item.dt * 1000).toISOString().split('T')[0];
    
    if (!dailyForecasts[date]) {
      dailyForecasts[date] = {
        date,
        temps: [],
        humidity: [],
        rainfall: 0,
        conditions: [],
        windSpeed: [],
      };
    }

    dailyForecasts[date].temps.push(item.main.temp);
    dailyForecasts[date].humidity.push(item.main.humidity);
    dailyForecasts[date].windSpeed.push(item.wind.speed);
    dailyForecasts[date].conditions.push(item.weather[0].main);
    
    if (item.rain && item.rain['3h']) {
      dailyForecasts[date].rainfall += item.rain['3h'];
    }
  });

  // Calculate daily averages and format
  return Object.values(dailyForecasts).slice(0, 7).map(day => ({
    date: day.date,
    tempMin: Math.min(...day.temps),
    tempMax: Math.max(...day.temps),
    tempAvg: day.temps.reduce((a, b) => a + b, 0) / day.temps.length,
    humidity: day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length,
    rainfall: day.rainfall,
    windSpeed: day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length,
    condition: getMostFrequent(day.conditions),
    risks: assessWeatherRisks(day),
  }));
}

function getMostFrequent(arr) {
  return arr.sort((a, b) =>
    arr.filter(v => v === a).length - arr.filter(v => v === b).length
  ).pop();
}

function assessWeatherRisks(day) {
  const risks = [];
  
  const avgTemp = day.temps.reduce((a, b) => a + b, 0) / day.temps.length;
  const avgHumidity = day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length;
  
  if (day.rainfall > 50) {
    risks.push({ type: 'heavy_rain', severity: 'high', message: 'Heavy rainfall expected - delay harvesting' });
  } else if (day.rainfall > 20) {
    risks.push({ type: 'moderate_rain', severity: 'medium', message: 'Moderate rain - monitor drying process' });
  }
  
  if (avgTemp > 35) {
    risks.push({ type: 'extreme_heat', severity: 'high', message: 'Extreme heat - provide shade, increase watering' });
  } else if (avgTemp < 10) {
    risks.push({ type: 'cold_stress', severity: 'medium', message: 'Cold weather - protect young plants' });
  }
  
  if (avgHumidity > 85 && avgTemp > 20) {
    risks.push({ type: 'disease_risk', severity: 'high', message: 'High disease risk - monitor for fungal infections' });
  }
  
  if (day.rainfall === 0 && avgTemp > 30) {
    risks.push({ type: 'drought_stress', severity: 'medium', message: 'Hot and dry - ensure adequate irrigation' });
  }

  return risks;
}

function getMockForecast() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    return {
      date: date.toISOString().split('T')[0],
      tempMin: 15 + Math.random() * 5,
      tempMax: 25 + Math.random() * 5,
      tempAvg: 20 + Math.random() * 5,
      humidity: 60 + Math.random() * 20,
      rainfall: Math.random() * 20,
      windSpeed: 5 + Math.random() * 10,
      condition: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
      risks: [],
    };
  });
}
