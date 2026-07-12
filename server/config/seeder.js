const Temple = require('../models/Temple');
const DarshanSlot = require('../models/DarshanSlot');

const sampleTemples = [
  {
    name: 'Tirumala Venkateswara Temple',
    location: 'Tirupati, Andhra Pradesh',
    description: 'The historic Venkateswara Temple is located in the hill town of Tirumala. It is dedicated to Lord Venkateswara, an incarnation of Vishnu, who is believed to have appeared here to save mankind from the trials of Kali Yuga.',
    image: '/images/gopuram.png',
    videoBg: 'https://assets.mixkit.co/videos/preview/mixkit-golden-bokeh-lights-background-loop-3129-large.mp4',
    deityImage: '/images/balaji.png',
    deityAudio: '/audio/tirupati.mp3',
    darshanStartTime: '06:00 AM',
    darshanEndTime: '09:00 PM',
    amenities: ['Free Meals (Anna Prasadam)', 'Locker Facilities', 'Rest Rooms', 'Wheelchair Support'],
    events: [
      { title: 'Srivari Brahmotsavam', date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), description: 'A nine-day festival celebrated annually in October, attracting millions of devotees.' },
      { title: 'Vasanthotsavam', date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), description: 'Annual spring festival performed to the deities on the auspicious day of Trayodashi in Chaitra month.' }
    ],
    ratings: [
      { userName: 'Aravind Swamy', rating: 5, comment: 'Extremely peaceful and well-organized darshan queue system.', date: new Date() }
    ],
    averageRating: 5
  },
  {
    name: 'Kashi Vishwanath Temple',
    location: 'Varanasi, Uttar Pradesh',
    description: 'One of the most famous Hindu temples dedicated to Lord Shiva. It is located in Varanasi, the holiest city of Hindus, on the western bank of the holy river Ganges.',
    image: '/images/kashi.png',
    videoBg: 'https://assets.mixkit.co/videos/preview/mixkit-candles-burning-in-a-temple-41662-large.mp4',
    deityImage: '/images/shiva.png',
    deityAudio: '/audio/kashi.mp3',
    darshanStartTime: '04:00 AM',
    darshanEndTime: '11:00 PM',
    amenities: ['Ganges Bath Ghat Access', 'Prasadam Stall', 'Shoe Keeping Stall', 'Information Desk'],
    events: [
      { title: 'Maha Shivaratri Special Pooja', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), description: 'Special midnight rituals and continuous prayers celebrating Shiva\'s holy night.' }
    ],
    ratings: [
      { userName: 'Radha Sharma', rating: 4, comment: 'Spiritual experience like no other. The ganga aarti is breathtaking.', date: new Date() }
    ],
    averageRating: 4
  },
  {
    name: 'Ayodhya Ram Mandir',
    location: 'Ayodhya, Uttar Pradesh',
    description: 'A grand Hindu temple dedicated to Lord Rama at the Rama Janmabhoomi site. It stands as a monumental symbol of cultural heritage, sacred faith, and architectural beauty.',
    image: '/images/ayodhya.png',
    videoBg: 'https://assets.mixkit.co/videos/preview/mixkit-golden-bokeh-lights-background-loop-3129-large.mp4',
    deityImage: '/images/rama.png',
    deityAudio: '/audio/rama.mp3',
    darshanStartTime: '06:00 AM',
    darshanEndTime: '10:00 PM',
    amenities: ['Prasadam Distribution', 'Locker Facilities', 'Rest Rooms', 'Wheelchair Support', 'Medical Center'],
    events: [
      { title: 'Rama Navami Celebrations', date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), description: 'Grand celebration of the birth of Lord Rama with continuous Vedic chants, special poojas, and Rath Yatra.' }
    ],
    ratings: [
      { userName: 'Vijay Kumar', rating: 5, comment: 'Breathtaking architecture and deeply spiritual atmosphere. Jai Shree Ram.', date: new Date() }
    ],
    averageRating: 5
  }
];

