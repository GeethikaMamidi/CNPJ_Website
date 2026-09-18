'use client';
import { v4 as uuidv4 } from 'uuid';

// ─── Helper ────────────────────────────────────────────────
export const generateId = () => uuidv4();

const STORAGE_KEY = 'techtatva_data';

// ─── Sample Data ───────────────────────────────────────────
function createSampleData() {
  // EVENTS
  const events = [
    { id: 'evt-1', name: 'RoboWars', category: 'Robotics', description: 'Build and battle robots in an arena', date: '2026-10-15', venue: 'Main Ground', maxMarks: 100, status: 'upcoming' },
    { id: 'evt-2', name: 'CodeSprint', category: 'Coding', description: '3-hour competitive programming contest', date: '2026-10-15', venue: 'CS Lab 1', maxMarks: 100, status: 'upcoming' },
    { id: 'evt-3', name: 'Circuit Design', category: 'Electronics', description: 'Design and implement innovative circuits', date: '2026-10-16', venue: 'ECE Lab', maxMarks: 100, status: 'upcoming' },
    { id: 'evt-4', name: 'AI Hackathon', category: 'Coding', description: '24-hour AI/ML hackathon', date: '2026-10-16', venue: 'Innovation Center', maxMarks: 100, status: 'upcoming' },
    { id: 'evt-5', name: 'Tech Quiz', category: 'General', description: 'Quiz on technology and science topics', date: '2026-10-17', venue: 'Auditorium', maxMarks: 100, status: 'upcoming' },
    { id: 'evt-6', name: 'Web Dev Challenge', category: 'Coding', description: 'Build a web application in 6 hours', date: '2026-10-17', venue: 'CS Lab 2', maxMarks: 100, status: 'upcoming' },
    { id: 'evt-7', name: 'Drone Racing', category: 'Robotics', description: 'FPV drone racing competition', date: '2026-10-18', venue: 'Sports Ground', maxMarks: 100, status: 'upcoming' },
    { id: 'evt-8', name: 'Paper Presentation', category: 'General', description: 'Present research papers on emerging tech', date: '2026-10-18', venue: 'Seminar Hall', maxMarks: 100, status: 'upcoming' },
  ];

  // JUDGES
  const judges = [
    { id: 'jdg-1', name: 'Dr. Ananya Sharma', email: 'ananya.sharma@univ.edu', phone: '9876543210', organization: 'University CSE Dept', designation: 'Professor' },
    { id: 'jdg-2', name: 'Prof. Rajesh Kumar', email: 'rajesh.kumar@univ.edu', phone: '9876543211', organization: 'University ECE Dept', designation: 'HOD' },
    { id: 'jdg-3', name: 'Ms. Priya Nair', email: 'priya.nair@infosys.com', phone: '9876543212', organization: 'Infosys', designation: 'Industry Expert' },
    { id: 'jdg-4', name: 'Dr. Vikram Patel', email: 'vikram.patel@univ.edu', phone: '9876543213', organization: 'University Mech Dept', designation: 'Professor' },
    { id: 'jdg-5', name: 'Mr. Suresh Menon', email: 'suresh@startupx.in', phone: '9876543214', organization: 'StartupX', designation: 'Founder & CEO' },
    { id: 'jdg-6', name: 'Dr. Kavitha Rao', email: 'kavitha.rao@univ.edu', phone: '9876543215', organization: 'University ISE Dept', designation: 'Professor' },
  ];

  // JUDGE ASSIGNMENTS
  const judgeAssignments = [
    { id: 'ja-1', judgeId: 'jdg-1', eventId: 'evt-2' },
    { id: 'ja-2', judgeId: 'jdg-1', eventId: 'evt-4' },
    { id: 'ja-3', judgeId: 'jdg-2', eventId: 'evt-3' },
    { id: 'ja-4', judgeId: 'jdg-2', eventId: 'evt-8' },
    { id: 'ja-5', judgeId: 'jdg-3', eventId: 'evt-6' },
    { id: 'ja-6', judgeId: 'jdg-3', eventId: 'evt-2' },
    { id: 'ja-7', judgeId: 'jdg-4', eventId: 'evt-1' },
    { id: 'ja-8', judgeId: 'jdg-4', eventId: 'evt-7' },
    { id: 'ja-9', judgeId: 'jdg-5', eventId: 'evt-4' },
    { id: 'ja-10', judgeId: 'jdg-5', eventId: 'evt-5' },
    { id: 'ja-11', judgeId: 'jdg-6', eventId: 'evt-5' },
    { id: 'ja-12', judgeId: 'jdg-6', eventId: 'evt-8' },
  ];

  // CRITERIA (per event)
  const criteria = [
    // RoboWars
    { id: 'cr-1', eventId: 'evt-1', name: 'Robot Design', maxMarks: 25, weight: 1, order: 1 },
    { id: 'cr-2', eventId: 'evt-1', name: 'Combat Performance', maxMarks: 35, weight: 1, order: 2 },
    { id: 'cr-3', eventId: 'evt-1', name: 'Innovation', maxMarks: 20, weight: 1, order: 3 },
    { id: 'cr-4', eventId: 'evt-1', name: 'Strategy', maxMarks: 20, weight: 1, order: 4 },
    // CodeSprint
    { id: 'cr-5', eventId: 'evt-2', name: 'Correctness', maxMarks: 40, weight: 1, order: 1 },
    { id: 'cr-6', eventId: 'evt-2', name: 'Efficiency', maxMarks: 30, weight: 1, order: 2 },
    { id: 'cr-7', eventId: 'evt-2', name: 'Code Quality', maxMarks: 30, weight: 1, order: 3 },
    // Circuit Design
    { id: 'cr-8', eventId: 'evt-3', name: 'Circuit Design', maxMarks: 30, weight: 1, order: 1 },
    { id: 'cr-9', eventId: 'evt-3', name: 'Functionality', maxMarks: 35, weight: 1, order: 2 },
    { id: 'cr-10', eventId: 'evt-3', name: 'Innovation', maxMarks: 20, weight: 1, order: 3 },
    { id: 'cr-11', eventId: 'evt-3', name: 'Presentation', maxMarks: 15, weight: 1, order: 4 },
    // AI Hackathon
    { id: 'cr-12', eventId: 'evt-4', name: 'Problem Solving', maxMarks: 30, weight: 1, order: 1 },
    { id: 'cr-13', eventId: 'evt-4', name: 'Model Accuracy', maxMarks: 30, weight: 1, order: 2 },
    { id: 'cr-14', eventId: 'evt-4', name: 'Innovation', maxMarks: 20, weight: 1, order: 3 },
    { id: 'cr-15', eventId: 'evt-4', name: 'Presentation', maxMarks: 20, weight: 1, order: 4 },
    // Tech Quiz
    { id: 'cr-16', eventId: 'evt-5', name: 'Quiz Score', maxMarks: 100, weight: 1, order: 1 },
    // Web Dev Challenge
    { id: 'cr-17', eventId: 'evt-6', name: 'UI/UX Design', maxMarks: 25, weight: 1, order: 1 },
    { id: 'cr-18', eventId: 'evt-6', name: 'Functionality', maxMarks: 30, weight: 1, order: 2 },
    { id: 'cr-19', eventId: 'evt-6', name: 'Code Quality', maxMarks: 25, weight: 1, order: 3 },
    { id: 'cr-20', eventId: 'evt-6', name: 'Creativity', maxMarks: 20, weight: 1, order: 4 },
    // Drone Racing
    { id: 'cr-21', eventId: 'evt-7', name: 'Race Time', maxMarks: 40, weight: 1, order: 1 },
    { id: 'cr-22', eventId: 'evt-7', name: 'Control Precision', maxMarks: 30, weight: 1, order: 2 },
    { id: 'cr-23', eventId: 'evt-7', name: 'Drone Build', maxMarks: 30, weight: 1, order: 3 },
    // Paper Presentation
    { id: 'cr-24', eventId: 'evt-8', name: 'Content Quality', maxMarks: 30, weight: 1, order: 1 },
    { id: 'cr-25', eventId: 'evt-8', name: 'Research Depth', maxMarks: 30, weight: 1, order: 2 },
    { id: 'cr-26', eventId: 'evt-8', name: 'Presentation Skills', maxMarks: 25, weight: 1, order: 3 },
    { id: 'cr-27', eventId: 'evt-8', name: 'Q&A Handling', maxMarks: 15, weight: 1, order: 4 },
  ];

  // PARTICIPANTS (3-5 per event)
  const participants = [
    // RoboWars
    { id: 'p-1', name: 'Arjun Reddy', teamName: 'Iron Fist', email: 'arjun@college.edu', phone: '9000000001', college: 'MIT Manipal', eventId: 'evt-1' },
    { id: 'p-2', name: 'Sneha Iyer', teamName: 'Mech Warriors', email: 'sneha@college.edu', phone: '9000000002', college: 'NIT Surathkal', eventId: 'evt-1' },
    { id: 'p-3', name: 'Rohan Das', teamName: 'Bot Crushers', email: 'rohan@college.edu', phone: '9000000003', college: 'RVCE Bangalore', eventId: 'evt-1' },
    { id: 'p-4', name: 'Meera Joshi', teamName: 'Steel Storm', email: 'meera@college.edu', phone: '9000000004', college: 'BMSCE Bangalore', eventId: 'evt-1' },
    // CodeSprint
    { id: 'p-5', name: 'Aditya Nair', teamName: 'Code Ninjas', email: 'aditya@college.edu', phone: '9000000005', college: 'IIT Madras', eventId: 'evt-2' },
    { id: 'p-6', name: 'Priyanka Kulkarni', teamName: 'Byte Busters', email: 'priyanka@college.edu', phone: '9000000006', college: 'NITK', eventId: 'evt-2' },
    { id: 'p-7', name: 'Karthik Menon', teamName: 'Algo Stars', email: 'karthik@college.edu', phone: '9000000007', college: 'PESIT', eventId: 'evt-2' },
    { id: 'p-8', name: 'Divya Sharma', teamName: 'Debug Devils', email: 'divya@college.edu', phone: '9000000008', college: 'VIT Vellore', eventId: 'evt-2' },
    { id: 'p-9', name: 'Varun Hegde', teamName: 'Syntax Error', email: 'varun@college.edu', phone: '9000000009', college: 'MIT Manipal', eventId: 'evt-2' },
    // Circuit Design
    { id: 'p-10', name: 'Anitha Raj', teamName: 'Circuit Wizards', email: 'anitha@college.edu', phone: '9000000010', college: 'NIT Trichy', eventId: 'evt-3' },
    { id: 'p-11', name: 'Saurabh Patil', teamName: 'Ohm Squad', email: 'saurabh@college.edu', phone: '9000000011', college: 'BMSCE', eventId: 'evt-3' },
    { id: 'p-12', name: 'Neha Gupta', teamName: 'Volt Makers', email: 'neha@college.edu', phone: '9000000012', college: 'RVCE', eventId: 'evt-3' },
    // AI Hackathon
    { id: 'p-13', name: 'Rahul Krishnan', teamName: 'Neural Nets', email: 'rahul@college.edu', phone: '9000000013', college: 'IIIT Hyderabad', eventId: 'evt-4' },
    { id: 'p-14', name: 'Pooja Venkat', teamName: 'Deep Thinkers', email: 'pooja@college.edu', phone: '9000000014', college: 'IIT Bombay', eventId: 'evt-4' },
    { id: 'p-15', name: 'Akash Shetty', teamName: 'Data Miners', email: 'akash@college.edu', phone: '9000000015', college: 'MIT Manipal', eventId: 'evt-4' },
    { id: 'p-16', name: 'Swathi Rao', teamName: 'AI Avengers', email: 'swathi@college.edu', phone: '9000000016', college: 'PESIT', eventId: 'evt-4' },
    // Tech Quiz
    { id: 'p-17', name: 'Vijay Kumar', teamName: 'Quiz Masters', email: 'vijay@college.edu', phone: '9000000017', college: 'NIT Calicut', eventId: 'evt-5' },
    { id: 'p-18', name: 'Lakshmi Pillai', teamName: 'Brain Storm', email: 'lakshmi@college.edu', phone: '9000000018', college: 'MIT Manipal', eventId: 'evt-5' },
    { id: 'p-19', name: 'Manish Agarwal', teamName: 'Tech Titans', email: 'manish@college.edu', phone: '9000000019', college: 'BITS Pilani', eventId: 'evt-5' },
    // Web Dev Challenge
    { id: 'p-20', name: 'Riya Desai', teamName: 'Pixel Perfect', email: 'riya@college.edu', phone: '9000000020', college: 'RVCE', eventId: 'evt-6' },
    { id: 'p-21', name: 'Nikhil Bhat', teamName: 'Full Stack Heroes', email: 'nikhil@college.edu', phone: '9000000021', college: 'NITK', eventId: 'evt-6' },
    { id: 'p-22', name: 'Ananya Mohan', teamName: 'Web Wizards', email: 'ananya@college.edu', phone: '9000000022', college: 'MIT Manipal', eventId: 'evt-6' },
    { id: 'p-23', name: 'Siddharth Gowda', teamName: 'Code Crafters', email: 'sid@college.edu', phone: '9000000023', college: 'BMSCE', eventId: 'evt-6' },
    // Drone Racing
    { id: 'p-24', name: 'Tarun Nayak', teamName: 'Sky Hawks', email: 'tarun@college.edu', phone: '9000000024', college: 'MIT Manipal', eventId: 'evt-7' },
    { id: 'p-25', name: 'Kavya Hegde', teamName: 'Aero Blitz', email: 'kavya@college.edu', phone: '9000000025', college: 'NIT Surathkal', eventId: 'evt-7' },
    { id: 'p-26', name: 'Pranav Shenoy', teamName: 'Drone Masters', email: 'pranav@college.edu', phone: '9000000026', college: 'PESIT', eventId: 'evt-7' },
    // Paper Presentation
    { id: 'p-27', name: 'Gayathri Nair', teamName: null, email: 'gayathri@college.edu', phone: '9000000027', college: 'IIT Madras', eventId: 'evt-8' },
    { id: 'p-28', name: 'Abhishek Jain', teamName: null, email: 'abhishek@college.edu', phone: '9000000028', college: 'BITS Pilani', eventId: 'evt-8' },
    { id: 'p-29', name: 'Shreya Kamath', teamName: null, email: 'shreya@college.edu', phone: '9000000029', college: 'MIT Manipal', eventId: 'evt-8' },
    { id: 'p-30', name: 'Harish Bhaskar', teamName: null, email: 'harish@college.edu', phone: '9000000030', college: 'RVCE', eventId: 'evt-8' },
  ];

  // VENDORS
  const vendors = [
    { id: 'vnd-1', name: 'Trophy World', contactPerson: 'Ramesh Shetty', phone: '9800000001', email: 'info@trophyworld.in', address: 'Mangalore', paymentStatus: 'pending', deliveryStatus: 'pending', notes: '' },
    { id: 'vnd-2', name: 'PrintHub Solutions', contactPerson: 'Sunil Rao', phone: '9800000002', email: 'orders@printhub.in', address: 'Bangalore', paymentStatus: 'pending', deliveryStatus: 'pending', notes: '' },
    { id: 'vnd-3', name: 'GiftCraft India', contactPerson: 'Meena Kumari', phone: '9800000003', email: 'sales@giftcraft.in', address: 'Udupi', paymentStatus: 'pending', deliveryStatus: 'pending', notes: '' },
    { id: 'vnd-4', name: 'TechMerch Co.', contactPerson: 'Anil Kumar', phone: '9800000004', email: 'contact@techmerch.co', address: 'Manipal', paymentStatus: 'pending', deliveryStatus: 'pending', notes: '' },
  ];

  // PRIZES
  const prizes = [
    { id: 'prz-1', eventId: 'evt-1', category: 'Robotics', position: '1st', prizeName: 'Winner Trophy + Cash Prize', prizeType: 'Trophy + Cash', quantity: 1, unitPrice: 5000, totalCost: 5000, vendorId: 'vnd-1', status: 'pending', notes: '' },
    { id: 'prz-2', eventId: 'evt-1', category: 'Robotics', position: '2nd', prizeName: 'Runner-up Trophy', prizeType: 'Trophy', quantity: 1, unitPrice: 3000, totalCost: 3000, vendorId: 'vnd-1', status: 'pending', notes: '' },
    { id: 'prz-3', eventId: 'evt-1', category: 'Robotics', position: '3rd', prizeName: 'Second Runner-up Trophy', prizeType: 'Trophy', quantity: 1, unitPrice: 2000, totalCost: 2000, vendorId: 'vnd-1', status: 'pending', notes: '' },
    { id: 'prz-4', eventId: 'evt-2', category: 'Coding', position: '1st', prizeName: 'Winner Trophy + Cash Prize', prizeType: 'Trophy + Cash', quantity: 1, unitPrice: 5000, totalCost: 5000, vendorId: 'vnd-1', status: 'pending', notes: '' },
    { id: 'prz-5', eventId: 'evt-2', category: 'Coding', position: '2nd', prizeName: 'Runner-up Trophy', prizeType: 'Trophy', quantity: 1, unitPrice: 3000, totalCost: 3000, vendorId: 'vnd-1', status: 'pending', notes: '' },
    { id: 'prz-6', eventId: 'evt-2', category: 'Coding', position: '3rd', prizeName: 'Second Runner-up Medal', prizeType: 'Medal', quantity: 1, unitPrice: 1500, totalCost: 1500, vendorId: 'vnd-1', status: 'pending', notes: '' },
    { id: 'prz-7', eventId: 'evt-3', category: 'Electronics', position: '1st', prizeName: 'Winner Trophy + Cash Prize', prizeType: 'Trophy + Cash', quantity: 1, unitPrice: 5000, totalCost: 5000, vendorId: 'vnd-1', status: 'pending', notes: '' },
    { id: 'prz-8', eventId: 'evt-3', category: 'Electronics', position: '2nd', prizeName: 'Runner-up Trophy', prizeType: 'Trophy', quantity: 1, unitPrice: 3000, totalCost: 3000, vendorId: 'vnd-1', status: 'pending', notes: '' },
    { id: 'prz-9', eventId: 'evt-4', category: 'Coding', position: '1st', prizeName: 'Winner Trophy + Cash Prize', prizeType: 'Trophy + Cash', quantity: 1, unitPrice: 7000, totalCost: 7000, vendorId: 'vnd-1', status: 'pending', notes: '' },
    { id: 'prz-10', eventId: 'evt-4', category: 'Coding', position: '2nd', prizeName: 'Runner-up Trophy', prizeType: 'Trophy', quantity: 1, unitPrice: 4000, totalCost: 4000, vendorId: 'vnd-1', status: 'pending', notes: '' },
    { id: 'prz-11', eventId: 'evt-4', category: 'Coding', position: '3rd', prizeName: 'Second Runner-up Medal', prizeType: 'Medal', quantity: 1, unitPrice: 2000, totalCost: 2000, vendorId: 'vnd-1', status: 'pending', notes: '' },
    { id: 'prz-12', eventId: 'evt-5', category: 'General', position: '1st', prizeName: 'Winner Trophy', prizeType: 'Trophy', quantity: 1, unitPrice: 3000, totalCost: 3000, vendorId: 'vnd-1', status: 'pending', notes: '' },
    { id: 'prz-13', eventId: 'evt-5', category: 'General', position: '2nd', prizeName: 'Runner-up Medal', prizeType: 'Medal', quantity: 1, unitPrice: 1500, totalCost: 1500, vendorId: 'vnd-1', status: 'pending', notes: '' },
    { id: 'prz-14', eventId: 'evt-6', category: 'Coding', position: '1st', prizeName: 'Winner Trophy + Cash Prize', prizeType: 'Trophy + Cash', quantity: 1, unitPrice: 5000, totalCost: 5000, vendorId: 'vnd-1', status: 'pending', notes: '' },
    { id: 'prz-15', eventId: 'evt-6', category: 'Coding', position: '2nd', prizeName: 'Runner-up Trophy', prizeType: 'Trophy', quantity: 1, unitPrice: 3000, totalCost: 3000, vendorId: 'vnd-1', status: 'pending', notes: '' },
    { id: 'prz-16', eventId: 'evt-7', category: 'Robotics', position: '1st', prizeName: 'Winner Trophy + Cash Prize', prizeType: 'Trophy + Cash', quantity: 1, unitPrice: 5000, totalCost: 5000, vendorId: 'vnd-1', status: 'pending', notes: '' },
    { id: 'prz-17', eventId: 'evt-7', category: 'Robotics', position: '2nd', prizeName: 'Runner-up Trophy', prizeType: 'Trophy', quantity: 1, unitPrice: 3000, totalCost: 3000, vendorId: 'vnd-1', status: 'pending', notes: '' },
    { id: 'prz-18', eventId: 'evt-8', category: 'General', position: '1st', prizeName: 'Winner Trophy + Certificate', prizeType: 'Trophy', quantity: 1, unitPrice: 3500, totalCost: 3500, vendorId: 'vnd-1', status: 'pending', notes: '' },
    { id: 'prz-19', eventId: 'evt-8', category: 'General', position: '2nd', prizeName: 'Runner-up Certificate', prizeType: 'Certificate', quantity: 1, unitPrice: 1000, totalCost: 1000, vendorId: 'vnd-2', status: 'pending', notes: '' },
  ];

  // MEMENTOS
  const mementos = [
    { id: 'mem-1', name: 'Judge Memento', type: 'Memento', vendorId: 'vnd-3', quantityRequired: 6, quantityReceived: 0, unitPrice: 1500, totalCost: 9000, status: 'ordered', notes: 'Personalized plaques for each judge' },
    { id: 'mem-2', name: 'Guest Speaker Memento', type: 'Memento', vendorId: 'vnd-3', quantityRequired: 4, quantityReceived: 0, unitPrice: 2000, totalCost: 8000, status: 'ordered', notes: '' },
    { id: 'mem-3', name: 'Volunteer T-Shirts', type: 'Merchandise', vendorId: 'vnd-4', quantityRequired: 50, quantityReceived: 0, unitPrice: 350, totalCost: 17500, status: 'ordered', notes: 'Custom printed TechTatva t-shirts' },
    { id: 'mem-4', name: 'Participant Certificates', type: 'Certificate', vendorId: 'vnd-2', quantityRequired: 150, quantityReceived: 0, unitPrice: 30, totalCost: 4500, status: 'pending', notes: 'Printed participation certificates' },
    { id: 'mem-5', name: 'Organizer Badges', type: 'Utility', vendorId: 'vnd-2', quantityRequired: 30, quantityReceived: 0, unitPrice: 100, totalCost: 3000, status: 'ordered', notes: 'ID badges with lanyards' },
    { id: 'mem-6', name: 'Event Banners', type: 'Utility', vendorId: 'vnd-2', quantityRequired: 10, quantityReceived: 0, unitPrice: 800, totalCost: 8000, status: 'pending', notes: 'Flex banners for each event' },
  ];

  // OTHER ITEMS
  const otherItems = [
    { id: 'oi-1', name: 'Participation Medals', type: 'Medal', eventId: null, vendorId: 'vnd-1', quantityRequired: 30, quantityReceived: 0, unitPrice: 200, totalCost: 6000, status: 'pending', notes: 'For all finalists' },
    { id: 'oi-2', name: 'Certificate Frames', type: 'Misc', eventId: null, vendorId: 'vnd-3', quantityRequired: 20, quantityReceived: 0, unitPrice: 250, totalCost: 5000, status: 'pending', notes: 'For winner certificates' },
    { id: 'oi-3', name: 'Event Standees', type: 'Misc', eventId: null, vendorId: 'vnd-2', quantityRequired: 8, quantityReceived: 0, unitPrice: 1200, totalCost: 9600, status: 'pending', notes: 'Roll-up standees for each event' },
    { id: 'oi-4', name: 'Gift Hampers', type: 'Gift', eventId: null, vendorId: 'vnd-3', quantityRequired: 10, quantityReceived: 0, unitPrice: 500, totalCost: 5000, status: 'pending', notes: 'For special winners' },
  ];

  // EVALUATIONS & SCORES (empty initially — judges will fill these)
  const evaluations = [];
  const scores = [];
  const results = [];

  return {
    events,
    judges,
    judgeAssignments,
    criteria,
    participants,
    vendors,
    prizes,
    mementos,
    otherItems,
    evaluations,
    scores,
    results,
  };
}

