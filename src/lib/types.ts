export type CarType = "sedan" | "suv" | "van";
export type Transmission = "automatic" | "manual";

export type GarageLocation = {
  address: string;
  city: string;
  province: string;
  coordinates: {
    lat: number;
    lng: number;
  };
};

export type Car = {
  id: string
  name: string
  type: string
  image: string
  imageUrls: string[]
  seats: number
  transmission: string
  fuel: string
  year: number
  pricePerDay: number
  pricePer12Hours: number
  pricePer24Hours: number
  pricePerHour: number
  deliveryFee: number
  owner: {
    name: string
    contactNumber: string
  }
  unavailableDates: string[];
  garageAddress: string;
  garageLocation: GarageLocation;
  rentedCount: number;
  rating: number;
  selfDrive: boolean;
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
