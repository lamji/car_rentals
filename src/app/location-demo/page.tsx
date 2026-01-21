"use client";

import ReduxLocationSelector from "@/components/ReduxLocationSelector";

export default function LocationDemoPage() {
  const handleLocationSelect = (location: any) => {
    console.log("Selected location:", location);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          PSGC Location Selector Demo
        </h1>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Redux-Powered Philippine Location Search
            </h2>
            <p className="text-gray-600 mb-6">
              This demo uses Redux to cache all regions on first render, then filters them client-side for instant autocomplete.
              Other levels (provinces, cities, barangays) are fetched from the API as needed.
            </p>
            
            <ReduxLocationSelector onLocationSelect={handleLocationSelect} />
          </div>
          
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Features:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Regions are fetched once and cached in Redux store</li>
              <li>Client-side filtering for instant region autocomplete</li>
              <li>Cascading search: Region → Province → City → Barangay</li>
              <li>API calls only for non-region data</li>
              <li>24-hour cache for regions data</li>
              <li>Error handling and loading states</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