// ─── LocalStorage Data Store ───────────────────────────────

function loadData() {
  if (typeof window === 'undefined') return createSampleData();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load data from localStorage:', e);
  }
  const sample = createSampleData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
  return sample;
}

function persistData(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to persist data:', e);
  }
}

function getData() {
  return loadData();
}

function updateCollection(collectionName, updater) {
  const data = getData();
  data[collectionName] = updater(data[collectionName]);
  persistData(data);
  return data[collectionName];
}

// ─── Events ────────────────────────────────────────────────
export function getEvents() { return getData().events || []; }
export function getEvent(id) { return getEvents().find(e => e.id === id) || null; }
export function saveEvent(event) {
  return updateCollection('events', (items) => {
    const idx = items.findIndex(e => e.id === event.id);
    if (idx >= 0) { items[idx] = { ...items[idx], ...event }; }
    else { items.push({ ...event, id: event.id || generateId() }); }
    return items;
  });
}
export function deleteEvent(id) {
  return updateCollection('events', items => items.filter(e => e.id !== id));
}

// ─── Judges ────────────────────────────────────────────────
export function getJudges() { return getData().judges || []; }
export function getJudge(id) { return getJudges().find(j => j.id === id) || null; }
export function saveJudge(judge) {
  return updateCollection('judges', (items) => {
    const idx = items.findIndex(j => j.id === judge.id);
    if (idx >= 0) { items[idx] = { ...items[idx], ...judge }; }
    else { items.push({ ...judge, id: judge.id || generateId() }); }
    return items;
  });
}
export function deleteJudge(id) {
  return updateCollection('judges', items => items.filter(j => j.id !== id));
}

