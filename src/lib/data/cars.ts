import type { Car } from "@/lib/types";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store";

export const useCarsFromRedux = () => {
  const allCars = useSelector((state: RootState) => state.data?.allCars);
  return Array.isArray(allCars) ? allCars : [];
};

// Fallback mock data for when API is unavailable
export const MOCK_CARS: Car[] = [
  {
    id: "camry-2023-mock",
    name: "Toyota Camry (Demo)",
    type: "sedan",
    image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=800",
    imageUrls: ["https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=800"],
    fuel: "gasoline",
    year: 2023,
    pricePerDay: 55,
    pricePer12Hours: 35,
    pricePer24Hours: 55,
    pricePerHour: 4,
    seats: 5,
    transmission: "automatic",
    deliveryFee: 20,
    driverCharge: 0,
    owner: {
      name: "Demo Owner",
      contactNumber: "+63-000-000-0000"
    },
    garageAddress: "Demo Address, City, Country",
    garageLocation: {
      address: "Demo Address, City, Country",
      city: "Demo City",
      province: "Demo Province",
      coordinates: {
        lat: 0,
        lng: 0
      }
    },
    rentedCount: 0,
    rating: 4.5,
    selfDrive: true,
    isOnHold: false,
    isActive: true,
    availability: {
      isAvailableToday: true,
      unavailableDates: []
    }
  }
];

export const CARS: Car[] = [];
