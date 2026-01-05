export interface Address {
  id: number;
  firstName: string;
  lastName: string;
  companyName?: string;
  nip?: string;
  street: string;
  houseNumber: string;
  apartmentNumber?: string;
  city: string;
  zipCode: string;
  country: string;
  phone: string;
  addressType: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

export interface CreateAddressDto {
  firstName: string;
  lastName: string;
  companyName?: string;
  nip?: string;
  street: string;
  houseNumber: string;
  apartmentNumber?: string;
  city: string;
  zipCode: string;
  country: string;
  phone: string;
  addressType: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}
