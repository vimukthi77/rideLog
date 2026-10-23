export type UserRole = 'admin' | 'passenger' | 'driver';

export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  role: UserRole;
  department?: string;
  employeeId?: string;
  profileImage?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type FuelType = 'Petrol' | 'Diesel' | 'LNG';

export interface IVehicle {
  _id: string;
  vehicleRegNo: string;
  vehicleType: string;
  vehicleName: string;
  initialMeterReading: number;
  currentMeterReading: number;
  fuelType: FuelType;
  vehicleImage?: string;
  isActive: boolean;
  assignedDrivers?: IUser[] | string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IDriver {
  _id: string;
  userId: IUser | string;
  licenseNumber?: string;
  licenseExpiry?: string;
  assignedVehicles?: IVehicle[] | string[];
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type RideStatus = 'ongoing' | 'completed' | 'cancelled';

export interface IRide {
  _id: string;
  date: string;
  vehicle: IVehicle | string;
  driver: IUser | string;
  passenger: IUser | string;
  authorizingOfficer?: string;
  startTime: string;
  endTime?: string;
  startMileageKM: number;
  endMileageKM?: number;
  noOfKMDone?: number;
  placesVisited: string;
  tripPurpose?: string;
  status: RideStatus;
  driverSignature?: boolean;
  passengerSignature?: boolean;
  otHours?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  department?: string;
  employeeId?: string;
}
