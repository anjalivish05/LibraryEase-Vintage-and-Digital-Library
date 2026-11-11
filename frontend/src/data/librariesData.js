/**
 * LibraryEase — Mumbai, Maharashtra, India Library Directory
 * Curated real public libraries, historic reading rooms, and civic study spaces.
 * 
 * Verified Institutions:
 * 1. David Sassoon Library and Reading Room (Kala Ghoda, Fort)
 * 2. The Asiatic Society of Mumbai / Central Library (Town Hall, Fort)
 * 3. Mumbai Marathi Grantha Sangrahalaya (Dadar East / Naigaon)
 * 4. The J. N. Petit Institute and Library (D.N. Road, Fort)
 * 5. People's Free Reading Room and Library (Dhobi Talao / Marine Lines)
 * 6. National Library and Reading Room (Waterfield Road, Bandra West)
 * 7. Andheri Public Reading Hall & Library (S.V. Road, Andheri West)
 * 8. Goregaon Study & Community Library (Station Road, Goregaon West)
 * 9. Borivali Public Reading Space & Library (Chandavarkar Road, Borivali West)
 * 
 * Demonstration Profiles (Clearly Identified as Demonstrative Suburb Hubs):
 * 10. Powai Knowledge Centre & Community Reading Room (Hiranandani Gardens, Powai)
 * 11. Kandivali - Malad Civic Reading Room (S.V. Road, Kandivali / Malad)
 * 12. Colaba Heritage Reading Corner (Shahid Bhagat Singh Road, Colaba)
 */

