import type { Car } from "@/lib/types";

export const CARS: Car[] = [
  {
    id: 'vios-2021',
    name: 'Toyota Vios',
    type: 'Sedan',
    image: '/images/toyota-vios-2021.jpg',
    imageUrls: [
      "https://res.cloudinary.com/dlax3esau/image/upload/v1768988167/sedan_tt05j8.png",
      "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1493238793685-419bd7346ff3?q=80&w=800&auto=format&fit=crop"
    ],
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Gasoline',
    year: 2021,
    pricePerDay: 45,
    pricePer12Hours: 30,
    pricePer24Hours: 45,
    pricePerHour: 3,
    deliveryFee: 15,
    owner: {
      name: 'Juan Santos',
      contactNumber: '+639123456789'
    },
    unavailableDates: [],
    garageAddress: "Cebu City, Philippines",
    garageLocation: {
      address: "Cebu City, Philippines",
      city: "Cebu City",
      province: "Cebu",
      coordinates: {
        lat: 14.5547,
        lng: 121.0244
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
    type: "van",
    image: "/images/toyota-innova-2021.jpg",
    imageUrls: [
      "https://res.cloudinary.com/dlax3esau/image/upload/v1768988167/van_vpcb4o.png",
      "https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583121274602-7567941206b5?q=80&w=800&auto=format&fit=crop"
    ],
    seats: 7,
    transmission: "automatic",
    fuel: "Diesel",
    year: 2021,
    pricePerDay: 65.00,
    pricePer12Hours: 45.00,
    pricePer24Hours: 65.00,
    pricePerHour: 4.50,
    deliveryFee: 20,
    owner: {
      name: "Maria Reyes",
      contactNumber: "+63-918-234-5678"
    },
    unavailableDates: [],
    garageAddress: "Cebu City, Philippines",
    garageLocation: {
      address: "Cebu City, Philippines",
      city: "Cebu City",
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
    type: "suv",
    image: "/images/toyota-fortuner-2020.jpg",
    imageUrls: [
      "https://res.cloudinary.com/dlax3esau/image/upload/v1768988167/suv_f87ihm.png",
      "https://images.unsplash.com/photo-1549399836-b3164316c851?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617654112369-ae0c058be276?q=80&w=800&auto=format&fit=crop"
    ],
    fuel: "Diesel",
    year: 2020,
    pricePerDay: 85.00,
    pricePer12Hours: 55.00,
    pricePer24Hours: 85.00,
    pricePerHour: 5.50,
    seats: 7,
    transmission: "automatic",
    deliveryFee: 25,
    garageAddress: "123 Mactan Avenue, Lapu-Lapu City, Cebu, Philippines",
    garageLocation: {
      address: "123 Mactan Avenue, Lapu-Lapu City, Cebu, Philippines",
      city: "Lapu-Lapu City",
      province: "Cebu",
      coordinates: {
        lat: 10.3128,
        lng: 123.9456
      }
    },
    owner: {
      name: "Carlos Mendoza",
      contactNumber: "+63-919-345-6789"
    },
    unavailableDates: [],
    rentedCount: 94,
    rating: 4.5,
    selfDrive: true,
    availability: {
      isAvailableToday: true,
      unavailableDates: ["2026-01-18", "2026-01-19", "2026-01-22", "2026-01-23", "2026-01-24"]
    },
  },
  {
    id: "civic-2022",
    name: "Honda Civic",
    type: "Sedan",
    image: "/images/honda-civic-2022.jpg",
    imageUrls: [
      "https://res.cloudinary.com/dlax3esau/image/upload/v1768988167/sedan_tt05j8.png",
      "https://images.unsplash.com/photo-1583121274602-7567941206b5?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617654112369-ae0c058be276?q=80&w=800&auto=format&fit=crop"
    ],
    fuel: "Gasoline",
    year: 2022,
    pricePerDay: 55.00,
    pricePer12Hours: 40.00,
    pricePer24Hours: 55.00,
    pricePerHour: 4.00,
    seats: 5,
    transmission: "manual",
    deliveryFee: 20,
    owner: {
      name: "Ana Lopez",
      contactNumber: "+63-920-456-7890"
    },
    unavailableDates: [],
    garageAddress: "Cebu City, Philippines",
    garageLocation: {
      address: "Cebu City, Philippines",
      city: "Cebu City",
      province: "Cebu",
      coordinates: {
        lat: 14.5804,
        lng: 121.0362
      }
    },
    rentedCount: 67,
    rating: 4.9,
    selfDrive: false,
    availability: {
      isAvailableToday: true,
      unavailableDates: ["2026-01-17", "2026-01-21", "2026-01-26", "2026-01-27", "2026-01-28"]
    },
  },
  {
    id: "m3-2023",
    name: "BMW M3",
    type: "Sports Car",
    image: "/images/bmw-m3-2023.jpg",
    imageUrls: [
      "https://res.cloudinary.com/dlax3esau/image/upload/v1768988167/sedan_tt05j8.png",
      "https://images.unsplash.com/photo-1583121274602-7567941206b5?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617654112369-ae0c058be276?q=80&w=800&auto=format&fit=crop"
    ],
    fuel: "Gasoline",
    year: 2023,
    pricePerDay: 75.00,
    pricePer12Hours: 50.00,
    pricePer24Hours: 75.00,
    pricePerHour: 5.00,
    seats: 5,
    transmission: "automatic",
    deliveryFee: 30,
    owner: {
      name: "Roberto Chen",
      contactNumber: "+63-917-890-1234"
    },
    unavailableDates: [],
    garageAddress: "Cebu City, Philippines",
    garageLocation: {
      address: "Cebu City, Philippines",
      city: "Cebu City",
      province: "Cebu",
      coordinates: {
        lat: 10.3157,
        lng: 123.8854
      }
    },
    rentedCount: 45,
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
    type: "Pickup Truck",
    image: "/images/ford-ranger-2022.jpg",
    imageUrls: [
      "https://res.cloudinary.com/dlax3esau/image/upload/v1768988167/suv_f87ihm.png",
      "https://images.unsplash.com/photo-1549399836-b3164316c851?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617654112369-ae0c058be276?q=80&w=800&auto=format&fit=crop"
    ],
    seats: 5,
    transmission: "manual",
    fuel: "Diesel",
    year: 2022,
    pricePerDay: 95.00,
    pricePer12Hours: 65.00,
    pricePer24Hours: 95.00,
    pricePerHour: 6.00,
    deliveryFee: 25,
    owner: {
      name: "David Cruz",
      contactNumber: "+63-918-567-8901"
    },
    unavailableDates: [],
    garageAddress: "Cebu City, Philippines",
    garageLocation: {
      address: "Cebu City, Philippines",
      city: "Cebu City",
      province: "Cebu",
      coordinates: {
        lat: 14.5547,
        lng: 121.0244
      }
    },
    rentedCount: 78,
    rating: 4.7,
    selfDrive: true,
    availability: {
      isAvailableToday: true,
      unavailableDates: ["2026-01-20", "2026-01-21", "2026-01-22", "2026-01-23"]
    },
  }
];
