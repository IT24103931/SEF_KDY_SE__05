import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Report, { calculatePriority } from '../models/Report.js';

dotenv.config();

const sampleReports = [
  {
    reporterName: 'Community Member', district: 'Colombo', area: 'Dematagoda',
    wasteType: 'Illegal Dumping', size: 'Large', urgency: 'High', sensitiveLocation: true,
    description: 'Mixed waste has been dumped beside a busy public road near a drainage channel.', status: 'In Review'
  },
  {
    reporterName: 'Local Resident', district: 'Kandy', area: 'Peradeniya',
    wasteType: 'Overflowing Garbage', size: 'Medium', urgency: 'Medium', sensitiveLocation: true,
    description: 'A collection point has remained overflowing for several days near a public walkway.', status: 'Reported'
  },
  {
    reporterName: 'Student Reporter', district: 'Galle', area: 'Unawatuna',
    wasteType: 'Plastic Waste', size: 'Medium', urgency: 'Medium', sensitiveLocation: true,
    description: 'Plastic containers and wrappers are scattered along the edge of a waterway.', status: 'Resolved'
  },
  {
    reporterName: 'Community Member', district: 'Jaffna', area: 'Nallur',
    wasteType: 'Construction Waste', size: 'Large', urgency: 'Low', sensitiveLocation: false,
    description: 'Broken concrete and building material have been left beside an unused plot.', status: 'Reported'
  },
  {
    reporterName: 'Local Resident', district: 'Gampaha', area: 'Negombo',
    wasteType: 'Hazardous Waste', size: 'Small', urgency: 'High', sensitiveLocation: true,
    description: 'Discarded containers with unknown residue were found close to a school boundary.', status: 'In Review'
  },
  {
    reporterName: 'Student Reporter', district: 'Kurunegala', area: 'Kuliyapitiya',
    wasteType: 'Organic Waste', size: 'Small', urgency: 'Low', sensitiveLocation: false,
    description: 'Unmanaged organic waste has accumulated behind a shared community space.', status: 'Reported'
  },
  {
    reporterName: 'Community Member', district: 'Matara', area: 'Walgama',
    wasteType: 'Illegal Dumping', size: 'Medium', urgency: 'High', sensitiveLocation: false,
    description: 'Household waste is being left repeatedly beside a narrow local access road.', status: 'Reported'
  },
  {
    reporterName: 'Local Resident', district: 'Anuradhapura', area: 'New Town',
    wasteType: 'Plastic Waste', size: 'Small', urgency: 'Low', sensitiveLocation: false,
    description: 'Plastic bottles and bags have collected around a public seating area.', status: 'Resolved'
  }
].map((report) => ({
  ...report,
  ...calculatePriority(report)
}));

const seedReports = async () => {
  try {
    await connectDB();
    await Report.deleteMany({});
    await Report.insertMany(sampleReports);
    console.log(`${sampleReports.length} sample reports inserted`);
    process.exit(0);
  } catch (error) {
    console.error(`Seed failed: ${error.message}`);
    process.exit(1);
  }
};

seedReports();