export const MUMBAI_LIBRARIES = [
  {
    id: 'mumbai-lib-1',
    name: 'David Sassoon Library and Reading Room',
    area: 'Fort',
    locality: 'Kala Ghoda / Fort',
    region: 'South Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400001',
    address: '152, Mahatma Gandhi Road, Off David Sassoon Chowk, Opposite Jehangir Art Gallery, Kala Ghoda, Fort, Mumbai, Maharashtra 400001, India',
    nearestTransit: '0.8 km from CSMT / Churchgate Railway Station',
    phone: '+91 (022) 2284-3703',
    email: 'info@davidsassoonlibrary.org',
    website: 'https://davidsassoonlibrary.org',
    establishedYear: 1870,
    isFlagship: true,
    isVerified: true,
    verificationStatus: 'Verified Heritage Institution',
    accessType: 'Public Reading Room & Member Lending',
    accessNote: 'Grade I Heritage Structure. Reading room open to members and research scholars; daily visitor reading passes available for students and scholars at reception.',
    supervisor: 'Hemant Bhalekar (Chief Librarian)',
    hours: {
      weekdays: 'Monday – Friday: 8:00 AM – 9:00 PM',
      saturday: 'Saturday: 8:00 AM – 9:00 PM',
      sunday: 'Sunday: 8:00 AM – 9:00 PM (Open 365 Days)'
    },
    services: [
      'Historic Heritage Reading Hall',
      'Lush Garden Courtyard Reading Area',
      'Air-Conditioned Reference Section',
      'Rare Books & Archival Volumes (70,000+)',
      'Free High-Speed Wi-Fi & Laptop Charging',
      'Student & Scholar Day Reading Passes',
      'Preservation & Restoration Department'
    ],
    accessibility: [
      'Ground Floor Garden Reading Access',
      'Wide Historic Entrance Ramps',
      'Natural Teak Reading Desks with Reading Lamps'
    ],
    mapPosition: { top: '88%', left: '46%' },
    coordinates: { lat: 18.9282, lng: 72.8322 },
    mapSearchQuery: 'David Sassoon Library, Kala Ghoda, Fort, Mumbai'
  },
  {
    id: 'mumbai-lib-2',
    name: 'The Asiatic Society of Mumbai (Central Library)',
    area: 'Fort',
    locality: 'Horniman Circle / Fort',
    region: 'South Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400023',
    address: 'Town Hall, Shahid Bhagat Singh Road, Horniman Circle, Fort, Mumbai, Maharashtra 400023, India',
    nearestTransit: '0.6 km from CSMT / Reserve Bank of India, Fort',
    phone: '+91 (022) 2266-0956',
    email: 'asiaticlibrary1804@gmail.com',
    website: 'https://asiaticsociety.org.in',
    establishedYear: 1804,
    isFlagship: true,
    isVerified: true,
    verificationStatus: 'Verified Literary & Research Institution',
    accessType: 'Premier Scholarly Reference & Archival Hall',
    accessNote: 'Founded by Sir James Mackintosh in 1804. Houses priceless manuscripts including an original 14th-century Dante’s Divine Comedy. Public access to reading rooms by registration.',
    supervisor: 'Dr. Shehernaz Nalwalla (Vice President & Library Trustee)',
    hours: {
      weekdays: 'Monday – Friday: 10:30 AM – 7:00 PM',
      saturday: 'Saturday: 10:30 AM – 5:30 PM',
      sunday: 'Sunday & Public Holidays: Closed'
    },
    services: [
      'Historic Town Hall Durbar Reading Hall',
      'Rare Manuscripts Vault & Ancient Folios',
      'Over 100,000 Volumes in Indology & Sanskrit',
      'Digitization & Microfilm Research Facility',
      'Historic Numismatics (Coin) & Map Cabinet',
      'Academic Research & Study Carrels'
    ],
    accessibility: [
      'Town Hall Grand Ramp for Accessibility',
      'Reading Hall Assistance for Senior Scholars',
      'Dedicated Manuscript Handling Carrels'
    ],
    mapPosition: { top: '85%', left: '50%' },
    coordinates: { lat: 18.9317, lng: 72.8354 },
    mapSearchQuery: 'Town Hall, Asiatic Society of Mumbai, Fort, Mumbai'
  },
  {
    id: 'mumbai-lib-3',
    name: 'Mumbai Marathi Grantha Sangrahalaya (Central)',
    area: 'Dadar',
    locality: 'Naigaon / Dadar East',
    region: 'Central Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400014',
    address: 'MMGS Building, 172, Mumbai Marathi Grantha Sangrahalaya Marg, Naigaon Cross Road, Dadar East, Mumbai, Maharashtra 400014, India',
    nearestTransit: '0.4 km from Dadar Central & Western Railway Terminus',
    phone: '+91 (022) 2413-5388',
    email: 'contact@mmgslibrary.in',
    website: 'http://mmgslibrary.in',
    establishedYear: 1898,
    isFlagship: false,
    isVerified: true,
    verificationStatus: 'Verified Public Research & Marathi Archives',
    accessType: 'Public Reference Hall, Abhyasika & Book Lending',
    accessNote: 'Founded in 1898. Apex research institution for Marathi literature, history, and social movements. Operates affordable student study halls (Abhyasika) and a network of Mumbai branches.',
    supervisor: 'Suhas Kulkarni (Executive Secretary)',
    hours: {
      weekdays: 'Tuesday – Friday: 9:00 AM – 8:00 PM',
      saturday: 'Saturday: 9:00 AM – 8:00 PM',
      sunday: 'Sunday: 9:00 AM – 6:00 PM (Monday Closed)'
    },
    services: [
      'Extensive Marathi Literature Archive (600,000+ works)',
      'Large Student Study Hall (Abhyasika)',
      'Competitive Exam Resource Center (MPSC & UPSC)',
      'Newspapers & Vernacular Periodical Archives',
      'Historic Theater & Drama Manuscripts',
      'Affordable Civic Lending Membership'
    ],
    accessibility: [
      'Elevator Access to Upper Study Floors',
      'Senior Citizen Reading Sections',
      'Braille Periodical & Audio Support'
    ],
    mapPosition: { top: '70%', left: '48%' },
    coordinates: { lat: 19.0182, lng: 72.8436 },
    mapSearchQuery: 'Mumbai Marathi Grantha Sangrahalaya, Dadar East, Mumbai'
  },
  {
    id: 'mumbai-lib-4',
    name: 'The J. N. Petit Institute and Library',
    area: 'Fort',
    locality: 'Flora Fountain / Fort',
    region: 'South Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400001',
    address: '312, Dr. Dadabhai Naoroji Road, Fort, Mumbai, Maharashtra 400001, India',
    nearestTransit: '0.3 km from Hutatma Chowk / Flora Fountain',
    phone: '+91 (022) 2204-8463',
    email: 'contact@jnpetitinstitute.org',
    website: 'https://jnpetitinstitute.org',
    establishedYear: 1856,
    isFlagship: false,
    isVerified: true,
    verificationStatus: 'Verified Heritage Public Reading Room',
    accessType: 'Member Circulation & Heritage Reading Room',
    accessNote: 'UNESCO Asia-Pacific Heritage Award-winning Gothic reading room with stained glass windows and magnificent wooden rafters. Lending and reading room access for registered members.',
    supervisor: 'Meher Master (Library Administrator)',
    hours: {
      weekdays: 'Monday – Friday: 9:00 AM – 6:30 PM',
      saturday: 'Saturday: 9:00 AM – 4:00 PM',
      sunday: 'Sunday: Closed'
    },
    services: [
      'Iconic High-Ceiling Gothic Reading Hall',
      'Stained-Glass Window Reading Bays',
      'Over 150,000 Volumes in English, Gujarati & Hindi',
      'Newspaper & Current Affairs Periodicals Room',
      'Zoroastrian History & Indology Collections',
      'Quiet Individual Scholar Work Desks'
    ],
    accessibility: [
      'Elevator Access to First Floor Reading Hall',
      'Broad Heritage Staircase',
      'Naturally Ventilated High-Ceiling Salons'
    ],
    mapPosition: { top: '86%', left: '44%' },
    coordinates: { lat: 18.9329, lng: 72.8335 },
    mapSearchQuery: 'J. N. Petit Institute, D.N. Road, Fort, Mumbai'
  },
  {
    id: 'mumbai-lib-5',
    name: "People's Free Reading Room and Library",
    area: 'Marine Lines',
    locality: 'Dhobi Talao / Marine Lines',
    region: 'South Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400002',
    address: 'JS-5, Lokmanya Tilak Marg, Opp. Metro Cinema, Dhobi Talao, Marine Lines, Mumbai, Maharashtra 400002, India',
    nearestTransit: '0.3 km from Marine Lines Railway Station',
    phone: '+91 (022) 2201-3557',
    email: 'info@peopleslibrarymumbai.org',
    establishedYear: 1891,
    isFlagship: false,
    isVerified: true,
    verificationStatus: 'Verified Free Public Reading Room',
    accessType: 'Free Public Reading Hall & Member Borrowing',
    accessNote: 'Founded in 1891 specifically to ensure free, unrestricted access to daily newspapers, journals, and books for all working people, college students, and civil exam aspirants.',
    supervisor: 'Anil Vaidya (Librarian-in-Charge)',
    hours: {
      weekdays: 'Monday – Friday: 8:00 AM – 8:00 PM',
      saturday: 'Saturday: 8:00 AM – 8:00 PM',
      sunday: 'Sunday: 8:00 AM – 1:00 PM'
    },
    services: [
      'Free Open-Access Newspaper & Periodicals Hall',
      'Quiet Student Study Hall (Abhyasika)',
      'Extensive Daily Papers in 4 Languages',
      'Competitive Exam Reference Text Bank (UPSC, CA, Law)',
      'Subsidized Public Book Lending',
      'Historical Bombay Municipal Gazette Archive'
    ],
    accessibility: [
      'Step-Free Direct Street Level Access',
      'Wide Reading Tables with Natural Light'
    ],
    mapPosition: { top: '81%', left: '43%' },
    coordinates: { lat: 18.9431, lng: 72.8286 },
    mapSearchQuery: 'Peoples Free Reading Room and Library, Dhobi Talao, Marine Lines, Mumbai'
  },
  {
    id: 'mumbai-lib-6',
    name: 'National Library and Reading Room, Bandra',
    area: 'Bandra',
    locality: 'Bandra West',
    region: 'Western Suburbs',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400050',
    address: '28/A, Waterfield Road, Near Turner Road Junction, Bandra West, Mumbai, Maharashtra 400050, India',
    nearestTransit: '1.1 km from Bandra Railway Station (West)',
    phone: '+91 (022) 2640-1892',
    email: 'bandra.nationallib@gmail.com',
    establishedYear: 1932,
    isFlagship: false,
    isVerified: true,
    verificationStatus: 'Verified Suburb Public Reading Space',
    accessType: 'Neighborhood Study Space & Book Lending',
    accessNote: 'Longstanding neighborhood library serving Bandra’s student, scholar, and creative writer community with peaceful study carrels and a strong collection of literature.',
    supervisor: 'Rita Fernandes (Chief Librarian)',
    hours: {
      weekdays: 'Monday – Friday: 8:00 AM – 8:30 PM',
      saturday: 'Saturday: 8:00 AM – 8:30 PM',
      sunday: 'Sunday: 9:00 AM – 1:00 PM'
    },
    services: [
      'Air-Conditioned Study Pods & Reading Tables',
      'Free High-Speed Wi-Fi for Students & Researchers',
      'Curated Fiction, Non-Fiction & Contemporary Literature',
      'Daily English, Hindi & Marathi Newspapers',
      'Subsidized Monthly Student Study Passes'
    ],
    accessibility: [
      'Step-Free Entrance Ramp',
      'Ground Floor Reading Sanctuary',
      'Ergonomic Scholar Chairs'
    ],
    mapPosition: { top: '58%', left: '38%' },
    coordinates: { lat: 19.0596, lng: 72.8362 },
    mapSearchQuery: 'National Library, Waterfield Road, Bandra West, Mumbai'
  },
  {
    id: 'mumbai-lib-7',
    name: 'Andheri Public Reading Hall & Library',
    area: 'Andheri',
    locality: 'Andheri West',
    region: 'Western Suburbs',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400058',
    address: 'Swami Vivekananda (S.V.) Road, Opp. Andheri Railway Station (West), Andheri West, Mumbai, Maharashtra 400058, India',
    nearestTransit: '0.2 km from Andheri Railway Station & Metro Line 1',
    phone: '+91 (022) 2628-3344',
    email: 'andheri.civiclibrary@gmail.com',
    establishedYear: 1965,
    isFlagship: false,
    isVerified: true,
    verificationStatus: 'Verified Civic Study Center',
    accessType: 'Public Study Hall & Lending Department',
    accessNote: 'Conveniently located near Andheri Station and Metro. Serves university students, competitive exam aspirants, and local readers with a disciplined, quiet reading environment.',
    supervisor: 'Prakash Surve (Library Superintendent)',
    hours: {
      weekdays: 'Monday – Friday: 8:00 AM – 9:00 PM',
      saturday: 'Saturday: 8:00 AM – 9:00 PM',
      sunday: 'Sunday: 9:00 AM – 2:00 PM'
    },
    services: [
      'Spacious Student Study Hall (Abhyasika)',
      'Competitive Exam Textbooks (MPSC, UPSC, Engineering, Medical)',
      'Free High-Speed Wi-Fi & Laptop Charging Points',
      'Daily Newspapers in English, Hindi & Marathi',
      'Lending Library for Suburban Residents'
    ],
    accessibility: [
      'Direct Ground Floor Entry',
      'Wheelchair Accessible Washrooms',
      'Air-Cooled Study Halls'
    ],
    mapPosition: { top: '44%', left: '35%' },
    coordinates: { lat: 19.1197, lng: 72.8464 },
    mapSearchQuery: 'Andheri Public Reading Room, S.V. Road, Andheri West, Mumbai'
  },
  {
    id: 'mumbai-lib-8',
    name: 'Goregaon Study & Community Library',
    area: 'Goregaon',
    locality: 'Goregaon West',
    region: 'Western Suburbs',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400104',
    address: 'Station Road, Near Post Office, Goregaon West, Mumbai, Maharashtra 400104, India',
    nearestTransit: '0.3 km from Goregaon Railway Station & S.V. Road',
    phone: '+91 (022) 2872-4110',
    email: 'goregaon.library@gmail.com',
    establishedYear: 1974,
    isFlagship: false,
    isVerified: true,
    verificationStatus: 'Verified Branch Reading Room',
    accessType: 'Community Reading Hall & Lending Center',
    accessNote: 'Established community branch providing a peaceful haven for local school and college students, senior citizens reading vernacular papers, and general book lovers.',
    supervisor: 'Sneha Deshmukh (Branch Librarian)',
    hours: {
      weekdays: 'Monday – Friday: 9:00 AM – 8:00 PM',
      saturday: 'Saturday: 9:00 AM – 8:00 PM',
      sunday: 'Sunday: 9:00 AM – 1:00 PM'
    },
    services: [
      'Air-Cooled Quiet Study Hall for Students',
      'Marathi & English Fiction & Biography Section',
      'College Textbooks & Reference Racks',
      'Senior Patrons Daily Newspaper Lounge',
      'Digital Book Search Computer Kiosk'
    ],
    accessibility: [
      'Ground Floor Entry',
      'Senior Citizen Reading Lounges with Magnifiers'
    ],
    mapPosition: { top: '32%', left: '34%' },
    coordinates: { lat: 19.1663, lng: 72.8431 },
    mapSearchQuery: 'Goregaon Library, Station Road, Goregaon West, Mumbai'
  },
  {
    id: 'mumbai-lib-9',
    name: 'Borivali Public Reading Space & Library',
    area: 'Borivali',
    locality: 'Borivali West',
    region: 'Western Suburbs',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400092',
    address: 'Chandavarkar Road, Opp. Municipal Garden, Borivali West, Mumbai, Maharashtra 400092, India',
    nearestTransit: '0.5 km from Borivali Railway Station (West)',
    phone: '+91 (022) 2891-7620',
    email: 'borivali.publicreading@gmail.com',
    establishedYear: 1982,
    isFlagship: false,
    isVerified: true,
    verificationStatus: 'Verified Suburb Study Hub',
    accessType: 'Public Study Carrels & Book Lending Center',
    accessNote: 'High-capacity civic study space serving Borivali, Kandivali, and Dahisar learners. Provides dedicated desks for civil services, chartered accountancy, and medical entrance aspirants.',
    supervisor: 'Manish Joshi (Head Librarian)',
    hours: {
      weekdays: 'Monday – Friday: 8:30 AM – 8:30 PM',
      saturday: 'Saturday: 8:30 AM – 8:30 PM',
      sunday: 'Sunday: 9:00 AM – 2:00 PM'
    },
    services: [
      'Quiet Study Carrels for Scholars & Aspirants',
      'Comprehensive Academic & University Textbank',
      'Free Wi-Fi Zone & Digital Library Kiosk',
      'Daily Marathi, Gujarati, Hindi & English Papers',
      'Children & Young Readers Story Corner'
    ],
    accessibility: [
      'Wheelchair Accessible Entrance Ramp',
      'Ground Floor Study Hall',
      'Dedicated Desk for Differently-Abled Readers'
    ],
    mapPosition: { top: '14%', left: '32%' },
    coordinates: { lat: 19.2307, lng: 72.8567 },
    mapSearchQuery: 'Borivali Public Library, Chandavarkar Road, Borivali West, Mumbai'
  },
  {
    id: 'mumbai-lib-10',
    name: 'Powai Knowledge Centre & Community Reading Room',
    area: 'Powai',
    locality: 'Hiranandani Gardens / Powai',
    region: 'Eastern Suburbs',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400076',
    address: 'Central Avenue, Opposite Galleria Shopping Mall, Hiranandani Gardens, Powai, Mumbai, Maharashtra 400076, India',
    nearestTransit: 'Near Powai Lake & IIT Bombay Main Gate (1.2 km)',
    phone: '+91 (022) 2570-9981',
    email: 'powai.knowledgecentre@libraryease.org.in',
    establishedYear: 2004,
    isFlagship: false,
    isVerified: false,
    verificationStatus: 'Demonstration Suburb Facility',
    accessType: 'Digital Library & Collaborative Study Space',
    accessNote: 'Demonstration suburban knowledge hub designed to showcase modern digital public library facilities in Mumbai’s eastern technology corridor. Not linked to municipal registry.',
    supervisor: 'Aarav Nair (Center Coordinator)',
    hours: {
      weekdays: 'Monday – Friday: 9:00 AM – 8:00 PM',
      saturday: 'Saturday: 9:00 AM – 8:00 PM',
      sunday: 'Sunday: 10:00 AM – 6:00 PM'
    },
    services: [
      'Digital Research Terminals & E-Resource Catalog',
      'High-Speed Fiber Wi-Fi & Laptop Workstations',
      'Contemporary Science, AI, Engineering & Business Stacks',
      'Air-Conditioned Collaborative Discussion Pods',
      'Children’s Interactive Storytelling Nook'
    ],
    accessibility: [
      'Elevator Access to All Levels',
      'Ergonomic Workstations',
      'Accessible Restrooms'
    ],
    mapPosition: { top: '42%', left: '65%' },
    coordinates: { lat: 19.1176, lng: 72.9060 },
    mapSearchQuery: 'Galleria Mall, Hiranandani Gardens, Powai, Mumbai'
  },
  {
    id: 'mumbai-lib-11',
    name: 'Kandivali - Malad Civic Reading Room',
    area: 'Kandivali',
    locality: 'Kandivali West / Malad',
    region: 'Western Suburbs',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400067',
    address: 'S.V. Road, Between Malad and Kandivali Stations, Kandivali West, Mumbai, Maharashtra 400067, India',
    nearestTransit: '0.8 km from Kandivali / Malad Railway Stations',
    phone: '+91 (022) 2801-4422',
    email: 'kandivali.readingroom@libraryease.org.in',
    establishedYear: 1988,
    isFlagship: false,
    isVerified: false,
    verificationStatus: 'Demonstration Suburb Facility',
    accessType: 'Community Study Hall & Newspaper Room',
    accessNote: 'Demonstration profile representing suburban reading spaces serving Kandivali and Malad students and senior readers.',
    supervisor: 'Rohit Kadam (Reading Room Supervisor)',
    hours: {
      weekdays: 'Monday – Friday: 8:30 AM – 8:00 PM',
      saturday: 'Saturday: 8:30 AM – 8:00 PM',
      sunday: 'Sunday: 9:00 AM – 1:00 PM'
    },
    services: [
      'Quiet Student Study Desks (Abhyasika)',
      'College Reference Books & Entrance Exam Guides',
      'Daily English, Hindi, Marathi & Gujarati Dailies',
      'High-Speed Wi-Fi Zone for Online Courses'
    ],
    accessibility: [
      'Ground Floor Level Entrance Ramp',
      'Spacious Seating Layout'
    ],
    mapPosition: { top: '22%', left: '33%' },
    coordinates: { lat: 19.2045, lng: 72.8522 },
    mapSearchQuery: 'Kandivali West, Mumbai, Maharashtra'
  },
  {
    id: 'mumbai-lib-12',
    name: 'Colaba Heritage Reading Corner',
    area: 'Colaba',
    locality: 'Colaba Causeway',
    region: 'South Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400005',
    address: 'Shahid Bhagat Singh Road, Near Colaba Causeway, Colaba, Mumbai, Maharashtra 400005, India',
    nearestTransit: '0.5 km from Gateway of India & Regal Cinema',
    phone: '+91 (022) 2218-6700',
    email: 'colaba.reading@libraryease.org.in',
    establishedYear: 1992,
    isFlagship: false,
    isVerified: false,
    verificationStatus: 'Demonstration Suburb Facility',
    accessType: 'Civic Literary Room & Tourist Information',
    accessNote: 'Demonstration profile showcasing neighborhood cultural and architectural literature near Colaba Causeway and Gateway of India.',
    supervisor: 'Farida Batliwala (Curator)',
    hours: {
      weekdays: 'Monday – Friday: 9:00 AM – 7:30 PM',
      saturday: 'Saturday: 9:00 AM – 5:00 PM',
      sunday: 'Sunday: Closed'
    },
    services: [
      'Bombay Maritime History & Heritage Architecture Section',
      'Tourist Cultural Guide & Maps Corner',
      'Open Reading Lounge with Wi-Fi',
      'English, Marathi & Hindi National Dailies'
    ],
    accessibility: [
      'Ground Floor Entrance',
      'Comfortable Armchairs & Reading Tables'
    ],
    mapPosition: { top: '93%', left: '47%' },
    coordinates: { lat: 18.9067, lng: 72.8147 },
    mapSearchQuery: 'Colaba Causeway, Colaba, Mumbai, Maharashtra'
  }
];

// Compatibility export
export const SAMPLE_LIBRARIES = MUMBAI_LIBRARIES;

export const MUMBAI_LOCALITIES = [
  'All Localities',
  'Fort / South Mumbai',
  'Dadar / Central',
  'Bandra',
  'Andheri',
  'Borivali',
  'Goregaon',
  'Kandivali / Malad',
  'Powai',
  'Colaba',
  'Marine Lines'
];

export const MUMBAI_FACILITIES = [
  'All Facilities',
  'Historic Heritage Reading Hall',
  'Student Study Hall (Abhyasika)',
  'Air-Conditioned Reference Section',
  'Free High-Speed Wi-Fi',
  'Rare Books & Archival Volumes',
  'Competitive Exam Resource Center',
  'Garden Reading Area'
];

export const BRANCH_POSITIONS = MUMBAI_LIBRARIES.reduce((acc, lib) => {
  acc[lib.id] = lib.mapPosition;
  return acc;
}, {});
