import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CUIScheduler database (SP-26)...\n");

  // ─── 1. Users ──────────────────────────────────────────────────
  const adminPw = await bcrypt.hash("admin123", 10);
  const facultyPw = await bcrypt.hash("faculty123", 10);
  const studentPw = await bcrypt.hash("student123", 10);

  await prisma.user.createMany({
    data: [
      { email: "admin@cui.edu.pk", name: "Areesha Khan (Admin)", hashedPassword: adminPw, role: "admin", department: "Computer Science" },
      // Faculty users (can log in)
      { email: "taimoor.sajjad@cui.edu.pk", name: "Mr. Taimoor Sajjad", hashedPassword: facultyPw, role: "faculty", department: "Computer Science" },
      { email: "nadir.shah@cui.edu.pk", name: "Dr. Nadir Shah", hashedPassword: facultyPw, role: "faculty", department: "Computer Science" },
      { email: "mamuna.fatima@cui.edu.pk", name: "Dr. Mamuna Fatima", hashedPassword: facultyPw, role: "faculty", department: "Computer Science" },
      { email: "khalil.afzal@cui.edu.pk", name: "Dr. Muhammad Khalil Afzal", hashedPassword: facultyPw, role: "faculty", department: "Computer Science" },
      { email: "umair.hassan@cui.edu.pk", name: "Dr. Umair Hassan", hashedPassword: facultyPw, role: "faculty", department: "Computer Science" },
      { email: "samia.zaffar@cui.edu.pk", name: "Ms. Samia Zaffar", hashedPassword: facultyPw, role: "faculty", department: "Computer Science" },
      { email: "faisal.butt@cui.edu.pk", name: "Dr. Faisal Shafique Butt", hashedPassword: facultyPw, role: "faculty", department: "Computer Science" },
      { email: "beenish.noor@cui.edu.pk", name: "Ms. Beenish Noor", hashedPassword: facultyPw, role: "faculty", department: "Computer Science" },
      { email: "zertaisha@cui.edu.pk", name: "Ms. Zertaisha Nasir", hashedPassword: facultyPw, role: "faculty", department: "Computer Science" },
      { email: "tahira.mueen@cui.edu.pk", name: "Ms. Tahira Mueen", hashedPassword: facultyPw, role: "faculty", department: "Computer Science" },
      { email: "nadeem@cui.edu.pk", name: "Mr. Muhammad Nadeem", hashedPassword: facultyPw, role: "faculty", department: "Computer Science" },
      { email: "alamdar@cui.edu.pk", name: "Alamdar Hussain", hashedPassword: facultyPw, role: "faculty", department: "Computer Science" },
      { email: "obaid@cui.edu.pk", name: "Dr. Hafiz Obaid Ullah Mehmood", hashedPassword: facultyPw, role: "faculty", department: "Computer Science" },
      { email: "tooba@cui.edu.pk", name: "Ms. Tooba Tehreem", hashedPassword: facultyPw, role: "faculty", department: "Computer Science" },
      { email: "javaria@cui.edu.pk", name: "Ms. Javaria Umbreen", hashedPassword: facultyPw, role: "faculty", department: "Computer Science" },
      { email: "marwa@cui.edu.pk", name: "Ms. Marwa Khanam", hashedPassword: facultyPw, role: "faculty", department: "Computer Science" },
      { email: "sharif@cui.edu.pk", name: "Dr. Muhammad Sharif", hashedPassword: facultyPw, role: "faculty", department: "Computer Science" },
      { email: "sania@cui.edu.pk", name: "Ms. Sania Umer", hashedPassword: facultyPw, role: "faculty", department: "Computer Science" },
      { email: "riaz@cui.edu.pk", name: "Mr. Riaz Ahmad", hashedPassword: facultyPw, role: "faculty", department: "Mathematics" },
      { email: "kashif@cui.edu.pk", name: "Dr. Kashif Ayyub", hashedPassword: facultyPw, role: "faculty", department: "Mathematics" },
      { email: "adnan@cui.edu.pk", name: "Dr. Adnan Jahangir", hashedPassword: facultyPw, role: "faculty", department: "Mathematics" },
      { email: "shabbir@cui.edu.pk", name: "Dr. Shabbir Ahmad", hashedPassword: facultyPw, role: "faculty", department: "Mathematics" },
      { email: "ashfaq@cui.edu.pk", name: "Mr. Ashfaq Ahmed", hashedPassword: facultyPw, role: "faculty", department: "Humanities" },
      { email: "shahid@cui.edu.pk", name: "Mr. Muhammad Shahid Khan", hashedPassword: facultyPw, role: "faculty", department: "Humanities" },
      { email: "atiq@cui.edu.pk", name: "Mr. Atiq ur Rehman", hashedPassword: facultyPw, role: "faculty", department: "Humanities" },
      { email: "waheed@cui.edu.pk", name: "Mr. Waheed Ahmad Khan", hashedPassword: facultyPw, role: "faculty", department: "Humanities" },
      { email: "kamran@cui.edu.pk", name: "Dr. Muhammad Kamran", hashedPassword: facultyPw, role: "faculty", department: "Physics" },
      { email: "shabieh@cui.edu.pk", name: "Dr. Shabieh Farwa", hashedPassword: facultyPw, role: "faculty", department: "Physics" },
      { email: "faisal.azam@cui.edu.pk", name: "Dr. Faisal Azam", hashedPassword: facultyPw, role: "faculty", department: "Electrical Engineering" },
      { email: "sarah@cui.edu.pk", name: "Ms. Sarah Amjad", hashedPassword: facultyPw, role: "faculty", department: "Software Engineering" },
      // Student
      { email: "student@cui.edu.pk", name: "Syed Mehmood ul Hassan", hashedPassword: studentPw, role: "student", department: "Computer Science" },
    ],
  });
  console.log("✅ Users: 32");

  // ─── 2. Rooms ──────────────────────────────────────────────────
  const rooms = [];
  // Basement
  for (let i = 1; i <= 17; i++)
    rooms.push({ name: `B-${String(i).padStart(2, "0")}`, type: "classroom", building: "Academic Block", floor: -1, capacity: 60, features: "{}", department: "General", status: "available" });
  // Ground floor classrooms
  for (const n of ["G-01","G-02","G-03","G-04","G-06","G-08","G-09","G-10","G-11","G-12"])
    rooms.push({ name: n, type: "classroom", building: "Academic Block", floor: 0, capacity: 55, features: "{}", department: "General", status: "available" });
  // First floor
  for (const n of ["F-01","F-02","F-03","F-04","F-05","F-06","F-07","F-08","F-09","F-10","F-11","F-13","F-14","F-15","F-16","F-17"])
    rooms.push({ name: n, type: "classroom", building: "Academic Block", floor: 1, capacity: 50, features: "{}", department: "General", status: "available" });
  // 300 Block
  for (const n of ["301","302","303","305","306"])
    rooms.push({ name: n, type: "classroom", building: "300 Block", floor: 3, capacity: 50, features: "{}", department: "General", status: "available" });
  // Civil Block
  for (const n of ["401","406","407","409","410","411"])
    rooms.push({ name: n, type: "classroom", building: "Civil Engineering Block", floor: 4, capacity: 55, features: "{}", department: "Civil Engineering", status: "available" });
  // 500 Block
  for (const n of ["501","502","503","504"])
    rooms.push({ name: n, type: "classroom", building: "500 Block", floor: 5, capacity: 60, features: "{}", department: "General", status: "available" });
  // ME Block
  for (let i = 601; i <= 606; i++)
    rooms.push({ name: String(i), type: "classroom", building: "ME Block", floor: 6, capacity: 50, features: "{}", department: "Mechanical Engineering", status: "available" });

  await prisma.resource.createMany({ data: rooms });
  console.log(`✅ Classrooms: ${rooms.length}`);

  // ─── 3. Labs ───────────────────────────────────────────────────
  const labs = [];
  for (let i = 1; i <= 9; i++)
    labs.push({ name: `Lab-${i}`, type: "lab", building: "Academic Block", floor: 0, capacity: 35, features: "{}", department: "Computer Science", status: "available" });
  labs.push({ name: "G-05 (Lab)", type: "lab", building: "Academic Block", floor: 0, capacity: 30, features: "{}", department: "Computer Science", status: "available" });
  labs.push({ name: "G-07 (Lab)", type: "lab", building: "Academic Block", floor: 0, capacity: 30, features: "{}", department: "Computer Science", status: "available" });
  for (const [n, d] of [
    ["Lab - Physics & Circuit", "Physics"],
    ["Lab - Digital Design", "Electrical Engineering"],
    ["Lab - Psychology", "Psychology"],
    ["Lab - Signal Processing", "Electrical Engineering"],
    ["Lab - Electronics", "Electrical Engineering"],
    ["Lab - Power Systems", "Electrical Engineering"],
    ["Lab - Drawing Hall", "Civil Engineering"],
    ["Lab - Concrete", "Civil Engineering"],
    ["Lab - Geotech", "Civil Engineering"],
    ["Lab - MOM", "Mechanical Engineering"],
    ["Lab - Thermodynamics", "Mechanical Engineering"],
    ["Lab - Fluid Mechanics", "Mechanical Engineering"],
    ["Lab - IC Engineering", "Mechanical Engineering"],
    ["Lab - Chemistry", "Chemistry"],
  ]) {
    labs.push({ name: n, type: "lab", building: "Respective Dept", floor: 0, capacity: 25, features: "{}", department: d, status: "available" });
  }
  await prisma.resource.createMany({ data: labs });
  console.log(`✅ Labs: ${labs.length}`);

  // ─── 4. Semester ───────────────────────────────────────────────
  const semester = await prisma.semester.create({
    data: {
      code: "SP-26",
      name: "Spring 2026",
      startDate: "2026-02-02",
      endDate: "2026-06-15",
      isActive: true,
    },
  });
  console.log("✅ Semester: SP-26 (active)");

  // ─── 5. Courses ────────────────────────────────────────────────
  const courseData = [
    // Semester 1
    { code: "CSC101", name: "Programming Fundamentals", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CSC101L", name: "Programming Fundamentals Lab", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Science" },
    { code: "CSC141", name: "Application of ICT", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CSC141L", name: "Application of ICT Lab", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Science" },
    { code: "MTH104", name: "Pre-Calculus", creditHours: 3, isLab: false, isTechnical: false, department: "Mathematics" },
    { code: "HUM100", name: "Functional English", creditHours: 3, isLab: false, isTechnical: false, department: "Humanities" },
    { code: "HUM110", name: "Pakistan Studies / Civics", creditHours: 2, isLab: false, isTechnical: false, department: "Humanities" },
    { code: "HUM120", name: "Sociology", creditHours: 2, isLab: false, isTechnical: false, department: "Humanities" },
    // Semester 2
    { code: "CSC102", name: "Object Oriented Programming", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CSC102L", name: "OOP Lab", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Science" },
    { code: "EEE241", name: "Digital Logic Design", creditHours: 3, isLab: false, isTechnical: true, department: "Electrical Engineering" },
    { code: "EEE241L", name: "DLD Lab", creditHours: 1, isLab: true, isTechnical: true, department: "Electrical Engineering" },
    { code: "MTH105", name: "Calculus I", creditHours: 3, isLab: false, isTechnical: false, department: "Mathematics" },
    { code: "HUM101", name: "Communication Skills", creditHours: 3, isLab: false, isTechnical: false, department: "Humanities" },
    { code: "HUM111", name: "Islamic Studies", creditHours: 2, isLab: false, isTechnical: false, department: "Humanities" },
    // Semester 3
    { code: "CSC211", name: "Data Structures", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CSC211L", name: "Data Structures Lab", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Science" },
    { code: "CSC301", name: "Software Engineering", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CSC371", name: "Database Systems", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CSC371L", name: "Database Systems Lab", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Science" },
    { code: "MTH201", name: "Calculus II", creditHours: 3, isLab: false, isTechnical: false, department: "Mathematics" },
    { code: "PHY100", name: "Applied Physics", creditHours: 3, isLab: false, isTechnical: false, department: "Physics" },
    // Semester 4
    { code: "CSC341", name: "Operating Systems", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CSC341L", name: "Operating Systems Lab", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Science" },
    { code: "CSC291", name: "Computer Organization & Assembly Language", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CSC291L", name: "COAL Lab", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Science" },
    { code: "MTH251", name: "Multivariate Calculus", creditHours: 3, isLab: false, isTechnical: false, department: "Mathematics" },
    { code: "MTH351", name: "Probability & Statistics", creditHours: 3, isLab: false, isTechnical: false, department: "Mathematics" },
    // Semester 5
    { code: "CSC401", name: "Design & Analysis of Algorithms", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CSC462", name: "Artificial Intelligence", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CSC462L", name: "AI Lab", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Science" },
    { code: "CSC471", name: "Web Technologies", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CSC471L", name: "Web Technologies Lab", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Science" },
    { code: "MTH321", name: "Linear Algebra", creditHours: 3, isLab: false, isTechnical: false, department: "Mathematics" },
    // Semester 6
    { code: "CSC441", name: "Information Security", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CSC451", name: "Compiler Construction", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CSC551", name: "Machine Learning", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CSC551L", name: "Machine Learning Lab", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Science" },
    { code: "CSC491", name: "Computer Networks", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CSC491L", name: "Computer Networks Lab", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Science" },
    // Semester 7
    { code: "CSC561", name: "Pattern Recognition", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CSC571", name: "Mobile App Development", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CSC571L", name: "Mobile App Dev Lab", creditHours: 1, isLab: true, isTechnical: true, department: "Computer Science" },
    { code: "CSC581", name: "Cloud Computing", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CSC599", name: "Final Year Project I", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    // Semester 8
    { code: "CSC600", name: "Final Year Project II", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    { code: "CSC591", name: "Deep Learning", creditHours: 3, isLab: false, isTechnical: true, department: "Computer Science" },
    // SE courses
    { code: "CSC431", name: "Software Architecture", creditHours: 3, isLab: false, isTechnical: true, department: "Software Engineering" },
    { code: "CSC432", name: "Software Quality Assurance", creditHours: 3, isLab: false, isTechnical: true, department: "Software Engineering" },
    // AI-specific
    { code: "CSC521", name: "Natural Language Processing", creditHours: 3, isLab: false, isTechnical: true, department: "Artificial Intelligence" },
    { code: "CSC522", name: "Computer Vision", creditHours: 3, isLab: false, isTechnical: true, department: "Artificial Intelligence" },
    { code: "CSC522L", name: "Computer Vision Lab", creditHours: 1, isLab: true, isTechnical: true, department: "Artificial Intelligence" },
    // Numerical Methods
    { code: "MTH301", name: "Numerical Methods", creditHours: 3, isLab: false, isTechnical: false, department: "Mathematics" },
  ];

  await prisma.course.createMany({ data: courseData });
  console.log(`✅ Courses: ${courseData.length}`);

  // ─── 6. Sections ───────────────────────────────────────────────
  const sectionData = [
    { name: "BCS-1A", program: "BCS", semester: 1, strength: 55, department: "Computer Science" },
    { name: "BCS-1B", program: "BCS", semester: 1, strength: 55, department: "Computer Science" },
    { name: "BCS-2A", program: "BCS", semester: 2, strength: 50, department: "Computer Science" },
    { name: "BCS-2B", program: "BCS", semester: 2, strength: 50, department: "Computer Science" },
    { name: "BCS-3A", program: "BCS", semester: 3, strength: 50, department: "Computer Science" },
    { name: "BCS-3B", program: "BCS", semester: 3, strength: 45, department: "Computer Science" },
    { name: "BCS-4A", program: "BCS", semester: 4, strength: 50, department: "Computer Science" },
    { name: "BCS-5A", program: "BCS", semester: 5, strength: 45, department: "Computer Science" },
    { name: "BCS-5B", program: "BCS", semester: 5, strength: 45, department: "Computer Science" },
    { name: "BCS-6A", program: "BCS", semester: 6, strength: 45, department: "Computer Science" },
    { name: "BCS-7A", program: "BCS", semester: 7, strength: 40, department: "Computer Science" },
    { name: "BCS-8A", program: "BCS", semester: 8, strength: 40, department: "Computer Science" },
    { name: "BSE-5", program: "BSE", semester: 5, strength: 35, department: "Software Engineering" },
    { name: "BAI-4", program: "BAI", semester: 4, strength: 35, department: "Artificial Intelligence" },
  ];

  await prisma.section.createMany({ data: sectionData });
  console.log(`✅ Sections: ${sectionData.length}`);

  // ─── 7. Course Offerings ───────────────────────────────────────
  // Load created records to get IDs
  const allCourses = await prisma.course.findMany();
  const allSections = await prisma.section.findMany();
  const allFaculty = await prisma.user.findMany({ where: { role: "faculty" } });

  const cid = (code) => allCourses.find((c) => c.code === code)?.id;
  const sid = (name) => allSections.find((s) => s.name === name)?.id;
  const fid = (name) => allFaculty.find((f) => f.name.includes(name))?.id;

  // Helper: create offering for a section
  const offerings = [];

  // BCS-1A
  offerings.push(
    { semesterId: semester.id, courseId: cid("CSC101"), sectionId: sid("BCS-1A"), facultyId: fid("Taimoor"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC101L"), sectionId: sid("BCS-1A"), facultyId: fid("Taimoor"), classesPerWeek: 0, labsPerWeek: 1 },
    { semesterId: semester.id, courseId: cid("CSC141"), sectionId: sid("BCS-1A"), facultyId: fid("Beenish"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC141L"), sectionId: sid("BCS-1A"), facultyId: fid("Beenish"), classesPerWeek: 0, labsPerWeek: 1 },
    { semesterId: semester.id, courseId: cid("MTH104"), sectionId: sid("BCS-1A"), facultyId: fid("Riaz"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("HUM100"), sectionId: sid("BCS-1A"), facultyId: fid("Ashfaq"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("HUM110"), sectionId: sid("BCS-1A"), facultyId: fid("Shahid"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("HUM120"), sectionId: sid("BCS-1A"), facultyId: fid("Atiq"), classesPerWeek: 2, labsPerWeek: 0 },
  );

  // BCS-1B
  offerings.push(
    { semesterId: semester.id, courseId: cid("CSC101"), sectionId: sid("BCS-1B"), facultyId: fid("Zertaisha"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC101L"), sectionId: sid("BCS-1B"), facultyId: fid("Zertaisha"), classesPerWeek: 0, labsPerWeek: 1 },
    { semesterId: semester.id, courseId: cid("CSC141"), sectionId: sid("BCS-1B"), facultyId: fid("Tahira"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC141L"), sectionId: sid("BCS-1B"), facultyId: fid("Tahira"), classesPerWeek: 0, labsPerWeek: 1 },
    { semesterId: semester.id, courseId: cid("MTH104"), sectionId: sid("BCS-1B"), facultyId: fid("Kashif"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("HUM100"), sectionId: sid("BCS-1B"), facultyId: fid("Waheed"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("HUM110"), sectionId: sid("BCS-1B"), facultyId: fid("Shahid"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("HUM120"), sectionId: sid("BCS-1B"), facultyId: fid("Atiq"), classesPerWeek: 2, labsPerWeek: 0 },
  );

  // BCS-2A
  offerings.push(
    { semesterId: semester.id, courseId: cid("CSC102"), sectionId: sid("BCS-2A"), facultyId: fid("Nadir"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC102L"), sectionId: sid("BCS-2A"), facultyId: fid("Nadir"), classesPerWeek: 0, labsPerWeek: 1 },
    { semesterId: semester.id, courseId: cid("EEE241"), sectionId: sid("BCS-2A"), facultyId: fid("Faisal Azam"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("EEE241L"), sectionId: sid("BCS-2A"), facultyId: fid("Faisal Azam"), classesPerWeek: 0, labsPerWeek: 1 },
    { semesterId: semester.id, courseId: cid("MTH105"), sectionId: sid("BCS-2A"), facultyId: fid("Adnan"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("HUM101"), sectionId: sid("BCS-2A"), facultyId: fid("Ashfaq"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("HUM111"), sectionId: sid("BCS-2A"), facultyId: fid("Waheed"), classesPerWeek: 2, labsPerWeek: 0 },
  );

  // BCS-2B
  offerings.push(
    { semesterId: semester.id, courseId: cid("CSC102"), sectionId: sid("BCS-2B"), facultyId: fid("Samia Zaffar"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC102L"), sectionId: sid("BCS-2B"), facultyId: fid("Samia Zaffar"), classesPerWeek: 0, labsPerWeek: 1 },
    { semesterId: semester.id, courseId: cid("EEE241"), sectionId: sid("BCS-2B"), facultyId: fid("Faisal Azam"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("EEE241L"), sectionId: sid("BCS-2B"), facultyId: fid("Faisal Azam"), classesPerWeek: 0, labsPerWeek: 1 },
    { semesterId: semester.id, courseId: cid("MTH105"), sectionId: sid("BCS-2B"), facultyId: fid("Shabbir"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("HUM101"), sectionId: sid("BCS-2B"), facultyId: fid("Shahid"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("HUM111"), sectionId: sid("BCS-2B"), facultyId: fid("Waheed"), classesPerWeek: 2, labsPerWeek: 0 },
  );

  // BCS-3A
  offerings.push(
    { semesterId: semester.id, courseId: cid("CSC211"), sectionId: sid("BCS-3A"), facultyId: fid("Umair"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC211L"), sectionId: sid("BCS-3A"), facultyId: fid("Umair"), classesPerWeek: 0, labsPerWeek: 1 },
    { semesterId: semester.id, courseId: cid("CSC301"), sectionId: sid("BCS-3A"), facultyId: fid("Mamuna"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC371"), sectionId: sid("BCS-3A"), facultyId: fid("Faisal Shafique"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC371L"), sectionId: sid("BCS-3A"), facultyId: fid("Faisal Shafique"), classesPerWeek: 0, labsPerWeek: 1 },
    { semesterId: semester.id, courseId: cid("MTH201"), sectionId: sid("BCS-3A"), facultyId: fid("Riaz"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("PHY100"), sectionId: sid("BCS-3A"), facultyId: fid("Kamran"), classesPerWeek: 2, labsPerWeek: 0 },
  );

  // BCS-3B
  offerings.push(
    { semesterId: semester.id, courseId: cid("CSC211"), sectionId: sid("BCS-3B"), facultyId: fid("Nadeem"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC211L"), sectionId: sid("BCS-3B"), facultyId: fid("Nadeem"), classesPerWeek: 0, labsPerWeek: 1 },
    { semesterId: semester.id, courseId: cid("CSC301"), sectionId: sid("BCS-3B"), facultyId: fid("Sarah"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC371"), sectionId: sid("BCS-3B"), facultyId: fid("Mamuna"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC371L"), sectionId: sid("BCS-3B"), facultyId: fid("Mamuna"), classesPerWeek: 0, labsPerWeek: 1 },
    { semesterId: semester.id, courseId: cid("MTH201"), sectionId: sid("BCS-3B"), facultyId: fid("Adnan"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("PHY100"), sectionId: sid("BCS-3B"), facultyId: fid("Shabieh"), classesPerWeek: 2, labsPerWeek: 0 },
  );

  // BCS-4A
  offerings.push(
    { semesterId: semester.id, courseId: cid("CSC341"), sectionId: sid("BCS-4A"), facultyId: fid("Khalil"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC341L"), sectionId: sid("BCS-4A"), facultyId: fid("Khalil"), classesPerWeek: 0, labsPerWeek: 1 },
    { semesterId: semester.id, courseId: cid("CSC291"), sectionId: sid("BCS-4A"), facultyId: fid("Alamdar"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC291L"), sectionId: sid("BCS-4A"), facultyId: fid("Alamdar"), classesPerWeek: 0, labsPerWeek: 1 },
    { semesterId: semester.id, courseId: cid("MTH251"), sectionId: sid("BCS-4A"), facultyId: fid("Kashif"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("MTH351"), sectionId: sid("BCS-4A"), facultyId: fid("Shabbir"), classesPerWeek: 2, labsPerWeek: 0 },
  );

  // BCS-5A
  offerings.push(
    { semesterId: semester.id, courseId: cid("CSC401"), sectionId: sid("BCS-5A"), facultyId: fid("Obaid"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC462"), sectionId: sid("BCS-5A"), facultyId: fid("Sharif"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC462L"), sectionId: sid("BCS-5A"), facultyId: fid("Sharif"), classesPerWeek: 0, labsPerWeek: 1 },
    { semesterId: semester.id, courseId: cid("CSC471"), sectionId: sid("BCS-5A"), facultyId: fid("Tooba"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC471L"), sectionId: sid("BCS-5A"), facultyId: fid("Tooba"), classesPerWeek: 0, labsPerWeek: 1 },
    { semesterId: semester.id, courseId: cid("MTH321"), sectionId: sid("BCS-5A"), facultyId: fid("Adnan"), classesPerWeek: 2, labsPerWeek: 0 },
  );

  // BCS-5B
  offerings.push(
    { semesterId: semester.id, courseId: cid("CSC401"), sectionId: sid("BCS-5B"), facultyId: fid("Obaid"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC462"), sectionId: sid("BCS-5B"), facultyId: fid("Sania"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC462L"), sectionId: sid("BCS-5B"), facultyId: fid("Sania"), classesPerWeek: 0, labsPerWeek: 1 },
    { semesterId: semester.id, courseId: cid("CSC471"), sectionId: sid("BCS-5B"), facultyId: fid("Javaria"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC471L"), sectionId: sid("BCS-5B"), facultyId: fid("Javaria"), classesPerWeek: 0, labsPerWeek: 1 },
    { semesterId: semester.id, courseId: cid("MTH321"), sectionId: sid("BCS-5B"), facultyId: fid("Kashif"), classesPerWeek: 2, labsPerWeek: 0 },
  );

  // BCS-6A
  offerings.push(
    { semesterId: semester.id, courseId: cid("CSC441"), sectionId: sid("BCS-6A"), facultyId: fid("Marwa"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC451"), sectionId: sid("BCS-6A"), facultyId: fid("Alamdar"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC551"), sectionId: sid("BCS-6A"), facultyId: fid("Sharif"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC551L"), sectionId: sid("BCS-6A"), facultyId: fid("Sharif"), classesPerWeek: 0, labsPerWeek: 1 },
    { semesterId: semester.id, courseId: cid("CSC491"), sectionId: sid("BCS-6A"), facultyId: fid("Nadeem"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC491L"), sectionId: sid("BCS-6A"), facultyId: fid("Nadeem"), classesPerWeek: 0, labsPerWeek: 1 },
  );

  // BCS-7A
  offerings.push(
    { semesterId: semester.id, courseId: cid("CSC561"), sectionId: sid("BCS-7A"), facultyId: fid("Sania"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC571"), sectionId: sid("BCS-7A"), facultyId: fid("Tooba"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC571L"), sectionId: sid("BCS-7A"), facultyId: fid("Tooba"), classesPerWeek: 0, labsPerWeek: 1 },
    { semesterId: semester.id, courseId: cid("CSC581"), sectionId: sid("BCS-7A"), facultyId: fid("Marwa"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC599"), sectionId: sid("BCS-7A"), facultyId: fid("Umair"), classesPerWeek: 1, labsPerWeek: 0 },
  );

  // BCS-8A
  offerings.push(
    { semesterId: semester.id, courseId: cid("CSC600"), sectionId: sid("BCS-8A"), facultyId: fid("Mamuna"), classesPerWeek: 1, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC591"), sectionId: sid("BCS-8A"), facultyId: fid("Sharif"), classesPerWeek: 2, labsPerWeek: 0 },
  );

  // BSE-5
  offerings.push(
    { semesterId: semester.id, courseId: cid("CSC431"), sectionId: sid("BSE-5"), facultyId: fid("Sarah"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC432"), sectionId: sid("BSE-5"), facultyId: fid("Mamuna"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC401"), sectionId: sid("BSE-5"), facultyId: fid("Obaid"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC471"), sectionId: sid("BSE-5"), facultyId: fid("Javaria"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC471L"), sectionId: sid("BSE-5"), facultyId: fid("Javaria"), classesPerWeek: 0, labsPerWeek: 1 },
    { semesterId: semester.id, courseId: cid("MTH301"), sectionId: sid("BSE-5"), facultyId: fid("Riaz"), classesPerWeek: 2, labsPerWeek: 0 },
  );

  // BAI-4
  offerings.push(
    { semesterId: semester.id, courseId: cid("CSC341"), sectionId: sid("BAI-4"), facultyId: fid("Khalil"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC341L"), sectionId: sid("BAI-4"), facultyId: fid("Khalil"), classesPerWeek: 0, labsPerWeek: 1 },
    { semesterId: semester.id, courseId: cid("CSC521"), sectionId: sid("BAI-4"), facultyId: fid("Sharif"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC522"), sectionId: sid("BAI-4"), facultyId: fid("Sania"), classesPerWeek: 2, labsPerWeek: 0 },
    { semesterId: semester.id, courseId: cid("CSC522L"), sectionId: sid("BAI-4"), facultyId: fid("Sania"), classesPerWeek: 0, labsPerWeek: 1 },
    { semesterId: semester.id, courseId: cid("MTH251"), sectionId: sid("BAI-4"), facultyId: fid("Adnan"), classesPerWeek: 2, labsPerWeek: 0 },
  );

  // Filter out any null IDs (in case of missing course/section)
  const validOfferings = offerings.filter(
    (o) => o.courseId != null && o.sectionId != null
  );

  await prisma.courseOffering.createMany({ data: validOfferings });
  console.log(`✅ Course Offerings: ${validOfferings.length}`);

  // ─── 8. Notifications ──────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { userId: 1, type: "system", subject: "SP-26 Timetable Published", body: "Spring 2026 timetable is now active. Review your schedule.", read: false },
      { userId: null, type: "info", subject: "Welcome to CUIScheduler", body: "Use this system to view timetables, request changes, and manage scheduling.", read: false },
    ],
  });
  console.log("✅ Notifications: 2");

  console.log("\n🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
