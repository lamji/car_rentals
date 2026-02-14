import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface Coordinates {
  lat: number;
  lng: number;
}

interface DbCar {
  id?: string;
  _id?: string;
  name?: string;
  type?: string;
  year?: number;
  image?: string;
  imageUrls?: string[];
  seats?: number;
  transmission?: string;
  fuel?: string;
  pricePerDay?: number;
  pricePer12Hours?: number;
  pricePer24Hours?: number;
  pricePerHour?: number;
  selfDrive?: boolean;
  driverCharge?: number;
  deliveryFee?: number;
  garageAddress?: string;
  garageLocation?: {
    address?: string;
    city?: string;
    province?: string;
    coordinates?: { lat?: number; lng?: number };
  };
  owner?: {
    name?: string;
    contactNumber?: string;
  };
  rating?: number;
  rentedCount?: number;
  isOnHold?: boolean;
  availability?: {
    isAvailableToday?: boolean;
    unavailableDates?: Array<{
      startDate?: string;
      endDate?: string;
      startTime?: string;
      endTime?: string;
    }>;
  };
}

interface CarWithDistance extends DbCar {
  distance: number;
  distanceText: string;
  resolvedAddress?: string;
  resolvedCity?: string;
  resolvedProvince?: string;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface GeocodeResult {
  coords: Coordinates;
  placeName: string;
  relevance: number;
}

async function geocodeLocation(locationString: string): Promise<GeocodeResult | null> {
  try {
    // Step 1: Extract city/municipality from the location string for proximity bias.
    // Long address strings like "Cebu North Road Corazon, Catmon, Cebu" can confuse
    // Mapbox into matching a road in a different city. We first geocode the
    // city/province portion to get a proximity anchor point.
    const parts = locationString.split(',').map(p => p.trim());
    let proximity = '';
    if (parts.length >= 2) {
      // Use the last 2-3 parts as the city/province (e.g. "Catmon, Cebu, Philippines")
      const cityParts = parts.slice(-3).join(', ');
      const cityUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cityParts)}.json`;
      const cityParams = new URLSearchParams({
        access_token: MAPBOX_TOKEN,
        limit: '1',
        country: 'PH',
        types: 'place,locality',
      });
      const cityRes = await fetch(`${cityUrl}?${cityParams}`);
      if (cityRes.ok) {
        const cityData = await cityRes.json();
        if (cityData.features?.length > 0) {
          const [cLng, cLat] = cityData.features[0].center;
          proximity = `${cLng},${cLat}`;
        }
      }
    }

    // Step 2: Geocode the full location string with proximity bias
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationString)}.json`;
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      limit: '3',
      country: 'PH',
      types: 'place,locality,neighborhood,address',
    });
    if (proximity) {
      params.set('proximity', proximity);
    }

    const response = await fetch(`${url}?${params}`);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.features && data.features.length > 0) {
      // Prefer place/locality matches (municipalities) over address matches
      const placeMatch = data.features.find((f: { place_type?: string[] }) =>
        f.place_type?.includes('place') || f.place_type?.includes('locality')
      );
      const feature = placeMatch || data.features[0];
      const [lng, lat] = feature.center;
      return {
        coords: { lat, lng },
        placeName: feature.place_name || locationString,
        relevance: feature.relevance || 0,
      };
    }
    return null;
  } catch {
    return null;
  }
}

interface ReverseGeoResult {
  address: string;
  city: string;
  province: string;
}

