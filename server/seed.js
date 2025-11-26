const mongoose = require('mongoose');
require('dotenv').config();

// Models
const User = require('./models/User');
const Church = require('./models/Church');
const Member = require('./models/Member');
const Event = require('./models/Event');
const Donation = require('./models/Donation');
const Group = require('./models/Group');
const Attendance = require('./models/Attendance');
const PrayerRequest = require('./models/PrayerRequest');
const Volunteer = require('./models/Volunteer');

async function seed() {
  try {
    console.log('🌱 Starting database seed...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Church.deleteMany({}),
      Member.deleteMany({}),
      Event.deleteMany({}),
      Donation.deleteMany({}),
      Group.deleteMany({}),
      Attendance.deleteMany({}),
      PrayerRequest.deleteMany({}),
      Volunteer.deleteMany({}),
    ]);

    // Create Church (South Africa)
    console.log('⛪ Creating church...');
    const church = await Church.create({
      name: 'Grace Community Church',
      email: 'info@gracechurch.org.za',
      phone: '+27 11 234 5678',
      website: 'https://gracechurch.org.za',
      address: {
        street: '45 Main Road, Sandton',
        city: 'Johannesburg',
        state: 'Gauteng',
        zipCode: '2196',
      },
      timezone: 'Africa/Johannesburg',
      currency: 'ZAR',
    });

    // Create Admin Users
    console.log('👤 Creating admin users...');
    const seniorPastor = await User.create({
      email: 'pastor@gracechurch.org.za',
      password: 'grace2024',
      firstName: 'Pastor',
      lastName: 'Mokoena',
      role: 'senior_pastor',
      churchId: church._id,
    });

    const adminLintle = await User.create({
      email: 'lintle@gracechurch.org.za',
      password: 'lintle123',
      firstName: 'Lintle',
      lastName: 'Lebitsa',
      role: 'admin',
      churchId: church._id,
    });

    const treasurer = await User.create({
      email: 'treasurer@gracechurch.org.za',
      password: 'finance123',
      firstName: 'Thandi',
      lastName: 'Nkosi',
      role: 'treasurer',
      churchId: church._id,
    });

    const secretary = await User.create({
      email: 'secretary@gracechurch.org.za',
      password: 'office123',
      firstName: 'Mpho',
      lastName: 'Sithole',
      role: 'secretary',
      churchId: church._id,
    });

    // Create Members (South African names)
    console.log('👥 Creating members...');
    const membersData = [
      { firstName: 'Thabo', lastName: 'Ndlovu', email: 'thabo.ndlovu@email.co.za', phone: '+27 82 234 5678', membershipStatus: 'active', gender: 'male' },
      { firstName: 'Nomsa', lastName: 'Dlamini', email: 'nomsa.d@email.co.za', phone: '+27 83 345 6789', membershipStatus: 'active', gender: 'female' },
      { firstName: 'Sipho', lastName: 'Mthembu', email: 'sipho.m@email.co.za', phone: '+27 84 456 7890', membershipStatus: 'active', gender: 'male' },
      { firstName: 'Lerato', lastName: 'Molefe', email: 'lerato.molefe@email.co.za', phone: '+27 72 567 8901', membershipStatus: 'active', gender: 'female' },
      { firstName: 'Bongani', lastName: 'Zulu', email: 'bongani.z@email.co.za', phone: '+27 73 678 9012', membershipStatus: 'member', gender: 'male' },
      { firstName: 'Palesa', lastName: 'Khumalo', email: 'palesa.k@email.co.za', phone: '+27 74 789 0123', membershipStatus: 'member', gender: 'female' },
      { firstName: 'Mandla', lastName: 'Nkosi', email: 'mandla.nkosi@email.co.za', phone: '+27 76 890 1234', membershipStatus: 'active', gender: 'male' },
      { firstName: 'Thandiwe', lastName: 'Mbeki', email: 'thandiwe.m@email.co.za', phone: '+27 79 901 2345', membershipStatus: 'active', gender: 'female' },
      { firstName: 'Johannes', lastName: 'van der Merwe', email: 'johannes.vdm@email.co.za', phone: '+27 82 012 3456', membershipStatus: 'visitor', gender: 'male' },
      { firstName: 'Anele', lastName: 'Sithole', email: 'anele.s@email.co.za', phone: '+27 83 123 4567', membershipStatus: 'visitor', gender: 'female' },
      { firstName: 'Pieter', lastName: 'Botha', email: 'pieter.botha@email.co.za', phone: '+27 84 234 5678', membershipStatus: 'active', gender: 'male' },
      { firstName: 'Zanele', lastName: 'Ngcobo', email: 'zanele.n@email.co.za', phone: '+27 72 345 6789', membershipStatus: 'inactive', gender: 'female' },
    ];

    const members = await Member.insertMany(
      membersData.map(m => ({
        ...m,
        churchId: church._id,
        joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      }))
    );

    // Create Groups
    console.log('👪 Creating groups...');
    const groupsData = [
      { name: 'Worship Team', type: 'ministry', description: 'Leading worship during services', meetingSchedule: 'Thursdays at 19:00' },
      { name: 'Youth Group', type: 'ministry', description: 'Ministry for teens ages 13-18', meetingSchedule: 'Fridays at 18:00' },
      { name: 'Women\'s Bible Study', type: 'small_group', description: 'Weekly Bible study for women', meetingSchedule: 'Tuesdays at 10:00' },
      { name: 'Men\'s Fellowship', type: 'small_group', description: 'Monthly men\'s gathering', meetingSchedule: 'First Saturday of each month' },
      { name: 'Outreach Team', type: 'ministry', description: 'Community outreach and missions', meetingSchedule: 'Bi-weekly Saturdays' },
      { name: 'Prayer Warriors', type: 'ministry', description: 'Intercessory prayer ministry', meetingSchedule: 'Wednesdays at 06:00' },
    ];

    const groups = await Group.insertMany(
      groupsData.map((g, i) => ({
        ...g,
        churchId: church._id,
        leaderId: members[i % members.length]._id,
        members: members.slice(i * 2, i * 2 + 4).map(m => m._id),
        isActive: true,
      }))
    );

    // Create Events
    console.log('📅 Creating events...');
    const now = new Date();
    const eventsData = [
      { title: 'Sunday Worship Service', type: 'service', startDate: getNextSunday(now, 10, 0), location: 'Main Sanctuary', description: 'Weekly Sunday worship service' },
      { title: 'Wednesday Bible Study', type: 'class', startDate: getNextWeekday(now, 3, 19, 0), location: 'Fellowship Hall', description: 'Mid-week Bible study for all ages' },
      { title: 'Youth Night', type: 'social', startDate: getNextWeekday(now, 5, 18, 0), location: 'Youth Room', description: 'Fun and fellowship for teens' },
      { title: 'Community Outreach - Soweto', type: 'outreach', startDate: addDays(getNextSaturday(now), 7), location: 'Soweto Community Centre', description: 'Serving our community in Soweto' },
      { title: 'Leadership Meeting', type: 'meeting', startDate: getNextWeekday(now, 1, 18, 30), location: 'Conference Room', description: 'Monthly leadership team meeting' },
      { title: 'Christmas Concert', type: 'service', startDate: new Date(now.getFullYear(), 11, 20, 19, 0), location: 'Main Sanctuary', description: 'Annual Christmas celebration concert' },
      { title: 'New Members Class', type: 'class', startDate: addDays(getNextSunday(now, 12, 30), 14), location: 'Room 101', description: 'Orientation for new members' },
      { title: 'Prayer Breakfast', type: 'meeting', startDate: getNextSaturday(now, 8, 0), location: 'Fellowship Hall', description: 'Monthly prayer and breakfast gathering' },
    ];

    const events = await Event.insertMany(
      eventsData.map(e => ({
        ...e,
        churchId: church._id,
        organizerId: members[Math.floor(Math.random() * members.length)]._id,
        registrationRequired: Math.random() > 0.5,
      }))
    );

    // Create Donations (in ZAR - South African Rand)
    console.log('💰 Creating donations...');
    const donationTypes = ['tithe', 'offering', 'building', 'mission'];
    const paymentMethods = ['cash', 'eft', 'card', 'online', 'bank_transfer'];
    
    const donations = [];
    for (let i = 0; i < 50; i++) {
      donations.push({
        churchId: church._id,
        donorId: members[Math.floor(Math.random() * members.length)]._id,
        amount: Math.floor(Math.random() * 5000 + 100) * 10, // R1000 - R51000
        currency: 'ZAR',
        date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        type: donationTypes[Math.floor(Math.random() * donationTypes.length)],
        method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        receiptSent: Math.random() > 0.3,
      });
    }
    await Donation.insertMany(donations);

    // Create Prayer Requests
    console.log('🙏 Creating prayer requests...');
    const prayerRequestsData = [
      { title: 'Healing for my mother', description: 'Please pray for my mother who is recovering from surgery at Netcare Hospital.', status: 'active' },
      { title: 'Job search', description: 'Looking for new employment opportunities in Johannesburg. Please pray for guidance.', status: 'active' },
      { title: 'Family reconciliation', description: 'Praying for restoration in family relationships.', status: 'active' },
      { title: 'Safe travels', description: 'Traveling to Cape Town next month for mission work.', status: 'active' },
      { title: 'New baby arrived safely!', description: 'Thank God for the safe arrival of our baby girl at Morningside Clinic!', status: 'answered' },
      { title: 'Got the job!', description: 'God answered prayers - I got the position at Discovery!', status: 'answered' },
    ];

    await PrayerRequest.insertMany(
      prayerRequestsData.map((pr, i) => ({
        ...pr,
        churchId: church._id,
        requesterId: members[i % members.length]._id,
        isPublic: true,
      }))
    );

    // Create Volunteers
    console.log('🤝 Creating volunteers...');
    const volunteerRoles = ['Usher', 'Greeter', 'Sound Tech', 'Media Team', 'Children\'s Ministry', 'Parking Team', 'Tea & Coffee'];
    
    await Volunteer.insertMany(
      members.slice(0, 8).map((m, i) => ({
        churchId: church._id,
        memberId: m._id,
        role: volunteerRoles[i % volunteerRoles.length],
        ministryId: groups[i % groups.length]._id,
        startDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        status: 'active',
      }))
    );

    // Create some Attendance records
    console.log('✅ Creating attendance records...');
    const attendanceRecords = [];
    const sundayService = events[0];
    
    for (let week = 0; week < 4; week++) {
      const serviceDate = new Date(sundayService.startDate);
      serviceDate.setDate(serviceDate.getDate() - (week * 7));
      
      for (const member of members.slice(0, 10)) {
        const status = Math.random() > 0.2 ? 'present' : (Math.random() > 0.5 ? 'absent' : 'late');
        attendanceRecords.push({
          churchId: church._id,
          memberId: member._id,
          eventId: sundayService._id,
          date: serviceDate,
          status,
          checkedInAt: status !== 'absent' ? serviceDate : undefined,
        });
      }
    }
    await Attendance.insertMany(attendanceRecords);

    console.log('\n✨ Seed completed successfully!\n');
    console.log('📧 Login credentials:');
    console.log('   Senior Pastor: pastor@gracechurch.org.za / grace2024');
    console.log('   Admin (Lintle): lintle@gracechurch.org.za / lintle123');
    console.log('   Treasurer: treasurer@gracechurch.org.za / finance123');
    console.log('   Secretary: secretary@gracechurch.org.za / office123\n');
    console.log('📊 Created:');
    console.log(`   - 1 Church (Johannesburg, South Africa)`);
    console.log(`   - 1 Admin User`);
    console.log(`   - ${members.length} Members`);
    console.log(`   - ${groups.length} Groups`);
    console.log(`   - ${events.length} Events`);
    console.log(`   - ${donations.length} Donations (in ZAR)`);
    console.log(`   - ${prayerRequestsData.length} Prayer Requests`);
    console.log(`   - 8 Volunteers`);
    console.log(`   - ${attendanceRecords.length} Attendance Records\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Helper functions
function getNextSunday(date, hour = 10, minute = 0) {
  const result = new Date(date);
  result.setDate(result.getDate() + (7 - result.getDay()) % 7);
  result.setHours(hour, minute, 0, 0);
  if (result <= date) result.setDate(result.getDate() + 7);
  return result;
}

function getNextSaturday(date, hour = 10, minute = 0) {
  const result = new Date(date);
  result.setDate(result.getDate() + (6 - result.getDay() + 7) % 7);
  result.setHours(hour, minute, 0, 0);
  if (result <= date) result.setDate(result.getDate() + 7);
  return result;
}

function getNextWeekday(date, dayOfWeek, hour, minute) {
  const result = new Date(date);
  result.setDate(result.getDate() + (dayOfWeek - result.getDay() + 7) % 7);
  result.setHours(hour, minute, 0, 0);
  if (result <= date) result.setDate(result.getDate() + 7);
  return result;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

seed();
