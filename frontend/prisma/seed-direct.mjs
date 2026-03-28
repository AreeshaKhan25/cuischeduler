import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Neon database...");

  // Users
  await prisma.user.createMany({
    data: [
      { email: "admin@cui.edu.pk", name: "Areesha Khan (Admin)", hashedPassword: await bcrypt.hash("admin123", 10), role: "admin", department: "Computer Science" },
      { email: "faculty@cui.edu.pk", name: "Dr. Riaz Ahmad", hashedPassword: await bcrypt.hash("faculty123", 10), role: "faculty", department: "Computer Science" },
      { email: "student@cui.edu.pk", name: "Syed Mehmood ul Hassan", hashedPassword: await bcrypt.hash("student123", 10), role: "student", department: "Computer Science" },
    ],
  });
  console.log("Users: 3");

  // Rooms
  const rooms = [];
  for (let i = 1; i <= 17; i++) rooms.push({ name: `B-${String(i).padStart(2, "0")}`, type: "classroom", building: "Academic Block", floor: 0, capacity: 60, features: "{}", department: "General" });
  for (const n of ["G-01","G-02","G-03","G-04","G-06","G-08","G-09","G-10","G-11","G-12"]) rooms.push({ name: n, type: "classroom", building: "Academic Block", floor: 0, capacity: 55, features: "{}", department: "General" });
  for (const n of ["F-01","F-02","F-03","F-04","F-05","F-06","F-07","F-08","F-09","F-10","F-11","F-13","F-14","F-15","F-16","F-17"]) rooms.push({ name: n, type: "classroom", building: "Academic Block", floor: 1, capacity: 50, features: "{}", department: "General" });
  for (const n of ["301","302","303","305","306"]) rooms.push({ name: n, type: "classroom", building: "300 Block", floor: 3, capacity: 50, features: "{}", department: "General" });
  for (const n of ["401","406","407","409","410","411"]) rooms.push({ name: n, type: "classroom", building: "Civil Engineering Block", floor: 4, capacity: 55, features: "{}", department: "Civil Engineering" });
  for (const n of ["501","502","503","504"]) rooms.push({ name: n, type: "classroom", building: "500 Block", floor: 5, capacity: 60, features: "{}", department: "General" });
  for (let i = 601; i <= 606; i++) rooms.push({ name: String(i), type: "classroom", building: "ME Block", floor: 6, capacity: 50, features: "{}", department: "Mechanical Engineering" });
  await prisma.resource.createMany({ data: rooms });
  console.log(`Rooms: ${rooms.length}`);

  // Labs
  const labs = [];
  for (let i = 1; i <= 9; i++) labs.push({ name: `Lab-${i}`, type: "lab", building: "Academic Block", floor: 0, capacity: 35, features: "{}", department: "Computer Science" });
  labs.push({ name: "G-05 (Lab)", type: "lab", building: "Academic Block", floor: 0, capacity: 30, features: "{}", department: "Computer Science" });
  labs.push({ name: "G-07 (Lab)", type: "lab", building: "Academic Block", floor: 0, capacity: 30, features: "{}", department: "Computer Science" });
  for (const [n, d] of [["Lab - Phy. and Circuit","Physics"],["Lab - Digital Design","EE"],["Lab - Psychology","Psychology"],["Lab - Signal Process.","EE"],["Lab - Electronics","EE"],["Lab - Pow. Sys","EE"],["Lab - Drawing Hall","CVE"],["Lab - Concrete","CVE"],["Lab - Geotech","CVE"],["Lab - MOM","ME"],["Lab - Thermodynamics","ME"],["Lab - Fluid Mechanics","ME"],["Lab - IC Eng.","ME"],["Lab - Chemistry","Chemistry"]]) {
    labs.push({ name: n, type: "lab", building: "Respective Dept", floor: 0, capacity: 25, features: "{}", department: d });
  }
  await prisma.resource.createMany({ data: labs });
  console.log(`Labs: ${labs.length}`);

  // Faculty
  const fac = ["Mr. Taimoor Sajjad","Ms. Beenish Noor","Ms. Zertaisha Nasir","Ms. Tahira Mueen","Syeda Maedah Kazmi","Dr. Nadir Shah","Dr. Umair Hassan","Ms. Samia Zaffar","Dr. Faisal Shafique Butt","Dr. Mamuna Fatima","Mr. Muhammad Nadeem","Alamdar Hussain","Dr. Hafiz Obaid Ullah Mehmood","Dr. Muhammad Khalil Afzal","Ms. Tooba Tehreem","Ms. Javaria Umbreen","Ms. Marwa Khanam","Dr. Muhammad Sharif","Ms. Sania Umer","Mr. Riaz Ahmad","Dr. Kashif Ayyub","Dr. Adnan Jahangir","Dr. Shabbir Ahmad","Mr. Ashfaq Ahmed","Mr. Muhammad Shahid Khan","Mr. Atiq ur Rehman","Mr. Waheed Ahmad Khan","Dr. Muhammad Kamran","Dr. Shabieh Farwa","Dr. Faisal Azam","Ms. Sarah Amjad","Mr. Aamir Satti","Ms. Seema Islam","Ms. Maha Rasheed","Mr. Muhammad Ismail Khan","Dr. Tassawar Iqbal","Dr. Mushtaq Khan","Mr. Amjad Usman","Ms. Samia Riaz","Dr. Muhammad Wasif Nisar","Ms. Maira Afzal","Ms. ZaibunNisa","Dr. Sajjad Ali Haider","Dr. Maliha Amjad","Dr. Kanwal Saeed","Mr. Muhammad Ali","Mr. Ali Roman","Dr. Umer Javed","Dr. Sadiq Ahmad","Dr. Aamir Qamar","Dr. Zahoor Uddin","Mr. Saad Hassan"];
  await prisma.resource.createMany({ data: fac.map(name => ({ name, type: "faculty", building: "Faculty Offices", floor: 0, capacity: 1, features: "{}", department: "Computer Science" })) });
  console.log(`Faculty: ${fac.length}`);

  // Bookings
  const allRes = await prisma.resource.findMany();
  const rid = (name) => allRes.find(r => r.name === name)?.id || 1;

  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);
  const monStr = monday.toISOString().split("T")[0];
  const dateOf = (d) => { const dt = new Date(monday); dt.setDate(monday.getDate() + d); return dt.toISOString().split("T")[0]; };

  const bd = [
    { t: "App. of ICT (Lab) – BCS-1A", cc: "CSC141L", r: "Lab-7", d: monStr, st: "10:40", et: "12:45", dur: 120, pri: 5, s: "completed" },
    { t: "Programming Fundamentals – BCS-1A", cc: "CSC101", r: "501", d: monStr, st: "13:20", et: "14:20", dur: 60, pri: 4, s: "completed" },
    { t: "Software Engg – BCS-3A", cc: "CSC301", r: "407", d: monStr, st: "08:30", et: "09:30", dur: 60, pri: 3, s: "completed" },
    { t: "Data Structures – BCS-3A", cc: "CSC211", r: "G-06", d: monStr, st: "09:35", et: "10:35", dur: 60, pri: 3, s: "completed" },
    { t: "Database Systems – BCS-3A", cc: "CSC371", r: "502", d: monStr, st: "10:40", et: "11:40", dur: 60, pri: 3, s: "completed" },
    { t: "Operating Systems – BCS-4A", cc: "CSC341", r: "503", d: monStr, st: "13:20", et: "14:20", dur: 60, pri: 2, s: "running" },
    { t: "AI (Lab) – BCS-4A", cc: "CSC462L", r: "Lab-6", d: dateOf(1), st: "14:25", et: "16:30", dur: 120, pri: 2, s: "running" },
    { t: "Statistics – BCS-5A", cc: "MTH351", r: "F-09", d: monStr, st: "08:30", et: "09:30", dur: 60, pri: 5, s: "ready" },
    { t: "DAA – BCS-5A", cc: "CSC401", r: "503", d: monStr, st: "10:40", et: "11:40", dur: 60, pri: 2, s: "ready" },
    { t: "Web Tech – BCS-5A", cc: "CSC471", r: "F-01", d: dateOf(1), st: "14:25", et: "15:25", dur: 60, pri: 4, s: "ready" },
    { t: "Pattern Recognition – BCS-7A", cc: "CSC561", r: "F-02", d: monStr, st: "08:30", et: "09:30", dur: 60, pri: 3, s: "completed" },
    { t: "Compiler Construction – BCS-7A", cc: "CSC451", r: "F-04", d: dateOf(1), st: "10:40", et: "11:40", dur: 60, pri: 3, s: "completed" },
    { t: "Info Security – BCS-4A", cc: "CSC441", r: "F-02", d: dateOf(3), st: "08:30", et: "09:30", dur: 60, pri: 3, s: "waiting" },
    { t: "Data Structures – BCS-4A", cc: "CSC211", r: "503", d: dateOf(3), st: "13:20", et: "15:25", dur: 120, pri: 3, s: "waiting" },
    { t: "Linear Algebra – BCS-6A", cc: "MTH321", r: "F-06", d: monStr, st: "08:30", et: "09:30", dur: 60, pri: 5, s: "new" },
    { t: "Deadlock Demo - 503", cc: "CSC341", r: "503", d: today.toISOString().split("T")[0], st: "13:20", et: "14:20", dur: 60, pri: 5, s: "blocked" },
    { t: "Deadlock Demo - Lab-1", cc: "CSC341", r: "Lab-1", d: today.toISOString().split("T")[0], st: "13:20", et: "14:20", dur: 60, pri: 5, s: "blocked" },
    { t: "AI – BAI-4", cc: "CSC462", r: "G-09", d: monStr, st: "10:40", et: "11:40", dur: 60, pri: 2, s: "completed" },
    { t: "ML Funda – BCS-6A", cc: "CSC551", r: "502", d: dateOf(1), st: "09:35", et: "10:35", dur: 60, pri: 2, s: "ready" },
    { t: "Multivar Calc – BSE-5", cc: "MTH301", r: "G-10", d: monStr, st: "08:30", et: "09:30", dur: 60, pri: 5, s: "new" },
  ];

  const algos = ["fcfs", "sjf", "round_robin", "priority"];
  await prisma.booking.createMany({
    data: bd.map((b, i) => ({
      processId: `P${i+1}`, title: b.t, courseCode: b.cc, department: "Computer Science",
      facultyId: 2, resourceId: rid(b.r), resourceType: b.r.startsWith("Lab") ? "lab" : "classroom",
      requestedBy: 1, date: b.d, startTime: b.st, endTime: b.et, durationMinutes: b.dur,
      priority: b.pri, state: b.s, arrivalTime: i * 5, algorithmUsed: algos[i % 4],
      osConceptNote: `P${i+1}: state=${b.s}, pri=${b.pri}.`,
    })),
  });
  console.log(`Bookings: ${bd.length}`);

  // Notifications
  await prisma.notification.createMany({
    data: [
      { fromDepartment: "Computer Science", toDepartment: "Electrical Engineering", type: "request", subject: "Lab Sharing Request", body: "CS requests Lab - Digital Design on Friday.", osConcept: "IPC message passing." },
      { fromDepartment: "Admin", toDepartment: "Computer Science", type: "alert", subject: "SP-26 Timetable Published", body: "Spring 2026 timetable is active.", osConcept: "Broadcast IPC." },
      { fromDepartment: "Computer Science", toDepartment: "Admin", type: "info", subject: "Resource Conflict", body: "Multiple bookings for 503 at slot 5 Thursday.", osConcept: "Deadlock notification." },
      { fromDepartment: "Admin", toDepartment: "All", type: "alert", subject: "System Maintenance", body: "Maintenance Saturday 10PM-2AM.", osConcept: "System interrupt." },
    ],
  });
  console.log("Notifications: 4");
  console.log("Done!");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
