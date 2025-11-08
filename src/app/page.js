'use client';

import { useState } from 'react';
import TravelForm from '@/components/TravelForm';
import ItineraryDisplay from '@/components/ItineraryDisplay';

export default function Home() {
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateItinerary = async (formData) => {
    setLoading(true);
    setError(null);
    setItinerary(null);

    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setItinerary(result.data);
      } else {
        setError(result.error || 'Failed to generate itinerary');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            ✈️ AI TravelMate
          </h1>
          <p className="text-xl text-gray-600">
            Your intelligent travel planning assistant
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <TravelForm onSubmit={handleGenerateItinerary} loading={loading} />

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
              {error}
            </div>
          )}

          {loading && (
            <div className="mt-8 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Creating your perfect itinerary...</p>
            </div>
          )}

          {itinerary && (
            <div className="mt-8">
              <ItineraryDisplay data={itinerary} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
