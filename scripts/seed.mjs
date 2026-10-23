import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = "mongodb+srv://sahasdhanaviepc_db_user:wttimKAonOnbWtbV@sahasridecluster.f5gbtvt.mongodb.net/lakdhanavi_rides?retryWrites=true&w=majority&appName=sahasridecluster";

async function seed() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB successfully!');

  const db = mongoose.connection.db;

  // Clear existing collections
  console.log('Clearing old collections...');
  try {
    await db.collection('users').deleteMany({});
    await db.collection('vehicles').deleteMany({});
    await db.collection('drivers').deleteMany({});
    await db.collection('rides').deleteMany({});
  } catch (e) {
    console.log('Collections reset note:', e.message);
  }

  // 1. Create Admin
  const adminSalt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', adminSalt);
  const driverPassword = await bcrypt.hash('driver123', adminSalt);
  const passPassword = await bcrypt.hash('pass123', adminSalt);

  const adminUser = await db.collection('users').insertOne({
    fullName: 'System Administrator',
    email: 'admin@lakdhanavi.com',
    password: adminPassword,
    phone: '+94 77 123 4567',
    role: 'admin',
    department: 'Management',
    employeeId: 'LAK-001',
    profileImage: '',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log('Admin user created:', adminUser.insertedId);

  // 2. Create 3 Drivers
  const driver1Res = await db.collection('users').insertOne({
    fullName: 'Lakshan Perera',
    email: 'lakshan@lakdhanavi.com',
    password: driverPassword,
    phone: '+94 71 456 7890',
    role: 'driver',
    department: 'Transport',
    employeeId: 'DRV-101',
    profileImage: '',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const driver2Res = await db.collection('users').insertOne({
    fullName: 'Sunil Weerasinghe',
    email: 'sunil@lakdhanavi.com',
    password: driverPassword,
    phone: '+94 76 890 1234',
    role: 'driver',
    department: 'Transport',
    employeeId: 'DRV-102',
    profileImage: '',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const driver3Res = await db.collection('users').insertOne({
    fullName: 'Kusal Jayawardena',
    email: 'kusal@lakdhanavi.com',
    password: driverPassword,
    phone: '+94 70 345 6789',
    role: 'driver',
    department: 'Transport',
    employeeId: 'DRV-103',
    profileImage: '',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 3. Create 2 Sample Passengers
  const passenger1Res = await db.collection('users').insertOne({
    fullName: 'Gaveen Rathnayake',
    email: 'gaveen@lakdhanavi.com',
    password: passPassword,
    phone: '+94 77 987 6543',
    role: 'passenger',
    department: 'Civil Engineering',
    employeeId: 'ENG-201',
    profileImage: '',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const passenger2Res = await db.collection('users').insertOne({
    fullName: 'Asanka Fernando',
    email: 'asanka@lakdhanavi.com',
    password: passPassword,
    phone: '+94 78 654 3210',
    role: 'passenger',
    department: 'Electrical & Instrumentation',
    employeeId: 'ENG-202',
    profileImage: '',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 4. Create 3 Sample Vehicles
  const vehicle1Res = await db.collection('vehicles').insertOne({
    vehicleRegNo: '62-5845',
    vehicleType: 'Van',
    vehicleName: 'Toyota HiAce High Roof',
    initialMeterReading: 9178,
    currentMeterReading: 9380,
    fuelType: 'Diesel',
    vehicleImage: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop&q=60',
    isActive: true,
    assignedDrivers: [driver1Res.insertedId],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const vehicle2Res = await db.collection('vehicles').insertOne({
    vehicleRegNo: 'WP-CAD-4290',
    vehicleType: 'Pickup',
    vehicleName: 'Toyota Hilux Double Cab',
    initialMeterReading: 45200,
    currentMeterReading: 45650,
    fuelType: 'Diesel',
    vehicleImage: 'https://images.unsplash.com/photo-1551830820-330a71b99659?w=800&auto=format&fit=crop&q=60',
    isActive: true,
    assignedDrivers: [driver2Res.insertedId],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const vehicle3Res = await db.collection('vehicles').insertOne({
    vehicleRegNo: 'WP-CAR-7812',
    vehicleType: 'Car',
    vehicleName: 'Toyota Corolla Axio',
    initialMeterReading: 78500,
    currentMeterReading: 78940,
    fuelType: 'Petrol',
    vehicleImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=60',
    isActive: true,
    assignedDrivers: [driver3Res.insertedId],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 5. Create Driver Profiles
  await db.collection('drivers').insertMany([
    {
      userId: driver1Res.insertedId,
      licenseNumber: 'B-8472910',
      licenseExpiry: new Date('2028-12-31'),
      assignedVehicles: [vehicle1Res.insertedId],
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId: driver2Res.insertedId,
      licenseNumber: 'B-6391024',
      licenseExpiry: new Date('2027-08-15'),
      assignedVehicles: [vehicle2Res.insertedId],
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId: driver3Res.insertedId,
      licenseNumber: 'B-9201834',
      licenseExpiry: new Date('2029-05-20'),
      assignedVehicles: [vehicle3Res.insertedId],
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  // 6. Create 10 Sample Rides (Matching logbook records from reference prompt)
  const today = new Date();
  const makeDate = (daysAgo) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d;
  };

  const sampleRides = [
    {
      date: makeDate(0),
      vehicle: vehicle1Res.insertedId,
      driver: driver1Res.insertedId,
      passenger: passenger1Res.insertedId,
      authorizingOfficer: 'KN',
      startTime: '07:30',
      endTime: '12:30',
      startMileageKM: 9178,
      endMileageKM: 9196,
      noOfKMDone: 18,
      placesVisited: 'Kerawalapitiya Site to Kadawatha',
      tripPurpose: 'Site Equipment Procurement',
      status: 'completed',
      driverSignature: true,
      passengerSignature: true,
      otHours: 0,
      createdAt: makeDate(0),
      updatedAt: makeDate(0),
    },
    {
      date: makeDate(0),
      vehicle: vehicle1Res.insertedId,
      driver: driver1Res.insertedId,
      passenger: passenger2Res.insertedId,
      authorizingOfficer: 'HM',
      startTime: '09:30',
      endTime: '12:30',
      startMileageKM: 9196,
      endMileageKM: 9203,
      noOfKMDone: 7,
      placesVisited: 'Kerawalapitiya Site to Wattala CEB sub-office',
      tripPurpose: 'Transmission line document hand-over',
      status: 'completed',
      driverSignature: true,
      passengerSignature: true,
      otHours: 0,
      createdAt: makeDate(0),
      updatedAt: makeDate(0),
    },
    {
      date: makeDate(1),
      vehicle: vehicle1Res.insertedId,
      driver: driver1Res.insertedId,
      passenger: passenger1Res.insertedId,
      authorizingOfficer: 'KN',
      startTime: '13:30',
      endTime: '15:30',
      startMileageKM: 9203,
      endMileageKM: 9251,
      noOfKMDone: 48,
      placesVisited: 'Site to Colombo Head Office',
      tripPurpose: 'EPC Project Management Meeting',
      status: 'completed',
      driverSignature: true,
      passengerSignature: true,
      otHours: 1.5,
      createdAt: makeDate(1),
      updatedAt: makeDate(1),
    },
    {
      date: makeDate(2),
      vehicle: vehicle2Res.insertedId,
      driver: driver2Res.insertedId,
      passenger: passenger2Res.insertedId,
      authorizingOfficer: 'PR',
      startTime: '08:00',
      endTime: '11:15',
      startMileageKM: 45200,
      endMileageKM: 45310,
      noOfKMDone: 110,
      placesVisited: 'Kerawalapitiya to Kelaniya Warehouse & return',
      tripPurpose: 'Heavy transformer oil sample delivery',
      status: 'completed',
      driverSignature: true,
      passengerSignature: true,
      otHours: 0,
      createdAt: makeDate(2),
      updatedAt: makeDate(2),
    },
    {
      date: makeDate(3),
      vehicle: vehicle2Res.insertedId,
      driver: driver2Res.insertedId,
      passenger: passenger1Res.insertedId,
      authorizingOfficer: 'KN',
      startTime: '10:00',
      endTime: '14:30',
      startMileageKM: 45310,
      endMileageKM: 45450,
      noOfKMDone: 140,
      placesVisited: 'Site to Sapugaskanda Refinery visit',
      tripPurpose: 'LNG feed technical survey',
      status: 'completed',
      driverSignature: true,
      passengerSignature: true,
      otHours: 2,
      createdAt: makeDate(3),
      updatedAt: makeDate(3),
    },
    {
      date: makeDate(4),
      vehicle: vehicle3Res.insertedId,
      driver: driver3Res.insertedId,
      passenger: passenger2Res.insertedId,
      authorizingOfficer: 'DM',
      startTime: '08:45',
      endTime: '13:00',
      startMileageKM: 78500,
      endMileageKM: 78620,
      noOfKMDone: 120,
      placesVisited: 'Site to Ministry of Power (Colombo 07)',
      tripPurpose: 'Environmental clearance submission',
      status: 'completed',
      driverSignature: true,
      passengerSignature: true,
      otHours: 0.5,
      createdAt: makeDate(4),
      updatedAt: makeDate(4),
    },
    {
      date: makeDate(5),
      vehicle: vehicle3Res.insertedId,
      driver: driver3Res.insertedId,
      passenger: passenger1Res.insertedId,
      authorizingOfficer: 'KN',
      startTime: '14:00',
      endTime: '17:30',
      startMileageKM: 78620,
      endMileageKM: 78710,
      noOfKMDone: 90,
      placesVisited: 'Kerawalapitiya to Negombo port liaison office',
      tripPurpose: 'Gas turbine sea cargo customs inspection',
      status: 'completed',
      driverSignature: true,
      passengerSignature: true,
      otHours: 1,
      createdAt: makeDate(5),
      updatedAt: makeDate(5),
    },
    {
      date: makeDate(6),
      vehicle: vehicle1Res.insertedId,
      driver: driver1Res.insertedId,
      passenger: passenger2Res.insertedId,
      authorizingOfficer: 'HM',
      startTime: '09:00',
      endTime: '13:30',
      startMileageKM: 9251,
      endMileageKM: 9320,
      noOfKMDone: 69,
      placesVisited: 'Site to Peliyagoda testing laboratory',
      tripPurpose: 'Concrete foundation core sample test',
      status: 'completed',
      driverSignature: true,
      passengerSignature: true,
      otHours: 0,
      createdAt: makeDate(6),
      updatedAt: makeDate(6),
    },
    {
      date: makeDate(7),
      vehicle: vehicle2Res.insertedId,
      driver: driver2Res.insertedId,
      passenger: passenger1Res.insertedId,
      authorizingOfficer: 'PR',
      startTime: '08:30',
      endTime: '16:00',
      startMileageKM: 45450,
      endMileageKM: 45650,
      noOfKMDone: 200,
      placesVisited: 'Site to Biyagama Grid Substation inspection',
      tripPurpose: 'Grid interconnection calibration',
      status: 'completed',
      driverSignature: true,
      passengerSignature: true,
      otHours: 3,
      createdAt: makeDate(7),
      updatedAt: makeDate(7),
    },
    {
      date: makeDate(0),
      vehicle: vehicle1Res.insertedId,
      driver: driver1Res.insertedId,
      passenger: passenger1Res.insertedId,
      authorizingOfficer: 'KN',
      startTime: '16:00',
      endTime: '',
      startMileageKM: 9320,
      endMileageKM: undefined,
      noOfKMDone: 0,
      placesVisited: 'Kerawalapitiya Site to Ragama Medical Center (routine inspection)',
      tripPurpose: 'Site medical team emergency equipment check',
      status: 'ongoing',
      driverSignature: false,
      passengerSignature: true,
      otHours: 0,
      createdAt: makeDate(0),
      updatedAt: makeDate(0),
    },
  ];

  await db.collection('rides').insertMany(sampleRides);
  console.log('Seeded 10 sample ride records!');

  console.log('\n--- SEED COMPLETE ---');
  console.log('Admin account: admin@lakdhanavi.com / admin123');
  console.log('Driver accounts: lakshan@lakdhanavi.com / driver123');
  console.log('Passenger accounts: gaveen@lakdhanavi.com / pass123');
  console.log('Vehicles: 62-5845, WP-CAD-4290, WP-CAR-7812');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
