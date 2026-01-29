export interface UserAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  address: UserAddress;
  dateJoined: string;
  profilePhoto?: string;
  isVerified: boolean;
}

export const mockUserData: UserData = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  mobileNumber: '+639123456789',
  address: {
    street: '123 Main Street',
    city: 'Manila',
    province: 'Metro Manila',
    postalCode: '1000',
    country: 'Philippines',
  },
  dateJoined: '2023-01-15',
  profilePhoto: undefined,
  isVerified: true,
};

export const createUserData = (overrides: Partial<UserData> = {}): UserData => {
  return {
    ...mockUserData,
    ...overrides,
    address: {
      ...mockUserData.address,
      ...overrides.address,
    },
  };
};
