import { Car } from './types';

/**
 * Simple Local RAG Engine for Car Rentals
 * "No DB" approach: Performs in-memory scoring of the car list against the user's query.
 */

// Keyword mappings for better semantic understanding without embeddings
const SYNONYMS: Record<string, string[]> = {
  'suv': ['suv', 'adventure', 'cross', 'fortuner', 'montero', 'everest', 'sport', 'big'],
  'sedan': ['sedan', 'vios', 'mirage', 'city', 'accent', 'small', 'family', '4 seater'],
  'van': ['van', 'hiace', 'grandia', 'urvan', 'family', 'big group', '10 seater', '12 seater'],
  'pickup': ['pickup', 'hilux', 'strada', 'ranger', 'navara', 'truck'],
  'cheap': ['cheap', 'budget', 'low price', 'affordable', 'economy'],
  'luxury': ['luxury', 'premium', 'high end', 'expensive'],
  'automatic': ['automatic', 'auto', 'at'],
  'manual': ['manual', 'stick', 'mt'],
};

interface ScoredCar {
  car: Car;
  score: number;
  matchReasons: string[];
}

/**
 * Retrieve relevant cars based on natural language query
 */
export function retrieveRelevantCars(query: string, allCars: Car[], limit: number = 5): Car[] {
  const normalizedQuery = query.toLowerCase();
  
  // If query is too generic, return top rated/popular cars
  if (isGenericQuery(normalizedQuery)) {
    return allCars
      .sort((a, b) => (b.rentedCount || 0) * 0.7 + (b.rating || 0) * 0.3 - ((a.rentedCount || 0) * 0.7 + (a.rating || 0) * 0.3)) // Simple popularity sort
      .slice(0, limit);
  }

  const scoredCars: ScoredCar[] = allCars.map(car => {
    let score = 0;
    const reasons: string[] = [];
    const carString = `${car.name} ${car.type} ${car.transmission} ${car.fuel}`.toLowerCase();

    // 1. Exact Name/Model Match (High Weight)
    // Split query into words and check if car name contains them
    const queryWords = normalizedQuery.split(/\s+/);
    queryWords.forEach(word => {
      if (word.length > 2 && car.name.toLowerCase().includes(word)) {
        score += 10;
        reasons.push(`matches "${word}"`);
      }
    });

    // 2. Type Match (semantic)
    for (const [type, keywords] of Object.entries(SYNONYMS)) {
      if (keywords.some(k => normalizedQuery.includes(k))) {
        // User is asking for this type
        if (car.type.toLowerCase() === type || carString.includes(type)) {
          score += 15;
          reasons.push(`matches type "${type}"`);
        }
      }
    }

    // 3. Transmission Match
    if (normalizedQuery.includes('manual') && car.transmission.toLowerCase() === 'manual') score += 10;
    if (normalizedQuery.includes('auto') && car.transmission.toLowerCase() === 'automatic') score += 10;

    // 4. Capacity Match
    if (normalizedQuery.includes('seater')) {
      const match = normalizedQuery.match(/(\d+)\s*seater/);
      if (match) {
        const reqSeats = parseInt(match[1]);
        if (car.seats >= reqSeats) {
          score += 8;
          reasons.push(`fits ${reqSeats} people`);
        }
      }
    }

    // 5. Availability Bonus (Slight boost for available cars)
    if (car.availability?.isAvailableToday) {
      score += 1;
    }

    return { car, score, matchReasons: reasons };
  });

  // Filter out zero scores if specific criteria were requested, unless everything is zero
  const nonZeroMatches = scoredCars.filter(s => s.score > 0);
  const candidates = nonZeroMatches.length > 0 ? nonZeroMatches : scoredCars;

  // Sort by Score DESC, then Rating DESC
  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b.car.rating || 0) - (a.car.rating || 0);
  });

  return candidates.slice(0, limit).map(s => s.car);
}

function isGenericQuery(query: string): boolean {
  const genericTerms = ['cars', 'available', 'show me', 'list', 'options', 'rent'];
  const specificTerms = Object.values(SYNONYMS).flat();
  
  // If query only contains generic terms and no specific car terms
  const hasSpecific = specificTerms.some(term => query.includes(term));
  return !hasSpecific && query.length < 20; // heuristic
}
