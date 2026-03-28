"""
Seed data for CUIScheduler - COMSATS University Islamabad, Wah Campus.
Creates users, resources, bookings, timetable entries, and notifications.
Idempotent: checks if data exists before seeding.

Room layout (actual campus):
  Academic Block Basement: B-01 to B-17
  Academic Block Ground:   G-01 to G-12
  Academic Block First:    F-01 to F-17
  CS Labs:                 Lab-1 to Lab-9, G-05 (Lab), G-07 (Lab)
  Civil Dept:              401 to 411
  ME Dept:                 601 to 606
  500-block:               501 to 504
  300-block:               301, 302, 303, 305, 306
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import date, time, datetime, timezone, timedelta
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from database import SessionLocal, engine, Base
from models.user import User, UserRole
from models.resource import Resource, ResourceType, ResourceStatus
from models.booking import Booking, BookingState
from models.timetable import TimetableEntry
from models.notification import Notification

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ---------------------------------------------------------------------------
# USERS
# ---------------------------------------------------------------------------
def seed_users(db: Session):
    if db.query(User).first():
        print("Users already exist, skipping.")
        return

    users = [
        User(
            email="admin@cui.edu.pk",
            name="Areesha Khan (Admin)",
            hashed_password=pwd_context.hash("admin123"),
            role=UserRole.admin,
            department="Computer Science",
        ),
        User(
            email="faculty@cui.edu.pk",
            name="Dr. Riaz Ahmad",
            hashed_password=pwd_context.hash("faculty123"),
            role=UserRole.faculty,
            department="Computer Science",
        ),
        User(
            email="student@cui.edu.pk",
            name="Syed Mehmood ul Hassan",
            hashed_password=pwd_context.hash("student123"),
            role=UserRole.student,
            department="Computer Science",
        ),
    ]
    db.add_all(users)
    db.commit()
    print(f"Created {len(users)} users.")


# ---------------------------------------------------------------------------
# RESOURCES  (rooms, labs, faculty)
# ---------------------------------------------------------------------------
def seed_resources(db: Session):
    if db.query(Resource).first():
        print("Resources already exist, skipping.")
        return

    resources = []

    # ── Academic Block – Basement (B-01 to B-17) ──────────────────────────
    basement_rooms = [
        "B-01", "B-02", "B-03", "B-04", "B-05", "B-06", "B-07", "B-08",
        "B-09", "B-10", "B-11", "B-12", "B-13", "B-14", "B-15", "B-16", "B-17",
    ]
    for r in basement_rooms:
        resources.append(Resource(
            name=r, type=ResourceType.classroom,
            building="Academic Block", floor=0, capacity=60,
            features={"projector": True, "ac": True, "whiteboard": True},
            department="General",
        ))

    # ── Academic Block – Ground Floor (G-01 to G-12) ──────────────────────
    ground_rooms = [
        "G-01", "G-02", "G-03", "G-04", "G-06", "G-08",
        "G-09", "G-10", "G-11", "G-12",
    ]
    for r in ground_rooms:
        resources.append(Resource(
            name=r, type=ResourceType.classroom,
            building="Academic Block", floor=0, capacity=55,
            features={"projector": True, "ac": True, "whiteboard": True},
            department="General",
        ))

    # ── Academic Block – First Floor (F-01 to F-17, no F-12) ──────────────
    first_floor_rooms = [
        "F-01", "F-02", "F-03", "F-04", "F-05", "F-06", "F-07", "F-08",
        "F-09", "F-10", "F-11", "F-13", "F-14", "F-15", "F-16", "F-17",
    ]
    for r in first_floor_rooms:
        resources.append(Resource(
            name=r, type=ResourceType.classroom,
            building="Academic Block", floor=1, capacity=50,
            features={"projector": True, "ac": True, "whiteboard": True},
            department="General",
        ))

    # ── 300-block rooms ───────────────────────────────────────────────────
    for r in ["301", "302", "303", "305", "306"]:
        resources.append(Resource(
            name=r, type=ResourceType.classroom,
            building="300 Block", floor=3, capacity=50,
            features={"projector": True, "ac": True, "whiteboard": True},
            department="General",
        ))

    # ── Civil Engineering Block (401-411) ─────────────────────────────────
    civil_rooms = ["401", "406", "407", "409", "410", "411"]
    for r in civil_rooms:
        resources.append(Resource(
            name=r, type=ResourceType.classroom,
            building="Civil Engineering Block", floor=4, capacity=55,
            features={"projector": True, "ac": True, "whiteboard": True},
            department="Civil Engineering",
        ))

    # ── 500-block rooms (501-504) ─────────────────────────────────────────
    for r in ["501", "502", "503", "504"]:
        resources.append(Resource(
            name=r, type=ResourceType.classroom,
            building="500 Block", floor=5, capacity=60,
            features={"projector": True, "ac": True, "whiteboard": True},
            department="General",
        ))

    # ── Mechanical Engineering Block (601-606) ────────────────────────────
    for r in ["601", "602", "603", "604", "605", "606"]:
        resources.append(Resource(
            name=r, type=ResourceType.classroom,
            building="Mechanical Engineering Block", floor=6, capacity=50,
            features={"projector": True, "ac": True, "whiteboard": True},
            department="Mechanical Engineering",
        ))

    # ── Computer Science Labs (Lab-1 to Lab-9, G-05 Lab, G-07 Lab) ───────
    for i in range(1, 10):
        resources.append(Resource(
            name=f"Lab-{i}", type=ResourceType.lab,
            building="Academic Block", floor=0, capacity=35,
            features={"computers": 35, "os": "Windows 11", "software": ["VS Code", "Python", "Java", "C++"]},
            department="Computer Science",
        ))
    resources.append(Resource(
        name="G-05 (Lab)", type=ResourceType.lab,
        building="Academic Block", floor=0, capacity=30,
        features={"computers": 30, "os": "Windows 11", "software": ["VS Code", "Python", "Cisco Packet Tracer"]},
        department="Computer Science",
    ))
    resources.append(Resource(
        name="G-07 (Lab)", type=ResourceType.lab,
        building="Academic Block", floor=0, capacity=30,
        features={"computers": 30, "os": "Ubuntu 22.04", "software": ["Python", "TensorFlow", "Jupyter"]},
        department="Computer Science",
    ))

    # ── Specialized Labs ──────────────────────────────────────────────────
    specialized_labs = [
        ("Lab - Phy. and Circuit", "Physics", 25),
        ("Lab - Digital Design", "Electrical Engineering", 25),
        ("Lab - Psychology", "Psychology", 20),
        ("Lab - Signal Process.", "Electrical Engineering", 25),
        ("Lab - Electronics", "Electrical Engineering", 25),
        ("Lab - Embed. n Contr. Sys.", "Electrical Engineering", 20),
        ("Lab - Pow. Sys", "Electrical Engineering", 20),
        ("Lab - Trans. and Dist.", "Electrical Engineering", 20),
        ("Lab - Comm. n Antenna", "Electrical Engineering", 20),
        ("Lab - Drawing Hall", "Civil Engineering", 40),
        ("Lab - Concrete", "Civil Engineering", 20),
        ("Lab - Geotech", "Civil Engineering", 20),
        ("Lab - Highway", "Civil Engineering", 20),
        ("Lab - Environmental", "Civil Engineering", 20),
        ("Lab - Engr. Mech.", "Civil Engineering", 20),
        ("Lab - MOM", "Mechanical Engineering", 20),
        ("Lab - Thermodynamics", "Mechanical Engineering", 20),
        ("Lab - Fluid Mechanics", "Mechanical Engineering", 20),
        ("Lab - Fluid", "Mechanical Engineering", 20),
        ("Lab - IC Eng.", "Mechanical Engineering", 20),
        ("Lab - Vibration", "Mechanical Engineering", 20),
        ("Lab - Manufacturing", "Mechanical Engineering", 20),
        ("Lab - Chemistry", "Chemistry", 25),
        ("Conference Room (CVE)", "Civil Engineering", 30),
    ]
    for name, dept, cap in specialized_labs:
        resources.append(Resource(
            name=name, type=ResourceType.lab,
            building="Respective Department", floor=0, capacity=cap,
            features={"specialized": True},
            department=dept,
        ))

    # ── Faculty as resources (actual teachers from SP-26 timetable) ───────
    faculty_data = [
        ("Mr. Taimoor Sajjad", "Programming Fundamentals"),
        ("Ms. Beenish Noor", "App. of ICT"),
        ("Ms. Zertaisha Nasir", "Pre-Calculus / Calculus"),
        ("Ms. Tahira Mueen", "Functional English"),
        ("Ms. Komal Dure Shehwar", "Fundamentals of Sociology"),
        ("Ms. Aatiqa Hasrat", "Civics and Community Engagement"),
        ("Mr. Kamran Ali Akhtar", "App. of ICT"),
        ("Mian Muhammad Talha", "Programming Fundamentals / Software Quality Engg"),
        ("Ms. Nimrah Nazim", "Functional English / Expository Writing"),
        ("Syeda Maedah Kazmi", "Discrete Structures"),
        ("Ms. Saffaf", "Expository Writing"),
        ("Dr. Nadir Shah", "OOP"),
        ("Dr. Umair Hassan", "Applied Physics"),
        ("Ms. Arubah Hussain", "OOP / App. of ICT"),
        ("Dr. Ahtisham Masood", "Understanding of Holy Quran"),
        ("Ms. Samia Zaffar", "OOP"),
        ("Dr. Rahim dad Khan", "Applied Physics"),
        ("Ms. Fatima Farooq", "Expository Writing"),
        ("Dr. Faisal Shafique Butt", "Software Engg / HRM"),
        ("Dr. Mamuna Fatima", "Database Systems"),
        ("Mr. Muhammad Nadeem", "Data Structures / OOP"),
        ("Alamdar Hussain", "Fund of DLD / App. of ICT"),
        ("Dr. Hafiz Obaid Ullah Mehmood", "Calculus and Analytic Geometry"),
        ("Mr. Ikram ul Haq", "Data Structures Lab / DevOps"),
        ("Dr. Muhammad Khalil Afzal", "Operating Systems"),
        ("Ms. Tooba Tehreem", "Artificial Intelligence"),
        ("Ms. Javaria Umbreen", "Professional Practices / Business Process Engg"),
        ("Ms. Hina Malik", "Civics and Community Engagement"),
        ("Ms. Marwa Khanam", "Data Structures / Pattern Recognition"),
        ("Dr. Muhammad Sharif", "Data Structures"),
        ("Ms. Sania Umer", "Information Security"),
        ("Ms. Yusra Banaras", "Operating Systems Lab"),
        ("Mr. Riaz Ahmad", "Operating Systems"),
        ("Dr. Mussarat Abdullah", "Data Structures"),
        ("Ms. Kinza Gul", "Civics and Community Engagement"),
        ("Dr. Saima Gulzar Ahmed", "Operating Systems"),
        ("Ms. Hina Saleem", "Information Security"),
        ("Ms. Uzma Shakoor", "Artificial Intelligence"),
        ("Dr. Muhammad Bilal", "Professional Practices / Information Security"),
        ("Dr. Kashif Ayyub", "Design and Analysis of Algorithms"),
        ("Dr. Adnan Jahangir", "Multivariable Calculus"),
        ("Dr. Shabbir Ahmad", "Statistics and Probability Theory"),
        ("Mr. Ashfaq Ahmed", "Mobile App. Dev. / TICS I"),
        ("Mr. Muhammad Shahid Khan", "Web Technologies"),
        ("Mr. Atiq ur Rehman", "COAL"),
        ("Dr. Sulma Rasheed", "Intro to Cyber Security"),
        ("Mr. Waheed Ahmad Khan", "Theory of Automata / Compiler Construction"),
        ("Dr. Muhammad Kamran", "Linear Algebra"),
        ("Dr. Sheraz Anjum", "Machine Learning Fundamentals"),
        ("Mr. Adnan Saleem Mughal", "Computer Architecture Lab / DLD Lab"),
        ("Ms. Samra Siddiqui", "Adv Database Systems"),
        ("Mr. Muhammad Kamran Fiaz", "Intro to Computer Architecture"),
        ("Ms. Asma khalid Butt", "OOP / Machine Learning Lab"),
        ("Dr. Shabieh Farwa", "Linear Algebra"),
        ("Mr. Muhammad Ibrahim", "Intro to Cyber Security / DevOps"),
        ("Dr. Saeed Ur Rehman", "Machine Learning Fundamentals"),
        ("Ms. Laraib Saeed", "Machine Learning Fundamentals"),
        ("Mr. Fasih ur Rehman", "Intro to Computer Arch / RF Electronics"),
        ("Mr. Salman Khan", "Adv Database Sys / Intro to Cyber Security"),
        ("Dr. Faisal Azam", "Artificial Intelligence / Machine Learning"),
        ("Ms. Sarah Amjad", "Numerical Computations / Statistics"),
        ("Mr. Aamir Satti", "Compiler Construction / COAL"),
        ("Ms. Seema Islam", "Artificial Intelligence"),
        ("Mr. Hassan Sardar", "E-Commerce and DM / Mobile App. Dev."),
        ("Ms. Maha Rasheed", "Topics in CS / Software Re-Engg / Professional Practices"),
        ("Mr. Muhammad Ismail Khan", "HRM / Entrepreneurship"),
        ("Dr. Humaira Tabassum", "Chinese"),
        ("Mr. Sadan Ali", "French"),
        ("Ms. Mehwish Zaheer", "Automated Software Testing"),
        ("Mr. Muhammad Yasir", "Chinese"),
        ("Ms. Somaiya Khan", "Intro to Data Science"),
        ("Dr. Tayyab Mehmood", "Operations Research"),
        ("Ms. Huma Farooq", "Software Design and Architecture / Deep Learning"),
        ("Ms. Palwasha Khan", "Software Construction and Development"),
        ("Ms. Yasmeen Khaliq", "Machine Learning / Software Engg"),
        ("Ms. Lubna Awan Hafiza", "Design and Analysis of Algorithms"),
        ("Dr. Ehsan Ullah Munir", "Design and Analysis of Algorithms"),
        ("Dr. Tassawar Iqbal", "Software Engineering"),
        ("Dr. Mushtaq Khan", "Data Structures"),
        ("Mr. Amjad Usman", "Database Systems"),
        ("Mr. Muhammad Abdul Rehman Choudhary", "Fund of DLD"),
        ("Ms. Samia Riaz", "Data Structures"),
        ("Dr. Muhammad Wasif Nisar", "Software Requirement Engineering"),
        ("Ms. Maira Afzal", "Artificial Intelligence"),
        ("Ms. ZaibunNisa", "Information Security"),
        ("Mr. M. Hassan Butt", "Data Structures"),
        ("Dr. Khalid Iqbal", "Programming for AI"),
        ("Dr. Jamal Hussain Shah", "AN Net. and Deep Learning"),
        ("Mr. Muhammad Nouman", "E-Commerce and DM"),
        ("Dr. Sajjad Ali Haider", "Artificial Intelligence / Programming Fundamentals"),
        ("Dr. Maliha Amjad", "Intro to Computer Prog / Linear Circuit Analysis"),
        ("Dr. Kanwal Saeed", "Programming Fundamentals / Intro to Computer Prog"),
        ("Ms. Hamnah Naeem", "OOP"),
        ("Mr. Muhammad Ali", "DLD / Programming Fundamentals"),
        ("Mr. Ali Roman", "DLD / Database Systems"),
        ("Dr. Umer Javed", "Signals and Systems"),
        ("Dr. Sadiq Ahmad", "Electric Machines"),
        ("Dr. Aamir Qamar", "Electromagnetic Theory / Power Distribution"),
        ("Dr. Zahoor Uddin", "DSP / CAED"),
        ("Mr. Saad Hassan", "DCCN"),
        ("Dr. Farooq A. Orakzai", "ECA II / Power Distribution"),
        ("Mr. Belawal Behram", "Power Electronics / AI Lab"),
        ("Dr. Muhammad Adeel Akram", "Digital Image Processing"),
        ("Mr. Riaz Hussain Junejo", "Data Structures Lab / DIP Lab"),
    ]
    for name, spec in faculty_data:
        dept = "Computer Science"
        if any(kw in spec for kw in ["Electric", "ECA", "DSP", "Signal", "Power", "Electromagnetic", "RF", "DLD", "DCCN", "Circuit"]):
            dept = "Electrical Engineering"
        elif any(kw in spec for kw in ["Chinese", "French", "English", "Writing", "Sociology", "Civics", "Holy Quran", "HRM", "Psychology"]):
            dept = "Humanities"
        elif any(kw in spec for kw in ["Calculus", "Algebra", "Statistics", "Pre-Calculus", "Operations Research"]):
            dept = "Mathematics"
        elif any(kw in spec for kw in ["Physics"]):
            dept = "Physics"
        resources.append(Resource(
            name=name, type=ResourceType.faculty,
            building="Faculty Offices", floor=0, capacity=1,
            features={"specialization": spec},
            department=dept,
        ))

    db.add_all(resources)
    db.commit()
    print(f"Created {len(resources)} resources ({len(basement_rooms)} basement, "
          f"{len(ground_rooms)} ground, {len(first_floor_rooms)} first-floor, "
          f"{len(civil_rooms)} civil, 4 x 500-block, 6 x ME, "
          f"11 CS labs, {len(specialized_labs)} specialized labs, "
          f"{len(faculty_data)} faculty).")


# ---------------------------------------------------------------------------
# Helper: look up resource id by name
# ---------------------------------------------------------------------------
def _rid(db: Session, name: str) -> int:
    r = db.query(Resource).filter(Resource.name == name).first()
    if r is None:
        raise ValueError(f"Resource '{name}' not found – run seed_resources first.")
    return r.id


# ---------------------------------------------------------------------------
# BOOKINGS  (based on actual SP-26 timetable)
# ---------------------------------------------------------------------------
def seed_bookings(db: Session):
    if db.query(Booking).first():
        print("Bookings already exist, skipping.")
        return

    today = date.today()
    monday = today - timedelta(days=today.weekday())

    # Time-slot helpers (1-hour slots as on the timetable)
    SLOTS = {
        1: (time(8, 30), time(9, 30)),
        2: (time(9, 35), time(10, 35)),
        3: (time(10, 40), time(11, 40)),
        4: (time(11, 45), time(12, 45)),
        5: (time(13, 20), time(14, 20)),
        6: (time(14, 25), time(15, 25)),
        7: (time(15, 30), time(16, 30)),
    }

    def _slot(n):
        s, e = SLOTS[n]
        return s, e, 60

    def _double_slot(start_n):
        """Two consecutive slots (for labs)."""
        s = SLOTS[start_n][0]
        e = SLOTS[start_n + 1][1]
        return s, e, 120

    booking_data = []

    # ── BCS-1A (Monday-Friday) ────────────────────────────────────────────
    # Mo: slot 3-4 App. of ICT (Lab) Lab-7, slot 5 Prog Fund 501
    s, e, d = _double_slot(3)
    booking_data.append({"title": "App. of ICT (Lab) – BCS-1A", "course_code": "CSC141L", "room": "Lab-7", "date": monday, "start_time": s, "end_time": e, "duration_minutes": d, "priority": 5, "state": "completed"})
    s, e, d = _slot(5)
    booking_data.append({"title": "Programming Fundamentals – BCS-1A", "course_code": "CSC101", "room": "501", "date": monday, "start_time": s, "end_time": e, "duration_minutes": d, "priority": 4, "state": "completed"})

    # Tu: slot 2-3 PF Lab Lab-7, slot 4 Pre-Calc G-08, slot 5 Func Eng 501
    s, e, d = _double_slot(2)
    booking_data.append({"title": "Programming Fundamentals (Lab) – BCS-1A", "course_code": "CSC101L", "room": "Lab-7", "date": monday + timedelta(days=1), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 4, "state": "completed"})
    s, e, d = _slot(4)
    booking_data.append({"title": "Pre-Calculus I – BCS-1A", "course_code": "MTH101", "room": "G-08", "date": monday + timedelta(days=1), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 6, "state": "completed"})
    s, e, d = _slot(5)
    booking_data.append({"title": "Functional English – BCS-1A", "course_code": "HUM101", "room": "501", "date": monday + timedelta(days=1), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 7, "state": "completed"})

    # We: slot 2 Func Eng 502, slot 6 Prog Fund F-16
    s, e, d = _slot(2)
    booking_data.append({"title": "Functional English – BCS-1A", "course_code": "HUM101", "room": "502", "date": monday + timedelta(days=2), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 7, "state": "completed"})
    s, e, d = _slot(6)
    booking_data.append({"title": "Programming Fundamentals – BCS-1A", "course_code": "CSC101", "room": "F-16", "date": monday + timedelta(days=2), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 4, "state": "completed"})

    # Th: slot 1 Fund Sociology G-11, slot 3 Civics 502, slot 6 App ICT F-08
    s, e, d = _slot(1)
    booking_data.append({"title": "Fundamentals of Sociology – BCS-1A", "course_code": "HUM111", "room": "G-11", "date": monday + timedelta(days=3), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 8, "state": "completed"})
    s, e, d = _slot(3)
    booking_data.append({"title": "Civics and Community Engagement – BCS-1A", "course_code": "HUM131", "room": "502", "date": monday + timedelta(days=3), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 8, "state": "completed"})
    s, e, d = _slot(6)
    booking_data.append({"title": "App. of ICT – BCS-1A", "course_code": "CSC141", "room": "F-08", "date": monday + timedelta(days=3), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 5, "state": "completed"})

    # Fr: slot 1 Pre-Calc 503
    s, e, d = _slot(1)
    booking_data.append({"title": "Pre-Calculus I – BCS-1A", "course_code": "MTH101", "room": "503", "date": monday + timedelta(days=4), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 6, "state": "completed"})

    # ── BCS-3A (sample entries) ───────────────────────────────────────────
    s, e, d = _slot(1)
    booking_data.append({"title": "Software Engg – BCS-3A", "course_code": "CSC301", "room": "407", "date": monday, "start_time": s, "end_time": e, "duration_minutes": d, "priority": 3, "state": "completed"})
    s, e, d = _slot(2)
    booking_data.append({"title": "Data Structures – BCS-3A", "course_code": "CSC211", "room": "G-06", "date": monday, "start_time": s, "end_time": e, "duration_minutes": d, "priority": 3, "state": "completed"})
    s, e, d = _slot(3)
    booking_data.append({"title": "Database Systems – BCS-3A", "course_code": "CSC371", "room": "502", "date": monday, "start_time": s, "end_time": e, "duration_minutes": d, "priority": 3, "state": "completed"})

    # Tu: Fund DLD 502, SE 407, DS F-02
    s, e, d = _slot(1)
    booking_data.append({"title": "Fund of DLD – BCS-3A", "course_code": "CSC231", "room": "502", "date": monday + timedelta(days=1), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 4, "state": "completed"})
    s, e, d = _slot(3)
    booking_data.append({"title": "Software Engg – BCS-3A", "course_code": "CSC301", "room": "407", "date": monday + timedelta(days=1), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 3, "state": "completed"})
    s, e, d = _slot(6)
    booking_data.append({"title": "Data Structures – BCS-3A", "course_code": "CSC211", "room": "F-02", "date": monday + timedelta(days=1), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 3, "state": "completed"})

    # We: DLD Lab
    s, e, d = _double_slot(1)
    booking_data.append({"title": "Fund of DLD (Lab) – BCS-3A", "course_code": "CSC231L", "room": "Lab - Digital Design", "date": monday + timedelta(days=2), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 4, "state": "completed"})

    # Th: Calc 503, DB G-09, DS Lab Lab-5
    s, e, d = _slot(1)
    booking_data.append({"title": "Calculus and Analytic Geometry – BCS-3A", "course_code": "MTH201", "room": "503", "date": monday + timedelta(days=3), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 5, "state": "completed"})
    s, e, d = _slot(2)
    booking_data.append({"title": "Database Systems – BCS-3A", "course_code": "CSC371", "room": "G-09", "date": monday + timedelta(days=3), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 3, "state": "completed"})
    s, e, d = _double_slot(6)
    booking_data.append({"title": "Data Structures (Lab) – BCS-3A", "course_code": "CSC211L", "room": "Lab-5", "date": monday + timedelta(days=3), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 3, "state": "completed"})

    # Fr: Calc 502, DB Lab Lab-5
    s, e, d = _slot(1)
    booking_data.append({"title": "Calculus and Analytic Geometry – BCS-3A", "course_code": "MTH201", "room": "502", "date": monday + timedelta(days=4), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 5, "state": "completed"})
    s, e, d = _double_slot(2)
    booking_data.append({"title": "Database Systems (Lab) – BCS-3A", "course_code": "CSC371L", "room": "Lab-5", "date": monday + timedelta(days=4), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 3, "state": "completed"})

    # ── BCS-5A (sample entries) ───────────────────────────────────────────
    s, e, d = _slot(1)
    booking_data.append({"title": "Statistics and Probability Theory – BCS-5A", "course_code": "MTH351", "room": "F-09", "date": monday, "start_time": s, "end_time": e, "duration_minutes": d, "priority": 5, "state": "ready"})
    s, e, d = _slot(3)
    booking_data.append({"title": "Design and Analysis of Algorithms – BCS-5A", "course_code": "CSC401", "room": "503", "date": monday, "start_time": s, "end_time": e, "duration_minutes": d, "priority": 2, "state": "ready"})

    # Tu: Mobile App Dev 504, Multivar Calc G-11, DAA 501, Web Tech F-01
    s, e, d = _slot(1)
    booking_data.append({"title": "Mobile App. Dev. – BCS-5A", "course_code": "CSC461", "room": "504", "date": monday + timedelta(days=1), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 4, "state": "ready"})
    s, e, d = _slot(2)
    booking_data.append({"title": "Multivariable Calculus – BCS-5A", "course_code": "MTH301", "room": "G-11", "date": monday + timedelta(days=1), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 5, "state": "ready"})
    s, e, d = _slot(3)
    booking_data.append({"title": "Design and Analysis of Algorithms – BCS-5A", "course_code": "CSC401", "room": "501", "date": monday + timedelta(days=1), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 2, "state": "ready"})
    s, e, d = _slot(6)
    booking_data.append({"title": "Web Technologies – BCS-5A", "course_code": "CSC471", "room": "F-01", "date": monday + timedelta(days=1), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 4, "state": "ready"})

    # We: Stats 406, Multivar Calc F-17, Web Lab Lab-1
    s, e, d = _slot(1)
    booking_data.append({"title": "Statistics and Probability Theory – BCS-5A", "course_code": "MTH351", "room": "406", "date": monday + timedelta(days=2), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 5, "state": "ready"})
    s, e, d = _slot(2)
    booking_data.append({"title": "Multivariable Calculus – BCS-5A", "course_code": "MTH301", "room": "F-17", "date": monday + timedelta(days=2), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 5, "state": "ready"})
    s, e, d = _double_slot(6)
    booking_data.append({"title": "Web Technologies (Lab) – BCS-5A", "course_code": "CSC471L", "room": "Lab-1", "date": monday + timedelta(days=2), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 4, "state": "ready"})

    # Th: Mobile Lab Lab-2, COAL Lab Lab-3
    s, e, d = _double_slot(2)
    booking_data.append({"title": "Mobile App. Dev. (Lab) – BCS-5A", "course_code": "CSC461L", "room": "Lab-2", "date": monday + timedelta(days=3), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 4, "state": "ready"})
    s, e, d = _double_slot(6)
    booking_data.append({"title": "COAL (Lab) – BCS-5A", "course_code": "CSC321L", "room": "Lab-3", "date": monday + timedelta(days=3), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 4, "state": "ready"})

    # Fr: COAL 501
    s, e, d = _slot(1)
    booking_data.append({"title": "COAL – BCS-5A", "course_code": "CSC321", "room": "501", "date": monday + timedelta(days=4), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 4, "state": "ready"})

    # ── BCS-7A (sample) ──────────────────────────────────────────────────
    s, e, d = _slot(1)
    booking_data.append({"title": "Pattern Recognition – BCS-7A", "course_code": "CSC561", "room": "F-02", "date": monday, "start_time": s, "end_time": e, "duration_minutes": d, "priority": 3, "state": "completed"})
    s, e, d = _double_slot(2)
    booking_data.append({"title": "Compiler Construction (Lab) – BCS-7A", "course_code": "CSC451L", "room": "Lab-2", "date": monday, "start_time": s, "end_time": e, "duration_minutes": d, "priority": 3, "state": "completed"})

    s, e, d = _slot(2)
    booking_data.append({"title": "Numerical Computations – BCS-7A", "course_code": "MTH451", "room": "G-09", "date": monday + timedelta(days=1), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 5, "state": "completed"})
    s, e, d = _slot(3)
    booking_data.append({"title": "Compiler Construction – BCS-7A", "course_code": "CSC451", "room": "F-04", "date": monday + timedelta(days=1), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 3, "state": "completed"})
    s, e, d = _slot(6)
    booking_data.append({"title": "Pattern Recognition – BCS-7A", "course_code": "CSC561", "room": "411", "date": monday + timedelta(days=1), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 3, "state": "completed"})

    # ── BCS-4A (Operating Systems, AI, Data Structures, Info Security) ────
    s, e, d = _double_slot(3)
    booking_data.append({"title": "Artificial Intelligence (Lab) – BCS-4A", "course_code": "CSC462L", "room": "306", "date": monday, "start_time": s, "end_time": e, "duration_minutes": d, "priority": 2, "state": "running"})
    s, e, d = _slot(5)
    booking_data.append({"title": "Operating Systems – BCS-4A", "course_code": "CSC341", "room": "503", "date": monday, "start_time": s, "end_time": e, "duration_minutes": d, "priority": 2, "state": "running"})
    s, e, d = _slot(7)
    booking_data.append({"title": "Operating Systems – BCS-4A", "course_code": "CSC341", "room": "503", "date": monday, "start_time": s, "end_time": e, "duration_minutes": d, "priority": 2, "state": "running"})

    # Tu: Professional Practices F-03, Civics F-05, AI Lab Lab-6
    s, e, d = _slot(1)
    booking_data.append({"title": "Professional Practices – BCS-4A", "course_code": "CSC491", "room": "F-03", "date": monday + timedelta(days=1), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 6, "state": "running"})
    s, e, d = _slot(3)
    booking_data.append({"title": "Civics and Community Engagement – BCS-4A", "course_code": "HUM131", "room": "F-05", "date": monday + timedelta(days=1), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 7, "state": "running"})
    s, e, d = _double_slot(6)
    booking_data.append({"title": "Artificial Intelligence (Lab) – BCS-4A", "course_code": "CSC462L", "room": "Lab-6", "date": monday + timedelta(days=1), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 2, "state": "completed"})

    # Th: Info Security F-02, Data Structures 503
    s, e, d = _slot(1)
    booking_data.append({"title": "Information Security – BCS-4A", "course_code": "CSC441", "room": "F-02", "date": monday + timedelta(days=3), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 3, "state": "waiting"})
    s, e, d = _slot(5)
    booking_data.append({"title": "Data Structures – BCS-4A", "course_code": "CSC211", "room": "503", "date": monday + timedelta(days=3), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 3, "state": "waiting"})
    s, e, d = _slot(6)
    booking_data.append({"title": "Data Structures – BCS-4A", "course_code": "CSC211", "room": "503", "date": monday + timedelta(days=3), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 3, "state": "waiting"})

    # Fr: Info Security Lab Lab-4, OS Lab Lab-2
    s, e, d = _double_slot(1)
    booking_data.append({"title": "Information Security (Lab) – BCS-4A", "course_code": "CSC441L", "room": "Lab-4", "date": monday + timedelta(days=4), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 3, "state": "waiting"})
    s, e, d = _double_slot(6)
    booking_data.append({"title": "Operating Systems (Lab) – BCS-4A", "course_code": "CSC341L", "room": "Lab-2", "date": monday + timedelta(days=4), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 2, "state": "waiting"})

    # ── BCS-6A (Cyber Security, Machine Learning, ToA, Linear Algebra) ────
    s, e, d = _slot(1)
    booking_data.append({"title": "Linear Algebra – BCS-6A", "course_code": "MTH321", "room": "F-06", "date": monday, "start_time": s, "end_time": e, "duration_minutes": d, "priority": 5, "state": "new"})
    s, e, d = _slot(3)
    booking_data.append({"title": "Intro to Cyber Security – BCS-6A", "course_code": "CSC481", "room": "F-04", "date": monday, "start_time": s, "end_time": e, "duration_minutes": d, "priority": 3, "state": "new"})
    s, e, d = _slot(6)
    booking_data.append({"title": "Theory of Automata – BCS-6A", "course_code": "CSC311", "room": "F-08", "date": monday, "start_time": s, "end_time": e, "duration_minutes": d, "priority": 3, "state": "new"})

    # ── BSE-5 (sample) ───────────────────────────────────────────────────
    s, e, d = _slot(1)
    booking_data.append({"title": "Multivariable Calculus – BSE-5", "course_code": "MTH301", "room": "G-10", "date": monday, "start_time": s, "end_time": e, "duration_minutes": d, "priority": 5, "state": "new"})
    s, e, d = _slot(3)
    booking_data.append({"title": "Web Technologies – BSE-5", "course_code": "CSC471", "room": "F-16", "date": monday, "start_time": s, "end_time": e, "duration_minutes": d, "priority": 4, "state": "new"})
    s, e, d = _double_slot(6)
    booking_data.append({"title": "Web Technologies (Lab) – BSE-5", "course_code": "CSC471L", "room": "Lab-4", "date": monday, "start_time": s, "end_time": e, "duration_minutes": d, "priority": 4, "state": "new"})

    # ── Deadlock demo bookings ────────────────────────────────────────────
    s, e, d = _slot(5)
    booking_data.append({"title": "Deadlock Demo - Holds 503", "course_code": "CSC341", "room": "503", "date": today, "start_time": s, "end_time": e, "duration_minutes": d, "priority": 5, "state": "blocked"})
    s, e, d = _slot(5)
    booking_data.append({"title": "Deadlock Demo - Holds Lab-1", "course_code": "CSC341", "room": "Lab-1", "date": today, "start_time": s, "end_time": e, "duration_minutes": d, "priority": 5, "state": "blocked"})

    # ── BAI-4 (Artificial Intelligence section) ───────────────────────────
    s, e, d = _slot(1)
    booking_data.append({"title": "Civics and Community Engagement – BAI-4", "course_code": "HUM131", "room": "G-11", "date": monday, "start_time": s, "end_time": e, "duration_minutes": d, "priority": 7, "state": "completed"})
    s, e, d = _slot(3)
    booking_data.append({"title": "Artificial Intelligence – BAI-4", "course_code": "CSC462", "room": "G-09", "date": monday, "start_time": s, "end_time": e, "duration_minutes": d, "priority": 2, "state": "completed"})
    s, e, d = _double_slot(6)
    booking_data.append({"title": "Information Security (Lab) – BAI-4", "course_code": "CSC441L", "room": "Lab-1", "date": monday, "start_time": s, "end_time": e, "duration_minutes": d, "priority": 3, "state": "completed"})

    # ── Additional varied bookings for richer data ────────────────────────
    s, e, d = _slot(2)
    booking_data.append({"title": "Machine Learning Funda. – BCS-6A", "course_code": "CSC551", "room": "502", "date": monday + timedelta(days=1), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 2, "state": "ready"})
    s, e, d = _double_slot(6)
    booking_data.append({"title": "Intro to Computer Arch (Lab) – BCS-6A", "course_code": "CSC321L", "room": "Lab-5", "date": monday + timedelta(days=1), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 4, "state": "ready"})

    s, e, d = _slot(1)
    booking_data.append({"title": "Linear Algebra – BCS-6A", "course_code": "MTH321", "room": "F-01", "date": monday + timedelta(days=2), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 5, "state": "ready"})
    s, e, d = _slot(3)
    booking_data.append({"title": "Intro to Computer Arch – BCS-6A", "course_code": "CSC321", "room": "G-11", "date": monday + timedelta(days=2), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 4, "state": "ready"})
    s, e, d = _double_slot(6)
    booking_data.append({"title": "Adv Database Sys (Lab) – BCS-6A", "course_code": "CSC571L", "room": "Lab-7", "date": monday + timedelta(days=2), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 3, "state": "ready"})

    # Th: Adv DB F-05
    s, e, d = _slot(3)
    booking_data.append({"title": "Adv Database Sys – BCS-6A", "course_code": "CSC571", "room": "F-05", "date": monday + timedelta(days=3), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 3, "state": "new"})

    # Fr: Cyber Security Lab G-05, ML Lab Lab-8
    s, e, d = _double_slot(2)
    booking_data.append({"title": "Intro to Cyber Security (Lab) – BCS-6A", "course_code": "CSC481L", "room": "G-05 (Lab)", "date": monday + timedelta(days=4), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 3, "state": "new"})
    s, e, d = _double_slot(6)
    booking_data.append({"title": "Machine Learn. Funda. (Lab) – BCS-6A", "course_code": "CSC551L", "room": "Lab-8", "date": monday + timedelta(days=4), "start_time": s, "end_time": e, "duration_minutes": d, "priority": 2, "state": "new"})

    # ── Create booking objects ────────────────────────────────────────────
    algorithms = ["fcfs", "sjf", "round_robin", "priority"]

    for i, bd in enumerate(booking_data):
        room_name = bd["room"]
        res_id = _rid(db, room_name)
        res = db.query(Resource).get(res_id)
        b = Booking(
            process_id=f"P{i + 1}",
            title=bd["title"],
            course_code=bd.get("course_code"),
            department=bd.get("department", "Computer Science"),
            faculty_id=2,
            resource_id=res_id,
            resource_type=res.type.value if res else "classroom",
            requested_by=1,
            date=bd["date"],
            start_time=bd["start_time"],
            end_time=bd["end_time"],
            duration_minutes=bd["duration_minutes"],
            priority=bd["priority"],
            state=bd["state"],
            arrival_time=i * 5,
            waiting_time=bd.get("waiting_time", 0),
            turnaround_time=bd.get("turnaround_time", 0),
            algorithm_used=algorithms[i % len(algorithms)],
            os_concept_note=f"Process P{i+1} ({bd['title']}): state={bd['state']}, priority={bd['priority']}, burst={bd['duration_minutes']}min.",
        )
        db.add(b)

    db.commit()
    print(f"Created {len(booking_data)} bookings.")


# ---------------------------------------------------------------------------
# NOTIFICATIONS
# ---------------------------------------------------------------------------
def seed_notifications(db: Session):
    if db.query(Notification).first():
        print("Notifications already exist, skipping.")
        return

    notifications = [
        Notification(
            from_department="Computer Science",
            to_department="Electrical Engineering",
            type="request",
            subject="Lab Sharing Request",
            body="CS department requests use of Lab - Digital Design on Friday for DLD lab sessions.",
            os_concept="IPC message passing - inter-department communication via shared message queue.",
        ),
        Notification(
            from_department="Admin",
            to_department="Computer Science",
            type="alert",
            subject="SP-26 Timetable Published",
            body="The Spring 2026 timetable has been finalized. All class-wise schedules are now active.",
            os_concept="Broadcast IPC - system-wide notification from kernel (admin) to all processes (departments).",
        ),
        Notification(
            from_department="Computer Science",
            to_department="Admin",
            type="info",
            subject="Resource Conflict Detected",
            body="Multiple bookings detected for room 503 at slot 5 on Thursday. Requires resolution.",
            os_concept="Deadlock notification - like an OS interrupt signaling resource contention.",
        ),
        Notification(
            from_department="Software Engineering",
            to_department="Computer Science",
            type="request",
            subject="Classroom Swap Request",
            body="Requesting swap of F-07 with G-10 for Wednesday morning slot due to capacity requirements for BSE-3.",
            os_concept="Resource reallocation request - like a process requesting memory remapping.",
        ),
        Notification(
            from_department="Admin",
            to_department="All",
            type="alert",
            subject="System Maintenance Notice",
            body="Scheduling system will undergo maintenance on Saturday 10PM-2AM. All pending bookings will be queued.",
            os_concept="System interrupt - OS scheduled maintenance requiring process suspension.",
        ),
        Notification(
            from_department="Computer Science",
            to_department="Computer Science",
            type="info",
            subject="Scheduling Algorithm Changed",
            body="The department scheduling algorithm has been switched from FCFS to Priority-based scheduling for exam period.",
            os_concept="Scheduler policy change - like an OS switching from CFS to real-time scheduling.",
        ),
        Notification(
            from_department="Electrical Engineering",
            to_department="Computer Science",
            type="response",
            subject="Re: Lab Sharing Request",
            body="Approved. Lab - Digital Design is available on Friday from 2PM-5PM.",
            os_concept="IPC response message - acknowledgment in a request-response communication pattern.",
        ),
        Notification(
            from_department="Admin",
            to_department="Computer Science",
            type="alert",
            subject="Deadlock Detected in Exam Scheduling",
            body="Circular dependency detected between OS Exam (503), DB Exam (Lab-5), and Network Exam (Lab-3) for the same time slot.",
            os_concept="Deadlock detection alert - OS detected circular wait condition requiring intervention.",
        ),
    ]

    db.add_all(notifications)
    db.commit()
    print(f"Created {len(notifications)} notifications.")


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------
def seed_all():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created.")

    db = SessionLocal()
    try:
        print("\n--- Seeding CUIScheduler Data (COMSATS Wah Campus SP-26) ---")
        seed_users(db)
        seed_resources(db)
        seed_bookings(db)
        seed_notifications(db)
        print("\n--- Seeding Complete ---")
        print(f"Users: {db.query(User).count()}")
        print(f"Resources: {db.query(Resource).count()}")
        print(f"Bookings: {db.query(Booking).count()}")
        print(f"Notifications: {db.query(Notification).count()}")
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()
