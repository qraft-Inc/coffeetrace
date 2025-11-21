'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Video, Headphones, FileText, Award, Clock, TrendingUp, CheckCircle } from 'lucide-react';

export default function TrainingHub({ language = 'en' }) {
  const [content, setContent] = useState([]);
  const [progress, setProgress] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: 'all', type: 'all' });
  const [selectedContent, setSelectedContent] = useState(null);

  useEffect(() => {
    fetchData();
  }, [filter, language]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams({ language });
      if (filter.category !== 'all') params.append('category', filter.category);
      if (filter.type !== 'all') params.append('type', filter.type);

      const [contentRes, progressRes] = await Promise.all([
        fetch(`/api/training/content?${params}`),
        fetch('/api/training/progress'),
      ]);

      if (contentRes.ok) {
        const contentData = await contentRes.json();
        setContent(contentData.content || []);
      }

      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setProgress(progressData.progress || []);
        setStats(progressData.stats);
      }
    } catch (error) {
      console.error('Error fetching training data:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All Topics' },
    { value: 'agronomy', label: 'Agronomy' },
    { value: 'pest_management', label: 'Pest Management' },
    { value: 'soil_health', label: 'Soil Health' },
    { value: 'harvesting', label: 'Harvesting' },
    { value: 'post_harvest', label: 'Post-Harvest' },
    { value: 'quality_control', label: 'Quality Control' },
    { value: 'climate_adaptation', label: 'Climate Adaptation' },
    { value: 'business_skills', label: 'Business Skills' },
  ];

  const contentTypes = [
    { value: 'all', label: 'All Types', icon: BookOpen },
    { value: 'video', label: 'Videos', icon: Video },
    { value: 'audio', label: 'Audio', icon: Headphones },
    { value: 'article', label: 'Articles', icon: FileText },
  ];

  const getContentIcon = (type) => {
    const Icon = contentTypes.find(t => t.value === type)?.icon || BookOpen;
    return <Icon className="w-5 h-5" />;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getProgressForContent = (contentId) => {
    return progress.find(p => p.contentId._id === contentId);
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
      {/* Stats Dashboard */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-4">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm text-gray-700">Completion Rate</span>
            </div>
            <p className="text-3xl font-bold text-green-900">{stats.completionRate}%</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-4">
            <div className="flex items-center mb-2">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm text-gray-700">Completed</span>
            </div>
            <p className="text-3xl font-bold text-blue-900">{stats.completed}</p>
            <p className="text-xs text-gray-600">of {stats.total}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-4">
            <div className="flex items-center mb-2">
              <BookOpen className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-sm text-gray-700">In Progress</span>
            </div>
            <p className="text-3xl font-bold text-purple-900">{stats.inProgress}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow p-4">
            <div className="flex items-center mb-2">
              <Clock className="w-5 h-5 text-orange-600 mr-2" />
              <span className="text-sm text-gray-700">Time Spent</span>
            </div>
            <p className="text-3xl font-bold text-orange-900">
              {Math.round(stats.totalTime / 60)}
            </p>
            <p className="text-xs text-gray-600">minutes</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setFilter({ ...filter, category: cat.value })}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter.category === cat.value
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
          <div className="flex flex-wrap gap-2">
            {contentTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setFilter({ ...filter, type: type.value })}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                  filter.type === type.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <type.icon className="w-4 h-4 mr-2" />
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No training content found
          </div>
        ) : (
          content.map((item) => {
            const itemProgress = getProgressForContent(item._id);
            
            return (
              <div
                key={item._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                onClick={() => setSelectedContent(item)}
              >
                {/* Thumbnail */}
                {item.media?.[0]?.thumbnail && (
                  <img
                    src={item.media[0].thumbnail}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                )}

                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center text-gray-600">
                      {getContentIcon(item.contentType)}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded font-medium ${getDifficultyColor(item.difficulty)}`}>
                      {item.difficulty}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.title}
                  </h3>

                  {/* Meta */}
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{item.estimatedDuration} min</span>
                    <span className="mx-2">•</span>
                    <span className="capitalize">{item.category.replace(/_/g, ' ')}</span>
                  </div>

                  {/* Progress Bar */}
                  {itemProgress && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{itemProgress.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${itemProgress.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      {item.avgRating ? `${item.avgRating.toFixed(1)} ★` : 'Not rated'}
                    </div>
                    <span>{item.views} views</span>
                  </div>

                  {/* Status Badge */}
                  {itemProgress?.status === 'completed' && (
                    <div className="mt-3 flex items-center text-green-600 text-sm font-medium">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Completed
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
