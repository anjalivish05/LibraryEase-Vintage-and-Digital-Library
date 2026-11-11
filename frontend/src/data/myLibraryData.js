export const DEMO_USER = {
  name: 'Eleanor Vance',
  cardNumber: 'LIB-2026-8841',
  memberSince: 'October 2021',
  homeBranch: 'David Sassoon Library, Fort',
  tier: 'Resident Patron',
  standing: 'Good Standing — No Fines',
  activeLoansCount: 3,
  holdsCount: 1,
  savedBooksCount: 4
};

export const INITIAL_BORROWED_BOOKS = [
  {
    id: 'loan-1',
    bookId: 'book-1',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    borrowDate: '2026-10-15',
    dueDate: '2026-11-05',
    daysLeft: 8,
    format: 'Physical Hardcover',
    branch: 'David Sassoon Library, Fort',
    renewalsRemaining: 2,
    callNumber: '823.92 HAI',
    status: 'Active — Due in 8 days',
    statusColor: 'success'
  },
  {
    id: 'loan-2',
    bookId: 'book-3',
    title: 'Braiding Sweetgrass',
    author: 'Robin Wall Kimmerer',
    borrowDate: '2026-10-08',
    dueDate: '2026-10-31',
    daysLeft: 3,
    format: 'Physical Paperback',
    branch: 'David Sassoon Library, Fort',
    renewalsRemaining: 1,
    callNumber: '508.7 KIM',
    status: 'Notice — Due in 3 days',
    statusColor: 'warning'
  },
  {
    id: 'loan-3',
    bookId: 'book-5',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    borrowDate: '2026-10-20',
    dueDate: '2026-11-10',
    daysLeft: 13,
    format: 'Digital eBook (Cloud Reader)',
    branch: 'Digital Collection',
    renewalsRemaining: 3,
    callNumber: '813.6 WEI',
    status: 'Active — Due in 13 days',
    statusColor: 'success'
  }
];

export const DEMO_HOLDS = [
  {
    id: 'hold-1',
    bookId: 'book-4',
    title: 'Atomic Habits',
    author: 'James Clear',
    requestDate: '2026-10-22',
    queuePosition: 2,
    estimatedPickupDate: 'Approx. Nov 8, 2026',
    pickupBranch: 'David Sassoon Library, Fort',
    format: 'Physical Hardcover'
  }
];

export const DEMO_HISTORY = [
  {
    title: 'The Song of Achilles',
    author: 'Madeline Miller',
    returnedDate: '2026-10-02',
    ratingGiven: 5
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    returnedDate: '2026-09-14',
    ratingGiven: 4
  },
  {
    title: 'A Gentleman in Moscow',
    author: 'Amor Towles',
    returnedDate: '2026-08-28',
    ratingGiven: 5
  }
];
