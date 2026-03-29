import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════════
// CUIScheduler Comprehensive Seed — SP-26
// 9 departments, 67 sections, 160+ faculty, 130+ courses, timetable
// ═══════════════════════════════════════════════════════════════════

const DEPT_MAP = {
  CS: "Computer Science",
  SE: "Software Engineering",
  EE: "Electrical Engineering",
  ME: "Mechanical Engineering",
  CE: "Civil Engineering",
  AI: "Artificial Intelligence",
  BCE: "Computer Engineering",
  PSY: "Psychology",
  MGT: "Management Sciences",
  MTH: "Mathematics",
  PHY: "Physics",
  HUM: "Humanities",
  CHM: "Chemistry",
};

const TIME_SLOTS = [
  { start: "08:30", end: "09:30" }, // slotIndex 0
  { start: "09:35", end: "10:35" }, // slotIndex 1
  { start: "10:40", end: "11:40" }, // slotIndex 2
  { start: "11:45", end: "12:45" }, // slotIndex 3
  { start: "13:20", end: "14:20" }, // slotIndex 4
  { start: "14:25", end: "15:25" }, // slotIndex 5
  { start: "15:30", end: "16:30" }, // slotIndex 6
];

async function main() {
  console.log("Seeding CUIScheduler database (SP-26) - Comprehensive...\n");

  // Clear existing data in reverse dependency order
  await prisma.changeRequest.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.timetableEntry.deleteMany();
  await prisma.courseOffering.deleteMany();
  await prisma.section.deleteMany();
  await prisma.course.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.user.deleteMany();
  await prisma.semester.deleteMany();
  console.log("Cleared existing data.\n");

  // ─── 1. USERS ──────────────────────────────────────────────────
  const adminPw = await bcrypt.hash("Admin@123", 10);
  const facultyPw = await bcrypt.hash("faculty@123", 10);
  const studentPw = await bcrypt.hash("Student@123", 10);

  // Faculty data: [name, department key]
  const facultyData = [
    // CS Department
    ["Taimoor Sajjad", "CS"],
    ["Nadir Shah", "CS"],
    ["Mamuna Fatima", "CS"],
    ["Muhammad Khalil Afzal", "CS"],
    ["Umair Hassan", "CS"],
    ["Samia Zaffar", "CS"],
    ["Faisal Shafique Butt", "CS"],
    ["Beenish Noor", "CS"],
    ["Muhammad Nadeem", "CS"],
    ["Alamdar Hussain", "CS"],
    ["Hafiz Obaid Ullah Mehmood", "CS"],
    ["Tooba Tehreem", "CS"],
    ["Javaria Umbreen", "CS"],
    ["Marwa Khanam", "CS"],
    ["Muhammad Sharif", "CS"],
    ["Sania Umer", "CS"],
    ["Arubah Hussain", "CS"],
    ["Kamran Ali Akhtar", "CS"],
    ["Mian Muhammad Talha", "CS"],
    ["Fatima Farooq", "CS"],
    ["Nosheen Atif", "CS"],
    ["Zain ul Abidin", "CS"],
    ["Hira Anwar", "CS"],
    ["Sajid Ali", "CS"],
    ["Madiha Liaqat", "CS"],
    ["Tayyaba Zainab", "CS"],
    ["Zeeshan Khan", "CS"],
    ["Usman Ghani", "CS"],
    ["Aqeel Iqbal", "CS"],
    ["Raheel Ahmad", "CS"],
    ["Shafiq Ahmad", "CS"],
    ["Adeel Baig", "CS"],
    ["Waqar Ahmed", "CS"],
    ["Amna Bibi", "CS"],
    ["Asad Ullah", "CS"],
    ["Bilal Hassan", "CS"],
    ["Fahad Maqbool", "CS"],
    ["Ghulam Mustafa", "CS"],
    ["Imran Sarwar", "CS"],
    ["Kashif Munir", "CS"],
    // SE Department
    ["Sarah Amjad", "SE"],
    ["Sidra Sultana", "SE"],
    ["Ali Raza Bhatti", "SE"],
    ["Nadia Kanwal", "SE"],
    ["Zubair Ahmed", "SE"],
    ["Farhan Aslam", "SE"],
    ["Qasim Shah", "SE"],
    ["Uzma Ashraf", "SE"],
    ["Tariq Mehmood", "SE"],
    ["Rabia Noor", "SE"],
    // EE Department
    ["Faisal Azam", "EE"],
    ["Asim Waris", "EE"],
    ["Mudasser Nasir", "EE"],
    ["Syed Omer Gilani", "EE"],
    ["Naveed Ahmed", "EE"],
    ["Hassan Raza", "EE"],
    ["Amir Sultan", "EE"],
    ["Bushra Naz", "EE"],
    ["Saad Qaisar", "EE"],
    ["Tahir Zaidi", "EE"],
    ["Zainab Fatima", "EE"],
    ["Mohsin Ali", "EE"],
    ["Irfan Ullah", "EE"],
    ["Nabeel Ahmad", "EE"],
    ["Danish Mehmood", "EE"],
    // ME Department
    ["Mirza Jahanzaib", "ME"],
    ["Waseem Akhtar", "ME"],
    ["Hamid Raza", "ME"],
    ["Farooq Ahmad", "ME"],
    ["Shahzad Ali", "ME"],
    ["Muhammad Usman", "ME"],
    ["Qaiser Abbas", "ME"],
    ["Tanveer Ahmad", "ME"],
    ["Raza Shah", "ME"],
    ["Anwar Ul Haq", "ME"],
    ["Syed Hussnain", "ME"],
    ["Babar Ali", "ME"],
    ["Kamran Shahzad", "ME"],
    ["Ahsan Iqbal", "ME"],
    ["Junaid Khan", "ME"],
    // CE Department
    ["Ammad Hassan", "CE"],
    ["Rizwan Azam", "CE"],
    ["Naeem Akhtar", "CE"],
    ["Shahid Iqbal", "CE"],
    ["Muhammad Arsalan", "CE"],
    ["Bilal Ahmad", "CE"],
    ["Zafar Iqbal", "CE"],
    ["Yasir Mahmood", "CE"],
    ["Sajjad Hussain", "CE"],
    ["Waqas Ali", "CE"],
    ["Tariq Aziz", "CE"],
    ["Noman Ahmed", "CE"],
    ["Adil Rehman", "CE"],
    ["Zahid Mehmood", "CE"],
    ["Shoaib Akram", "CE"],
    // AI Department
    ["Syed Ali Raza", "AI"],
    ["Ayesha Siddiqui", "AI"],
    ["Rehan Ashraf", "AI"],
    ["Huma Nawaz", "AI"],
    ["Iftikhar Ahmad", "AI"],
    ["Mehreen Saeed", "AI"],
    ["Owais Khan", "AI"],
    ["Saba Bashir", "AI"],
    // BCE Department
    ["Tahira Mahboob", "BCE"],
    ["Kamran Javed", "BCE"],
    ["Saima Rauf", "BCE"],
    ["Nisar Ahmad", "BCE"],
    ["Fouzia Hanif", "BCE"],
    // PSY Department
    ["Komal Dure Shehwar", "PSY"],
    ["Saira Batool", "PSY"],
    ["Nazia Mumtaz", "PSY"],
    ["Hina Iqbal", "PSY"],
    // MGT Department
    ["Aatiqa Hasrat", "MGT"],
    ["Rana Faisal", "MGT"],
    ["Amina Tariq", "MGT"],
    ["Bilal Javed", "MGT"],
    // Mathematics
    ["Zertaisha Nasir", "MTH"],
    ["Riaz Ahmad", "MTH"],
    ["Kashif Ayyub", "MTH"],
    ["Adnan Jahangir", "MTH"],
    ["Shabbir Ahmad", "MTH"],
    ["Syeda Maedah Kazmi", "MTH"],
    ["Naila Tabassam", "MTH"],
    ["Amjad Hussain", "MTH"],
    ["Sadia Parveen", "MTH"],
    ["Tabassum Naz", "MTH"],
    // Physics
    ["Muhammad Kamran", "PHY"],
    ["Shabieh Farwa", "PHY"],
    ["Asif Mahmood", "PHY"],
    ["Tallat Iqbal", "PHY"],
    // Humanities
    ["Tahira Mueen", "HUM"],
    ["Nimrah Nazim", "HUM"],
    ["Ashfaq Ahmed", "HUM"],
    ["Muhammad Shahid Khan", "HUM"],
    ["Atiq ur Rehman", "HUM"],
    ["Waheed Ahmad Khan", "HUM"],
    ["Sabir Ullah", "HUM"],
    ["Abdullah", "HUM"],
    ["Farah Deeba", "HUM"],
    ["Irfana Begum", "HUM"],
    ["Saleha Noor", "HUM"],
    ["Sajida Parveen", "HUM"],
    // Chemistry
    ["Tahira Aziz", "CHM"],
    ["Naheed Akhtar", "CHM"],
  ];

  // Generate email from name
  function nameToEmail(name) {
    const parts = name.toLowerCase().replace(/[^a-z\s]/g, "").trim().split(/\s+/);
    if (parts.length === 1) return `${parts[0]}@cui.edu.pk`;
    return `${parts[0]}.${parts[parts.length - 1]}@cui.edu.pk`;
  }

  // Build user records - deduplicate emails
  const emailsSeen = new Set();
  const facultyRecords = [];
  for (const [name, deptKey] of facultyData) {
    let email = nameToEmail(name);
    if (emailsSeen.has(email)) {
      // Add middle initial or number
      const parts = name.toLowerCase().replace(/[^a-z\s]/g, "").trim().split(/\s+/);
      if (parts.length > 2) {
        email = `${parts[0]}.${parts[1]}.${parts[parts.length - 1]}@cui.edu.pk`;
      } else {
        email = `${parts[0]}.${parts[parts.length - 1]}2@cui.edu.pk`;
      }
    }
    emailsSeen.add(email);
    facultyRecords.push({
      email,
      name,
      hashedPassword: facultyPw,
      role: "faculty",
      department: DEPT_MAP[deptKey] || deptKey,
    });
  }

  // Admin + student users
  const specialUsers = [
    { email: "admin@cui.edu.pk", name: "Admin", hashedPassword: adminPw, role: "admin", department: "Computer Science" },
    { email: "cr.bcs4a@cui.edu.pk", name: "CR BCS-4A", hashedPassword: studentPw, role: "student", department: "Computer Science" },
    { email: "student@cui.edu.pk", name: "Student User", hashedPassword: studentPw, role: "student", department: "Computer Science" },
  ];

  // Create users individually so we can map them by name later
  const createdUsers = [];
  for (const u of [...specialUsers, ...facultyRecords]) {
    const user = await prisma.user.create({ data: u });
    createdUsers.push(user);
  }
  console.log(`Users: ${createdUsers.length}`);

  // Build faculty lookup by partial name match
  const allFaculty = createdUsers.filter((u) => u.role === "faculty");
  const fid = (search) => {
    const f = allFaculty.find((u) => u.name.toLowerCase().includes(search.toLowerCase()));
    return f?.id || null;
  };

  // ─── 2. RESOURCES (Rooms & Labs) ──────────────────────────────
  const rooms = [];

  // F-block (First floor)
  for (let i = 1; i <= 17; i++) {
    if (i === 12) continue; // No F-12
    rooms.push({ name: `F-${String(i).padStart(2, "0")}`, type: "classroom", building: "Academic Block", floor: "1st", capacity: 50, features: "{}", department: "General", status: "available" });
  }
  // G-block (Ground floor classrooms)
  for (const n of ["G-06", "G-08", "G-09", "G-10", "G-11", "G-12"])
    rooms.push({ name: n, type: "classroom", building: "Academic Block", floor: "G", capacity: 55, features: "{}", department: "General", status: "available" });
  // 300 Block
  for (const n of ["301", "302", "303", "304", "305", "306"])
    rooms.push({ name: n, type: "classroom", building: "300 Block", floor: "3rd", capacity: 50, features: "{}", department: "General", status: "available" });
  // Civil Block (400s)
  for (const n of ["401", "402", "403", "404", "405", "406", "407", "408", "409", "410", "411"])
    rooms.push({ name: n, type: "classroom", building: "Civil Engineering Block", floor: "4th", capacity: 55, features: "{}", department: "Civil Engineering", status: "available" });
  // 500 Block
  for (const n of ["501", "502", "503", "504"])
    rooms.push({ name: n, type: "classroom", building: "500 Block", floor: "5th", capacity: 60, features: "{}", department: "General", status: "available" });
  // 600 Block
  rooms.push({ name: "601", type: "classroom", building: "ME Block", floor: "6th", capacity: 50, features: "{}", department: "Mechanical Engineering", status: "available" });
  // Basement
  for (const n of ["B-11", "B-19", "B-25"])
    rooms.push({ name: n, type: "classroom", building: "Academic Block", floor: "B", capacity: 60, features: "{}", department: "General", status: "available" });

  // Labs: CS Labs
  const labs = [];
  for (let i = 1; i <= 9; i++)
    labs.push({ name: `Lab-${i}`, type: "lab", building: "Academic Block", floor: "G", capacity: 35, features: "{}", department: "Computer Science", status: "available" });
  labs.push({ name: "G-05 (Lab)", type: "lab", building: "Academic Block", floor: "G", capacity: 30, features: "{}", department: "Computer Science", status: "available" });
  labs.push({ name: "G-07 (Lab)", type: "lab", building: "Academic Block", floor: "G", capacity: 30, features: "{}", department: "Computer Science", status: "available" });

  // Specialized department labs
  const specializedLabs = [
    ["Lab - Physics", "Physics"],
    ["Lab - Physics & Circuit", "Physics"],
    ["Lab - Digital Design", "Electrical Engineering"],
    ["Lab - Psychology", "Psychology"],
    ["Lab - Signal Processing", "Electrical Engineering"],
    ["Lab - Electronics", "Electrical Engineering"],
    ["Lab - Power Systems", "Electrical Engineering"],
    ["Lab - Machines", "Electrical Engineering"],
    ["Lab - Control Systems", "Electrical Engineering"],
    ["Lab - Communication", "Electrical Engineering"],
    ["Lab - Microprocessor", "Electrical Engineering"],
    ["Lab - Drawing Hall", "Civil Engineering"],
    ["Lab - Concrete", "Civil Engineering"],
    ["Lab - Geotech", "Civil Engineering"],
    ["Lab - Survey", "Civil Engineering"],
    ["Lab - Environmental", "Civil Engineering"],
    ["Lab - Hydraulics", "Civil Engineering"],
    ["Lab - MOM", "Mechanical Engineering"],
    ["Lab - Thermodynamics", "Mechanical Engineering"],
    ["Lab - Fluid Mechanics", "Mechanical Engineering"],
    ["Lab - IC Engineering", "Mechanical Engineering"],
    ["Lab - CNC", "Mechanical Engineering"],
    ["Lab - Vibration", "Mechanical Engineering"],
    ["Lab - Heat Transfer", "Mechanical Engineering"],
    ["Lab - Chemistry", "Chemistry"],
    ["Lab - AI Research", "Artificial Intelligence"],
    ["Lab - Network", "Computer Science"],
    ["Lab - Robotics", "Computer Engineering"],
  ];
  for (const [n, d] of specializedLabs) {
    labs.push({ name: n, type: "lab", building: "Respective Dept", floor: "G", capacity: 25, features: "{}", department: d, status: "available" });
  }

  // Create all resources
  const allResourceData = [...rooms, ...labs];
  const createdResources = [];
  for (const r of allResourceData) {
    const res = await prisma.resource.create({ data: r });
    createdResources.push(res);
  }
  console.log(`Resources: ${createdResources.length} (${rooms.length} classrooms, ${labs.length} labs)`);

  // Resource lookup by name
  const rid = (name) => {
    const r = createdResources.find((res) => res.name === name);
    if (!r) console.warn(`  WARNING: Resource not found: "${name}"`);
    return r?.id || null;
  };

  // ─── 3. SEMESTER ───────────────────────────────────────────────
  const semester = await prisma.semester.create({
    data: {
      code: "SP-26",
      name: "Spring 2026",
      startDate: "2026-02-02",
      endDate: "2026-06-15",
      isActive: true,
    },
  });
  console.log("Semester: SP-26 (active)");

  // ─── 4. SECTIONS (67 sections) ────────────────────────────────
  const sectionData = [
    // BCS - 1A through 8E
    { name: "BCS-1A", program: "BCS", semester: 1, strength: 55, department: "Computer Science" },
    { name: "BCS-1B", program: "BCS", semester: 1, strength: 55, department: "Computer Science" },
    { name: "BCS-1C", program: "BCS", semester: 1, strength: 55, department: "Computer Science" },
    { name: "BCS-1D", program: "BCS", semester: 1, strength: 55, department: "Computer Science" },
    { name: "BCS-1E", program: "BCS", semester: 1, strength: 55, department: "Computer Science" },
    { name: "BCS-2A", program: "BCS", semester: 2, strength: 50, department: "Computer Science" },
    { name: "BCS-2B", program: "BCS", semester: 2, strength: 50, department: "Computer Science" },
    { name: "BCS-2C", program: "BCS", semester: 2, strength: 50, department: "Computer Science" },
    { name: "BCS-2D", program: "BCS", semester: 2, strength: 50, department: "Computer Science" },
    { name: "BCS-3A", program: "BCS", semester: 3, strength: 50, department: "Computer Science" },
    { name: "BCS-3B", program: "BCS", semester: 3, strength: 50, department: "Computer Science" },
    { name: "BCS-3C", program: "BCS", semester: 3, strength: 50, department: "Computer Science" },
    { name: "BCS-4A", program: "BCS", semester: 4, strength: 50, department: "Computer Science" },
    { name: "BCS-4B", program: "BCS", semester: 4, strength: 50, department: "Computer Science" },
    { name: "BCS-4C", program: "BCS", semester: 4, strength: 50, department: "Computer Science" },
    { name: "BCS-5A", program: "BCS", semester: 5, strength: 45, department: "Computer Science" },
    { name: "BCS-5B", program: "BCS", semester: 5, strength: 45, department: "Computer Science" },
    { name: "BCS-5C", program: "BCS", semester: 5, strength: 45, department: "Computer Science" },
    { name: "BCS-6A", program: "BCS", semester: 6, strength: 45, department: "Computer Science" },
    { name: "BCS-6B", program: "BCS", semester: 6, strength: 45, department: "Computer Science" },
    { name: "BCS-7A", program: "BCS", semester: 7, strength: 40, department: "Computer Science" },
    { name: "BCS-7B", program: "BCS", semester: 7, strength: 40, department: "Computer Science" },
    { name: "BCS-8A", program: "BCS", semester: 8, strength: 40, department: "Computer Science" },
    { name: "BCS-8B", program: "BCS", semester: 8, strength: 40, department: "Computer Science" },
    { name: "BCS-8C", program: "BCS", semester: 8, strength: 40, department: "Computer Science" },
    { name: "BCS-8D", program: "BCS", semester: 8, strength: 40, department: "Computer Science" },
    { name: "BCS-8E", program: "BCS", semester: 8, strength: 40, department: "Computer Science" },
    // BSE
    { name: "BSE-1", program: "BSE", semester: 1, strength: 40, department: "Software Engineering" },
    { name: "BSE-2", program: "BSE", semester: 2, strength: 40, department: "Software Engineering" },
    { name: "BSE-3", program: "BSE", semester: 3, strength: 40, department: "Software Engineering" },
    { name: "BSE-4", program: "BSE", semester: 4, strength: 38, department: "Software Engineering" },
    { name: "BSE-5", program: "BSE", semester: 5, strength: 35, department: "Software Engineering" },
    { name: "BSE-6", program: "BSE", semester: 6, strength: 35, department: "Software Engineering" },
    { name: "BSE-7", program: "BSE", semester: 7, strength: 30, department: "Software Engineering" },
    { name: "BSE-8A", program: "BSE", semester: 8, strength: 30, department: "Software Engineering" },
    { name: "BSE-8B", program: "BSE", semester: 8, strength: 30, department: "Software Engineering" },
    // BAI
    { name: "BAI-2", program: "BAI", semester: 2, strength: 40, department: "Artificial Intelligence" },
    { name: "BAI-4", program: "BAI", semester: 4, strength: 35, department: "Artificial Intelligence" },
    { name: "BAI-6", program: "BAI", semester: 6, strength: 30, department: "Artificial Intelligence" },
    // CVE (Civil Engineering)
    { name: "CVE-2A", program: "CVE", semester: 2, strength: 45, department: "Civil Engineering" },
    { name: "CVE-2B", program: "CVE", semester: 2, strength: 45, department: "Civil Engineering" },
    { name: "CVE-4A", program: "CVE", semester: 4, strength: 40, department: "Civil Engineering" },
    { name: "CVE-4B", program: "CVE", semester: 4, strength: 40, department: "Civil Engineering" },
    { name: "CVE-6A", program: "CVE", semester: 6, strength: 40, department: "Civil Engineering" },
    { name: "CVE-6B", program: "CVE", semester: 6, strength: 40, department: "Civil Engineering" },
    { name: "CVE-8A", program: "CVE", semester: 8, strength: 35, department: "Civil Engineering" },
    { name: "CVE-8B", program: "CVE", semester: 8, strength: 35, department: "Civil Engineering" },
    // BME (Mechanical Engineering)
    { name: "BME-2A", program: "BME", semester: 2, strength: 45, department: "Mechanical Engineering" },
    { name: "BME-2B", program: "BME", semester: 2, strength: 45, department: "Mechanical Engineering" },
    { name: "BME-4A", program: "BME", semester: 4, strength: 40, department: "Mechanical Engineering" },
    { name: "BME-4B", program: "BME", semester: 4, strength: 40, department: "Mechanical Engineering" },
    { name: "BME-6A", program: "BME", semester: 6, strength: 38, department: "Mechanical Engineering" },
    { name: "BME-6B", program: "BME", semester: 6, strength: 38, department: "Mechanical Engineering" },
    { name: "BME-8A", program: "BME", semester: 8, strength: 35, department: "Mechanical Engineering" },
    { name: "BME-8B", program: "BME", semester: 8, strength: 35, department: "Mechanical Engineering" },
    // BEE (Electrical Engineering)
    { name: "BEE-2", program: "BEE", semester: 2, strength: 45, department: "Electrical Engineering" },
    { name: "BEE-4", program: "BEE", semester: 4, strength: 40, department: "Electrical Engineering" },
    { name: "BEE-6", program: "BEE", semester: 6, strength: 38, department: "Electrical Engineering" },
    { name: "BEE-8", program: "BEE", semester: 8, strength: 35, department: "Electrical Engineering" },
    // BCE (Computer Engineering)
    { name: "BCE-2", program: "BCE", semester: 2, strength: 35, department: "Computer Engineering" },
    { name: "BCE-4", program: "BCE", semester: 4, strength: 35, department: "Computer Engineering" },
    { name: "BCE-6", program: "BCE", semester: 6, strength: 30, department: "Computer Engineering" },
    // BPY (Psychology)
    { name: "BPY-1", program: "BPY", semester: 1, strength: 50, department: "Psychology" },
    { name: "BPY-2", program: "BPY", semester: 2, strength: 45, department: "Psychology" },
    { name: "BPY-3", program: "BPY", semester: 3, strength: 45, department: "Psychology" },
    { name: "BPY-4", program: "BPY", semester: 4, strength: 40, department: "Psychology" },
  ];

  const createdSections = [];
  for (const s of sectionData) {
    const sec = await prisma.section.create({ data: s });
    createdSections.push(sec);
  }
  console.log(`Sections: ${createdSections.length}`);

  const sid = (name) => {
    const s = createdSections.find((sec) => sec.name === name);
    if (!s) console.warn(`  WARNING: Section not found: "${name}"`);
    return s?.id || null;
  };

  // ─── 5. COURSES (130+) ────────────────────────────────────────
  // Using sequential codes with department prefix for uniqueness
  const courseData = [
    // ── CS Semester 1 ──
    { code: "CS-PF", name: "Programming Fundamentals", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CS-PFL", name: "Programming Fundamentals (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Science" },
    { code: "CS-ICT", name: "Application of ICT", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CS-ICTL", name: "Application of ICT (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Science" },
    // ── CS Semester 2 ──
    { code: "CS-OOP", name: "Object Oriented Programming", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CS-OOPL", name: "OOP (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Science" },
    { code: "CS-ECC", name: "Electronic Commerce & Computers", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    // ── CS Semester 3 ──
    { code: "CS-DS", name: "Data Structures", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CS-DSL", name: "Data Structures (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Science" },
    { code: "CS-DLD", name: "Digital Logic Design", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CS-DLDL", name: "Digital Logic Design (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Science" },
    { code: "CS-DB", name: "Database Systems", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CS-DBL", name: "Database Systems (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Science" },
    // ── CS Semester 4 ──
    { code: "CS-OS", name: "Operating Systems", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CS-OSL", name: "Operating Systems (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Science" },
    { code: "CS-COAL", name: "Computer Organization & Assembly Language", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CS-COALL", name: "COAL (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Science" },
    { code: "CS-SE", name: "Software Engineering", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    // ── CS Semester 5 ──
    { code: "CS-DAA", name: "Design & Analysis of Algorithms", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CS-AI", name: "Artificial Intelligence", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CS-AIL", name: "AI (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Science" },
    { code: "CS-WT", name: "Web Technologies", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CS-WTL", name: "Web Technologies (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Science" },
    { code: "CS-CN", name: "Computer Networks", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CS-CNL", name: "Computer Networks (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Science" },
    // ── CS Semester 6 ──
    { code: "CS-IS", name: "Information Security", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CS-CC", name: "Compiler Construction", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CS-ML", name: "Machine Learning", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CS-MLL", name: "Machine Learning (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Science" },
    { code: "CS-TC", name: "Theory of Computing", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    // ── CS Semester 7 ──
    { code: "CS-PR", name: "Pattern Recognition", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CS-MAD", name: "Mobile App Development", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CS-MADL", name: "Mobile App Development (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Science" },
    { code: "CS-CLD", name: "Cloud Computing", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CS-FYP1", name: "Final Year Project I", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    // ── CS Semester 8 ──
    { code: "CS-FYP2", name: "Final Year Project II", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CS-DL", name: "Deep Learning", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CS-PP", name: "Parallel Processing", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CS-IDS", name: "Intro to Data Science", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    // ── SE courses ──
    { code: "SE-SA", name: "Software Architecture", creditHours: 3, isLab: false, isTechnical: true, department: "Software Engineering" },
    { code: "SE-SQA", name: "Software Quality Assurance", creditHours: 3, isLab: false, isTechnical: true, department: "Software Engineering" },
    { code: "SE-SPM", name: "Software Project Management", creditHours: 3, isLab: false, isTechnical: true, department: "Software Engineering" },
    { code: "SE-REQ", name: "Requirements Engineering", creditHours: 3, isLab: false, isTechnical: true, department: "Software Engineering" },
    { code: "SE-SDD", name: "Software Design & Development", creditHours: 3, isLab: false, isTechnical: true, department: "Software Engineering" },
    { code: "SE-SDDL", name: "Software Design & Development (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Software Engineering" },
    { code: "SE-HCI", name: "Human Computer Interaction", creditHours: 3, isLab: false, isTechnical: true, department: "Software Engineering" },
    // ── AI-specific ──
    { code: "AI-NLP", name: "Natural Language Processing", creditHours: 3, isLab: false, isTechnical: true, department: "Artificial Intelligence" },
    { code: "AI-CV", name: "Computer Vision", creditHours: 3, isLab: false, isTechnical: true, department: "Artificial Intelligence" },
    { code: "AI-CVL", name: "Computer Vision (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Artificial Intelligence" },
    { code: "AI-DLR", name: "Deep Learning & Reasoning", creditHours: 3, isLab: false, isTechnical: true, department: "Artificial Intelligence" },
    { code: "AI-RL", name: "Reinforcement Learning", creditHours: 3, isLab: false, isTechnical: true, department: "Artificial Intelligence" },
    // ── EE courses ──
    { code: "EE-CT", name: "Circuit Theory", creditHours: 3, isLab: false, isTechnical: true, department: "Electrical Engineering" },
    { code: "EE-CTL", name: "Circuit Theory (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Electrical Engineering" },
    { code: "EE-EM", name: "Electromagnetic Theory", creditHours: 3, isLab: false, isTechnical: true, department: "Electrical Engineering" },
    { code: "EE-SP", name: "Signal Processing", creditHours: 3, isLab: false, isTechnical: true, department: "Electrical Engineering" },
    { code: "EE-SPL", name: "Signal Processing (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Electrical Engineering" },
    { code: "EE-PE", name: "Power Electronics", creditHours: 3, isLab: false, isTechnical: true, department: "Electrical Engineering" },
    { code: "EE-PEL", name: "Power Electronics (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Electrical Engineering" },
    { code: "EE-CS", name: "Control Systems", creditHours: 3, isLab: false, isTechnical: true, department: "Electrical Engineering" },
    { code: "EE-CSL", name: "Control Systems (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Electrical Engineering" },
    { code: "EE-MP", name: "Microprocessor Systems", creditHours: 3, isLab: false, isTechnical: true, department: "Electrical Engineering" },
    { code: "EE-MPL", name: "Microprocessor Systems (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Electrical Engineering" },
    { code: "EE-DC", name: "Digital Communications", creditHours: 3, isLab: false, isTechnical: true, department: "Electrical Engineering" },
    { code: "EE-DCL", name: "Digital Communications (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Electrical Engineering" },
    { code: "EE-ELC", name: "Electronics", creditHours: 3, isLab: false, isTechnical: true, department: "Electrical Engineering" },
    { code: "EE-ELCL", name: "Electronics (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Electrical Engineering" },
    { code: "EE-PS", name: "Power Systems", creditHours: 3, isLab: false, isTechnical: true, department: "Electrical Engineering" },
    { code: "EE-PSL", name: "Power Systems (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Electrical Engineering" },
    // ── ME courses ──
    { code: "ME-TH", name: "Thermodynamics", creditHours: 3, isLab: false, isTechnical: true, department: "Mechanical Engineering" },
    { code: "ME-THL", name: "Thermodynamics (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Mechanical Engineering" },
    { code: "ME-FM", name: "Fluid Mechanics", creditHours: 3, isLab: false, isTechnical: true, department: "Mechanical Engineering" },
    { code: "ME-FML", name: "Fluid Mechanics (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Mechanical Engineering" },
    { code: "ME-MOM", name: "Mechanics of Materials", creditHours: 3, isLab: false, isTechnical: true, department: "Mechanical Engineering" },
    { code: "ME-MOML", name: "Mechanics of Materials (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Mechanical Engineering" },
    { code: "ME-MD", name: "Machine Design", creditHours: 3, isLab: false, isTechnical: true, department: "Mechanical Engineering" },
    { code: "ME-HT", name: "Heat Transfer", creditHours: 3, isLab: false, isTechnical: true, department: "Mechanical Engineering" },
    { code: "ME-HTL", name: "Heat Transfer (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Mechanical Engineering" },
    { code: "ME-DYN", name: "Dynamics", creditHours: 3, isLab: false, isTechnical: true, department: "Mechanical Engineering" },
    { code: "ME-MFG", name: "Manufacturing Processes", creditHours: 3, isLab: false, isTechnical: true, department: "Mechanical Engineering" },
    { code: "ME-MFGL", name: "Manufacturing Processes (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Mechanical Engineering" },
    { code: "ME-ICE", name: "IC Engines", creditHours: 3, isLab: false, isTechnical: true, department: "Mechanical Engineering" },
    { code: "ME-ICEL", name: "IC Engines (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Mechanical Engineering" },
    // ── CE courses ──
    { code: "CE-SM", name: "Structural Mechanics", creditHours: 3, isLab: false, isTechnical: true, department: "Civil Engineering" },
    { code: "CE-SML", name: "Structural Mechanics (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Civil Engineering" },
    { code: "CE-SVY", name: "Surveying", creditHours: 3, isLab: false, isTechnical: true, department: "Civil Engineering" },
    { code: "CE-SVYL", name: "Surveying (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Civil Engineering" },
    { code: "CE-GT", name: "Geotechnical Engineering", creditHours: 3, isLab: false, isTechnical: true, department: "Civil Engineering" },
    { code: "CE-GTL", name: "Geotechnical Engineering (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Civil Engineering" },
    { code: "CE-HYD", name: "Hydraulics", creditHours: 3, isLab: false, isTechnical: true, department: "Civil Engineering" },
    { code: "CE-HYDL", name: "Hydraulics (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Civil Engineering" },
    { code: "CE-CON", name: "Concrete Technology", creditHours: 3, isLab: false, isTechnical: true, department: "Civil Engineering" },
    { code: "CE-CONL", name: "Concrete Technology (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Civil Engineering" },
    { code: "CE-ENV", name: "Environmental Engineering", creditHours: 3, isLab: false, isTechnical: true, department: "Civil Engineering" },
    { code: "CE-ED", name: "Engineering Drawing", creditHours: 2, isLab: false, isTechnical: true, department: "Civil Engineering" },
    { code: "CE-EDL", name: "Engineering Drawing (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Civil Engineering" },
    // ── BCE courses ──
    { code: "BCE-EMB", name: "Embedded Systems", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Engineering" },
    { code: "BCE-EMBL", name: "Embedded Systems (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Engineering" },
    { code: "BCE-IOT", name: "Internet of Things", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Engineering" },
    { code: "BCE-IOTL", name: "Internet of Things (Lab)", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Engineering" },
    { code: "BCE-VLSI", name: "VLSI Design", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Engineering" },
    // ── PSY courses ──
    { code: "PSY-GP", name: "General Psychology", creditHours: 3, isLab: false, isTechnical: false, department: "Psychology" },
    { code: "PSY-DEV", name: "Developmental Psychology", creditHours: 3, isLab: false, isTechnical: false, department: "Psychology" },
    { code: "PSY-ABN", name: "Abnormal Psychology", creditHours: 3, isLab: false, isTechnical: false, department: "Psychology" },
    { code: "PSY-SOC", name: "Social Psychology", creditHours: 3, isLab: false, isTechnical: false, department: "Psychology" },
    { code: "PSY-RM", name: "Research Methods in Psychology", creditHours: 3, isLab: false, isTechnical: false, department: "Psychology" },
    { code: "PSY-STAT", name: "Statistics for Psychology", creditHours: 3, isLab: false, isTechnical: false, department: "Psychology" },
    { code: "PSY-COG", name: "Cognitive Psychology", creditHours: 3, isLab: false, isTechnical: false, department: "Psychology" },
    { code: "PSY-CLP", name: "Clinical Psychology", creditHours: 3, isLab: false, isTechnical: false, department: "Psychology" },
    // ── Mathematics ──
    { code: "MTH-PC", name: "Pre-Calculus I", creditHours: 3, isLab: false, isTechnical: false, department: "Mathematics" },
    { code: "MTH-C1", name: "Calculus I", creditHours: 3, isLab: false, isTechnical: false, department: "Mathematics" },
    { code: "MTH-C2", name: "Calculus II", creditHours: 3, isLab: false, isTechnical: false, department: "Mathematics" },
    { code: "MTH-MVC", name: "Multivariate Calculus", creditHours: 3, isLab: false, isTechnical: false, department: "Mathematics" },
    { code: "MTH-PS", name: "Probability & Statistics", creditHours: 3, isLab: false, isTechnical: false, department: "Mathematics" },
    { code: "MTH-LA", name: "Linear Algebra", creditHours: 3, isLab: false, isTechnical: false, department: "Mathematics" },
    { code: "MTH-NM", name: "Numerical Methods", creditHours: 3, isLab: false, isTechnical: false, department: "Mathematics" },
    { code: "MTH-DE", name: "Differential Equations", creditHours: 3, isLab: false, isTechnical: false, department: "Mathematics" },
    { code: "MTH-DM", name: "Discrete Mathematics", creditHours: 3, isLab: false, isTechnical: false, department: "Mathematics" },
    // ── Physics ──
    { code: "PHY-AP", name: "Applied Physics", creditHours: 3, isLab: false, isTechnical: false, department: "Physics" },
    { code: "PHY-APL", name: "Applied Physics (Lab)", creditHours: 1, isLab: true, isTechnical: false, department: "Physics" },
    // ── Humanities ──
    { code: "HUM-FE", name: "Functional English", creditHours: 3, isLab: false, isTechnical: false, department: "Humanities" },
    { code: "HUM-IS", name: "Islamic Studies", creditHours: 2, isLab: false, isTechnical: false, department: "Humanities" },
    { code: "HUM-PS", name: "Pakistan Studies", creditHours: 2, isLab: false, isTechnical: false, department: "Humanities" },
    { code: "HUM-CCE", name: "Civics & Community Engagement", creditHours: 2, isLab: false, isTechnical: false, department: "Humanities" },
    { code: "HUM-SOC", name: "Fundamentals of Sociology", creditHours: 2, isLab: false, isTechnical: false, department: "Humanities" },
    { code: "HUM-CS", name: "Communication Skills", creditHours: 3, isLab: false, isTechnical: false, department: "Humanities" },
    { code: "HUM-TP", name: "Technical & Professional Writing", creditHours: 3, isLab: false, isTechnical: false, department: "Humanities" },
    { code: "HUM-ETH", name: "Professional Ethics", creditHours: 2, isLab: false, isTechnical: false, department: "Humanities" },
    // ── Chemistry ──
    { code: "CHM-GC", name: "General Chemistry", creditHours: 3, isLab: false, isTechnical: false, department: "Chemistry" },
    { code: "CHM-GCL", name: "General Chemistry (Lab)", creditHours: 1, isLab: true, isTechnical: false, department: "Chemistry" },
    // ── Management ──
    { code: "MGT-ENT", name: "Entrepreneurship", creditHours: 3, isLab: false, isTechnical: false, department: "Management Sciences" },
    { code: "MGT-FM", name: "Financial Management", creditHours: 3, isLab: false, isTechnical: false, department: "Management Sciences" },
    { code: "MGT-ECO", name: "Engineering Economics", creditHours: 3, isLab: false, isTechnical: false, department: "Management Sciences" },
  ];

  const createdCourses = [];
  for (const c of courseData) {
    const course = await prisma.course.create({ data: c });
    createdCourses.push(course);
  }
  console.log(`Courses: ${createdCourses.length}`);

  const cid = (code) => {
    const c = createdCourses.find((cr) => cr.code === code);
    if (!c) console.warn(`  WARNING: Course not found: "${code}"`);
    return c?.id || null;
  };

  // ─── 6. COURSE OFFERINGS ──────────────────────────────────────
  // Create offerings for sections that have timetable entries + more

  const offeringDefs = [
    // ── BCS-1A ──
    { section: "BCS-1A", course: "CS-PF", faculty: "Taimoor Sajjad", cpw: 2, lpw: 0 },
    { section: "BCS-1A", course: "CS-PFL", faculty: "Taimoor Sajjad", cpw: 0, lpw: 1 },
    { section: "BCS-1A", course: "CS-ICT", faculty: "Beenish Noor", cpw: 2, lpw: 0 },
    { section: "BCS-1A", course: "CS-ICTL", faculty: "Beenish Noor", cpw: 0, lpw: 1 },
    { section: "BCS-1A", course: "MTH-PC", faculty: "Zertaisha Nasir", cpw: 2, lpw: 0 },
    { section: "BCS-1A", course: "HUM-FE", faculty: "Tahira Mueen", cpw: 2, lpw: 0 },
    { section: "BCS-1A", course: "HUM-SOC", faculty: "Komal Dure Shehwar", cpw: 2, lpw: 0 },
    { section: "BCS-1A", course: "HUM-CCE", faculty: "Aatiqa Hasrat", cpw: 2, lpw: 0 },

    // ── BCS-1B ──
    { section: "BCS-1B", course: "CS-PF", faculty: "Mian Muhammad Talha", cpw: 2, lpw: 0 },
    { section: "BCS-1B", course: "CS-PFL", faculty: "Mian Muhammad Talha", cpw: 0, lpw: 1 },
    { section: "BCS-1B", course: "CS-ICT", faculty: "Kamran Ali Akhtar", cpw: 2, lpw: 0 },
    { section: "BCS-1B", course: "CS-ICTL", faculty: "Kamran Ali Akhtar", cpw: 0, lpw: 1 },
    { section: "BCS-1B", course: "MTH-PC", faculty: "Zertaisha Nasir", cpw: 2, lpw: 0 },
    { section: "BCS-1B", course: "HUM-FE", faculty: "Nimrah Nazim", cpw: 2, lpw: 0 },
    { section: "BCS-1B", course: "HUM-SOC", faculty: "Komal Dure Shehwar", cpw: 2, lpw: 0 },
    { section: "BCS-1B", course: "HUM-CCE", faculty: "Aatiqa Hasrat", cpw: 2, lpw: 0 },

    // ── BCS-2A ──
    { section: "BCS-2A", course: "CS-OOP", faculty: "Nadir Shah", cpw: 2, lpw: 0 },
    { section: "BCS-2A", course: "CS-OOPL", faculty: "Nadir Shah", cpw: 0, lpw: 1 },
    { section: "BCS-2A", course: "CS-ECC", faculty: "Fatima Farooq", cpw: 2, lpw: 0 },
    { section: "BCS-2A", course: "MTH-C1", faculty: "Syeda Maedah Kazmi", cpw: 2, lpw: 0 },
    { section: "BCS-2A", course: "PHY-AP", faculty: "Umair Hassan", cpw: 2, lpw: 0 },
    { section: "BCS-2A", course: "PHY-APL", faculty: "Umair Hassan", cpw: 0, lpw: 1 },
    { section: "BCS-2A", course: "HUM-IS", faculty: "Sabir Ullah", cpw: 2, lpw: 0 },

    // ── BCS-2B ──
    { section: "BCS-2B", course: "CS-OOP", faculty: "Arubah Hussain", cpw: 2, lpw: 0 },
    { section: "BCS-2B", course: "CS-OOPL", faculty: "Arubah Hussain", cpw: 0, lpw: 1 },
    { section: "BCS-2B", course: "CS-ECC", faculty: "Fatima Farooq", cpw: 2, lpw: 0 },
    { section: "BCS-2B", course: "MTH-C1", faculty: "Syeda Maedah Kazmi", cpw: 2, lpw: 0 },
    { section: "BCS-2B", course: "PHY-AP", faculty: "Umair Hassan", cpw: 2, lpw: 0 },
    { section: "BCS-2B", course: "PHY-APL", faculty: "Umair Hassan", cpw: 0, lpw: 1 },
    { section: "BCS-2B", course: "HUM-IS", faculty: "Abdullah", cpw: 2, lpw: 0 },

    // ── BCS-2C ──
    { section: "BCS-2C", course: "CS-OOP", faculty: "Samia Zaffar", cpw: 2, lpw: 0 },
    { section: "BCS-2C", course: "CS-OOPL", faculty: "Samia Zaffar", cpw: 0, lpw: 1 },
    { section: "BCS-2C", course: "CS-ECC", faculty: "Nosheen Atif", cpw: 2, lpw: 0 },
    { section: "BCS-2C", course: "MTH-C1", faculty: "Naila Tabassam", cpw: 2, lpw: 0 },
    { section: "BCS-2C", course: "PHY-AP", faculty: "Muhammad Kamran", cpw: 2, lpw: 0 },
    { section: "BCS-2C", course: "PHY-APL", faculty: "Muhammad Kamran", cpw: 0, lpw: 1 },
    { section: "BCS-2C", course: "HUM-IS", faculty: "Sabir Ullah", cpw: 2, lpw: 0 },

    // ── BCS-3A ──
    { section: "BCS-3A", course: "CS-DS", faculty: "Muhammad Khalil Afzal", cpw: 2, lpw: 0 },
    { section: "BCS-3A", course: "CS-DSL", faculty: "Muhammad Khalil Afzal", cpw: 0, lpw: 1 },
    { section: "BCS-3A", course: "CS-DLD", faculty: "Faisal Azam", cpw: 2, lpw: 0 },
    { section: "BCS-3A", course: "CS-DLDL", faculty: "Faisal Azam", cpw: 0, lpw: 1 },
    { section: "BCS-3A", course: "MTH-C2", faculty: "Riaz Ahmad", cpw: 2, lpw: 0 },
    { section: "BCS-3A", course: "HUM-CS", faculty: "Ashfaq Ahmed", cpw: 2, lpw: 0 },
    { section: "BCS-3A", course: "HUM-PS", faculty: "Muhammad Shahid Khan", cpw: 2, lpw: 0 },

    // ── BCS-3B ──
    { section: "BCS-3B", course: "CS-DS", faculty: "Muhammad Nadeem", cpw: 2, lpw: 0 },
    { section: "BCS-3B", course: "CS-DSL", faculty: "Muhammad Nadeem", cpw: 0, lpw: 1 },
    { section: "BCS-3B", course: "CS-DLD", faculty: "Asim Waris", cpw: 2, lpw: 0 },
    { section: "BCS-3B", course: "CS-DLDL", faculty: "Asim Waris", cpw: 0, lpw: 1 },
    { section: "BCS-3B", course: "MTH-C2", faculty: "Adnan Jahangir", cpw: 2, lpw: 0 },
    { section: "BCS-3B", course: "HUM-CS", faculty: "Waheed Ahmad Khan", cpw: 2, lpw: 0 },
    { section: "BCS-3B", course: "HUM-PS", faculty: "Muhammad Shahid Khan", cpw: 2, lpw: 0 },

    // ── BCS-4A ──
    { section: "BCS-4A", course: "CS-OS", faculty: "Muhammad Khalil Afzal", cpw: 2, lpw: 0 },
    { section: "BCS-4A", course: "CS-OSL", faculty: "Muhammad Khalil Afzal", cpw: 0, lpw: 1 },
    { section: "BCS-4A", course: "CS-COAL", faculty: "Alamdar Hussain", cpw: 2, lpw: 0 },
    { section: "BCS-4A", course: "CS-COALL", faculty: "Alamdar Hussain", cpw: 0, lpw: 1 },
    { section: "BCS-4A", course: "CS-SE", faculty: "Mamuna Fatima", cpw: 2, lpw: 0 },
    { section: "BCS-4A", course: "MTH-PS", faculty: "Shabbir Ahmad", cpw: 2, lpw: 0 },

    // ── BCS-4B ──
    { section: "BCS-4B", course: "CS-OS", faculty: "Hafiz Obaid Ullah Mehmood", cpw: 2, lpw: 0 },
    { section: "BCS-4B", course: "CS-OSL", faculty: "Hafiz Obaid Ullah Mehmood", cpw: 0, lpw: 1 },
    { section: "BCS-4B", course: "CS-COAL", faculty: "Zain ul Abidin", cpw: 2, lpw: 0 },
    { section: "BCS-4B", course: "CS-COALL", faculty: "Zain ul Abidin", cpw: 0, lpw: 1 },
    { section: "BCS-4B", course: "CS-SE", faculty: "Sarah Amjad", cpw: 2, lpw: 0 },
    { section: "BCS-4B", course: "MTH-PS", faculty: "Kashif Ayyub", cpw: 2, lpw: 0 },

    // ── BCS-5A ──
    { section: "BCS-5A", course: "CS-DAA", faculty: "Hafiz Obaid Ullah Mehmood", cpw: 2, lpw: 0 },
    { section: "BCS-5A", course: "CS-AI", faculty: "Muhammad Sharif", cpw: 2, lpw: 0 },
    { section: "BCS-5A", course: "CS-AIL", faculty: "Muhammad Sharif", cpw: 0, lpw: 1 },
    { section: "BCS-5A", course: "CS-WT", faculty: "Tooba Tehreem", cpw: 2, lpw: 0 },
    { section: "BCS-5A", course: "CS-WTL", faculty: "Tooba Tehreem", cpw: 0, lpw: 1 },
    { section: "BCS-5A", course: "MTH-LA", faculty: "Adnan Jahangir", cpw: 2, lpw: 0 },

    // ── BCS-5B ──
    { section: "BCS-5B", course: "CS-DAA", faculty: "Hafiz Obaid Ullah Mehmood", cpw: 2, lpw: 0 },
    { section: "BCS-5B", course: "CS-AI", faculty: "Sania Umer", cpw: 2, lpw: 0 },
    { section: "BCS-5B", course: "CS-AIL", faculty: "Sania Umer", cpw: 0, lpw: 1 },
    { section: "BCS-5B", course: "CS-WT", faculty: "Javaria Umbreen", cpw: 2, lpw: 0 },
    { section: "BCS-5B", course: "CS-WTL", faculty: "Javaria Umbreen", cpw: 0, lpw: 1 },
    { section: "BCS-5B", course: "MTH-LA", faculty: "Kashif Ayyub", cpw: 2, lpw: 0 },

    // ── BCS-6A ──
    { section: "BCS-6A", course: "CS-IS", faculty: "Marwa Khanam", cpw: 2, lpw: 0 },
    { section: "BCS-6A", course: "CS-CC", faculty: "Alamdar Hussain", cpw: 2, lpw: 0 },
    { section: "BCS-6A", course: "CS-ML", faculty: "Muhammad Sharif", cpw: 2, lpw: 0 },
    { section: "BCS-6A", course: "CS-MLL", faculty: "Muhammad Sharif", cpw: 0, lpw: 1 },
    { section: "BCS-6A", course: "CS-CN", faculty: "Muhammad Nadeem", cpw: 2, lpw: 0 },
    { section: "BCS-6A", course: "CS-CNL", faculty: "Muhammad Nadeem", cpw: 0, lpw: 1 },

    // ── BCS-7A ──
    { section: "BCS-7A", course: "CS-PR", faculty: "Sania Umer", cpw: 2, lpw: 0 },
    { section: "BCS-7A", course: "CS-MAD", faculty: "Tooba Tehreem", cpw: 2, lpw: 0 },
    { section: "BCS-7A", course: "CS-MADL", faculty: "Tooba Tehreem", cpw: 0, lpw: 1 },
    { section: "BCS-7A", course: "CS-CLD", faculty: "Marwa Khanam", cpw: 2, lpw: 0 },
    { section: "BCS-7A", course: "CS-FYP1", faculty: "Mamuna Fatima", cpw: 1, lpw: 0 },

    // ── BCS-8A ──
    { section: "BCS-8A", course: "CS-FYP2", faculty: "Mamuna Fatima", cpw: 1, lpw: 0 },
    { section: "BCS-8A", course: "CS-DL", faculty: "Muhammad Sharif", cpw: 2, lpw: 0 },

    // ── BSE-5 ──
    { section: "BSE-5", course: "SE-SA", faculty: "Sarah Amjad", cpw: 2, lpw: 0 },
    { section: "BSE-5", course: "SE-SQA", faculty: "Mamuna Fatima", cpw: 2, lpw: 0 },
    { section: "BSE-5", course: "CS-DAA", faculty: "Hafiz Obaid Ullah Mehmood", cpw: 2, lpw: 0 },
    { section: "BSE-5", course: "CS-WT", faculty: "Javaria Umbreen", cpw: 2, lpw: 0 },
    { section: "BSE-5", course: "CS-WTL", faculty: "Javaria Umbreen", cpw: 0, lpw: 1 },
    { section: "BSE-5", course: "MTH-NM", faculty: "Riaz Ahmad", cpw: 2, lpw: 0 },

    // ── BAI-4 ──
    { section: "BAI-4", course: "CS-OS", faculty: "Muhammad Khalil Afzal", cpw: 2, lpw: 0 },
    { section: "BAI-4", course: "CS-OSL", faculty: "Muhammad Khalil Afzal", cpw: 0, lpw: 1 },
    { section: "BAI-4", course: "AI-NLP", faculty: "Muhammad Sharif", cpw: 2, lpw: 0 },
    { section: "BAI-4", course: "AI-CV", faculty: "Sania Umer", cpw: 2, lpw: 0 },
    { section: "BAI-4", course: "AI-CVL", faculty: "Sania Umer", cpw: 0, lpw: 1 },
    { section: "BAI-4", course: "MTH-MVC", faculty: "Adnan Jahangir", cpw: 2, lpw: 0 },
  ];

  // Create offerings individually to get their IDs
  const createdOfferings = [];
  const offeringMap = {}; // key: "section|course" -> offering id

  for (const o of offeringDefs) {
    const sectionId = sid(o.section);
    const courseId = cid(o.course);
    const facultyId = fid(o.faculty);

    if (!sectionId || !courseId) {
      console.warn(`  Skipping offering: section=${o.section}, course=${o.course} (missing ID)`);
      continue;
    }

    const offering = await prisma.courseOffering.create({
      data: {
        semesterId: semester.id,
        courseId,
        sectionId,
        facultyId,
        classesPerWeek: o.cpw,
        labsPerWeek: o.lpw,
      },
    });
    createdOfferings.push(offering);
    offeringMap[`${o.section}|${o.course}`] = offering.id;
  }
  console.log(`Course Offerings: ${createdOfferings.length}`);

  // ─── 7. TIMETABLE ENTRIES ─────────────────────────────────────
  // Helper to get offering ID
  const oid = (section, course) => {
    const key = `${section}|${course}`;
    const id = offeringMap[key];
    if (!id) console.warn(`  WARNING: Offering not found: ${key}`);
    return id || null;
  };

  // Helper to create timetable entry
  async function addEntry(section, course, day, slotIdx, room, isLab = false) {
    const offeringId = oid(section, course);
    const resourceId = rid(room);
    if (!offeringId || !resourceId) return null;

    return prisma.timetableEntry.create({
      data: {
        courseOfferingId: offeringId,
        resourceId,
        semesterId: semester.id,
        dayOfWeek: day,
        slotIndex: slotIdx,
        startTime: TIME_SLOTS[slotIdx].start,
        endTime: TIME_SLOTS[slotIdx].end,
        isLab,
      },
    });
  }

  let ttCount = 0;
  const tt = async (...args) => {
    const entry = await addEntry(...args);
    if (entry) ttCount++;
    return entry;
  };

  // ═══════════════════════════════════════════════════════════════
  // BCS-1A Timetable
  // ═══════════════════════════════════════════════════════════════
  // Mon P3-4: App of ICT (Lab), Beenish Noor, Lab-7
  await tt("BCS-1A", "CS-ICTL", "Monday", 2, "Lab-7", true);
  await tt("BCS-1A", "CS-ICTL", "Monday", 3, "Lab-7", true);
  // Mon P5: Programming Fundamentals, Taimoor Sajjad, 501
  await tt("BCS-1A", "CS-PF", "Monday", 4, "501");
  // Tue P2-3: PF (Lab), Taimoor Sajjad, Lab-7
  await tt("BCS-1A", "CS-PFL", "Tuesday", 1, "Lab-7", true);
  await tt("BCS-1A", "CS-PFL", "Tuesday", 2, "Lab-7", true);
  // Tue P4: Pre-Calculus I, Zertaisha Nasir, G-08
  await tt("BCS-1A", "MTH-PC", "Tuesday", 3, "G-08");
  // Tue P5: Functional English, Tahira Mueen, 501
  await tt("BCS-1A", "HUM-FE", "Tuesday", 4, "501");
  // Wed P2: Functional English, Tahira Mueen, 502
  await tt("BCS-1A", "HUM-FE", "Wednesday", 1, "502");
  // Wed P5-6: Programming Fundamentals, Taimoor Sajjad, F-16
  await tt("BCS-1A", "CS-PF", "Wednesday", 4, "F-16");
  await tt("BCS-1A", "CS-PF", "Wednesday", 5, "F-16");
  // Thu P1-2: Fund. of Sociology, Komal Dure Shehwar, G-11
  await tt("BCS-1A", "HUM-SOC", "Thursday", 0, "G-11");
  await tt("BCS-1A", "HUM-SOC", "Thursday", 1, "G-11");
  // Thu P3-4: Civics & CE, Aatiqa Hasrat, 502
  await tt("BCS-1A", "HUM-CCE", "Thursday", 2, "502");
  await tt("BCS-1A", "HUM-CCE", "Thursday", 3, "502");
  // Thu P5-6: App of ICT, Beenish Noor, F-08
  await tt("BCS-1A", "CS-ICT", "Thursday", 4, "F-08");
  await tt("BCS-1A", "CS-ICT", "Thursday", 5, "F-08");
  // Fri P1: Pre-Calculus I, Zertaisha Nasir, 503
  await tt("BCS-1A", "MTH-PC", "Friday", 0, "503");

  // ═══════════════════════════════════════════════════════════════
  // BCS-1B Timetable
  // ═══════════════════════════════════════════════════════════════
  // Mon P2-3: App of ICT (Lab), Kamran Ali Akhtar, Lab-5
  await tt("BCS-1B", "CS-ICTL", "Monday", 1, "Lab-5", true);
  await tt("BCS-1B", "CS-ICTL", "Monday", 2, "Lab-5", true);
  // Mon P4: PF, Mian Muhammad Talha, G-08
  await tt("BCS-1B", "CS-PF", "Monday", 3, "G-08");
  // Mon P5-6: App of ICT, Kamran Ali Akhtar, 411
  await tt("BCS-1B", "CS-ICT", "Monday", 4, "411");
  await tt("BCS-1B", "CS-ICT", "Monday", 5, "411");
  // Tue P1-2: Fund. of Sociology, Komal Dure Shehwar, F-11
  await tt("BCS-1B", "HUM-SOC", "Tuesday", 0, "F-11");
  await tt("BCS-1B", "HUM-SOC", "Tuesday", 1, "F-11");
  // Tue P4: Pre-Calculus I, Zertaisha Nasir, G-08
  await tt("BCS-1B", "MTH-PC", "Tuesday", 3, "G-10");
  // Tue P5-6: PF, Mian Muhammad Talha, G-08
  await tt("BCS-1B", "CS-PF", "Tuesday", 4, "G-08");
  await tt("BCS-1B", "CS-PF", "Tuesday", 5, "G-08");
  // Wed P3: Functional English, Nimrah Nazim, F-03
  await tt("BCS-1B", "HUM-FE", "Wednesday", 2, "F-03");
  // Wed P5-6: PF (Lab), Mian Muhammad Talha, Lab-5
  await tt("BCS-1B", "CS-PFL", "Wednesday", 4, "Lab-5", true);
  await tt("BCS-1B", "CS-PFL", "Wednesday", 5, "Lab-5", true);
  // Thu P1-2: Civics & CE, Aatiqa Hasrat, 306
  await tt("BCS-1B", "HUM-CCE", "Thursday", 0, "306");
  await tt("BCS-1B", "HUM-CCE", "Thursday", 1, "306");
  // Fri P1: Pre-Calculus I, Zertaisha Nasir, 503
  await tt("BCS-1B", "MTH-PC", "Friday", 0, "504");
  // Fri P2: Functional English, Nimrah Nazim, F-02
  await tt("BCS-1B", "HUM-FE", "Friday", 1, "F-02");

  // ═══════════════════════════════════════════════════════════════
  // BCS-2A Timetable
  // ═══════════════════════════════════════════════════════════════
  // Mon P1: Calc I, Syeda Maedah Kazmi, F-09
  await tt("BCS-2A", "MTH-C1", "Monday", 0, "F-09");
  // Mon P5-6: OOP, Nadir Shah, F-09
  await tt("BCS-2A", "CS-OOP", "Monday", 4, "F-09");
  await tt("BCS-2A", "CS-OOP", "Monday", 5, "F-09");
  // Tue P1-2: OOP (Lab), Nadir Shah, Lab-4
  await tt("BCS-2A", "CS-OOPL", "Tuesday", 0, "Lab-4", true);
  await tt("BCS-2A", "CS-OOPL", "Tuesday", 1, "Lab-4", true);
  // Tue P3: Applied Physics, Umair Hassan, F-09
  await tt("BCS-2A", "PHY-AP", "Tuesday", 2, "F-09");
  // Wed P1-2: ECC, Fatima Farooq, F-09
  await tt("BCS-2A", "CS-ECC", "Wednesday", 0, "F-09");
  await tt("BCS-2A", "CS-ECC", "Wednesday", 1, "F-09");
  // Wed P3: Islamic Studies, Sabir Ullah, F-09
  await tt("BCS-2A", "HUM-IS", "Wednesday", 2, "F-09");
  // Thu P1: Applied Physics, Umair Hassan, 503
  await tt("BCS-2A", "PHY-AP", "Thursday", 0, "503");
  // Thu P5-6: Applied Physics (Lab), Umair Hassan, Lab - Physics
  await tt("BCS-2A", "PHY-APL", "Thursday", 4, "Lab - Physics", true);
  await tt("BCS-2A", "PHY-APL", "Thursday", 5, "Lab - Physics", true);
  // Fri P1: Calc I, Syeda Maedah Kazmi, F-09
  await tt("BCS-2A", "MTH-C1", "Friday", 0, "F-09");
  // Fri P2: Islamic Studies, Sabir Ullah, F-09
  await tt("BCS-2A", "HUM-IS", "Friday", 1, "F-09");

  // ═══════════════════════════════════════════════════════════════
  // BCS-2B Timetable
  // ═══════════════════════════════════════════════════════════════
  // Mon P1: Calc I, Syeda Maedah Kazmi, F-04
  await tt("BCS-2B", "MTH-C1", "Monday", 0, "F-04");
  // Mon P3-4: OOP (Lab), Arubah Hussain, Lab-3
  await tt("BCS-2B", "CS-OOPL", "Monday", 2, "Lab-3", true);
  await tt("BCS-2B", "CS-OOPL", "Monday", 3, "Lab-3", true);
  // Tue P3: Applied Physics, Umair Hassan, F-04
  await tt("BCS-2B", "PHY-AP", "Tuesday", 2, "F-04");
  // Tue P5-6: OOP, Arubah Hussain, F-04
  await tt("BCS-2B", "CS-OOP", "Tuesday", 4, "F-04");
  await tt("BCS-2B", "CS-OOP", "Tuesday", 5, "F-04");
  // Wed P1: Islamic Studies, Abdullah, F-04
  await tt("BCS-2B", "HUM-IS", "Wednesday", 0, "F-04");
  // Wed P5-6: ECC, Fatima Farooq, F-04
  await tt("BCS-2B", "CS-ECC", "Wednesday", 4, "F-04");
  await tt("BCS-2B", "CS-ECC", "Wednesday", 5, "F-04");
  // Thu P1: Applied Physics, Umair Hassan, F-04
  await tt("BCS-2B", "PHY-AP", "Thursday", 0, "F-04");
  // Thu P3-4: Applied Physics (Lab), Umair Hassan, Lab - Physics
  await tt("BCS-2B", "PHY-APL", "Thursday", 2, "Lab - Physics", true);
  await tt("BCS-2B", "PHY-APL", "Thursday", 3, "Lab - Physics", true);
  // Fri P1: Calc I, Syeda Maedah Kazmi, 502
  await tt("BCS-2B", "MTH-C1", "Friday", 0, "502");
  // Fri P2: Islamic Studies, Abdullah, F-04
  await tt("BCS-2B", "HUM-IS", "Friday", 1, "F-04");

  console.log(`Timetable Entries: ${ttCount}`);

  // ─── 8. NOTIFICATIONS ─────────────────────────────────────────
  const adminUser = createdUsers.find((u) => u.email === "admin@cui.edu.pk");
  await prisma.notification.createMany({
    data: [
      {
        userId: adminUser?.id || 1,
        type: "system",
        subject: "SP-26 Timetable Published",
        body: "The Spring 2026 timetable has been published with all sections and course offerings. Review and make changes as needed.",
        read: false,
      },
      {
        userId: null,
        type: "info",
        subject: "Welcome to CUIScheduler",
        body: "Use this system to view timetables, request room/time changes, and manage scheduling. Faculty can request changes, admin can approve/reject.",
        read: false,
      },
      {
        userId: null,
        type: "schedule_change",
        subject: "Spring 2026 Schedule Active",
        body: "The SP-26 semester schedule is now active with 67 sections across 9 departments. All timetable entries have been loaded.",
        read: false,
      },
    ],
  });
  console.log("Notifications: 3");

  // ─── SUMMARY ──────────────────────────────────────────────────
  console.log("\n--- Seed Summary ---");
  console.log(`Users: ${createdUsers.length} (${allFaculty.length} faculty, 1 admin, 2 students)`);
  console.log(`Resources: ${createdResources.length} (${rooms.length} classrooms, ${labs.length} labs)`);
  console.log(`Sections: ${createdSections.length}`);
  console.log(`Courses: ${createdCourses.length}`);
  console.log(`Course Offerings: ${createdOfferings.length}`);
  console.log(`Timetable Entries: ${ttCount}`);
  console.log("\nSeed complete!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
