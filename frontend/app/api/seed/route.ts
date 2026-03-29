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

  for (let i = 1; i <= 17; i++) rooms.push({ name: `B-${String(i).padStart(2, "0")}`, type: "classroom", building: "Academic Block", floor: 0, capacity: 60, department: "General" });
  for (const n of ["G-01","G-02","G-03","G-04","G-06","G-08","G-09","G-10","G-11","G-12"]) rooms.push({ name: n, type: "classroom", building: "Academic Block", floor: 0, capacity: 55, department: "General" });
  for (const n of ["F-01","F-02","F-03","F-04","F-05","F-06","F-07","F-08","F-09","F-10","F-11","F-13","F-14","F-15","F-16","F-17"]) rooms.push({ name: n, type: "classroom", building: "Academic Block", floor: 1, capacity: 50, department: "General" });
  for (const n of ["301","302","303","305","306"]) rooms.push({ name: n, type: "classroom", building: "300 Block", floor: 3, capacity: 50, department: "General" });
  for (const n of ["401","406","407","409","410","411"]) rooms.push({ name: n, type: "classroom", building: "Civil Engineering Block", floor: 4, capacity: 55, department: "Civil Engineering" });
  for (const n of ["501","502","503","504"]) rooms.push({ name: n, type: "classroom", building: "500 Block", floor: 5, capacity: 60, department: "General" });
  for (let i = 601; i <= 606; i++) rooms.push({ name: String(i), type: "classroom", building: "ME Block", floor: 6, capacity: 50, department: "Mechanical Engineering" });

  await prisma.resource.createMany({ data: rooms.map(r => ({ ...r, features: "{}" })) });

  // ── CS Labs ────────────────────────────────────────────────────────
  const labs: { name: string; type: string; building: string; capacity: number; department: string }[] = [];
  for (let i = 1; i <= 9; i++) labs.push({ name: `Lab-${i}`, type: "lab", building: "Academic Block", capacity: 35, department: "Computer Science" });
  labs.push({ name: "G-05 (Lab)", type: "lab", building: "Academic Block", capacity: 30, department: "Computer Science" });
  labs.push({ name: "G-07 (Lab)", type: "lab", building: "Academic Block", capacity: 30, department: "Computer Science" });

  for (const [n, d] of [["Lab - Phy. and Circuit","Physics"],["Lab - Digital Design","EE"],["Lab - Psychology","Psychology"],["Lab - Signal Process.","EE"],["Lab - Electronics","EE"],["Lab - Pow. Sys","EE"],["Lab - Drawing Hall","CVE"],["Lab - Concrete","CVE"],["Lab - Geotech","CVE"],["Lab - MOM","ME"],["Lab - Thermodynamics","ME"],["Lab - Fluid Mechanics","ME"],["Lab - IC Eng.","ME"],["Lab - Chemistry","Chemistry"]] as const) {
    labs.push({ name: n, type: "lab", building: "Respective Dept", capacity: 25, department: d });
  }

  await prisma.resource.createMany({ data: labs.map(l => ({ ...l, floor: 0, features: "{}" })) });

  // ── Faculty as Resources ──────────────────────────────────────────
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

  // ── Notifications ──────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { type: "request", subject: "Lab Sharing Request", body: "CS requests use of Lab - Digital Design on Friday." },
      { type: "info", subject: "SP-26 Timetable Published", body: "Spring 2026 timetable is active." },
      { type: "info", subject: "Resource Conflict Detected", body: "Multiple bookings for room 503 at slot 5 Thursday." },
      { type: "system", subject: "System Maintenance", body: "Scheduling system maintenance Saturday 10PM-2AM." },
    ],
  });

  const counts = { users: await prisma.user.count(), resources: await prisma.resource.count(), notifications: await prisma.notification.count() };
  return jsonResponse({ message: "Seeded successfully (bookings skipped — model removed)", ...counts });
}
