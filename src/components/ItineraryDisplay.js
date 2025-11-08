'use client';

export default function ItineraryDisplay({ data }) {
  if (!data) return null;

  const { itinerary, hotels, tips } = data;

  return (
    <div className="space-y-8">
      {/* Hotels Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          🏨 Recommended Hotels
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {hotels?.map((hotel, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg text-gray-800">{hotel.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{hotel.location}</p>
              <p className="text-blue-600 font-medium mt-2">{hotel.priceRange}</p>
              <p className="text-sm text-gray-700 mt-2">{hotel.highlights}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Itinerary */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">📅 Your Itinerary</h2>
        {itinerary?.map((day) => (
          <div key={day.day} className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-blue-600 mb-4">Day {day.day}</h3>
            
            <div className="space-y-4">
              {/* Morning */}
              <div className="flex gap-4">
                <div className="text-2xl">🌅</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">Morning</h4>
                  <p className="text-gray-700">{day.morning?.activity}</p>
                  <p className="text-sm text-gray-500">{day.morning?.time} • {day.morning?.location}</p>
                </div>
              </div>

              {/* Lunch */}
              <div className="flex gap-4">
                <div className="text-2xl">🍽️</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">Lunch</h4>
                  <p className="text-gray-700">{day.lunch?.name}</p>
                  <p className="text-sm text-gray-500">{day.lunch?.cuisine} • {day.lunch?.location}</p>
                </div>
              </div>

              {/* Afternoon */}
              <div className="flex gap-4">
                <div className="text-2xl">☀️</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">Afternoon</h4>
                  <p className="text-gray-700">{day.afternoon?.activity}</p>
                  <p className="text-sm text-gray-500">{day.afternoon?.time} • {day.afternoon?.location}</p>
                </div>
              </div>

              {/* Dinner */}
              <div className="flex gap-4">
                <div className="text-2xl">🍷</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">Dinner</h4>
                  <p className="text-gray-700">{day.dinner?.name}</p>
                  <p className="text-sm text-gray-500">{day.dinner?.cuisine} • {day.dinner?.location}</p>
                </div>
              </div>

              {/* Evening */}
              <div className="flex gap-4">
                <div className="text-2xl">🌙</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">Evening</h4>
                  <p className="text-gray-700">{day.evening?.activity}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Travel Tips */}
      {tips && tips.length > 0 && (
        <div className="bg-blue-50 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            💡 Travel Tips
          </h2>
          <ul className="space-y-2">
            {tips.map((tip, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span className="text-gray-700">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
