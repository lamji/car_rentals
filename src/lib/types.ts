export type CarType = "sedan" | "suv" | "van";
export type Transmission = "automatic" | "manual";

export type User = {
  id: string;
  name: string;
  email: string;
  photo?: string;
};

export type GarageLocation = {
  address?: string;
  city?: string;
  province?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
};

export type Car = {
  id: string;
  _id?: string;
  name: string
  type: string
  image: string
  imageUrls: string[]
  imagePublicIds?: string[]
  seats: number
  transmission: string
  fuel: string
  year: number
  distanceText?: string
  pricePerDay?: number
  pricePer12Hours: number
  pricePer24Hours: number
  pricePerHour: number
  deliveryFee: number
  driverCharge?: number; // Optional driver charge for cars with driver
  owner: {
    name: string
    contactNumber: string
    email?: string
    userId?: string
    notificationId?: string
  }
  garageAddress?: string;
  garageLocation: GarageLocation;
  rentedCount: number;
  rating: number;
  selfDrive: boolean;
  isOnHold: boolean;
  holdReason?: string;
  isActive: boolean;
  availability: {
    isAvailableToday: boolean;
    unavailableDates: string[]; // ISO yyyy-mm-dd dates when car is unavailable
  };
};

export type FulfillmentType = "pickup" | "delivery";

export type SearchState = {
  location: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string; // ISO yyyy-mm-dd
  carType?: CarType;
  user?: User;
};

export type FulfillmentState =
  | {
      type: "pickup";
    }
  | {
      type: "delivery";
      deliveryAddress: string;
    };

export type Booking = {
  reference: string;
  createdAt: string; // ISO
  carId: string;
  location: string;
  startDate: string;
  endDate: string;
  fulfillment: FulfillmentState;
  pricing: {
    days: number;
    pricePerDay: number;
    rentCost: number;
    deliveryFee: number;
    total: number;
  };
};