// ─── Participants ──────────────────────────────────────────
export function getParticipants(eventId) {
  const all = getData().participants || [];
  return eventId ? all.filter(p => p.eventId === eventId) : all;
}
export function getParticipant(id) { return (getData().participants || []).find(p => p.id === id) || null; }
export function saveParticipant(participant) {
  return updateCollection('participants', (items) => {
    const idx = items.findIndex(p => p.id === participant.id);
    if (idx >= 0) { items[idx] = { ...items[idx], ...participant }; }
    else { items.push({ ...participant, id: participant.id || generateId() }); }
    return items;
  });
}
export function deleteParticipant(id) {
  return updateCollection('participants', items => items.filter(p => p.id !== id));
}

// ─── Criteria ──────────────────────────────────────────────
export function getCriteria(eventId) {
  const all = getData().criteria || [];
  return eventId ? all.filter(c => c.eventId === eventId).sort((a,b) => a.order - b.order) : all;
}
export function getCriterion(id) { return (getData().criteria || []).find(c => c.id === id) || null; }
export function saveCriterion(criterion) {
  return updateCollection('criteria', (items) => {
    const idx = items.findIndex(c => c.id === criterion.id);
    if (idx >= 0) { items[idx] = { ...items[idx], ...criterion }; }
    else { items.push({ ...criterion, id: criterion.id || generateId() }); }
    return items;
  });
}
export function deleteCriterion(id) {
  return updateCollection('criteria', items => items.filter(c => c.id !== id));
}