async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeoResult | null> {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`;
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      types: 'address,place,locality,neighborhood',
      limit: '1',
      country: 'PH',
    });

    const response = await fetch(`${url}?${params}`);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.features || data.features.length === 0) return null;

    const feature = data.features[0];
    const placeName = feature.place_name || '';
    const context = feature.context || [];

    // Extract city and province from context
    let city = '';
    let province = '';
    for (const c of context) {
      const id = c.id || '';
      if (id.startsWith('place.')) city = c.text || '';
      if (id.startsWith('region.')) province = c.text || '';
    }

    return {
      address: placeName,
      city: city || feature.text || '',
      province,
    };
  } catch {
    return null;
  }
}

async function fetchAllCars(): Promise<DbCar[]> {
  try {
    const res = await fetch(`${API_URL}/api/cars?limit=100`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data || [];
  } catch {
    return [];
  }
}

function hasDateOverlap(unavailStart: string, unavailEnd: string, reqStart: string, reqEnd: string): boolean {
  return unavailStart <= reqEnd && unavailEnd >= reqStart;
}

function isCarAvailableForDates(car: DbCar, startDate?: string, endDate?: string): boolean {
  if (car.isOnHold) return false;
  const unavail = car.availability?.unavailableDates || [];

  if (!startDate || !endDate) {
    // No dates specified — check if car is available RIGHT NOW
    // Must match the same logic as isCarAvailableToday in validateBlockedDates.ts
    if (unavail.length === 0) return true;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentHour = now.getHours();

    return !unavail.some(d => {
      if (!d.startDate || !d.endDate) return false;
      const bStartDate = d.startDate;
      const bEndDate = d.endDate;
      const bStartHour = d.startTime ? parseInt(d.startTime.split(':')[0]) : 0;
      const bEndHour = d.endTime ? parseInt(d.endTime.split(':')[0]) : 23;

      // Check if today is within the booking date range
      if (bStartDate <= todayStr && bEndDate >= todayStr) {
        // If booking is for today only, check time overlap
        if (bStartDate === todayStr && bEndDate === todayStr) {
          return currentHour >= bStartHour && currentHour < bEndHour;
        }
        // Multi-day booking that includes today
        return true;
      }
      return false;
    });
  }

  return !unavail.some(d =>
    d.startDate && d.endDate && hasDateOverlap(d.startDate, d.endDate, startDate, endDate)
  );
}

function findNearbyCars(cars: DbCar[], coords: Coordinates, radiusKm: number = 25): CarWithDistance[] {
  return cars
    .filter(car => {
      const gCoords = car.garageLocation?.coordinates;
      if (!gCoords?.lat || !gCoords?.lng) return false;
      if (car.isOnHold) return false;
      return true;
    })
    .map(car => {
      const gCoords = car.garageLocation!.coordinates!;
      const dist = calculateDistance(coords.lat, coords.lng, gCoords.lat!, gCoords.lng!);
      const rounded = Math.round(dist * 10) / 10;

      return {
        ...car,
        distance: rounded,
        distanceText: rounded < 1 ? `${Math.round(rounded * 1000)}m away` : `${rounded} km away`,
      } as CarWithDistance;
    })
    .filter(car => car.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}

function formatNearbyCarsHtml(cars: CarWithDistance[], locationName: string, filterType?: string, startDate?: string, endDate?: string): string {
  let filtered = cars;
  if (filterType) {
    filtered = cars.filter(c => c.type?.toLowerCase() === filterType.toLowerCase());
  }

  // Check availability for each car against requested dates
  const carsWithAvail = filtered.map(car => ({
    ...car,
    availableForDates: isCarAvailableForDates(car, startDate, endDate),
  }));

  // Sort: available first, then by distance
  carsWithAvail.sort((a, b) => {
    if (a.availableForDates !== b.availableForDates) return a.availableForDates ? -1 : 1;
    return a.distance - b.distance;
  });

  const dateLabel = startDate && endDate
    ? ` for <strong>${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}</strong>`
    : '';

  if (carsWithAvail.length === 0) {
    return `<div style="text-align:center;padding:12px;">
      <p style="font-size:13px;color:#6b7280;">No cars found near <strong>${locationName}</strong>${filterType ? ` (type: ${filterType})` : ''}${dateLabel}</p>
      <p style="font-size:11px;color:#9ca3af;margin-top:4px;">Try a different location or remove filters.</p>
    </div>`;
  }

  const availCount = carsWithAvail.filter(c => c.availableForDates).length;

  const cards = carsWithAvail.slice(0, 10).map(car => {
    const carId = car.id || car._id || '';
    const imgUrl = car.imageUrls?.[0] || car.image || '';
    const price12 = car.pricePer12Hours?.toLocaleString() || '0';
    const price24 = car.pricePer24Hours?.toLocaleString() || '0';
    const available = car.availableForDates;
    const statusBadge = available
      ? '<span style="font-size:10px;padding:2px 8px;border-radius:99px;background:#d1fae5;color:#059669;font-weight:600;">Available</span>'
      : '<span style="font-size:10px;padding:2px 8px;border-radius:99px;background:#fee2e2;color:#dc2626;font-weight:600;">Unavailable</span>';

    return `<div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:8px;background:#fff;">
      ${imgUrl ? `<img src="${imgUrl}" alt="${car.name || 'Car'}" style="width:100%;height:110px;object-fit:cover;" />` : ''}
      <div style="padding:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <strong style="font-size:13px;color:#111827;">${car.name || 'Unknown'} ${car.year || ''}</strong>
          <span style="font-size:10px;padding:2px 8px;border-radius:99px;background:#dbeafe;color:#2563eb;font-weight:600;">${car.distanceText}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
          <span style="font-size:11px;color:#6b7280;">${car.type || ''} | ${car.seats || ''} seats | ${car.transmission || ''} | ${car.fuel || ''}</span>
          ${statusBadge}
        </div>
        <div style="font-size:11px;color:#374151;margin-bottom:4px;">
          <span style="font-weight:600;">P${price12}</span> /12hr | <span style="font-weight:600;">P${price24}</span> /24hr
        </div>
        <div style="font-size:10px;color:#6b7280;margin-bottom:8px;">${car.resolvedCity || car.garageLocation?.city || ''}${(car.resolvedProvince || car.garageLocation?.province) ? ', ' + (car.resolvedProvince || car.garageLocation?.province) : ''}</div>
        <a href="/cars/${carId}" style="display:block;text-align:center;padding:8px 0;background:#2563eb;color:#fff;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;cursor:pointer;">Book Now</a>
      </div>
    </div>`;
  }).join('');

  return `<div>
    <div style="font-size:12px;color:#6b7280;margin-bottom:8px;">Found <strong>${carsWithAvail.length}</strong> car${carsWithAvail.length > 1 ? 's' : ''} near <strong>${locationName}</strong>${filterType ? ` (${filterType})` : ''}${dateLabel} (<strong>${availCount}</strong> available)</div>
    ${cards}
  </div>`;
}

function formatDateLabel(dateStr: string): string {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { location, carType, startDate, endDate } = await request.json();

    if (!location) {
      return NextResponse.json(
        { success: false, message: 'Location is required' },
        { status: 400 }
      );
    }

    if (!MAPBOX_TOKEN) {
      return NextResponse.json(
        { success: false, message: 'Mapbox not configured' },
        { status: 500 }
      );
    }

    // Geocode the location string to coordinates
    const geoResult = await geocodeLocation(location);
    if (!geoResult) {
      return NextResponse.json({
        success: true,
        html: `<div style="text-align:center;padding:12px;">
          <p style="font-size:13px;color:#6b7280;">Could not find the location "<strong>${location}</strong>".</p>
          <p style="font-size:11px;color:#9ca3af;margin-top:4px;">Please try a more specific location (e.g. "Catmon, Cebu").</p>
        </div>`,
      });
    }

    const { coords, placeName, relevance } = geoResult;

    // If Mapbox returned a low-confidence match, ask user to be more specific
    if (relevance < 0.7) {
      return NextResponse.json({
        success: true,
        html: `<div style="text-align:center;padding:12px;">
          <p style="font-size:13px;color:#374151;">I found "<strong>${placeName}</strong>" but I'm not sure that's the right place.</p>
          <p style="font-size:12px;color:#6b7280;margin-top:6px;">Could you add the province or city? For example:</p>
          <p style="font-size:12px;color:#2563eb;margin-top:4px;"><strong>"${location}, Cebu"</strong> or <strong>"${location}, Bulacan"</strong></p>
        </div>`,
      });
    }

    // Fetch all cars from DB
    const allCars = await fetchAllCars();

    // Find nearby cars sorted by distance
    const nearbyCars = findNearbyCars(allCars, coords, 25);

    // Reverse-geocode each nearby car's garage coordinates to get accurate address
    const carsToShow = nearbyCars.slice(0, 10);
    await Promise.all(carsToShow.map(async (car) => {
      const gCoords = car.garageLocation?.coordinates;
      if (gCoords?.lat && gCoords?.lng) {
        const resolved = await reverseGeocode(gCoords.lat, gCoords.lng);
        if (resolved) {
          car.resolvedAddress = resolved.address;
          car.resolvedCity = resolved.city;
          car.resolvedProvince = resolved.province;
        }
      }
    }));

    // Format as HTML with Book Now buttons — use resolved placeName for display
    const html = formatNearbyCarsHtml(carsToShow, placeName, carType, startDate, endDate);

    // Return simplified car data for follow-up context
    const carsContext = carsToShow.map(car => ({
      id: car.id || car._id,
      name: car.name,
      type: car.type,
      year: car.year,
      seats: car.seats,
      transmission: car.transmission,
      fuel: car.fuel,
      pricePerDay: car.pricePerDay,
      pricePer12Hours: car.pricePer12Hours,
      pricePer24Hours: car.pricePer24Hours,
      pricePerHour: car.pricePerHour,
      selfDrive: car.selfDrive,
      driverCharge: car.driverCharge,
      deliveryFee: car.deliveryFee,
      rating: car.rating,
      rentedCount: car.rentedCount,
      distance: car.distance,
      distanceText: car.distanceText,
      garageAddress: car.resolvedAddress || car.garageLocation?.address || car.garageAddress,
      garageCity: car.resolvedCity || car.garageLocation?.city,
      garageProvince: car.resolvedProvince || car.garageLocation?.province,
      ownerName: car.owner?.name,
      ownerContact: car.owner?.contactNumber,
      isOnHold: car.isOnHold,
      isAvailableToday: car.availability?.isAvailableToday,
      unavailableDates: car.availability?.unavailableDates || [],
      availableForDates: isCarAvailableForDates(car, startDate, endDate),
      image: car.image,
      imageUrls: car.imageUrls,
    }));

    // Return raw car data so frontend can merge into Redux for /cars/[id] page
    const rawCars = carsToShow.map(car => {
      const { distance, distanceText, resolvedAddress, resolvedCity, resolvedProvince, ...rawCar } = car;
      return { ...rawCar, id: rawCar.id || rawCar._id };
    });

    return NextResponse.json({ success: true, html, carsContext, rawCars });
  } catch (error) {
    console.error('Nearby cars lookup error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to find nearby cars' },
      { status: 500 }
    );
  }
}
