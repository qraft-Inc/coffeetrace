'use client';

import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

export default function WeatherDashboard({ location }) {
  const [forecast, setForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    fetchWeatherData();
  }, [location]);

  const fetchWeatherData = async () => {
    try {
      const params = new URLSearchParams();
      if (location?.coordinates) {
        params.append('lat', location.coordinates[1]);
        params.append('lon', location.coordinates[0]);
      } else if (location?.district) {
        params.append('location', location.district);
      }

      const [forecastRes, alertsRes] = await Promise.all([
        fetch(`/api/weather/forecast?${params}`),
        fetch(`/api/weather/alerts?${params}`),
      ]);

      const forecastData = await forecastRes.json();
      const alertsData = await alertsRes.json();

      if (forecastRes.ok) {
        setForecast(forecastData.forecast || []);
      }

      if (alertsRes.ok) {
        setAlerts(alertsData.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      Clear: <Sun className="w-8 h-8 text-yellow-500" />,
      Clouds: <Cloud className="w-8 h-8 text-gray-500" />,
      Rain: <CloudRain className="w-8 h-8 text-blue-500" />,
      Drizzle: <CloudRain className="w-8 h-8 text-blue-400" />,
    };
    return icons[condition] || <Cloud className="w-8 h-8 text-gray-400" />;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800 border-blue-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      critical: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Weather Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
            Active Weather Alerts ({alerts.length})
          </h3>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert._id}
                className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-sm">{alert.title}</h4>
                    <p className="text-sm mt-1">{alert.description}</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded font-medium bg-white">
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                {alert.recommendations && alert.recommendations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-current opacity-50">
                    <p className="text-xs font-medium mb-1">Recommendations:</p>
                    <ul className="text-xs space-y-1">
                      {alert.recommendations.map((rec, idx) => (
                        <li key={idx}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-xs mt-2 opacity-75">
                  Valid until: {new Date(alert.validUntil).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7-Day Forecast */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Cloud className="w-5 h-5 mr-2 text-blue-600" />
          7-Day Weather Forecast
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {forecast.map((day, index) => (
            <div
              key={day.date}
              onClick={() => setSelectedDay(day)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedDay?.date === day.date
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-2">
                  {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <div className="flex justify-center mb-2">
                  {getWeatherIcon(day.condition)}
                </div>
                <p className="text-sm font-semibold mb-1">{day.condition}</p>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <span className="text-blue-600 flex items-center">
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                    {Math.round(day.tempMin)}°
                  </span>
                  <span className="text-red-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    {Math.round(day.tempMax)}°
                  </span>
                </div>
                {day.rainfall > 0 && (
                  <div className="flex items-center justify-center mt-1 text-xs text-blue-600">
                    <Droplets className="w-3 h-3 mr-1" />
                    {Math.round(day.rainfall)}mm
                  </div>
                )}
                {day.risks && day.risks.length > 0 && (
                  <div className="mt-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mx-auto" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Day View */}
      {selectedDay && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Detailed Forecast - {new Date(selectedDay.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Sun className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm text-gray-700">Temperature</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {Math.round(selectedDay.tempAvg)}°C
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {Math.round(selectedDay.tempMin)}° - {Math.round(selectedDay.tempMax)}°
              </p>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Droplets className="w-5 h-5 text-cyan-600 mr-2" />
                <span className="text-sm text-gray-700">Humidity</span>
              </div>
              <p className="text-2xl font-bold text-cyan-900">
                {Math.round(selectedDay.humidity)}%
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CloudRain className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm text-gray-700">Rainfall</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {Math.round(selectedDay.rainfall)}mm
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Wind className="w-5 h-5 text-gray-600 mr-2" />
                <span className="text-sm text-gray-700">Wind Speed</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(selectedDay.windSpeed)} km/h
              </p>
            </div>
          </div>

          {/* Weather Risks */}
          {selectedDay.risks && selectedDay.risks.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                Weather Risks & Recommendations
              </h4>
              <div className="space-y-2">
                {selectedDay.risks.map((risk, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border-l-4 ${getSeverityColor(risk.severity)}`}
                  >
                    <p className="text-sm font-medium">{risk.type.replace(/_/g, ' ').toUpperCase()}</p>
                    <p className="text-sm mt-1">{risk.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Farming Recommendations */}
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">Farming Activities Recommendations</h4>
            <ul className="text-sm text-green-800 space-y-1">
              {selectedDay.rainfall > 20 ? (
                <>
                  <li>• Postpone harvesting - wet cherries reduce quality</li>
                  <li>• Ensure proper drainage around coffee plants</li>
                  <li>• Delay drying activities until weather clears</li>
                </>
              ) : selectedDay.rainfall === 0 && selectedDay.tempMax > 30 ? (
                <>
                  <li>• Good day for sun drying parchment coffee</li>
                  <li>• Ensure adequate irrigation for young plants</li>
                  <li>• Monitor soil moisture levels closely</li>
                </>
              ) : (
                <>
                  <li>• Good conditions for harvesting ripe cherries</li>
                  <li>• Suitable for wet processing activities</li>
                  <li>• Monitor drying coffee for optimal moisture content</li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