// ─── Judge Assignments ─────────────────────────────────────
export function getJudgeAssignments(judgeId) {
  const all = getData().judgeAssignments || [];
  return judgeId ? all.filter(a => a.judgeId === judgeId) : all;
}
export function saveJudgeAssignment(assignment) {
  return updateCollection('judgeAssignments', (items) => {
    const exists = items.find(a => a.judgeId === assignment.judgeId && a.eventId === assignment.eventId);
    if (exists) return items;
    items.push({ ...assignment, id: assignment.id || generateId() });
    return items;
  });
}
export function deleteJudgeAssignment(id) {
  return updateCollection('judgeAssignments', items => items.filter(a => a.id !== id));
}

// ─── Evaluations ───────────────────────────────────────────
export function getEvaluations(filters) {
  let all = getData().evaluations || [];
  if (filters) {
    if (filters.judgeId) all = all.filter(e => e.judgeId === filters.judgeId);
    if (filters.eventId) all = all.filter(e => e.eventId === filters.eventId);
    if (filters.participantId) all = all.filter(e => e.participantId === filters.participantId);
    if (filters.status) all = all.filter(e => e.status === filters.status);
  }
  return all;
}
export function getEvaluation(id) { return (getData().evaluations || []).find(e => e.id === id) || null; }
export function saveEvaluation(evaluation) {
  return updateCollection('evaluations', (items) => {
    const idx = items.findIndex(e => e.id === evaluation.id);
    if (idx >= 0) { items[idx] = { ...items[idx], ...evaluation, updatedAt: new Date().toISOString() }; }
    else { items.push({ ...evaluation, id: evaluation.id || generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); }
    return items;
  });
}
export function deleteEvaluation(id) {
  return updateCollection('evaluations', items => items.filter(e => e.id !== id));
}

// ─── Scores ────────────────────────────────────────────────
export function getScores(evaluationId) {
  const all = getData().scores || [];
  return evaluationId ? all.filter(s => s.evaluationId === evaluationId) : all;
}
export function saveScore(score) {
  return updateCollection('scores', (items) => {
    const idx = items.findIndex(s => s.evaluationId === score.evaluationId && s.criterionId === score.criterionId);
    if (idx >= 0) { items[idx] = { ...items[idx], ...score }; }
    else { items.push({ ...score, id: score.id || generateId() }); }
    return items;
  });
}
export function saveScoresBatch(scoresToSave) {
  return updateCollection('scores', (items) => {
    scoresToSave.forEach(score => {
      const idx = items.findIndex(s => s.evaluationId === score.evaluationId && s.criterionId === score.criterionId);
      if (idx >= 0) { items[idx] = { ...items[idx], ...score }; }
      else { items.push({ ...score, id: score.id || generateId() }); }
    });
    return items;
  });
}

// ─── Results ───────────────────────────────────────────────
export function getResults(eventId) {
  const all = getData().results || [];
  return eventId ? all.filter(r => r.eventId === eventId) : all;
}
export function saveResult(result) {
  return updateCollection('results', (items) => {
    const idx = items.findIndex(r => r.id === result.id);
    if (idx >= 0) { items[idx] = { ...items[idx], ...result }; }
    else { items.push({ ...result, id: result.id || generateId() }); }
    return items;
  });
}
export function saveResultsBatch(resultsToSave) {
  return updateCollection('results', (items) => {
    resultsToSave.forEach(result => {
      const idx = items.findIndex(r => r.eventId === result.eventId && r.participantId === result.participantId);
      if (idx >= 0) { items[idx] = { ...items[idx], ...result }; }
      else { items.push({ ...result, id: result.id || generateId() }); }
    });
    return items;
  });
}
export function clearResults(eventId) {
  return updateCollection('results', items => items.filter(r => r.eventId !== eventId));
}

// ─── Vendors ───────────────────────────────────────────────
export function getVendors() { return getData().vendors || []; }
export function getVendor(id) { return getVendors().find(v => v.id === id) || null; }
export function saveVendor(vendor) {
  return updateCollection('vendors', (items) => {
    const idx = items.findIndex(v => v.id === vendor.id);
    if (idx >= 0) { items[idx] = { ...items[idx], ...vendor }; }
    else { items.push({ ...vendor, id: vendor.id || generateId() }); }
    return items;
  });
}
export function deleteVendor(id) {
  return updateCollection('vendors', items => items.filter(v => v.id !== id));
}

// ─── Prizes ────────────────────────────────────────────────
export function getPrizes(eventId) {
  const all = getData().prizes || [];
  return eventId ? all.filter(p => p.eventId === eventId) : all;
}
export function getPrize(id) { return (getData().prizes || []).find(p => p.id === id) || null; }
export function savePrize(prize) {
  return updateCollection('prizes', (items) => {
    const idx = items.findIndex(p => p.id === prize.id);
    if (idx >= 0) { items[idx] = { ...items[idx], ...prize }; }
    else { items.push({ ...prize, id: prize.id || generateId() }); }
    return items;
  });
}
export function deletePrize(id) {
  return updateCollection('prizes', items => items.filter(p => p.id !== id));
}

// ─── Mementos ──────────────────────────────────────────────
export function getMementos() { return getData().mementos || []; }
export function getMemento(id) { return getMementos().find(m => m.id === id) || null; }
export function saveMemento(memento) {
  return updateCollection('mementos', (items) => {
    const idx = items.findIndex(m => m.id === memento.id);
    if (idx >= 0) { items[idx] = { ...items[idx], ...memento }; }
    else { items.push({ ...memento, id: memento.id || generateId() }); }
    return items;
  });
}
export function deleteMemento(id) {
  return updateCollection('mementos', items => items.filter(m => m.id !== id));
}

// ─── Other Items ───────────────────────────────────────────
export function getOtherItems() { return getData().otherItems || []; }
export function getOtherItem(id) { return getOtherItems().find(i => i.id === id) || null; }
export function saveOtherItem(item) {
  return updateCollection('otherItems', (items) => {
    const idx = items.findIndex(i => i.id === item.id);
    if (idx >= 0) { items[idx] = { ...items[idx], ...item }; }
    else { items.push({ ...item, id: item.id || generateId() }); }
    return items;
  });
}
export function deleteOtherItem(id) {
  return updateCollection('otherItems', items => items.filter(i => i.id !== id));
}

// ─── Dashboard Stats ──────────────────────────────────────
export function getDashboardStats() {
  const data = getData();
  const events = data.events || [];
  const judges = data.judges || [];
  const participants = data.participants || [];
  const evaluations = data.evaluations || [];
  const results = data.results || [];
  const prizes = data.prizes || [];
  const mementos = data.mementos || [];
  const vendors = data.vendors || [];
  const otherItems = data.otherItems || [];

  const completedEvaluations = evaluations.filter(e => e.status === 'submitted').length;
  const totalExpectedEvaluations = (data.judgeAssignments || []).reduce((sum, ja) => {
    return sum + participants.filter(p => p.eventId === ja.eventId).length;
  }, 0);
  const pendingEvaluations = totalExpectedEvaluations - completedEvaluations;
  const eventsWithResults = new Set(results.map(r => r.eventId)).size;

  const totalPrizeCost = prizes.reduce((s, p) => s + (p.totalCost || 0), 0);
  const totalMementoCost = mementos.reduce((s, m) => s + (m.totalCost || 0), 0);
  const totalOtherCost = otherItems.reduce((s, i) => s + (i.totalCost || 0), 0);
  const totalExpenditure = totalPrizeCost + totalMementoCost + totalOtherCost;

  return {
    totalEvents: events.length,
    totalJudges: judges.length,
    totalParticipants: participants.length,
    evaluationsCompleted: completedEvaluations,
    pendingEvaluations: Math.max(0, pendingEvaluations),
    winnersFinalized: eventsWithResults,
    totalPrizes: prizes.length,
    totalMementos: mementos.length,
    totalVendors: vendors.length,
    totalExpenditure,
    totalPrizeCost,
    totalMementoCost,
    totalOtherCost,
  };
}

// ─── Reset Data ────────────────────────────────────────────
export function resetData() {
  const sample = createSampleData();
  persistData(sample);
  return sample;
}
