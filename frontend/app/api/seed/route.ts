import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/auth-helpers";
import bcrypt from "bcryptjs";

export async function POST() {
  // Check if already seeded
  const userCount = await prisma.user.count();
  if (userCount > 0) return jsonResponse({ message: "Already seeded", users: userCount });

  // ── Users ──────────────────────────────────────────────────────────
  await prisma.user.createMany({
    data: [
      { email: "admin@cui.edu.pk", name: "Areesha Khan (Admin)", hashedPassword: await bcrypt.hash("admin123", 10), role: "admin", department: "Computer Science" },
      { email: "faculty@cui.edu.pk", name: "Dr. Riaz Ahmad", hashedPassword: await bcrypt.hash("faculty123", 10), role: "faculty", department: "Computer Science" },
      { email: "student@cui.edu.pk", name: "Syed Mehmood ul Hassan", hashedPassword: await bcrypt.hash("student123", 10), role: "student", department: "Computer Science" },
    ],
  });

  // ── Rooms ──────────────────────────────────────────────────────────
  const rooms: { name: string; type: string; building: string; floor: number; capacity: number; department: string }[] = [];

  // Basement B-01 to B-17
  for (let i = 1; i <= 17; i++) rooms.push({ name: `B-${String(i).padStart(2, "0")}`, type: "classroom", building: "Academic Block", floor: 0, capacity: 60, department: "General" });
  // Ground G-01 to G-12 (excl G-05, G-07 which are labs)
  for (const n of ["G-01","G-02","G-03","G-04","G-06","G-08","G-09","G-10","G-11","G-12"]) rooms.push({ name: n, type: "classroom", building: "Academic Block", floor: 0, capacity: 55, department: "General" });
  // First floor F-01 to F-17 (no F-12)
  for (const n of ["F-01","F-02","F-03","F-04","F-05","F-06","F-07","F-08","F-09","F-10","F-11","F-13","F-14","F-15","F-16","F-17"]) rooms.push({ name: n, type: "classroom", building: "Academic Block", floor: 1, capacity: 50, department: "General" });
  // 300-block
  for (const n of ["301","302","303","305","306"]) rooms.push({ name: n, type: "classroom", building: "300 Block", floor: 3, capacity: 50, department: "General" });
  // Civil 401-411
  for (const n of ["401","406","407","409","410","411"]) rooms.push({ name: n, type: "classroom", building: "Civil Engineering Block", floor: 4, capacity: 55, department: "Civil Engineering" });
  // 500-block
  for (const n of ["501","502","503","504"]) rooms.push({ name: n, type: "classroom", building: "500 Block", floor: 5, capacity: 60, department: "General" });
  // ME 601-606
  for (let i = 601; i <= 606; i++) rooms.push({ name: String(i), type: "classroom", building: "ME Block", floor: 6, capacity: 50, department: "Mechanical Engineering" });

  await prisma.resource.createMany({ data: rooms.map(r => ({ ...r, features: "{}" })) });

  // ── CS Labs ────────────────────────────────────────────────────────
  const labs: { name: string; type: string; building: string; capacity: number; department: string }[] = [];
  for (let i = 1; i <= 9; i++) labs.push({ name: `Lab-${i}`, type: "lab", building: "Academic Block", capacity: 35, department: "Computer Science" });
  labs.push({ name: "G-05 (Lab)", type: "lab", building: "Academic Block", capacity: 30, department: "Computer Science" });
  labs.push({ name: "G-07 (Lab)", type: "lab", building: "Academic Block", capacity: 30, department: "Computer Science" });

  // Specialized labs
  for (const [n, d] of [["Lab - Phy. and Circuit","Physics"],["Lab - Digital Design","EE"],["Lab - Psychology","Psychology"],["Lab - Signal Process.","EE"],["Lab - Electronics","EE"],["Lab - Pow. Sys","EE"],["Lab - Drawing Hall","CVE"],["Lab - Concrete","CVE"],["Lab - Geotech","CVE"],["Lab - MOM","ME"],["Lab - Thermodynamics","ME"],["Lab - Fluid Mechanics","ME"],["Lab - IC Eng.","ME"],["Lab - Chemistry","Chemistry"]] as const) {
    labs.push({ name: n, type: "lab", building: "Respective Dept", capacity: 25, department: d });
  }

  await prisma.resource.createMany({ data: labs.map(l => ({ ...l, floor: 0, features: "{}" })) });

  // ── Faculty ────────────────────────────────────────────────────────
  const facultyNames = [
    "Mr. Taimoor Sajjad","Ms. Beenish Noor","Ms. Zertaisha Nasir","Ms. Tahira Mueen",
    "Syeda Maedah Kazmi","Dr. Nadir Shah","Dr. Umair Hassan","Ms. Samia Zaffar",
    "Dr. Faisal Shafique Butt","Dr. Mamuna Fatima","Mr. Muhammad Nadeem","Alamdar Hussain",
    "Dr. Hafiz Obaid Ullah Mehmood","Dr. Muhammad Khalil Afzal","Ms. Tooba Tehreem",
    "Ms. Javaria Umbreen","Ms. Marwa Khanam","Dr. Muhammad Sharif","Ms. Sania Umer",
    "Mr. Riaz Ahmad","Dr. Kashif Ayyub","Dr. Adnan Jahangir","Dr. Shabbir Ahmad",
    "Mr. Ashfaq Ahmed","Mr. Muhammad Shahid Khan","Mr. Atiq ur Rehman",
    "Mr. Waheed Ahmad Khan","Dr. Muhammad Kamran","Dr. Shabieh Farwa",
    "Dr. Faisal Azam","Ms. Sarah Amjad","Mr. Aamir Satti","Ms. Seema Islam",
    "Ms. Maha Rasheed","Mr. Muhammad Ismail Khan","Dr. Tassawar Iqbal",
    "Dr. Mushtaq Khan","Mr. Amjad Usman","Ms. Samia Riaz","Dr. Muhammad Wasif Nisar",
    "Ms. Maira Afzal","Ms. ZaibunNisa","Dr. Sajjad Ali Haider","Dr. Maliha Amjad",
    "Dr. Kanwal Saeed","Mr. Muhammad Ali","Mr. Ali Roman","Dr. Umer Javed",
    "Dr. Sadiq Ahmad","Dr. Aamir Qamar","Dr. Zahoor Uddin","Mr. Saad Hassan",
  ];
  await prisma.resource.createMany({
    data: facultyNames.map(name => ({ name, type: "faculty", building: "Faculty Offices", floor: 0, capacity: 1, features: "{}", department: "Computer Science" })),
  });

  // ── Bookings ───────────────────────────────────────────────────────
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);
  const monStr = monday.toISOString().split("T")[0];
  const dateOf = (d: number) => { const dt = new Date(monday); dt.setDate(monday.getDate() + d); return dt.toISOString().split("T")[0]; };

  // Look up resource IDs
  const allRes = await prisma.resource.findMany();
  const rid = (name: string) => allRes.find(r => r.name === name)?.id || 1;

  const bookingData = [
    { title: "App. of ICT (Lab) – BCS-1A", cc: "CSC141L", room: "Lab-7", date: monStr, st: "10:40", et: "12:45", dur: 120, pri: 5, state: "completed" },
    { title: "Programming Fundamentals – BCS-1A", cc: "CSC101", room: "501", date: monStr, st: "13:20", et: "14:20", dur: 60, pri: 4, state: "completed" },
    { title: "Programming Fundamentals (Lab) – BCS-1A", cc: "CSC101L", room: "Lab-7", date: dateOf(1), st: "09:35", et: "11:40", dur: 120, pri: 4, state: "completed" },
    { title: "Pre-Calculus I – BCS-1A", cc: "MTH101", room: "G-08", date: dateOf(1), st: "11:45", et: "12:45", dur: 60, pri: 6, state: "completed" },
    { title: "Functional English – BCS-1A", cc: "HUM101", room: "501", date: dateOf(1), st: "13:20", et: "14:20", dur: 60, pri: 7, state: "completed" },
    { title: "Software Engg – BCS-3A", cc: "CSC301", room: "407", date: monStr, st: "08:30", et: "09:30", dur: 60, pri: 3, state: "completed" },
    { title: "Data Structures – BCS-3A", cc: "CSC211", room: "G-06", date: monStr, st: "09:35", et: "10:35", dur: 60, pri: 3, state: "completed" },
    { title: "Database Systems – BCS-3A", cc: "CSC371", room: "502", date: monStr, st: "10:40", et: "11:40", dur: 60, pri: 3, state: "completed" },
    { title: "Operating Systems – BCS-4A", cc: "CSC341", room: "503", date: monStr, st: "13:20", et: "14:20", dur: 60, pri: 2, state: "running" },
    { title: "Artificial Intelligence (Lab) – BCS-4A", cc: "CSC462L", room: "Lab-6", date: dateOf(1), st: "14:25", et: "16:30", dur: 120, pri: 2, state: "running" },
    { title: "Statistics and Probability – BCS-5A", cc: "MTH351", room: "F-09", date: monStr, st: "08:30", et: "09:30", dur: 60, pri: 5, state: "ready" },
    { title: "Design and Analysis of Algo – BCS-5A", cc: "CSC401", room: "503", date: monStr, st: "10:40", et: "11:40", dur: 60, pri: 2, state: "ready" },
    { title: "Web Technologies – BCS-5A", cc: "CSC471", room: "F-01", date: dateOf(1), st: "14:25", et: "15:25", dur: 60, pri: 4, state: "ready" },
    { title: "COAL (Lab) – BCS-5A", cc: "CSC321L", room: "Lab-3", date: dateOf(3), st: "14:25", et: "16:30", dur: 120, pri: 4, state: "ready" },
    { title: "Pattern Recognition – BCS-7A", cc: "CSC561", room: "F-02", date: monStr, st: "08:30", et: "09:30", dur: 60, pri: 3, state: "completed" },
    { title: "Compiler Construction – BCS-7A", cc: "CSC451", room: "F-04", date: dateOf(1), st: "10:40", et: "11:40", dur: 60, pri: 3, state: "completed" },
    { title: "Information Security – BCS-4A", cc: "CSC441", room: "F-02", date: dateOf(3), st: "08:30", et: "09:30", dur: 60, pri: 3, state: "waiting" },
    { title: "Data Structures – BCS-4A", cc: "CSC211", room: "503", date: dateOf(3), st: "13:20", et: "15:25", dur: 120, pri: 3, state: "waiting" },
    { title: "Linear Algebra – BCS-6A", cc: "MTH321", room: "F-06", date: monStr, st: "08:30", et: "09:30", dur: 60, pri: 5, state: "new" },
    { title: "Intro to Cyber Security – BCS-6A", cc: "CSC481", room: "F-04", date: monStr, st: "10:40", et: "11:40", dur: 60, pri: 3, state: "new" },
    { title: "Deadlock Demo - Holds 503", cc: "CSC341", room: "503", date: today.toISOString().split("T")[0], st: "13:20", et: "14:20", dur: 60, pri: 5, state: "blocked" },
    { title: "Deadlock Demo - Holds Lab-1", cc: "CSC341", room: "Lab-1", date: today.toISOString().split("T")[0], st: "13:20", et: "14:20", dur: 60, pri: 5, state: "blocked" },
    { title: "Artificial Intelligence – BAI-4", cc: "CSC462", room: "G-09", date: monStr, st: "10:40", et: "11:40", dur: 60, pri: 2, state: "completed" },
    { title: "Machine Learning Funda. – BCS-6A", cc: "CSC551", room: "502", date: dateOf(1), st: "09:35", et: "10:35", dur: 60, pri: 2, state: "ready" },
    { title: "Multivariable Calculus – BSE-5", cc: "MTH301", room: "G-10", date: monStr, st: "08:30", et: "09:30", dur: 60, pri: 5, state: "new" },
  ];

  const algos = ["fcfs", "sjf", "round_robin", "priority"];
  for (let i = 0; i < bookingData.length; i++) {
    const bd = bookingData[i];
    await prisma.booking.create({
      data: {
        processId: `P${i + 1}`, title: bd.title, courseCode: bd.cc, department: "Computer Science",
        facultyId: 2, resourceId: rid(bd.room), resourceType: bd.room.startsWith("Lab") ? "lab" : "classroom",
        requestedBy: 1, date: bd.date, startTime: bd.st, endTime: bd.et, durationMinutes: bd.dur,
        priority: bd.pri, state: bd.state, arrivalTime: i * 5, algorithmUsed: algos[i % 4],
        osConceptNote: `Process P${i + 1}: state=${bd.state}, priority=${bd.pri}.`,
      },
    });
  }

  // ── Notifications ──────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { fromDepartment: "Computer Science", toDepartment: "Electrical Engineering", type: "request", subject: "Lab Sharing Request", body: "CS requests use of Lab - Digital Design on Friday.", osConcept: "IPC message passing." },
      { fromDepartment: "Admin", toDepartment: "Computer Science", type: "alert", subject: "SP-26 Timetable Published", body: "Spring 2026 timetable is active.", osConcept: "Broadcast IPC." },
      { fromDepartment: "Computer Science", toDepartment: "Admin", type: "info", subject: "Resource Conflict Detected", body: "Multiple bookings for room 503 at slot 5 Thursday.", osConcept: "Deadlock notification." },
      { fromDepartment: "Admin", toDepartment: "All", type: "alert", subject: "System Maintenance", body: "Scheduling system maintenance Saturday 10PM-2AM.", osConcept: "System interrupt." },
    ],
  });

  const counts = { users: await prisma.user.count(), resources: await prisma.resource.count(), bookings: await prisma.booking.count(), notifications: await prisma.notification.count() };
  return jsonResponse({ message: "Seeded successfully", ...counts });
}
