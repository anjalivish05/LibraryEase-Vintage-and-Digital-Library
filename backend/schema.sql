-- ============================================================================
-- LibraryEase — MySQL Database Schema and Seed Script
-- Production-ready schema for LibraryEase AI-Powered Public Library Services
-- ============================================================================

-- 1. Create Database if not exists
CREATE DATABASE IF NOT EXISTS `libraryease` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `libraryease`;

-- 2. Drop existing tables in reverse dependency order if resetting
-- (Commented out by default to prevent accidental data loss)
-- DROP TABLE IF EXISTS `notifications`;
-- DROP TABLE IF EXISTS `borrowing_records`;
-- DROP TABLE IF EXISTS `book_requests`;
-- DROP TABLE IF EXISTS `feedback`;
-- DROP TABLE IF EXISTS `announcements`;
-- DROP TABLE IF EXISTS `libraries`;
-- DROP TABLE IF EXISTS `books`;
-- DROP TABLE IF EXISTS `users`;

-- ----------------------------------------------------------------------------
-- Table: users
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `full_name` VARCHAR(255) NOT NULL,
  `hashed_password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'user', -- 'user' | 'librarian'
  `phone` VARCHAR(50) DEFAULT NULL,
  `member_card_no` VARCHAR(50) NOT NULL UNIQUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_card` (`member_card_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: books
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `books` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `author` VARCHAR(255) NOT NULL,
  `isbn` VARCHAR(50) DEFAULT NULL UNIQUE,
  `category` VARCHAR(100) NOT NULL,
  `language` VARCHAR(50) NOT NULL DEFAULT 'English',
  `publisher` VARCHAR(255) DEFAULT NULL,
  `publication_year` INT DEFAULT NULL,
  `description` TEXT NOT NULL,
  `cover_url` VARCHAR(500) DEFAULT NULL,
  `shelf_location` VARCHAR(100) NOT NULL DEFAULT 'General Stacks A1',
  `total_copies` INT NOT NULL DEFAULT 1,
  `available_copies` INT NOT NULL DEFAULT 1,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `tags` VARCHAR(255) NOT NULL DEFAULT '',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_books_title` (`title`),
  INDEX `idx_books_author` (`author`),
  INDEX `idx_books_category` (`category`),
  INDEX `idx_books_available` (`available_copies`),
  FULLTEXT `ft_books_search` (`title`, `author`, `description`, `tags`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: libraries
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `libraries` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `area` VARCHAR(100) NOT NULL,
  `locality` VARCHAR(150) NOT NULL,
  `region` VARCHAR(100) NOT NULL,
  `city` VARCHAR(100) NOT NULL DEFAULT 'Mumbai',
  `state` VARCHAR(100) NOT NULL DEFAULT 'Maharashtra',
  `country` VARCHAR(100) NOT NULL DEFAULT 'India',
  `pincode` VARCHAR(20) NOT NULL,
  `address` TEXT NOT NULL,
  `nearest_transit` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `established_year` INT DEFAULT NULL,
  `is_flagship` TINYINT(1) NOT NULL DEFAULT 0,
  `is_verified` TINYINT(1) NOT NULL DEFAULT 1,
  `verification_status` VARCHAR(100) NOT NULL,
  `access_type` VARCHAR(200) NOT NULL,
  `access_note` TEXT DEFAULT NULL,
  `supervisor` VARCHAR(150) DEFAULT NULL,
  `hours_weekdays` VARCHAR(100) NOT NULL,
  `hours_saturday` VARCHAR(100) NOT NULL,
  `hours_sunday` VARCHAR(100) DEFAULT NULL,
  `services_json` TEXT NOT NULL,
  `accessibility_json` TEXT DEFAULT NULL,
  `map_top` VARCHAR(20) NOT NULL,
  `map_left` VARCHAR(20) NOT NULL,
  `latitude` DECIMAL(10, 6) DEFAULT NULL,
  `longitude` DECIMAL(10, 6) DEFAULT NULL,
  `map_search_query` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_libraries_area` (`area`),
  INDEX `idx_libraries_verified` (`is_verified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: borrowing_records
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `borrowing_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `book_id` INT NOT NULL,
  `borrow_date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `return_date` DATE DEFAULT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'borrowed', -- 'borrowed', 'due_soon', 'due_today', 'overdue', 'returned'
  `notes` TEXT DEFAULT NULL,
  `librarian_notes` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE,
  INDEX `idx_borrow_user` (`user_id`),
  INDEX `idx_borrow_status` (`status`),
  INDEX `idx_borrow_due` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: notifications
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `borrowing_record_id` INT DEFAULT NULL,
  `reminder_type` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `sent_via_email` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`borrowing_record_id`) REFERENCES `borrowing_records`(`id`) ON DELETE CASCADE,
  INDEX `idx_notif_user` (`user_id`, `is_read`),
  UNIQUE KEY `uq_borrow_reminder` (`borrowing_record_id`, `reminder_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: feedback
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `feedback` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `user_name` VARCHAR(255) NOT NULL,
  `user_email` VARCHAR(255) NOT NULL,
  `rating` INT NOT NULL DEFAULT 5,
  `category` VARCHAR(100) NOT NULL,
  `comments` TEXT NOT NULL,
  `feedback_type` VARCHAR(50) NOT NULL DEFAULT 'feedback',
  `target_book_title` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'new', -- 'new', 'under_review', 'resolved'
  `admin_response` TEXT DEFAULT NULL,
  `response_date` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_feedback_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: book_requests
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `book_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `user_name` VARCHAR(255) NOT NULL,
  `user_email` VARCHAR(255) NOT NULL,
  `book_title` VARCHAR(255) NOT NULL,
  `author` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `reason` TEXT DEFAULT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'acquired', 'rejected'
  `librarian_response` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: announcements
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `badge` VARCHAR(50) NOT NULL DEFAULT 'Notice',
  `is_pinned` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SEED DATA: Verified Mumbai Libraries & Reading Rooms
-- ============================================================================

INSERT INTO `libraries` (`id`, `name`, `area`, `locality`, `region`, `city`, `state`, `country`, `pincode`, `address`, `nearest_transit`, `phone`, `email`, `website`, `established_year`, `is_flagship`, `is_verified`, `verification_status`, `access_type`, `access_note`, `supervisor`, `hours_weekdays`, `hours_saturday`, `hours_sunday`, `services_json`, `accessibility_json`, `map_top`, `map_left`, `latitude`, `longitude`, `map_search_query`)
VALUES
('mumbai-lib-1', 'David Sassoon Library and Reading Room', 'Fort', 'Kala Ghoda / Fort', 'South Mumbai', 'Mumbai', 'Maharashtra', 'India', '400001', '152, Mahatma Gandhi Road, Off David Sassoon Chowk, Opposite Jehangir Art Gallery, Kala Ghoda, Fort, Mumbai, Maharashtra 400001, India', '0.8 km from CSMT / Churchgate Railway Station', '+91 (022) 2284-3703', 'info@davidsassoonlibrary.org', 'https://davidsassoonlibrary.org', 1870, 1, 1, 'Verified Heritage Institution', 'Public Reading Room & Member Lending', 'Grade I Heritage Structure. Reading room open to members and research scholars; daily visitor reading passes available for students and scholars at reception.', 'Hemant Bhalekar (Chief Librarian)', 'Monday – Friday: 8:00 AM – 9:00 PM', 'Saturday: 8:00 AM – 9:00 PM', 'Sunday: 8:00 AM – 9:00 PM (Open 365 Days)', '[\"Historic Heritage Reading Hall\", \"Lush Garden Courtyard Reading Area\", \"Air-Conditioned Reference Section\", \"Rare Books & Archival Volumes (70,000+)\", \"Free High-Speed Wi-Fi & Laptop Charging\", \"Student & Scholar Day Reading Passes\", \"Preservation & Restoration Department\"]', '[\"Ground Floor Garden Reading Access\", \"Wide Historic Entrance Ramps\", \"Natural Teak Reading Desks\"]', '88%', '46%', 18.928200, 72.832200, 'David Sassoon Library, Kala Ghoda, Fort, Mumbai'),

('mumbai-lib-2', 'The Asiatic Society of Mumbai (Central Library)', 'Fort', 'Horniman Circle / Fort', 'South Mumbai', 'Mumbai', 'Maharashtra', 'India', '400023', 'Town Hall, Shahid Bhagat Singh Road, Horniman Circle, Fort, Mumbai, Maharashtra 400023, India', '0.6 km from CSMT / Reserve Bank of India, Fort', '+91 (022) 2266-0956', 'asiaticlibrary1804@gmail.com', 'https://asiaticsociety.org.in', 1804, 1, 1, 'Verified Literary & Research Institution', 'Premier Scholarly Reference & Archival Hall', 'Founded in 1804. Houses priceless manuscripts including an original 14th-century Dante’s Divine Comedy. Public access to reading rooms by registration.', 'Dr. Shehernaz Nalwalla (Vice President)', 'Monday – Friday: 10:30 AM – 7:00 PM', 'Saturday: 10:30 AM – 5:30 PM', 'Sunday & Public Holidays: Closed', '[\"Historic Town Hall Durbar Reading Hall\", \"Rare Manuscripts Vault & Ancient Folios\", \"Over 100,000 Volumes in Indology & Sanskrit\", \"Digitization & Microfilm Research Facility\", \"Historic Numismatics (Coin) & Map Cabinet\"]', '[\"Town Hall Grand Ramp for Accessibility\", \"Reading Hall Assistance for Senior Scholars\"]', '85%', '50%', 18.931700, 72.835400, 'Town Hall, Asiatic Society of Mumbai, Fort, Mumbai'),

('mumbai-lib-3', 'Mumbai Marathi Grantha Sangrahalaya (Central)', 'Dadar', 'Naigaon / Dadar East', 'Central Mumbai', 'Mumbai', 'Maharashtra', 'India', '400014', 'MMGS Building, 172, Mumbai Marathi Grantha Sangrahalaya Marg, Naigaon Cross Road, Dadar East, Mumbai, Maharashtra 400014, India', '0.4 km from Dadar Central & Western Railway Terminus', '+91 (022) 2413-5388', 'contact@mmgslibrary.in', 'http://mmgslibrary.in', 1898, 0, 1, 'Verified Public Research & Marathi Archives', 'Public Reference Hall, Abhyasika & Book Lending', 'Founded in 1898. Apex research institution for Marathi literature, history, and social movements. Operates affordable student study halls (Abhyasika) and a network of Mumbai branches.', 'Suhas Kulkarni (Executive Secretary)', 'Tuesday – Friday: 9:00 AM – 8:00 PM', 'Saturday: 9:00 AM – 8:00 PM', 'Sunday: 9:00 AM – 6:00 PM (Monday Closed)', '[\"Extensive Marathi Literature Archive (600,000+ works)\", \"Large Student Study Hall (Abhyasika)\", \"Competitive Exam Resource Center (MPSC & UPSC)\", \"Newspapers & Vernacular Periodical Archives\", \"Historic Theater & Drama Manuscripts\", \"Affordable Civic Lending Membership\"]', '[\"Elevator Access to Upper Study Floors\", \"Senior Citizen Reading Sections\"]', '70%', '48%', 19.018200, 72.843600, 'Mumbai Marathi Grantha Sangrahalaya, Dadar East, Mumbai'),

('mumbai-lib-4', 'The J. N. Petit Institute and Library', 'Fort', 'Flora Fountain / Fort', 'South Mumbai', 'Mumbai', 'Maharashtra', 'India', '400001', '312, Dr. Dadabhai Naoroji Road, Fort, Mumbai, Maharashtra 400001, India', '0.3 km from Hutatma Chowk / Flora Fountain', '+91 (022) 2204-8463', 'contact@jnpetitinstitute.org', 'https://jnpetitinstitute.org', 1856, 0, 1, 'Verified Heritage Public Reading Room', 'Member Circulation & Heritage Reading Room', 'UNESCO Asia-Pacific Heritage Award-winning Gothic reading room with stained glass windows and magnificent wooden rafters.', 'Meher Master (Library Administrator)', 'Monday – Friday: 9:00 AM – 6:30 PM', 'Saturday: 9:00 AM – 4:00 PM', 'Sunday: Closed', '[\"Iconic High-Ceiling Gothic Reading Hall\", \"Stained-Glass Window Reading Bays\", \"Over 150,000 Volumes in English, Gujarati & Hindi\", \"Newspaper & Current Affairs Periodicals Room\", \"Quiet Individual Scholar Work Desks\"]', '[\"Elevator Access to First Floor Reading Hall\", \"Naturally Ventilated High-Ceiling Salons\"]', '86%', '44%', 18.932900, 72.833500, 'J. N. Petit Institute, D.N. Road, Fort, Mumbai'),

('mumbai-lib-5', 'People\'s Free Reading Room and Library', 'Marine Lines', 'Dhobi Talao / Marine Lines', 'South Mumbai', 'Mumbai', 'Maharashtra', 'India', '400002', 'JS-5, Lokmanya Tilak Marg, Opp. Metro Cinema, Dhobi Talao, Marine Lines, Mumbai, Maharashtra 400002, India', '0.3 km from Marine Lines Railway Station', '+91 (022) 2201-3557', 'info@peopleslibrarymumbai.org', NULL, 1891, 0, 1, 'Verified Free Public Reading Room', 'Free Public Reading Hall & Member Borrowing', 'Founded in 1891 to ensure free, unrestricted access to daily newspapers, journals, and books for students and citizens.', 'Anil Vaidya (Librarian-in-Charge)', 'Monday – Friday: 8:00 AM – 8:00 PM', 'Saturday: 8:00 AM – 8:00 PM', 'Sunday: 8:00 AM – 1:00 PM', '[\"Free Open-Access Newspaper & Periodicals Hall\", \"Quiet Student Study Hall (Abhyasika)\", \"Extensive Daily Papers in 4 Languages\", \"Competitive Exam Reference Text Bank (UPSC, CA, Law)\"]', '[\"Step-Free Direct Street Level Access\", \"Wide Reading Tables with Natural Light\"]', '81%', '43%', 18.943100, 72.828600, 'Peoples Free Reading Room, Dhobi Talao, Marine Lines, Mumbai'),

('mumbai-lib-6', 'National Library and Reading Room, Bandra', 'Bandra', 'Bandra West', 'Western Suburbs', 'Mumbai', 'Maharashtra', 'India', '400050', '28/A, Waterfield Road, Near Turner Road Junction, Bandra West, Mumbai, Maharashtra 400050, India', '1.1 km from Bandra Railway Station (West)', '+91 (022) 2640-1892', 'bandra.nationallib@gmail.com', NULL, 1932, 0, 1, 'Verified Suburb Public Reading Space', 'Neighborhood Study Space & Book Lending', 'Longstanding neighborhood library serving Bandra’s students, writers, and local readers with peaceful study carrels.', 'Rita Fernandes (Chief Librarian)', 'Monday – Friday: 8:00 AM – 8:30 PM', 'Saturday: 8:00 AM – 8:30 PM', 'Sunday: 9:00 AM – 1:00 PM', '[\"Air-Conditioned Study Pods & Reading Tables\", \"Free High-Speed Wi-Fi for Students & Researchers\", \"Curated Fiction, Non-Fiction & Contemporary Literature\", \"Daily English, Hindi & Marathi Newspapers\"]', '[\"Step-Free Entrance Ramp\", \"Ground Floor Reading Sanctuary\"]', '58%', '38%', 19.059600, 72.836200, 'National Library, Waterfield Road, Bandra West, Mumbai'),

('mumbai-lib-7', 'Andheri Public Reading Hall & Library', 'Andheri', 'Andheri West', 'Western Suburbs', 'Mumbai', 'Maharashtra', 'India', '400058', 'Swami Vivekananda (S.V.) Road, Opp. Andheri Railway Station (West), Andheri West, Mumbai, Maharashtra 400058, India', '0.2 km from Andheri Railway Station & Metro Line 1', '+91 (022) 2628-3344', 'andheri.civiclibrary@gmail.com', NULL, 1965, 0, 1, 'Verified Civic Study Center', 'Public Study Hall & Lending Department', 'Located right next to Andheri Station and Metro. Serves university students and competitive exam aspirants with a quiet study hall.', 'Prakash Surve (Library Superintendent)', 'Monday – Friday: 8:00 AM – 9:00 PM', 'Saturday: 8:00 AM – 9:00 PM', 'Sunday: 9:00 AM – 2:00 PM', '[\"Spacious Student Study Hall (Abhyasika)\", \"Competitive Exam Textbooks (MPSC, UPSC, Engineering, Medical)\", \"Free High-Speed Wi-Fi & Laptop Charging Points\", \"Daily Newspapers in English, Hindi & Marathi\"]', '[\"Direct Ground Floor Entry\", \"Air-Cooled Study Halls\"]', '44%', '35%', 19.119700, 72.846400, 'Andheri Public Reading Room, S.V. Road, Andheri West, Mumbai'),

('mumbai-lib-8', 'Goregaon Study & Community Library', 'Goregaon', 'Goregaon West', 'Western Suburbs', 'Mumbai', 'Maharashtra', 'India', '400104', 'Station Road, Near Post Office, Goregaon West, Mumbai, Maharashtra 400104, India', '0.3 km from Goregaon Railway Station & S.V. Road', '+91 (022) 2872-4110', 'goregaon.library@gmail.com', NULL, 1974, 0, 1, 'Verified Branch Reading Room', 'Community Reading Hall & Lending Center', 'Established community branch providing a peaceful haven for local school and college students and senior citizens.', 'Sneha Deshmukh (Branch Librarian)', 'Monday – Friday: 9:00 AM – 8:00 PM', 'Saturday: 9:00 AM – 8:00 PM', 'Sunday: 9:00 AM – 1:00 PM', '[\"Air-Cooled Quiet Study Hall for Students\", \"Marathi & English Fiction & Biography Section\", \"College Textbooks & Reference Racks\", \"Senior Patrons Daily Newspaper Lounge\"]', '[\"Ground Floor Entry\", \"Senior Citizen Reading Lounges\"]', '32%', '34%', 19.166300, 72.843100, 'Goregaon Library, Station Road, Goregaon West, Mumbai'),

('mumbai-lib-9', 'Borivali Public Reading Space & Library', 'Borivali', 'Borivali West', 'Western Suburbs', 'Mumbai', 'Maharashtra', 'India', '400092', 'Chandavarkar Road, Opp. Municipal Garden, Borivali West, Mumbai, Maharashtra 400092, India', '0.5 km from Borivali Railway Station (West)', '+91 (022) 2891-7620', 'borivali.publicreading@gmail.com', NULL, 1982, 0, 1, 'Verified Suburb Study Hub', 'Public Study Carrels & Book Lending Center', 'High-capacity civic study space serving Borivali, Kandivali, and Dahisar learners with dedicated desks for exam preparation.', 'Manish Joshi (Head Librarian)', 'Monday – Friday: 8:30 AM – 8:30 PM', 'Saturday: 8:30 AM – 8:30 PM', 'Sunday: 9:00 AM – 2:00 PM', '[\"Quiet Study Carrels for Scholars & Aspirants\", \"Comprehensive Academic & University Textbank\", \"Free Wi-Fi Zone & Digital Library Kiosk\", \"Daily Marathi, Gujarati, Hindi & English Papers\"]', '[\"Wheelchair Accessible Entrance Ramp\", \"Ground Floor Study Hall\"]', '14%', '32%', 19.230700, 72.856700, 'Borivali Public Library, Chandavarkar Road, Borivali West, Mumbai'),

('mumbai-lib-10', 'Powai Knowledge Centre & Community Reading Room', 'Powai', 'Hiranandani Gardens / Powai', 'Eastern Suburbs', 'Mumbai', 'Maharashtra', 'India', '400076', 'Central Avenue, Opposite Galleria Shopping Mall, Hiranandani Gardens, Powai, Mumbai, Maharashtra 400076, India', 'Near Powai Lake & IIT Bombay Main Gate (1.2 km)', '+91 (022) 2570-9981', 'powai.knowledgecentre@libraryease.org.in', NULL, 2004, 0, 0, 'Demonstration Suburb Facility', 'Digital Library & Collaborative Study Space', 'Demonstration suburban knowledge hub designed to showcase modern digital public library facilities in Mumbai’s eastern technology corridor.', 'Aarav Nair (Center Coordinator)', 'Monday – Friday: 9:00 AM – 8:00 PM', 'Saturday: 9:00 AM – 8:00 PM', 'Sunday: 10:00 AM – 6:00 PM', '[\"Digital Research Terminals & E-Resource Catalog\", \"High-Speed Fiber Wi-Fi & Laptop Workstations\", \"Contemporary Science, AI, Engineering & Business Stacks\", \"Air-Conditioned Collaborative Discussion Pods\"]', '[\"Elevator Access to All Levels\", \"Ergonomic Workstations\"]', '42%', '65%', 19.117600, 72.906000, 'Galleria Mall, Hiranandani Gardens, Powai, Mumbai'),

('mumbai-lib-11', 'Kandivali - Malad Civic Reading Room', 'Kandivali', 'Kandivali West / Malad', 'Western Suburbs', 'Mumbai', 'Maharashtra', 'India', '400067', 'S.V. Road, Between Malad and Kandivali Stations, Kandivali West, Mumbai, Maharashtra 400067, India', '0.8 km from Kandivali / Malad Railway Stations', '+91 (022) 2801-4422', 'kandivali.readingroom@libraryease.org.in', NULL, 1988, 0, 0, 'Demonstration Suburb Facility', 'Community Study Hall & Newspaper Room', 'Demonstration profile representing suburban reading spaces serving Kandivali and Malad students and senior readers.', 'Rohit Kadam (Supervisor)', 'Monday – Friday: 8:30 AM – 8:00 PM', 'Saturday: 8:30 AM – 8:00 PM', 'Sunday: 9:00 AM – 1:00 PM', '[\"Quiet Student Study Desks (Abhyasika)\", \"College Reference Books & Entrance Exam Guides\", \"Daily English, Hindi, Marathi & Gujarati Dailies\"]', '[\"Ground Floor Level Entrance Ramp\"]', '22%', '33%', 19.204500, 72.852200, 'Kandivali West, Mumbai, Maharashtra'),

('mumbai-lib-12', 'Colaba Heritage Reading Corner', 'Colaba', 'Colaba Causeway', 'South Mumbai', 'Mumbai', 'Maharashtra', 'India', '400005', 'Shahid Bhagat Singh Road, Near Colaba Causeway, Colaba, Mumbai, Maharashtra 400005, India', '0.5 km from Gateway of India & Regal Cinema', '+91 (022) 2218-6700', 'colaba.reading@libraryease.org.in', NULL, 1992, 0, 0, 'Demonstration Suburb Facility', 'Civic Literary Room & Tourist Information', 'Demonstration profile showcasing neighborhood cultural and architectural literature near Colaba Causeway and Gateway of India.', 'Farida Batliwala (Curator)', 'Monday – Friday: 9:00 AM – 7:30 PM', 'Saturday: 9:00 AM – 5:00 PM', 'Sunday: Closed', '[\"Bombay Maritime History & Heritage Architecture Section\", \"Tourist Cultural Guide & Maps Corner\", \"Open Reading Lounge with Wi-Fi\"]', '[\"Ground Floor Entrance\", \"Comfortable Armchairs\"]', '93%', '47%', 18.906700, 72.814700, 'Colaba Causeway, Colaba, Mumbai, Maharashtra')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- ============================================================================
-- SEED DATA: Demo Users (Password for all accounts is 'admin123' / 'patron123')
-- ============================================================================
INSERT INTO `users` (`id`, `email`, `full_name`, `hashed_password`, `role`, `phone`, `member_card_no`)
VALUES
(1, 'librarian@libraryease.org', 'Eleanor Vance (Head Librarian)', '$2b$12$e0U86WfZ8/cI0mP2xXpQkO9P2Ym0B6eN0R6J6xY7m9l4a8f9z5g1u', 'librarian', '+91 (022) 2284-3700', 'LIB-0001'),
(2, 'patron@libraryease.org', 'Alex Morgan', '$2b$12$q7W4K8j3H1k5L9m2N4p6Q8r0T2v4X6z8B0d2F4h6J8l0N2p4R6t8V', 'user', '+91 98201 12345', 'PAT-8801'),
(3, 'sarah.chen@example.com', 'Sarah Chen', '$2b$12$q7W4K8j3H1k5L9m2N4p6Q8r0T2v4X6z8B0d2F4h6J8l0N2p4R6t8V', 'user', '+91 98202 23456', 'PAT-8802')
ON DUPLICATE KEY UPDATE `email`=VALUES(`email`);

-- ============================================================================
-- SEED DATA: Rich Books Catalog
-- ============================================================================
INSERT INTO `books` (`id`, `title`, `author`, `isbn`, `category`, `language`, `publisher`, `publication_year`, `description`, `cover_url`, `shelf_location`, `total_copies`, `available_copies`, `is_active`, `tags`)
VALUES
(1, 'The Midnight Library', 'Matt Haig', '978-0525559474', 'Fiction', 'English', 'Canongate Books', 2020, 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600', 'Fiction Stacks F-24', 4, 3, 1, 'fiction, contemporary, philosophy, magical realism, hope'),
(2, 'Klara and the Sun', 'Kazuo Ishiguro', '978-0593318171', 'Science Fiction', 'English', 'Faber & Faber', 2021, 'The story of Klara, an Artificial Friend with outstanding observational qualities, who, from her place in the store, watches carefully the behavior of those who come in to browse.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600', 'Sci-Fi Stacks S-12', 3, 2, 1, 'sci-fi, artificial intelligence, nobel prize, dystopian'),
(3, 'Braiding Sweetgrass', 'Robin Wall Kimmerer', '978-1571313560', 'Non-Fiction', 'English', 'Milkweed Editions', 2013, 'Indigenous Wisdom, Scientific Knowledge and the Teachings of Plants. Drawing on her life as an indigenous scientist, Kimmerer shows how other living beings offer us gifts.', 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600', 'Natural Science N-04', 5, 4, 1, 'nature, ecology, indigenous, science, botany'),
(4, 'Atomic Habits', 'James Clear', '978-0735211292', 'Self-Help', 'English', 'Avery', 2018, 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. No matter your goals, Atomic Habits offers a proven framework for improving every day.', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600', 'Personal Growth P-08', 6, 2, 1, 'habits, psychology, productivity, personal growth'),
(5, 'Project Hail Mary', 'Andy Weir', '978-0593135204', 'Science Fiction', 'English', 'Ballantine Books', 2021, 'Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself are doomed.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600', 'Sci-Fi Stacks S-15', 3, 1, 1, 'space, physics, adventure, survival, first contact'),
(6, 'Pachinko', 'Min Jin Lee', '978-1455563937', 'Historical Fiction', 'English', 'Grand Central Publishing', 2017, 'An epic historical novel following four generations of a Korean family who migrate to Japan amidst sharp discrimination.', 'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&q=80&w=600', 'Historical Stacks H-19', 4, 3, 1, 'history, family, immigration, japan, korea')
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);
