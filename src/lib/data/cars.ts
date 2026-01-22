import type { Car } from "@/lib/types";

export const CARS: Car[] = [
  {
    id: "vios-2022",
    name: "Toyota Vios",
    year: 2022,
    pricePerDay: 45.00,
    pricePer12Hours: 30.00,
    pricePer24Hours: 45.00,
    seats: 5,
    transmission: "automatic",
    type: "sedan",
    imageUrls: [
      "https://res.cloudinary.com/dlax3esau/image/upload/v1768988167/sedan_tt05j8.png",
      "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1493238793685-419bd7346ff3?q=80&w=800&auto=format&fit=crop"
    ],
    garageAddress: "Garage A, Makati City",
    garageLocation: {
      address: "123 Ayala Avenue, Makati City, Metro Manila",
      city: "Makati City",
      province: "Metro Manila",
      coordinates: {
        lat: 14.5605,
        lng: 121.0145
      }
    },
    rentedCount: 127,
    rating: 4.8,
    selfDrive: true,
    availability: {
      isAvailableToday: true,
      unavailableDates: ["2026-01-24", "2026-01-25", "2026-01-30", "2026-02-01"]
    },
  },
  {
    id: "innova-2021",
    name: "Toyota Innova",
    year: 2021,
    pricePerDay: 65.00,
    pricePer12Hours: 45.00,
    pricePer24Hours: 65.00,
    seats: 7,
    transmission: "automatic",
    type: "van",
    imageUrls: [
      "https://res.cloudinary.com/dlax3esau/image/upload/v1768988167/van_vpcb4o.png",
      "https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583121274602-7567941206b5?q=80&w=800&auto=format&fit=crop"
    ],
    garageAddress: "Garage B, Carmen, Cebu",
    garageLocation: {
      address: "National Highway, Carmen, Cebu",
      city: "Carmen",
      province: "Cebu",
      coordinates: {
        lat: 10.58142,
        lng: 124.01929
      }
    },
    rentedCount: 89,
    rating: 4.6,
    selfDrive: false,
    availability: {
      isAvailableToday: false,
      unavailableDates: ["2026-01-22", "2026-01-23", "2026-01-24", "2026-01-25", "2026-01-26"]
    },
  },
  {
    id: "fortuner-2020",
    name: "Toyota Fortuner",
    year: 2020,
    pricePerDay: 85.00,
    pricePer12Hours: 55.00,
    pricePer24Hours: 85.00,
    seats: 7,
    transmission: "automatic",
    type: "suv",
    imageUrls: [
      "https://res.cloudinary.com/dlax3esau/image/upload/v1768988167/suv_f87ihm.png",
      "https://images.unsplash.com/photo-1549399836-b3164316c851?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617654112369-ae0c058be276?q=80&w=800&auto=format&fit=crop"
    ],
    garageAddress: "Garage C, Pasig City",
    garageLocation: {
      address: "789 Ortigas Avenue, Pasig City, Metro Manila",
      city: "Pasig City",
      province: "Metro Manila",
      coordinates: {
        lat: 14.5764,
        lng: 121.0851
      }
    },
    rentedCount: 156,
    rating: 4.9,
    selfDrive: true,
    availability: {
      isAvailableToday: true,
      unavailableDates: ["2026-01-18", "2026-01-19", "2026-01-22", "2026-01-23", "2026-01-24"]
    },
  },
  {
    id: "civic-2022",
    name: "Honda Civic",
    year: 2022,
    pricePerDay: 70.00,
    pricePer12Hours: 48.00,
    pricePer24Hours: 70.00,
    seats: 5,
    transmission: "manual",
    type: "sedan",
    imageUrls: [
      "https://res.cloudinary.com/dlax3esau/image/upload/v1768988167/sedan_tt05j8.png",
      "https://images.unsplash.com/photo-1617654112369-ae0c058be276?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583121274602-7567941206b5?q=80&w=800&auto=format&fit=crop"
    ],
    garageAddress: "Garage D, Cebu City",
    garageLocation: {
      address: "456 Osmeña Boulevard, Cebu City, Philippines",
      city: "Cebu City",
      province: "Cebu",
      coordinates: {
        lat: 10.3157,
        lng: 123.8854
      }
    },
    rentedCount: 203,
    rating: 4.7,
    selfDrive: true,
    availability: {
      isAvailableToday: true,
      unavailableDates: ["2026-01-17", "2026-01-21", "2026-01-26", "2026-01-27", "2026-01-28"]
    },
  },
  {
    id: "m3-2023",
    name: "BMW M3",
    year: 2023,
    pricePerDay: 120.00,
    pricePer12Hours: 85.00,
    pricePer24Hours: 120.00,
    seats: 5,
    transmission: "automatic",
    type: "sedan",
    imageUrls: [
      "https://res.cloudinary.com/dlax3esau/image/upload/v1768988167/sedan_tt05j8.png",
      "https://images.unsplash.com/photo-1583121274602-7567941206b5?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617654112369-ae0c058be276?q=80&w=800&auto=format&fit=crop"
    ],
    garageAddress: "Garage E, Mandaluyong City",
    garageLocation: {
      address: "654 Shaw Boulevard, Mandaluyong City, Metro Manila",
      city: "Mandaluyong City",
      province: "Metro Manila",
      coordinates: {
        lat: 14.5794,
        lng: 121.0359
      }
    },
    rentedCount: 67,
    rating: 4.9,
    selfDrive: false,
    availability: {
      isAvailableToday: false,
      unavailableDates: ["2026-01-10", "2026-01-11", "2026-01-12", "2026-01-13", "2026-01-14", "2026-01-15", "2026-01-16", "2026-01-17"]
    },
  },
  {
    id: "ranger-2022",
    name: "Ford Ranger",
    year: 2022,
    pricePerDay: 95.00,
    pricePer12Hours: 65.00,
    pricePer24Hours: 95.00,
    seats: 5,
    transmission: "manual",
    type: "suv",
    imageUrls: [
      "https://res.cloudinary.com/dlax3esau/image/upload/v1768988167/suv_f87ihm.png",
      "https://images.unsplash.com/photo-1549399836-b3164316c851?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617654112369-ae0c058be276?q=80&w=800&auto=format&fit=crop"
    ],
    garageAddress: "Garage F, San Juan City",
    garageLocation: {
      address: "987 Greenhills Shopping Center, San Juan City, Metro Manila",
      city: "San Juan City",
      province: "Metro Manila",
      coordinates: {
        lat: 14.6042,
        lng: 121.0378
      }
    },
    rentedCount: 94,
    rating: 4.5,
    selfDrive: true,
    availability: {
      isAvailableToday: true,
      unavailableDates: ["2026-01-29", "2026-01-30", "2026-01-31", "2026-02-01", "2026-02-02"]
    },
  },
];