const seedData = async () => {
  try {
    const templeCount = await Temple.countDocuments();
    if (templeCount === 0) {
      console.log('Seeding initial temple database data...');
      const createdTemples = await Temple.insertMany(sampleTemples);
      console.log(`${createdTemples.length} temples successfully seeded.`);

      // Seed initial slots
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);

      const slots = [];
      createdTemples.forEach(temple => {
        slots.push(
          {
            temple: temple._id,
            date: tomorrow,
            startTime: '08:00 AM',
            endTime: '10:00 AM',
            availableSeats: 50,
            totalSeats: 50,
            price: 150
          },
          {
            temple: temple._id,
            date: tomorrow,
            startTime: '11:00 AM',
            endTime: '01:00 PM',
            availableSeats: 40,
            totalSeats: 40,
            price: 150
          },
          {
            temple: temple._id,
            date: tomorrow,
            startTime: '04:00 PM',
            endTime: '06:00 PM',
            availableSeats: 30,
            totalSeats: 30,
            price: 200
          },
          {
            temple: temple._id,
            date: dayAfter,
            startTime: '09:00 AM',
            endTime: '11:00 AM',
            availableSeats: 60,
            totalSeats: 60,
            price: 150
          }
        );
      });

      await DarshanSlot.insertMany(slots);
      console.log('Initial slots successfully seeded.');
    } else {
      console.log('Checking database for temple upgrades (videoBg, deityImage, deityAudio, image)...');
      
      // If Golden Temple is still there, rename/replace it with Ayodhya Ram Mandir
      await Temple.updateOne(
        { name: 'Sri Harmandir Sahib (Golden Temple)' },
        { 
          $set: { 
            name: 'Ayodhya Ram Mandir',
            location: 'Ayodhya, Uttar Pradesh',
            description: 'A grand Hindu temple dedicated to Lord Rama at the Rama Janmabhoomi site. It stands as a monumental symbol of cultural heritage, sacred faith, and architectural beauty.',
            image: '/images/ayodhya.png',
            videoBg: 'https://assets.mixkit.co/videos/preview/mixkit-golden-bokeh-lights-background-loop-3129-large.mp4',
            deityImage: '/images/rama.png',
            deityAudio: '/audio/rama.mp3',
            darshanStartTime: '06:00 AM',
            darshanEndTime: '10:00 PM',
            amenities: ['Prasadam Distribution', 'Locker Facilities', 'Rest Rooms', 'Wheelchair Support', 'Medical Center']
          }
        }
      );

      for (let sample of sampleTemples) {
        const result = await Temple.updateOne(
          { name: sample.name },
          { 
            $set: { 
              image: sample.image,
              videoBg: sample.videoBg,
              deityImage: sample.deityImage,
              deityAudio: sample.deityAudio,
              description: sample.description,
              location: sample.location,
              darshanStartTime: sample.darshanStartTime,
              darshanEndTime: sample.darshanEndTime,
              amenities: sample.amenities
            } 
          },
          { upsert: true }
        );

        // If it was upserted or just to be safe, check if it has slots
        const templeDoc = await Temple.findOne({ name: sample.name });
        if (templeDoc) {
          const slotCount = await DarshanSlot.countDocuments({ temple: templeDoc._id });
          if (slotCount === 0) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            await DarshanSlot.insertMany([
              {
                temple: templeDoc._id,
                date: tomorrow,
                startTime: '08:00 AM',
                endTime: '10:00 AM',
                availableSeats: 50,
                totalSeats: 50,
                price: 150
              },
              {
                temple: templeDoc._id,
                date: tomorrow,
                startTime: '04:00 PM',
                endTime: '06:00 PM',
                availableSeats: 30,
                totalSeats: 30,
                price: 200
              }
            ]);
            console.log(`Seeded missing slots for ${sample.name}`);
          }
        }
      }
      console.log('Temple upgrades and slots verified.');
    }
  } catch (error) {
    console.error('Error seeding initial data:', error);
  }
};

module.exports = { seedData };
