# CUIScheduler User Manual

## Intelligent Campus Resource Scheduling System

**COMSATS University Islamabad, Wah Campus**
**Operating Systems Course Project**

---

**Version:** 1.0
**Last Updated:** March 2026
**Course Reference:** Operating Systems Concepts (Silberschatz, Galvin, Gagne)

---

## Table of Contents

1. [Welcome and Introduction](#1-welcome-and-introduction)
2. [Getting Started](#2-getting-started)
3. [Understanding the Interface](#3-understanding-the-interface)
4. [Dashboard (Live Overview)](#4-dashboard-live-overview)
5. [Scheduling Engine](#5-scheduling-engine)
6. [Deadlock Detector](#6-deadlock-detector)
7. [Concurrency Monitor](#7-concurrency-monitor)
8. [Resource Map](#8-resource-map)
9. [Timetable Builder](#9-timetable-builder)
10. [Analytics](#10-analytics)
11. [Notifications (IPC Message Queue)](#11-notifications-ipc-message-queue)
12. [Admin Panel](#12-admin-panel)
13. [OS Concepts Reference Guide](#13-os-concepts-reference-guide)
14. [Demo Day Guide](#14-demo-day-guide)
15. [Troubleshooting and FAQ](#15-troubleshooting-and-faq)

---

## 1. Welcome and Introduction

### 1.1 What is CUIScheduler?

CUIScheduler is a production-grade, web-based campus resource scheduling system built specifically for COMSATS University Islamabad, Wah Campus. Unlike a traditional scheduling tool, CUIScheduler is designed from the ground up to **demonstrate core Operating System concepts** through a real, functional university application.

Every feature in the system maps directly to an OS concept from the Silberschatz, Galvin, and Gagne textbook. When you book a classroom, you are creating a **process**. When two departments compete for the same lab, you are witnessing **resource contention**. When the system resolves a double-booking, it is performing **deadlock detection and resolution**.

### 1.2 Who Is This System For?

| Audience | How CUIScheduler Helps |
|---|---|
| **OS Students** | Visualize abstract concepts like CPU scheduling, deadlocks, semaphores, and memory management through tangible campus scenarios |
| **Faculty** | Book classrooms, labs, and time slots while seeing how scheduling algorithms determine the order of requests |
| **Administrators** | Manage all campus resources, configure scheduling policies, and monitor system-wide analytics |
| **Course Instructors** | Use as a live teaching aid to demonstrate OS concepts with real university data |

### 1.3 OS Concepts Demonstrated

CUIScheduler covers the following Operating System topics, each mapped to a specific chapter in the textbook:

| OS Concept | Textbook Chapter | Where in CUIScheduler |
|---|---|---|
| CPU Scheduling (FCFS, SJF, RR, Priority) | Chapter 5 | Scheduling Engine |
| Process Management (PCB, State Machine) | Chapter 3 | All booking views |
| Deadlock Detection (Resource Allocation Graph) | Chapter 7 | Deadlock Detector |
| Deadlock Avoidance (Banker's Algorithm) | Chapter 7 | Deadlock Detector |
| Synchronization (Semaphore, Mutex) | Chapter 6 | Concurrency Monitor |
| Race Conditions and Critical Sections | Chapter 6 | Concurrency Monitor |
| Memory Management (Bitmap Allocation) | Chapter 8 | Resource Map |
| Fragmentation and Compaction | Chapter 8 | Resource Map, Analytics |
| Inter-Process Communication (Message Queue) | Chapter 3 | Notifications |
| Load Balancing | Chapter 5 | Analytics |
| Context Switching | Chapter 5 | Round Robin Scheduler |

### 1.4 Technology Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion, Recharts, D3.js
- **Backend:** FastAPI (Python), SQLAlchemy, PostgreSQL
- **Real-time:** WebSockets
- **Drag-and-Drop:** @dnd-kit
- **State Management:** Zustand
- **Deployment:** Docker Compose

---

## 2. Getting Started

### 2.1 System Requirements

| Requirement | Minimum | Recommended |
|---|---|---|
| **Browser** | Chrome 90+, Firefox 88+, Edge 90+ | Latest Chrome or Edge |
| **Screen Resolution** | 1280 x 720 | 1920 x 1080 or higher |
| **Internet Connection** | Broadband | Stable broadband |
| **JavaScript** | Must be enabled | Must be enabled |

> **Note:** CUIScheduler uses modern CSS features, animations, and WebSocket connections. For the best experience, use a Chromium-based browser with hardware acceleration enabled.

### 2.2 How to Access the System

If running via Docker Compose (the standard deployment):

```
docker compose up --build
```

The system will be available at:

| Service | URL | Description |
|---|---|---|
| **Frontend** | `http://localhost:3000` | Main application interface |
| **Backend API** | `http://localhost:8000` | REST API server |
| **API Documentation** | `http://localhost:8000/docs` | Swagger/OpenAPI interactive docs |

If running in development mode:

```bash
# Terminal 1: Start the backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Terminal 2: Start the frontend
cd frontend
npm install
npm run dev
```

### 2.3 Default Login Credentials

The system comes pre-seeded with three user accounts, each representing a different role:

| Role | Email | Password | Full Name | Department |
|---|---|---|---|---|
| **Admin** | `admin@cui.edu.pk` | `admin123` | Dr. Ahmed Khan (Admin) | Computer Science |
| **Faculty** | `faculty@cui.edu.pk` | `faculty123` | Dr. Sara Ali | Computer Science |
| **Student** | `student@cui.edu.pk` | `student123` | Ali Hassan | Computer Science |

> **Security Note:** These are default credentials for development and demonstration purposes. In a production environment, you should change these immediately after first login.

### 2.4 Role Permissions

| Feature | Admin | Faculty | Student |
|---|---|---|---|
| View Dashboard | Yes | Yes | Yes |
| Run Scheduling Algorithms | Yes | Yes | Yes |
| Create Booking Requests | Yes | Yes | Yes (limited) |
| Deadlock Detection | Yes | Yes | View only |
| Concurrency Monitor | Yes | Yes | View only |
| Resource Map | Yes | Yes | Yes |
| Timetable Management | Yes | Yes (own dept) | View only |
| Analytics | Yes | Yes | Limited |
| Notifications | Yes | Yes | Yes |
| Admin Panel | Yes | No | No |
| System Settings | Yes | No | No |
| Manage Resources | Yes | No | No |
| Manage Users | Yes | No | No |

### 2.5 First Login Walkthrough

1. Open your browser and navigate to `http://localhost:3000`
2. You will see the login page with the CUIScheduler logo and a dark-themed interface
3. Enter your email address (e.g., `admin@cui.edu.pk`)
4. Enter your password (e.g., `admin123`)
5. Click **Sign In**
6. You will be redirected to the **Dashboard** page
7. Take note of:
   - The **navigation sidebar** on the left
   - The **top bar** with a live clock, notification bell, and user avatar
   - The **OS Concept badges** that appear throughout the interface (glowing red/orange indicators)

---

## 3. Understanding the Interface

### 3.1 Navigation Sidebar

The sidebar is the primary navigation element, located on the left side of the screen. It contains the following menu items, organized by function:

| Icon | Menu Item | Description | OS Concept Tie-in |
|---|---|---|---|
| Dashboard icon | **Dashboard** | Live system overview with stat cards, Gantt chart, and resource rings | CPU utilization, resource allocation |
| CPU icon | **Scheduling Engine** | Run and visualize CPU scheduling algorithms on booking requests | FCFS, SJF, RR, Priority (Ch. 5) |
| Shield icon | **Deadlock Detector** | Visualize Resource Allocation Graphs and run Banker's Algorithm | Deadlock detection/avoidance (Ch. 7) |
| Lock icon | **Concurrency Monitor** | Semaphore and mutex visualization, race condition demos | Synchronization primitives (Ch. 6) |
| Map icon | **Resource Map** | Building floor plans and memory bitmap allocation view | Memory management (Ch. 8) |
| Calendar icon | **Timetable** | Weekly drag-and-drop schedule builder with conflict detection | Process scheduling, Gantt charts (Ch. 5) |
| Chart icon | **Analytics** | Algorithm comparison, usage heatmaps, faculty load analysis | Load balancing, throughput (Ch. 5) |
| Bell icon | **Notifications** | IPC message queue between departments | Inter-process communication (Ch. 3) |
| Gear icon | **Admin Panel** | System administration (admin role only) | Kernel-mode operations (Ch. 2) |

The currently active page is highlighted with a blue accent on the sidebar item.

### 3.2 Top Bar Features

The top bar spans the full width of the content area and includes:

```
+------------------------------------------------------------------+
|  [Breadcrumb: CUIScheduler > Module > Page]          [Clock] [Bell] [Avatar] |
+------------------------------------------------------------------+
```

- **Breadcrumb Trail:** Shows your current location in the application hierarchy (e.g., `CUIScheduler > Modules > Scheduling Engine`)
- **Live Clock:** Displays the current system time, updating in real-time. This serves as a visual reminder of the time-based nature of scheduling
- **Notification Bell:** Shows an unread message count badge. Click to navigate to the Notifications page
- **User Menu (Avatar):** Shows the logged-in user's name and role. Click to access profile settings or sign out

### 3.3 OS Concept Badges

One of the most distinctive features of CUIScheduler is the **OS Concept Badge** system. These badges appear throughout the interface as small, glowing indicators that connect every UI element to an Operating System concept.

#### What They Look Like

OS Concept Badges appear as small, rounded labels with:
- A **pulsing red/orange glow** effect (when active)
- **Text label** showing the concept name (e.g., "CPU Scheduling", "Semaphore")
- **Chapter reference** in monospace font (e.g., "Ch.5", "Ch.7")

#### Where They Appear

- **Page Headers:** Each page has OS concept badges in its header showing which concepts that page demonstrates
- **Stat Cards:** Individual metrics have badges explaining the OS analogy
- **Visualization Panels:** Charts and graphs have badges explaining what OS concept is being visualized
- **Form Fields:** Even input fields may have badges explaining how the field maps to an OS concept (e.g., "burst time" on booking duration)

#### How to Read Them

When you see an OS Concept Badge:

1. **Read the concept name** -- this tells you which OS topic is being demonstrated
2. **Note the chapter** -- this maps to the Silberschatz textbook chapter
3. **Hover or click** to see a detailed description of how the UI element maps to the OS concept
4. **A pulsing badge** indicates the concept is currently active or being demonstrated in real-time

Example:
```
[ OS Ch.5 | CPU Scheduling -- FCFS ]
  "Booking requests are treated as processes competing for CPU (resource)
   time. First Come First Served processes them in arrival order."
```

### 3.4 OS Concept Right Panel

Some pages feature an expandable right panel that provides deeper OS concept explanations. To use it:

1. Look for the **OS concept icons** in the page header area
2. Click on any OS concept badge in the header
3. A panel slides open from the right showing:
   - Concept name and chapter reference
   - Detailed explanation of the OS concept
   - How it maps to the university scheduling scenario
   - Key observations to look for on the current page

### 3.5 Color Coding System

CUIScheduler uses a consistent color system throughout the application. Understanding these colors helps you quickly read the state of the system.

#### Process State Colors

Every booking request is treated as a process with a state. The states follow the standard OS process state machine:

| State | Background | Text Color | Border | Meaning |
|---|---|---|---|---|
| **New** | Dark blue | Light blue (#93c5fd) | Blue (#3b82f6) | Request just submitted, not yet in ready queue |
| **Ready** | Dark green | Light green (#86efac) | Green (#22c55e) | In the ready queue, waiting for CPU/resource |
| **Running** | Dark teal | Teal (#5eead4) | Teal (#2dd4bf) | Currently being processed / resource in use |
| **Waiting** | Dark amber | Yellow (#fcd34d) | Amber (#f59e0b) | Blocked, waiting for I/O or another resource |
| **Completed** | Dark gray | Gray (#8892aa) | Gray (#3a4560) | Process finished, resource released |
| **Blocked** | Dark red | Light red (#fca5a5) | Red (#ef4444) | Deadlocked or permanently blocked |

#### Process State Transitions

```
                    +--------+
                    |  NEW   |
                    +---+----+
                        |
                        v (admitted)
                    +--------+
            +------>| READY  |<-----------+
            |       +---+----+            |
            |           |                 |
            |           v (dispatched)    | (I/O complete)
            |       +--------+            |
            |       |RUNNING |--------->+---------+
            |       +---+----+ (I/O     | WAITING |
            |           |      request) +---------+
            |           |
            |           v (preempted by RR quantum)
            +-----------+
                        |
                        v (exit)
                  +-----------+
                  | COMPLETED |
                  +-----------+
```

#### Department Colors

Each academic department is assigned a unique color for easy identification:

| Department | Color | Hex Code |
|---|---|---|
| Computer Science | Blue | `#4f8ef7` |
| Software Engineering | Teal | `#2dd4bf` |
| Electrical Engineering | Amber | `#f59e0b` |
| Mechanical Engineering | Red | `#ef4444` |
| Management Sciences | Purple | `#a855f7` |
| Mathematics | Green | `#22c55e` |

#### Algorithm Colors

Each scheduling algorithm has its own color for chart differentiation:

| Algorithm | Color | Hex Code |
|---|---|---|
| FCFS | Blue | `#4f8ef7` |
| SJF | Teal | `#2dd4bf` |
| Round Robin | Amber | `#f59e0b` |
| Priority | Purple | `#a855f7` |

#### Resource Status Indicators

| Status | Visual | Meaning |
|---|---|---|
| **Available** | Green dot / green border | Resource is free and can be booked |
| **Occupied** | Red dot / red border | Resource currently in use |
| **Reserved** | Amber dot / amber border | Resource reserved for future use |
| **Maintenance** | Gray dot / gray border | Resource offline for maintenance |

---

## 4. Dashboard (Live Overview)

The Dashboard is the landing page after login. It provides a real-time overview of the entire campus scheduling system, presenting key metrics and live visualizations.

**Navigation:** Sidebar > Dashboard
**Breadcrumb:** CUIScheduler > Dashboard
**OS Concepts:** CPU Scheduling (Ch. 5), Resource Allocation (Ch. 7)

### 4.1 Stat Cards

The top section displays four stat cards in a responsive grid:

| Card | Value Example | Subtitle | OS Concept |
|---|---|---|---|
| **Active Bookings** | 42 | "Currently running processes" | Process States (Ch. 3) -- represents processes in RUNNING state |
| **Resources** | 128 | "Total managed resources" | Resource Pool (Ch. 7) -- total allocatable resources |
| **Faculty** | 67 | "Active faculty members" | (No direct mapping) |
| **Scheduled Today** | 18 | "Classes and events" | (Process count) |

Each stat card may show a **trend indicator** -- a small green (up) or red (down) arrow with a percentage, showing change compared to the previous period.

**How to read a stat card:**
1. The large number is the current metric value
2. The subtitle explains what the number represents
3. The icon on the left provides visual context
4. If an OS Concept Badge is present, hover over it to see how this metric maps to an OS concept
5. The trend arrow (if present) shows whether the metric is increasing or decreasing

### 4.2 System Status Panel

Below the stat cards on the left side, you will find the **System Status** panel. This card displays:

| Field | Example Value | Meaning |
|---|---|---|
| Scheduler Algorithm | Round Robin (q=4) | Which CPU scheduling algorithm is currently active |
| Queue Length | 7 waiting | Number of booking requests in the ready queue |
| CPU Utilization | 87.3% | Percentage of resource time being utilized |
| Deadlock Status | No deadlock detected | Whether the system has detected any deadlocks |

A **LivePulse** indicator (green pulsing dot) in the top-right of this card confirms that the data is updating in real-time.

### 4.3 OS Concepts Active Panel

On the right side, the **OS Concepts Active** panel shows which Operating System concepts are currently being demonstrated by the live system state:

| Concept | Status | Chapter |
|---|---|---|
| FCFS Scheduling | Active | Ch. 5 |
| Banker's Algorithm | Monitoring | Ch. 8 |
| Semaphore Control | Active | Ch. 6 |
| Memory Allocation | Idle | Ch. 9 |

Status meanings:
- **Active** (green): The concept is actively being demonstrated right now
- **Monitoring** (amber): The concept's module is running in the background
- **Idle** (gray): The concept's module is not currently active

### 4.4 Live Gantt Chart

The Gantt chart on the Dashboard shows currently running and recently completed bookings plotted against a time axis. Each horizontal bar represents a booking/process:

- **Bar color** corresponds to the department color
- **Bar length** represents the duration of the booking
- **Bar position** on the time axis shows start and end times
- **Bar label** shows the course code and room number

**OS Concept:** This is exactly how CPU scheduling Gantt charts work in textbooks -- processes are shown as bars on a timeline, allowing you to visualize execution order, waiting time, and context switches.

### 4.5 Resource Utilization Rings

Circular progress indicators (ring charts) show the utilization percentage of key resource categories:

- **Classrooms:** What percentage of classroom time slots are booked
- **Labs:** What percentage of lab time slots are booked
- **Faculty:** What percentage of faculty teaching capacity is allocated

### 4.6 Process Queue Widget

A compact view of the current process ready queue, showing:
- Process ID (e.g., P1, P2, P3)
- Process state (color-coded)
- Priority level
- Waiting time

This widget mirrors the ready queue data structure used by OS schedulers.

### 4.7 Semaphore Status Widget

Shows the current state of semaphore-controlled resources:
- Resource name
- Semaphore count (current / maximum)
- Number of processes in the wait queue

### 4.8 Activity Feed

A chronological log of recent system events:
- Booking confirmations
- Resource releases
- Conflicts detected
- Algorithm changes

Each entry shows a timestamp, action description, and the user or system component that triggered it.

---

## 5. Scheduling Engine

The Scheduling Engine is the core demonstration module of CUIScheduler. It implements four classic CPU scheduling algorithms and applies them to real university booking requests.

**Navigation:** Sidebar > Scheduling Engine
**Breadcrumb:** CUIScheduler > Modules > Scheduling Engine
**OS Concepts:** FCFS (Ch. 5), SJF (Ch. 5), Round Robin (Ch. 5), Priority (Ch. 5), PCB (Ch. 3), Context Switch (Ch. 5)

### 5.1 The Scheduling Analogy

In an Operating System, the CPU scheduler decides which process gets to use the CPU next. In CUIScheduler, the scheduling engine decides which booking request gets allocated a campus resource (classroom, lab, etc.) next.

| OS Concept | CUIScheduler Equivalent |
|---|---|
| Process | Booking request |
| CPU | Campus resource (room/lab) |
| Burst time | Duration of the booking (in minutes) |
| Arrival time | When the booking request was submitted |
| Priority | Urgency level (1 = highest, 10 = lowest) |
| Process Control Block (PCB) | Booking record with PID, state, priority, times |
| Ready queue | List of booking requests waiting to be processed |
| Context switch | Switching from processing one booking to another |
| Turnaround time | Total time from request submission to booking completion |
| Waiting time | Time a request spends in the ready queue |

### 5.2 Page Layout

The Scheduling Engine page is organized into the following sections from top to bottom:

1. **Page Header** -- Title, description, and OS concept badges
2. **Algorithm Tabs** -- Select which algorithm to run (FCFS, SJF, RR, Priority)
3. **Split Layout** -- Booking Request Form (left) + Process Ready Queue (right)
4. **Controls Bar** -- Run, Compare All, and Reset buttons
5. **Results Section** (appears after running) -- Metrics, Gantt Chart, Trace Log
6. **Comparison Section** (appears after Compare All) -- Side-by-side algorithm comparison

### 5.3 Creating a Booking Request

To add a new booking request to the process queue, use the **Booking Request Form** on the left side of the split layout.

**Step-by-step:**

1. **Title:** Enter a descriptive name for the booking (e.g., "Operating Systems Lecture")
2. **Course Code:** Enter the course code (e.g., "CS371"). This helps identify the booking
3. **Department:** Select the department from the dropdown:
   - Computer Science
   - Software Engineering
   - Electrical Engineering
   - Mechanical Engineering
   - Management Sciences
   - Mathematics
4. **Resource Type:** Choose between:
   - `classroom` -- A lecture room
   - `lab` -- A computer or hardware lab
   - `faculty` -- A faculty member's availability
   - `exam_slot` -- An examination time slot
5. **Resource:** Select the specific resource from the filtered dropdown
6. **Date:** Pick the booking date
7. **Start Time:** Select from available time slots (08:00 to 17:00)
8. **End Time:** Select the end time (must be after start time)
9. **Duration (minutes):** Auto-calculated from start/end times. This is the **burst time** in OS terminology
10. **Priority:** Set a priority level from 1 (highest urgency) to 10 (lowest urgency)
    - Priority 1-2: Critical (exams, FYP defenses)
    - Priority 3-4: High (core lectures, labs)
    - Priority 5-6: Medium (tutorials, workshops)
    - Priority 7-8: Low (meetings, seminars)
    - Priority 9-10: Lowest (optional sessions)
11. Click **Add to Queue** to submit the booking request

**OS Concept Note:** When you click "Add to Queue," you are creating a new process. The system generates a Process Control Block (PCB) with a unique Process ID (PID), records the arrival time, burst time, and priority, and places the process in the **New** state before moving it to the **Ready** queue.

### 5.4 Understanding the Process Ready Queue

The Process Ready Queue panel on the right side shows all booking requests that are waiting to be scheduled. Each row displays:

| Column | Description | OS Mapping |
|---|---|---|
| **PID** | Process ID (e.g., P1, P2, ...) | Unique process identifier |
| **Title** | Booking title | Process name |
| **Course** | Course code | (Application-specific) |
| **Burst** | Duration in minutes | CPU burst time |
| **Priority** | 1-10 (1 = highest) | Process priority |
| **Arrival** | When request was submitted | Arrival time |
| **State** | New, Ready, Running, etc. | Process state |

The queue is displayed as a table with color-coded state indicators. Processes in the **Ready** state have a green border, **Running** processes have a teal border, and **Waiting** processes have an amber border.

**Quick Actions:**
- **Add 5 Random:** Generates five random booking requests with varied burst times and priorities. Useful for quickly populating the queue for algorithm testing
- **Load Demo Set:** Loads the full set of pre-seeded booking data from the database

### 5.5 The Four Scheduling Algorithms

#### 5.5.1 First Come First Served (FCFS)

**Tab Color:** Blue (#4f8ef7)
**Chapter Reference:** OS Ch. 5

**How it works:**
FCFS is the simplest scheduling algorithm. Booking requests are processed in the exact order they arrive -- the first request to enter the ready queue is the first to be allocated a resource.

```
Arrival Order:  P1(90min) -> P2(120min) -> P3(60min) -> P4(90min)

Gantt Chart:
|---P1(90)---|---P2(120)---|--P3(60)--|---P4(90)---|
0           90           210        270          360
```

**Characteristics:**
- **Non-preemptive:** Once a process starts running, it runs to completion
- **No starvation:** Every process will eventually be served
- **Simple implementation:** Just a FIFO queue
- **Convoy effect:** Short processes stuck behind long ones experience high waiting time

**When to use in CUIScheduler:**
- When fairness (first-come basis) is the primary concern
- For simple, sequential scheduling where all bookings have similar importance
- When the order of request submission should determine allocation order

**Pros:**
- Completely fair -- no favoritism
- Easy to understand and implement
- No starvation possible
- Zero context switches (non-preemptive)

**Cons:**
- Convoy effect: a single long booking can delay many short ones
- Average waiting time can be very high
- Not optimal for minimizing wait times
- Does not consider priority or urgency

**What to look for in the visualization:**
- Notice how processes are arranged on the Gantt chart in strict arrival order
- Look at the waiting time column -- early arrivals have low wait, late arrivals accumulate wait
- Compare the average waiting time with SJF to see the convoy effect

#### 5.5.2 Shortest Job First (SJF)

**Tab Color:** Teal (#2dd4bf)
**Chapter Reference:** OS Ch. 5

**How it works:**
SJF selects the booking request with the **shortest duration (burst time)** from the ready queue to process next. This minimizes average waiting time.

```
Processes:  P1(90min), P2(120min), P3(60min), P4(30min)

SJF Order: P4(30) -> P3(60) -> P1(90) -> P2(120)

Gantt Chart:
|P4(30)|--P3(60)--|---P1(90)---|---P2(120)---|
0     30         90          180           300
```

**Characteristics:**
- **Non-preemptive** (in this implementation): Once started, runs to completion
- **Optimal average waiting time:** Proven to produce the minimum average waiting time among non-preemptive algorithms
- **Requires burst time knowledge:** The scheduler must know (or estimate) how long each booking will take
- **Possible starvation:** Long bookings may be perpetually delayed if short bookings keep arriving

**Optimal Average Waiting Time Proof:**
SJF is provably optimal for minimizing average waiting time. By scheduling shorter jobs first, each short job's waiting time is minimized, and since short jobs affect fewer subsequent processes, the cumulative waiting time is lowest possible.

**When to use in CUIScheduler:**
- When minimizing overall waiting time is the goal
- When booking durations are known in advance (which they always are in university scheduling)
- When quick turnaround for short sessions (quizzes, office hours) is desirable

**Pros:**
- Mathematically optimal average waiting time
- Short bookings (quizzes, quick meetings) get processed fast
- No convoy effect

**Cons:**
- Can starve long bookings (3-hour labs may wait indefinitely)
- Requires accurate duration estimates
- Not fair to long-running processes

**What to look for in the visualization:**
- Notice processes are ordered by burst time (shortest first), not arrival time
- Compare the average waiting time with FCFS -- SJF will always be lower or equal
- Look for long processes pushed to the end of the Gantt chart

#### 5.5.3 Round Robin (RR)

**Tab Color:** Amber (#f59e0b)
**Chapter Reference:** OS Ch. 5

**How it works:**
Round Robin assigns each booking request a fixed **time quantum** (time slice). Each process gets to run for exactly one quantum, then is preempted and moved to the back of the ready queue. This continues in a circular fashion until all processes complete.

```
Processes: P1(90min), P2(60min), P3(30min)
Time Quantum: 30 minutes

Gantt Chart:
|P1(30)|P2(30)|P3(30)|P1(30)|P2(30)|P1(30)|
0     30     60     90    120    150    180

P3 completes at t=90  (only needed 30 min)
P2 completes at t=150 (needed 60 min, ran in 2 slices)
P1 completes at t=180 (needed 90 min, ran in 3 slices)
```

**Key Concepts:**

- **Time Quantum:** The fixed amount of time each process gets before being preempted. In CUIScheduler, this is configurable in Admin Settings (default: 4 time units). A time unit maps to a scheduling granularity (e.g., 15 minutes)

- **Preemption:** When a process's quantum expires, the OS forcibly stops it and gives the CPU to the next process. In CUIScheduler, this means a booking's processing is paused and the next request gets attention

- **Context Switch:** Every time the scheduler switches from one process to another, a context switch occurs. This has overhead -- the system must save the state of the outgoing process and load the state of the incoming process. The trace log shows each context switch explicitly

**How to adjust the quantum:**
1. Go to Admin Panel > System Settings
2. Find the "Round Robin Quantum" slider
3. Adjust between 1 (very small, high overhead) and 20 (very large, less fair)
4. Click Save Settings

**Quantum size trade-offs:**

| Small Quantum (1-3) | Large Quantum (10+) |
|---|---|
| Very fair -- each process gets frequent turns | Less fair -- long wait between turns |
| High context switch overhead | Low context switch overhead |
| Approaches processor sharing | Approaches FCFS behavior |
| Good for interactive systems | Good for batch systems |
| Higher number of context switches in the metrics | Lower number of context switches |

**When to use in CUIScheduler:**
- When fairness across all departments is essential
- During peak hours when many departments are competing for limited resources
- When no booking should monopolize the scheduling system
- When you want to demonstrate preemption and context switching

**Pros:**
- Fair -- every booking gets equal time slices
- No starvation -- every process runs within one round
- Good response time for all processes
- Ideal for time-sharing environments

**Cons:**
- Context switch overhead can be significant with small quantum
- Average waiting time can be higher than SJF
- Does not consider priority or burst time
- Performance highly dependent on quantum size

**What to look for in the visualization:**
- The Gantt chart shows alternating colored bars as processes take turns
- Count the number of context switches in the metrics
- Notice how processes with burst time less than or equal to the quantum finish in one slice
- See the step-by-step trace showing "preempt" actions when quantum expires

#### 5.5.4 Priority Scheduling

**Tab Color:** Purple (#a855f7)
**Chapter Reference:** OS Ch. 5

**How it works:**
Priority scheduling selects the booking request with the **highest priority** (lowest priority number) to run next. Exams (priority 1) run before regular lectures (priority 5), which run before optional meetings (priority 9).

```
Processes:  P1(pri=5), P2(pri=1), P3(pri=3), P4(pri=2)

Priority Order: P2(pri=1) -> P4(pri=2) -> P3(pri=3) -> P1(pri=5)
```

**Priority Levels in CUIScheduler:**

| Priority | Level | Typical Use |
|---|---|---|
| 1 | Critical | Final exams, FYP defenses, accreditation visits |
| 2 | Very High | Midterm exams, practical exams |
| 3 | High | Core course lectures, mandatory labs |
| 4 | Above Normal | Elective lectures, project presentations |
| 5 | Normal | Regular tutorials, workshops |
| 6 | Below Normal | Office hours, extra help sessions |
| 7 | Low | Department meetings, seminars |
| 8 | Very Low | Optional workshops, guest lectures |
| 9 | Minimal | Informal meetings, study groups |
| 10 | Lowest | Housekeeping, non-academic events |

**The Starvation Problem:**
If high-priority bookings keep arriving, low-priority bookings may **never** get scheduled. This is called starvation. For example, if exam scheduling requests (priority 1-2) keep coming in, a department meeting (priority 7) might wait indefinitely.

**The Aging Mechanism:**
To solve starvation, CUIScheduler implements **aging**. Over time, the priority of waiting processes is gradually increased. A booking that has been waiting for a long time will have its priority incremented until it eventually becomes high enough to be scheduled.

- Aging can be enabled/disabled in Admin Panel > System Settings > Priority Aging toggle
- When enabled, the trace log shows "age" actions where waiting processes have their priority increased
- The aging factor controls how quickly priority improves (configurable in admin settings)

**When to use in CUIScheduler:**
- During exam periods when exam slots must take precedence
- When certain bookings genuinely need higher urgency (FYP defenses, external visits)
- When the scheduling policy should reflect institutional priorities

**Pros:**
- Critical bookings (exams) are processed first
- Reflects real-world priority needs of a university
- With aging, starvation is prevented

**Cons:**
- Without aging, low-priority bookings may starve
- More complex implementation
- Priority assignment can be subjective
- May not minimize average waiting time

**What to look for in the visualization:**
- Processes appear on the Gantt chart ordered by priority, not arrival time
- Look for the "age" actions in the trace log (if aging is enabled)
- Compare a high-priority late arrival that jumps ahead of low-priority early arrivals
- Check if starvation occurs when aging is disabled vs. when it is enabled

### 5.6 How to Run an Algorithm

Follow these steps to execute a scheduling algorithm:

1. **Ensure the queue has processes:** Either add requests manually via the form, click "Add 5 Random," or click "Load Demo Set"
2. **Select an algorithm:** Click one of the four algorithm tabs (FCFS, SJF, RR, Priority). The selected tab is highlighted with its algorithm color
3. **Verify your selection:** The Controls Bar shows "Selected: [Algorithm Name]" with the process count
4. **Click "Run [Algorithm]":** The blue button with a play icon. The button shows a loading spinner while processing
5. **View the results:** After execution completes, the Results Section appears below with:
   - OS Concept Summary banner
   - Metrics Row
   - Gantt Chart Visualizer
   - Algorithm Trace Log

### 5.7 Reading the Gantt Chart Visualization

The Gantt Chart is the primary visual output of the scheduling engine. It shows how processes are allocated CPU time over the scheduling timeline.

```
Time axis (horizontal):
0    10    20    30    40    50    60    70    80    90   100

|----P1----|----P3----|--------P2--------|----P4----|
 (CS371)    (CS202)    (CS352)            (MT201)
```

**How to read it:**
- **Horizontal axis:** Time units (each unit may represent a configurable interval, e.g., 15 minutes)
- **Each bar:** One process execution segment
- **Bar color:** Matches the process's department color
- **Bar label:** Shows the Process ID (PID) and optionally the course code
- **Bar length:** Proportional to how long the process ran in that segment
- **Gaps between bars:** Idle time (no process running)
- **Multiple segments for one PID:** Occurs in Round Robin when a process is preempted and later resumed

**Interactive features:**
- Hover over a bar to see details (PID, course, start time, end time, duration)
- The chart animates as results load, showing bars appearing sequentially

### 5.8 Understanding the Algorithm Decision Trace

The Algorithm Trace Log is a step-by-step record of every decision the scheduler made. Each entry shows:

| Field | Description |
|---|---|
| **Step #** | Sequential step number |
| **Time Unit** | The current time in the simulation |
| **PID** | The process affected |
| **Action** | What happened: `start`, `preempt`, `resume`, `complete`, `wait`, `age`, `block` |
| **Reason** | Why this action was taken |
| **OS Concept Note** | The OS concept being demonstrated |
| **Queue Snapshot** | State of the ready queue at this moment |

**Action types explained:**

| Action | Meaning | OS Concept |
|---|---|---|
| `start` | Process begins execution | Process moves from Ready to Running |
| `preempt` | Process is interrupted (RR quantum expiry) | Context switch -- save state, load next |
| `resume` | Previously preempted process continues | Context restored from PCB |
| `complete` | Process finishes execution | Process moves to Completed state |
| `wait` | Process moves to waiting queue | Blocked on I/O or resource |
| `age` | Process priority is increased | Aging mechanism prevents starvation |
| `block` | Process is blocked (deadlock) | Process cannot proceed |

### 5.9 Reading the Metrics

After running an algorithm, the **Metrics Row** displays five key performance indicators:

| Metric | Formula | What It Means | Lower or Higher is Better? |
|---|---|---|---|
| **Avg Waiting Time** | Sum of all waiting times / number of processes | Average time processes spend in the ready queue before getting CPU | Lower is better |
| **Avg Turnaround Time** | Sum of all turnaround times / number of processes | Average time from process arrival to completion | Lower is better |
| **CPU Utilization** | (Total busy time / Total elapsed time) x 100% | Percentage of time the CPU/resource is actually being used | Higher is better |
| **Throughput** | Number of processes completed / Total time | How many processes complete per time unit | Higher is better |
| **Context Switches** | Count of all preempt + resume actions | How many times the scheduler switched between processes | Lower is better (less overhead) |

**Benchmark values to watch for:**
- FCFS: 0 context switches (non-preemptive)
- SJF: Lowest average waiting time
- RR: Highest context switches, most fair
- Priority: Depends on priority distribution

### 5.10 Using "Compare All 4" Feature

The **Compare All** button (teal button with a compare icon) runs all four algorithms on the **same** set of processes and displays the results side by side.

**Step-by-step:**
1. Ensure the queue has processes
2. Click the teal **Compare All** button
3. Wait for all four algorithms to complete
4. The Comparison Section appears below the results showing:

**Comparison Table:**

| Metric | FCFS | SJF | RR | Priority |
|---|---|---|---|---|
| Avg Waiting Time | 12.4 | 7.8 | 10.1 | 9.2 |
| Avg Turnaround Time | 18.2 | 13.6 | 16.5 | 14.8 |
| CPU Utilization | 68.5% | 78.2% | 82.0% | 75.5% |
| Throughput | 4.2 | 5.1 | 4.8 | 4.6 |
| Context Switches | 0 | 0 | 18 | 8 |
| Best For | Sequential | Min wait | Fair sharing | Urgent first |

This feature is particularly useful for:
- Demonstrating why SJF has the optimal average waiting time
- Showing the trade-off between fairness (RR) and efficiency (SJF)
- Visualizing how context switches increase with preemptive algorithms
- Preparing for exam questions that ask "compare and contrast scheduling algorithms"

### 5.11 Quick Actions

| Button | Location | Function |
|---|---|---|
| **Add 5 Random** | Above the queue | Generates 5 random booking requests with varied parameters |
| **Load Demo Set** | Above the queue | Loads the pre-seeded demo data (60 bookings) from the database |
| **Run [Algorithm]** | Controls Bar | Executes the selected algorithm on the current queue |
| **Compare All** | Controls Bar | Runs all 4 algorithms and shows comparative results |
| **Reset** | Controls Bar | Clears all results and resets the visualization |

---

## 6. Deadlock Detector

The Deadlock Detector module visualizes one of the most important problems in Operating Systems: deadlock. It provides interactive tools to create, detect, and resolve deadlocks using Resource Allocation Graphs and the Banker's Algorithm.

**Navigation:** Sidebar > Deadlock Detector
**Breadcrumb:** CUIScheduler > OS Concepts > Deadlock Detection
**OS Concepts:** Deadlock -- RAG Cycle (Ch. 7), Deadlock -- Banker's Algorithm (Ch. 7)

### 6.1 What is Deadlock?

A deadlock occurs when two or more processes are permanently blocked because each is waiting for a resource held by the other. None of them can proceed.

**University Analogy:** Department A has booked Lab-1 but also needs CR-301. Department B has booked CR-301 but also needs Lab-1. Neither can proceed -- this is a deadlock.

```
Department A                    Department B
  Holds: Lab-1                   Holds: CR-301
  Needs: CR-301  <--- cycle --->  Needs: Lab-1
```

### 6.2 The Four Coffman Conditions

For a deadlock to occur, **all four** of these conditions must hold simultaneously. The Deadlock Detector page displays these conditions in a banner at the top:

| # | Condition | Description | CUIScheduler Example |
|---|---|---|---|
| 1 | **Mutual Exclusion** | Resources are non-shareable; only one process can use a resource at a time | A classroom can only be used by one class at a time |
| 2 | **Hold and Wait** | Processes hold resources while requesting additional ones | A booking holds a room while requesting a projector/lab |
| 3 | **No Preemption** | Resources cannot be forcibly taken from a process | You cannot kick a class out of a room mid-lecture |
| 4 | **Circular Wait** | A circular chain of processes exists where each waits for a resource held by the next | A -> waits for B's resource, B -> waits for A's resource |

When a deadlock is detected, all four condition labels turn **red with pulsing dots** to visually confirm that all conditions are met.

### 6.3 Resource Allocation Graph (RAG)

The RAG is an interactive, D3.js-powered graph visualization that shows the relationships between processes and resources.

#### Node Types

| Node Shape | Type | Meaning | Visual |
|---|---|---|---|
| **Circle** | Process | A booking request (e.g., P1, P2) | Blue/teal circle with PID label |
| **Square** | Resource | A campus resource (e.g., CR-301, Lab-1) | Amber/orange square with resource name |

#### Edge Types

| Edge Style | Type | Direction | Meaning |
|---|---|---|---|
| **Solid arrow** | Assignment | Resource -> Process | The resource is currently assigned to this process |
| **Dashed arrow** | Request | Process -> Resource | The process is requesting this resource |

#### How to Read the Graph

```
    Assignment edge           Request edge
    (solid arrow)            (dashed arrow)

    [Lab-1] -------> (P1)      (P1) - - - -> [CR-301]
    "Lab-1 is held    "P1 is requesting
     by process P1"    resource CR-301"
```

**A complete deadlock cycle looks like this:**

```
    [Lab-1] -------> (P1) - - - -> [CR-301]
                                      |
                                      | (assignment)
                                      v
    [Lab-1] <- - - - (P2) <------- [CR-301]

    P1 holds Lab-1, wants CR-301
    P2 holds CR-301, wants Lab-1
    = CYCLE = DEADLOCK
```

#### What a Cycle Means

When the detection algorithm finds a cycle in the RAG:
- All nodes in the cycle are highlighted with a **red glow animation**
- All edges in the cycle turn **red**
- The system status changes from "SAFE" (green shield) to "DEADLOCK" (red shield)
- The Coffman conditions banner turns red
- A Cycle Highlighter panel appears below the graph describing the cycle in plain text

#### Interactive Features

- **Drag nodes:** You can click and drag process and resource nodes to rearrange the graph layout
- **Zoom:** Scroll to zoom in/out on the graph
- **Hover:** Hover over a node to see its details (PID, resource name, current allocation)

### 6.4 Demo Scenarios

The **Deadlock Scenario Builder** panel provides pre-built scenarios that you can load with one click:

| Scenario | What It Creates | Expected Outcome |
|---|---|---|
| **Classic 2-Process Deadlock** | Two processes, each holding one resource and requesting the other | Deadlock detected: P1 and P2 form a cycle |
| **3-Process Chain Deadlock** | Three processes forming a circular wait chain: P1->P2->P3->P1 | Deadlock detected: 3-node cycle |
| **Safe Near-Deadlock** | Processes that share resources but no cycle exists | No deadlock -- system is in a safe state |

**How to use a demo scenario:**
1. Click one of the scenario buttons in the Scenario Builder
2. The RAG canvas updates with the new nodes and edges
3. Detection runs automatically after a short delay
4. Observe the results: SAFE or DEADLOCK status, cycle highlighting, Banker's matrix

### 6.5 Banker's Algorithm

The Banker's Algorithm is a **deadlock avoidance** algorithm. It checks whether granting a resource request would leave the system in a safe state. If not, the request is denied.

#### The Matrices

The Banker's Matrix panel on the right side shows:

| Matrix | Description | Meaning |
|---|---|---|
| **MAX** | Maximum resources each process may need | Each row shows the most resources a process could ever request |
| **ALLOCATION** | Resources currently allocated to each process | What each process currently holds |
| **NEED** | Resources each process still needs (MAX - ALLOCATION) | What each process may still request |
| **AVAILABLE** | Resources currently available in the system | Free resources that can be allocated |

**Example:**

```
Processes: P1, P2, P3
Resources: CR-301(3 slots), Lab-1(2 slots)

         MAX        ALLOCATION     NEED        AVAILABLE
       CR  Lab      CR  Lab       CR  Lab      CR  Lab
P1  [  2    1  ]  [  1    0  ]  [  1    1  ]  [  1    1  ]
P2  [  1    2  ]  [  0    1  ]  [  1    1  ]
P3  [  2    1  ]  [  1    0  ]  [  1    1  ]
```

#### Safe Sequence Concept

A **safe sequence** is an ordering of processes such that each process can complete using the currently available resources plus the resources that will be released by previously completed processes.

If a safe sequence exists, the system is in a **safe state** -- no deadlock is possible.

**Example safe sequence: P2 -> P1 -> P3**
1. P2 needs (1,1), available is (1,1) -- can run. P2 completes, releases (0,1), available becomes (1,2)
2. P1 needs (1,1), available is (1,2) -- can run. P1 completes, releases (1,0), available becomes (2,2)
3. P3 needs (1,1), available is (2,2) -- can run. All processes complete

#### Reading the Step-by-Step Trace

The Banker's Algorithm trace shows each step:

| Step | Process | Can Run? | Reason | Available After |
|---|---|---|---|---|
| 1 | P2 | Yes | Need(1,1) <= Available(1,1) | (1, 2) |
| 2 | P1 | Yes | Need(1,1) <= Available(1,2) | (2, 2) |
| 3 | P3 | Yes | Need(1,1) <= Available(2,2) | (3, 2) |

**Result:** Safe sequence found: P2 -> P1 -> P3

#### Safe Sequence Display

Below the Banker's Matrix, the Safe Sequence Display shows:
- **Green border / "SAFE":** A safe sequence exists, displayed as a chain (P2 -> P1 -> P3)
- **Red border / "UNSAFE":** No safe sequence exists -- the system is in an unsafe state and deadlock is possible

### 6.6 Deadlock Resolution

When a deadlock is detected, the **Resolution Panel** slides into view with options to resolve it:

| Resolution Method | Description | OS Analogy |
|---|---|---|
| **Process Termination** | Kill one of the deadlocked processes (cancel a booking) | OS terminates a process to break the cycle |
| **Resource Preemption** | Forcibly take a resource from one process and give it to another | OS preempts a resource from a lower-priority process |
| **Rollback** | Undo the most recent action that caused the deadlock | OS rolls back a process to a safe checkpoint |

**How to resolve:**
1. Click the **"Resolve Deadlock"** button (red, appears only when deadlock is detected)
2. The system applies the selected resolution strategy
3. The RAG is updated, the cycle is broken
4. The status changes back to "SAFE"

### 6.7 Cycle Detection Visual Indicators

When a deadlock cycle is detected:

- **Red glow animation:** All nodes in the cycle pulse with a red glow effect
- **Red edges:** Edges forming the cycle turn red
- **Cycle Highlighter panel:** Appears below the RAG canvas with a text description:
  ```
  "Cycle detected: P1 -> CR-301 -> P2 -> Lab-1 -> P1"
  ```
- **Coffman conditions:** All four condition badges turn red with pulsing dots
- **System status badge:** Changes from green "SAFE" shield to red "DEADLOCK" shield
- **OS Concept Note:** Appears at the bottom with a detailed explanation of the deadlock theory being demonstrated

---

## 7. Concurrency Monitor

The Concurrency Monitor demonstrates synchronization primitives -- the tools an OS uses to coordinate access to shared resources when multiple processes run concurrently.

**Navigation:** Sidebar > Concurrency Monitor
**Breadcrumb:** CUIScheduler > OS Concepts > Concurrency Control
**OS Concepts:** Semaphore (Ch. 6), Mutex (Ch. 6), Race Condition (Ch. 6)

### 7.1 What Are Semaphores and Why They Matter

A **semaphore** is a synchronization primitive that controls access to a shared resource using a counter. In CUIScheduler:

- A **lab with 3 workstations** is a counting semaphore with max_count = 3
- When a booking acquires a workstation, the count decreases (wait/P operation)
- When a booking releases a workstation, the count increases (signal/V operation)
- When count = 0, all workstations are in use, and new requests must wait in a queue

**University Analogy:**
Think of a lab with 3 available computers. The semaphore count is 3. When a student sits down, count goes to 2. When all 3 are taken (count = 0), the next student must wait outside in a queue.

### 7.2 Semaphore Visualizer

The Semaphore Visualizer is the main panel on the left side. It shows:

```
+------------------------------------------+
|  SEMAPHORE: Software Lab 1               |
|                                          |
|  Count: [====2====] / 3                  |
|                                          |
|  Critical Section (occupied):            |
|    [P3 - DB Lab] [P7 - OS Lab]           |
|                                          |
|  Wait Queue (blocked):                   |
|    P12 (waiting 45s) -> P8 (waiting 20s) |
+------------------------------------------+
```

| Element | Description |
|---|---|
| **Resource Name** | Which shared resource this semaphore controls |
| **Count** | Current semaphore value (how many more processes can enter) |
| **Max Count** | Maximum concurrent access allowed |
| **Count Bar** | Visual bar showing current count relative to maximum |
| **Critical Section** | Processes currently inside the critical section (using the resource) |
| **Wait Queue** | Processes blocked, waiting to enter. Shows PID and waiting time |
| **History** | Timeline of wait() and signal() operations |

**Controls:**
- **Resource Selector dropdown:** Choose which resource's semaphore to view
- **Concurrent Requests slider:** Set how many concurrent booking requests to simulate (2-10)

### 7.3 Mutex Display

The Mutex Display panel on the right shows binary semaphores (mutexes) for resources that allow only **one** user at a time:

```
+---------------------------+
|  MUTEX: CR-301            |
|  Status: LOCKED           |
|  Owner: P5 (OS Lecture)   |
|  Waiters: P9, P12         |
+---------------------------+

+---------------------------+
|  MUTEX: CR-201            |
|  Status: UNLOCKED         |
|  Owner: None              |
|  Waiters: (empty)         |
+---------------------------+
```

| Field | Meaning |
|---|---|
| **Status** | LOCKED (in use) or UNLOCKED (free) |
| **Owner** | The PID of the process that holds the lock (or None) |
| **Waiters** | List of PIDs waiting to acquire the lock |

**OS Concept:** A mutex is a binary semaphore (count = 0 or 1). Only one process can hold it. This prevents race conditions when booking a single-occupancy resource like a classroom.

### 7.4 Race Condition Demo

The Race Condition Demo is a side-by-side comparison that shows what happens when two processes try to book the same resource **with and without** synchronization.

**To run the demo:**
1. Click the **"Race Demo"** button (red, with a lightning bolt icon)
2. The system simulates two concurrent booking attempts for the same room

**Without Lock (Left Panel):**
```
Time  Process A             Process B
t=0   Read room status      Read room status
t=1   Status = "free"       Status = "free"      <- BOTH see "free"!
t=2   Book room             Book room             <- BOTH book it!
t=3   CONFLICT! Double-booked!
```

Both processes read the status as "free" before either has written, so both proceed to book -- resulting in a **double booking** (data corruption).

**With Lock (Right Panel):**
```
Time  Process A             Process B
t=0   acquire(mutex)
t=1   Read room status      (BLOCKED - waiting for mutex)
t=2   Status = "free"       (BLOCKED)
t=3   Book room             (BLOCKED)
t=4   release(mutex)        acquire(mutex)
t=5                         Read room status
t=6                         Status = "occupied"   <- Sees correct state
t=7                         Request DENIED
```

With the mutex lock, Process B cannot read the room status until Process A has completed its booking. The data stays consistent.

### 7.5 Running a Concurrent Simulation

**Step-by-step:**
1. Select a resource from the **Resource Selector** dropdown
2. Adjust the **Concurrent Requests** slider (2-10 processes)
3. Click the blue **"Run Simulation"** button
4. Watch as:
   - Processes attempt to acquire the semaphore
   - Some enter the critical section (up to the semaphore count)
   - Others are queued in the wait queue
   - As processes complete, waiting processes are unblocked
5. The **Concurrent Request Simulation** panel shows an animated visualization of all processes competing

### 7.6 Reading the Operation Log

The **Operation Log** at the bottom records every synchronization operation:

| Timestamp | PID | Operation | Semaphore | Count After | OS Note |
|---|---|---|---|---|---|
| 0.00s | P3 | wait() | Lab-1 | 2 | Semaphore decremented; process enters critical section |
| 0.05s | P7 | wait() | Lab-1 | 1 | Semaphore decremented; process enters critical section |
| 0.10s | P12 | wait() | Lab-1 | 0 | Count = 0; process blocked, added to wait queue |
| 0.50s | P3 | signal() | Lab-1 | 1 | Process exits critical section; P12 unblocked |
| 0.51s | P12 | wait() | Lab-1 | 0 | Previously blocked process now enters critical section |

The log uses monospace font and color-coded entries:
- **Green** entries: Successful wait() or signal() operations
- **Amber** entries: Process blocked (wait queue full or count = 0)
- **Red** entries: Race condition detected (in no-lock scenario)

---

## 8. Resource Map

The Resource Map provides a spatial view of campus resources, treating rooms and labs as memory blocks managed by the OS.

**Navigation:** Sidebar > Resource Map
**Breadcrumb:** CUIScheduler > Resources
**OS Concepts:** Memory Bitmap (Ch. 8), Fragmentation (Ch. 8)

### 8.1 Building Floor Plan Navigation

The top of the page has building tabs for navigating between campus buildings:

| Building | Description |
|---|---|
| **Academic Block A** | Classrooms CR-101 through CR-203 (Floors 1-2) |
| **Academic Block B** | Classrooms CR-301 through CR-401 (Floors 3-4) |
| **IT Block** | Labs: Software Lab 1 & 2, Network Lab, Database Lab, Hardware Lab, AI/ML Lab (Floors 1-3) |
| **Faculty Block** | Faculty offices FB-101 through FB-302 (Floors 1-3) |

Click a building tab to view its floor plan. The selected tab is highlighted with a blue accent.

### 8.2 Resource Filter Bar

Below the building tabs, a filter bar lets you narrow down the resource view:
- Filter by **resource type** (Classroom, Lab, Faculty)
- Filter by **status** (Available, Occupied, Reserved, Maintenance)
- Filter by **department**
- Search by **resource name**

### 8.3 Building Floor Plan

The floor plan displays rooms and labs as interactive cards arranged by floor:

```
Floor 1:
+--------+  +--------+  +--------+
| CR-101 |  | CR-102 |  | CR-103 |
| Cap: 60|  | Cap: 45|  | Cap: 40|
| [FREE] |  | [BUSY] |  | [FREE] |
+--------+  +--------+  +--------+

Floor 2:
+--------+  +--------+  +--------+
| CR-201 |  | CR-202 |  | CR-203 |
| Cap: 60|  | Cap: 50|  | Cap: 40|
| [BUSY] |  | [FREE] |  | [MAINT]|
+--------+  +--------+  +--------+
```

Each room card shows:
- **Room name** (e.g., CR-101, Software Lab 1)
- **Capacity** (number of seats/workstations)
- **Status indicator** (colored dot: green = available, red = occupied, amber = reserved, gray = maintenance)
- **Department color** accent along the top edge
- **Features icons** (projector, AC, whiteboard, microphone)

Click any room card to open the **Resource Detail Panel**.

### 8.4 Resource Detail Panel

A slide-out panel that appears when you click a resource. It shows:

| Section | Content |
|---|---|
| **Header** | Resource name, type badge, status badge |
| **Location** | Building, floor number |
| **Capacity** | Number of seats/workstations |
| **Department** | Which department primarily uses this resource |
| **Features** | List of available features (projector, AC, computers, software, etc.) |
| **Current Booking** | If occupied, shows the current booking details |
| **Upcoming Bookings** | List of future bookings for this resource |
| **Utilization** | Usage percentage for this resource |

### 8.5 Memory Bitmap Visualization

Below the floor plan, the **Memory Bitmap** section treats the entire resource pool as a bitmap -- the same data structure used by an OS to track physical memory pages.

```
Memory Bitmap (1 bit per resource slot):
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
| 1| 1| 0| 1| 0| 0| 1| 1| 1| 0| 1| 0| 0| 1| 1| 0|
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  CR  CR  CR  CR  CR  CR  CR  CR  CR  CR  L1  L2  L3  L4  L5  L6
 101 102 103 201 202 203 301 302 303 401

Legend:
  [1] = Allocated (occupied/reserved) - shown as a filled square
  [0] = Free (available) - shown as an empty square
```

**What each square means:**
- **Filled/colored square (1):** This resource slot is allocated to a booking
- **Empty/dark square (0):** This resource slot is free and available
- **Hover** over a square to see which booking is using it (if allocated) or that it is free

**OS Concept:** This is exactly how an OS tracks physical memory frames. Each bit in the bitmap represents one frame. 0 = free, 1 = allocated. This allows O(1) lookup to find the status of any resource.

**Summary statistics shown:**
- Total Slots: Total number of resource slots in the system
- Allocated Slots: Number of currently occupied slots
- Free Slots: Number of available slots
- Fragmentation %: Percentage of fragmentation (see below)

### 8.6 Fragmentation Visualization and Compaction

The **Fragmentation Bar** at the bottom visualizes the concept of external fragmentation:

```
Resource Timeline (horizontal = time slots):
|###|   |##|   |   |###|   |##|   |   |###|   |
 used  free used free free used free used free free used free

Fragmentation: 35.2%
Free slots exist, but they are scattered (fragmented).
```

**What fragmentation means in CUIScheduler:**
- When bookings are created and cancelled over time, **gaps** appear in the resource timeline
- These gaps are "free" but may be too small to accommodate new bookings
- This is exactly like **external fragmentation** in memory management

**Compaction:**
- The system can "compact" the schedule by moving bookings to fill gaps
- This is analogous to **memory compaction** in OS, where the OS moves allocated blocks together to create a large contiguous free block
- Fragmentation percentage trends are tracked in the Analytics page

---

## 9. Timetable Builder

The Timetable Builder provides a weekly schedule view with drag-and-drop functionality for creating and modifying timetable entries.

**Navigation:** Sidebar > Timetable
**Breadcrumb:** CUIScheduler > Timetable
**OS Concepts:** FCFS (Ch. 5), Priority (Ch. 5), Process States (Ch. 3)

### 9.1 Page Layout

```
+------------------------------------------------------------------+
|  [< Week of Mar 23, 2026 >]  [Dept Filter]  [Auto: FCFS SJF PRI RR]  [Export] |
+------------------------------------------------------------------+
|          |  Mon   |  Tue   |  Wed   |  Thu   |  Fri   |  Sat   |
+----------+--------+--------+--------+--------+--------+--------+
| 08:00    |  CS371 |        |  CS201 |        |  CS302 |        |
| 09:00    |  CS352 |  CS202 |  EE201 |  CS481 |        |        |
| 10:00    |        |  CS101 |  CS311 |  CS472 |        |        |
| 11:00    |  CS461 |  MT201 |        |  CS441 |        |        |
| ...      |  ...   |  ...   |  ...   |  ...   |  ...   |  ...   |
+----------+--------+--------+--------+--------+--------+--------+
| Resource |
| Sidebar  |
+----------+
```

### 9.2 Weekly Grid Navigation

**Week Navigation:**
- Click the **left arrow** (`<`) to go to the previous week
- Click the **right arrow** (`>`) to go to the next week
- The center label shows "Week of [Date]"

**Grid structure:**
- **Columns:** Monday through Saturday (6 days)
- **Rows:** Time slots from 08:00 to 17:00 (10 one-hour slots)
- **Each cell:** Represents one day + one time slot intersection

**Timetable entries** appear as colored blocks within cells:
- Color corresponds to the department color
- Text shows the course code
- Height of the block corresponds to duration (a 2-hour class spans 2 rows)

### 9.3 Department Filtering

Use the **department dropdown** in the controls bar to filter the timetable:
- **All Departments:** Shows all entries (default)
- Select a specific department to show only its classes
- Available departments: Computer Science, Software Engineering, Electrical Engineering, Mechanical Engineering, Management Sciences, Mathematics

When filtered, entries from other departments are hidden or grayed out.

### 9.4 Drag-and-Drop Scheduling

The timetable supports drag-and-drop for rescheduling entries:

1. **Click and hold** on a timetable entry (course block)
2. **Drag** it to a new cell (different day or time slot)
3. **Release** to drop it in the new position
4. The system checks for conflicts before confirming the move

**Resource Sidebar:**
A sidebar on the left shows available resources that can be dragged onto the timetable grid to create new entries.

**OS Concept:** Moving a timetable entry is analogous to a **process migration** -- moving a process from one CPU/time slot to another, requiring the scheduler to check for conflicts and update the allocation table.

### 9.5 Conflict Detection

When a scheduling conflict is detected (two classes assigned to the same room at the same time), the system shows:

- A **red overlay** on the conflicting cells
- A **warning banner** at the top: "X scheduling conflict(s) detected -- [reason]"
- The warning includes a pulsing red dot and the conflict reason

**Common conflict types:**
- Same room booked twice in the same slot
- Same faculty member assigned to two classes simultaneously
- Room capacity exceeded

### 9.6 Auto-Schedule Feature

The **Auto-Schedule buttons** in the controls bar let the system automatically arrange all pending bookings using a scheduling algorithm:

| Button | Algorithm | Behavior |
|---|---|---|
| **FCFS** | First Come First Served | Places bookings in arrival order |
| **SJF** | Shortest Job First | Places shortest bookings first |
| **PRIORITY** | Priority Scheduling | Places highest-priority bookings first |
| **RR** | Round Robin | Distributes bookings fairly across time slots |

**How to use:**
1. Click one of the algorithm buttons (e.g., "FCFS")
2. A loading spinner appears while the system calculates
3. The timetable grid updates with the auto-scheduled entries
4. Conflicts (if any) are highlighted

### 9.7 Export to PDF/CSV

The **Export button** in the controls bar allows you to download the current timetable:

- **PDF Export:** A formatted document suitable for printing or sharing
- **CSV Export:** A spreadsheet-compatible file for further analysis

The exported file includes:
- Week range
- All entries with day, time, course code, room, faculty, department
- The selected department filter (if any)

---

## 10. Analytics

The Analytics page provides data-driven insights into scheduling efficiency, resource utilization, and faculty workload.

**Navigation:** Sidebar > Analytics
**Breadcrumb:** CUIScheduler > Analytics
**OS Concepts:** Load Balancing (Ch. 5), Memory Bitmap (Ch. 8), Fragmentation (Ch. 8)

### 10.1 Summary Stat Cards

Four stat cards at the top provide key metrics:

| Card | Description | OS Concept |
|---|---|---|
| **Avg Utilization** | Average resource utilization across all rooms and labs (e.g., 58.9%) | Resource Allocation (Ch. 8) |
| **Weekly Bookings** | Total bookings processed this week | Process Count (Ch. 3) |
| **Best Algorithm** | Algorithm with the lowest average waiting time (e.g., SJF at 7.8 min) | Scheduling Optimal (Ch. 5) |
| **Faculty Overloaded** | Number of faculty exceeding their maximum teaching hours | Load Imbalance (Ch. 5) |

### 10.2 Algorithm Comparison Bar Chart

A grouped bar chart comparing all four scheduling algorithms across multiple metrics:

```
                FCFS    SJF     RR      Priority
Avg Wait Time   |====   |==     |===    |===
Avg Turnaround  |=====  |===    |====   |====
CPU Utilization  |====  |=====  |=====  |=====
Throughput      |===    |=====  |====   |====
Context Switch  |       |       |=====  |===
```

Each algorithm has its designated color. Hover over any bar to see the exact value.

**How to read it:**
- For waiting time and turnaround time: **shorter bars are better**
- For CPU utilization and throughput: **taller bars are better**
- For context switches: **shorter bars are better** (less overhead)
- The "Best For" label under each algorithm group explains its strength

### 10.3 Usage Heatmap

A 7x16 grid (days x hours) showing booking intensity across the week:

```
        06  07  08  09  10  11  12  13  14  15  16  17  18  19  20  21
Mon     .   .   3   5   8   7   4   2   1   6   9   8   5   3   2   1
Tue     .   .   2   4   6   8   5   3   1   5   7   9   6   4   2   1
Wed     .   .   4   6   9   7   5   2   1   7   8   7   5   3   1   1
Thu     .   .   3   5   7   6   4   2   1   6   8   8   6   3   2   1
Fri     .   .   2   4   5   6   3   2   .   4   6   5   4   2   1   .
Sat     .   .   .   1   2   1   1   .   .   .   1   1   .   .   .   .
Sun     .   .   .   .   .   .   .   .   .   .   .   .   .   .   .   .
```

**Color intensity** represents the number of concurrent bookings:
- **Light/cool colors:** Low activity (0-3 bookings)
- **Medium colors:** Moderate activity (4-6 bookings)
- **Dark/warm colors:** High activity (7-9 bookings)
- **Hottest color:** Peak activity (9+ bookings)

**How to read it:**
- Look for **hot spots** (darkest cells) -- these are peak scheduling periods
- Identify **cold spots** (lightest cells) -- these time slots have available capacity
- Compare weekdays vs. weekends
- Use this data to decide when to schedule optional events to avoid congestion

### 10.4 Resource Utilization Bars

Horizontal bar charts showing the utilization percentage for each resource:

```
Lecture Hall A    |================================================| 91.0%
CS Lab 1          |============================================|     85.2%
Seminar Hall      |=======================================|          78.2%
Room 201          |====================================|             72.5%
AI Lab            |==================================|               68.0%
Circuits Lab      |===============================|                  62.1%
Room 202          |===========================|                      55.3%
SE Lab            |========================|                         48.7%
Lecture Hall B    |======================|                           45.0%
DSP Lab           |===================|                              38.4%
NB Room 201       |=================|                                33.8%
Conference Room   |============|                                     25.5%
```

**Color coding:**
- **Green bars** (>70%): Well-utilized resources
- **Amber bars** (40-70%): Moderately utilized
- **Red bars** (<40%): Underutilized resources (consider reallocation)

### 10.5 Faculty Load Radar Chart

A radar/spider chart showing each faculty member's teaching load relative to their maximum:

- Each axis represents a faculty member
- The **inner polygon** shows their current teaching hours
- The **outer boundary** represents their maximum teaching hours
- Faculty members whose load **exceeds** the maximum are highlighted in red

**Example data from the system:**

| Faculty | Current Hours | Max Hours | Status |
|---|---|---|---|
| Dr. Ahmed Khan | 16 | 18 | OK |
| Dr. Fatima Noor | 14 | 16 | OK |
| Dr. Usman Tariq | 20 | 18 | OVERLOADED |
| Dr. Sara Malik | 12 | 16 | OK |
| Dr. Hassan Ali | 18 | 18 | AT LIMIT |
| Dr. Bilal Shah | 15 | 16 | OK |
| Dr. Ayesha Rizwan | 19 | 16 | OVERLOADED |
| Dr. Imran Sajid | 10 | 18 | OK |
| Dr. Nadia Akram | 14 | 18 | OK |

**OS Concept:** This is **load balancing** -- distributing work evenly across processors. When some faculty are overloaded while others are underutilized, the system has a load imbalance, similar to an OS where some CPUs are overloaded while others are idle.

### 10.6 Fragmentation Over Time

A line chart showing the fragmentation percentage trend over the past week:

```
35% |  *
    |    *
30% |      *
    |           *
25% |              *
    |                 *
20% |                      *
    +--+--+--+--+--+--+--+-->
     Mar Mar Mar Mar Mar Mar Mar
      22  23  24  25  26  27  28
```

**How to read it:**
- **Decreasing trend:** Compaction is effective, scheduling gaps are being filled
- **Increasing trend:** More cancellations or irregular booking patterns creating gaps
- **Sudden spikes:** Likely due to mass cancellations (e.g., weather closure)
- **Ideal:** Keep fragmentation below 20%

### 10.7 Exporting Reports

The **Report Exporter** button in the top-right allows you to export analytics data:

- **PDF Report:** Formatted report with all charts and metrics
- **CSV Data Export:** Raw data for spreadsheet analysis
- **Date range selection:** Choose the period to export

---

## 11. Notifications (IPC Message Queue)

The Notifications page demonstrates Inter-Process Communication (IPC) by treating department communications as messages in an OS message queue.

**Navigation:** Sidebar > Notifications
**Breadcrumb:** CUIScheduler > Notifications
**OS Concepts:** IPC Message Queue (Ch. 3), Process States (Ch. 3)

### 11.1 Message Queue Visualizer

At the top of the page, an animated visualization shows the message queue in action:

```
+----------+        +---------+        +----------+
| Producer | ---->  | BUFFER  | ---->  | Consumer |
| (Sender) |  MSG   |[M1][M2] |  MSG   | (Recvr)  |
|Dept Sender|       |[M3][M4] |       |Dept Recvr |
+----------+        +---------+        +----------+
   send()           Queue Depth: 4       receive()
```

**How the animation works:**
1. Every 3 seconds, the **Producer** (left) creates a new message
2. The message animates from producer to the **Buffer** (center)
3. After a delay, the oldest message in the buffer is consumed by the **Consumer** (right)
4. Messages are color-coded by type:
   - Green (CONF): Booking confirmed
   - Red (ALRT): Conflict alert
   - Teal (FREE): Resource freed
   - Amber (EXAM): Exam scheduled
   - Blue (CAST): Broadcast

**OS Concepts shown in the visualizer:**
- **FIFO ordering:** Messages are consumed in the order they were produced
- **Bounded buffer:** The queue has a maximum depth (shown in real-time)
- **Asynchronous IPC:** Producer and consumer operate independently
- **send() and receive():** OS concept badges label the operations

### 11.2 How IPC Maps to Department Communication

In an OS, processes communicate via IPC mechanisms. In CUIScheduler:

| OS Concept | CUIScheduler Equivalent |
|---|---|
| Process | Department |
| Message | Notification (booking confirmation, conflict alert, etc.) |
| Message Queue | The notifications inbox |
| send() | Department sends a notification |
| receive() | Department reads a notification |
| Mailbox | Each department's inbox |
| Broadcast | Message to "All Departments" |

### 11.3 Message Types

| Type | Badge Color | Icon | Typical Content |
|---|---|---|---|
| **booking_confirmed** | Green | Calendar check | "Your booking for CS-201 has been confirmed" |
| **conflict** | Red | Warning triangle | "Double-booking detected for Lab-3" |
| **resource_freed** | Teal | Unlock | "Lab-2 semaphore signaled: count incremented" |
| **exam_scheduled** | Amber | Calendar | "Final Exam: OS scheduled for Hall-A" |
| **broadcast** | Blue | Radio | "System maintenance window scheduled" |

### 11.4 Stats Row

Three stat cards below the visualizer:

| Stat | Description | OS Concept |
|---|---|---|
| **Unread Messages** | Messages pending in queue | Queue Depth (Ch. 3) |
| **Queue Depth** | Current buffer occupancy | Bounded Buffer (Ch. 6) |
| **Messages Today** | IPC transactions processed today | Throughput (Ch. 5) |

### 11.5 Filtering Messages

Use the **Filter dropdown** to narrow the inbox:
- **All Messages:** Show everything
- **Unread:** Only unread messages
- **Confirmations:** Only booking_confirmed type
- **Conflicts:** Only conflict alerts
- **Resource Freed:** Only resource release notifications
- **Exam Scheduled:** Only exam scheduling notifications
- **Broadcasts:** Only broadcast messages

### 11.6 Reading Messages

Each message in the inbox list shows:
- **Read/Unread icon:** Closed envelope (unread, with blue dot) or open envelope (read)
- **Type badge:** Color-coded label (CONFIRMED, CONFLICT, FREED, EXAM, BROADCAST)
- **Routing:** "From Department -> To Department" in monospace font
- **Subject:** The message title
- **Body preview:** First line of the message body
- **Timestamp:** Relative time (e.g., "5 min ago", "2 hours ago")
- **OS Concept badge:** Small IPC badge with the OS concept note

**Click** any message to open a detailed modal showing the full body, routing information, and the OS concept explanation.

**Mark as read:** Clicking a message automatically marks it as read. The unread count in the stat card updates.

**Mark All Read:** Click the "Mark All Read" button to mark all messages as read at once.

### 11.7 Composing Messages

Click the **Compose** button (blue, with send icon) to open the compose modal:

1. **To Department:** Select the target department from dropdown:
   - Computer Science
   - Electrical Engineering
   - Mechanical Engineering
   - Admin Office
   - Exam Cell
   - All Departments (Broadcast)
2. **Message Type:** Select the notification type:
   - Booking Confirmed
   - Conflict Alert
   - Resource Freed
   - Exam Scheduled
   - Broadcast
3. **Subject:** Enter the message subject line
4. **Body:** Enter the message content in the text area
5. Click **Send Message** to enqueue the message to the IPC queue

**OS Concept Note:** The compose modal includes an OS badge explaining that "Sending a message enqueues it to the destination department's message queue buffer" -- this is the `send()` IPC operation.

---

## 12. Admin Panel

The Admin Panel provides system administration capabilities, analogous to kernel-mode operations in an OS.

**Navigation:** Sidebar > Admin Panel (admin role only)
**Breadcrumb:** CUIScheduler > Admin
**OS Concepts:** Priority (Ch. 5), Load Balancing (Ch. 5), Round Robin (Ch. 5)

### 12.1 Admin Dashboard Overview

The Admin Dashboard shows four stat cards at the top:

| Card | Value | OS Concept |
|---|---|---|
| **Total Users** | 234 | Process Table (Ch. 3) -- total registered processes |
| **Total Resources** | 57 | Resource Pool (Ch. 7) -- total allocatable resources |
| **Total Bookings** | 1,247 | All-time scheduled processes |
| **Active Conflicts** | 3 | Deadlock Detection (Ch. 7) -- resource conflicts |

### 12.2 Quick Actions (Resource Management)

Four quick-action cards link to resource management pages:

| Action | Link | Count | Description |
|---|---|---|---|
| **Manage Rooms** | /admin/rooms | 45 entries | Add, edit, delete, or set maintenance mode for classrooms |
| **Manage Labs** | /admin/labs | 12 entries | Manage lab resources and their features |
| **Manage Faculty** | /admin/faculty | 67 entries | View and manage faculty teaching loads |
| **Manage Users** | /admin/users | 234 entries | Assign roles, manage accounts |

### 12.3 Managing Rooms

From **Manage Rooms** you can:
- **Add a room:** Specify name, building, floor, capacity, department, and features
- **Edit a room:** Modify any field including capacity and features
- **Delete a room:** Remove a room from the system (deallocate the resource)
- **Set Maintenance Mode:** Toggle a room's status to "maintenance" -- removes it from the bookable pool temporarily

**Seeded Rooms (10 classrooms):**

| Room | Building | Floor | Capacity | Department | Features |
|---|---|---|---|---|---|
| CR-101 | Academic Block A | 1 | 60 | Computer Science | Projector, AC, Whiteboard |
| CR-102 | Academic Block A | 1 | 45 | Computer Science | Projector, AC, Whiteboard |
| CR-103 | Academic Block A | 1 | 40 | Computer Science | Projector, AC |
| CR-201 | Academic Block A | 2 | 60 | Computer Science | Projector, AC, Whiteboard, Mic |
| CR-202 | Academic Block A | 2 | 50 | Electrical Eng. | Projector, AC |
| CR-203 | Academic Block A | 2 | 40 | Electrical Eng. | Projector, AC |
| CR-301 | Academic Block B | 3 | 70 | Computer Science | Projector, AC, Whiteboard, Mic |
| CR-302 | Academic Block B | 3 | 55 | Management Sci. | Projector, AC |
| CR-303 | Academic Block B | 3 | 45 | Management Sci. | Projector, AC |
| CR-401 | Academic Block B | 4 | 80 | Computer Science | Projector, AC, Mic, Video Conf. |

### 12.4 Managing Labs

From **Manage Labs** you can:
- **Add a lab:** Specify name, building, floor, capacity, department, and equipment/software
- **Edit lab features:** Update the list of installed software, hardware, and workstation count
- **Delete a lab:** Remove from the system
- **Set Maintenance Mode:** Take lab offline for upgrades or repairs

**Seeded Labs (6 labs):**

| Lab | Building | Floor | Capacity | Key Features |
|---|---|---|---|---|
| Software Lab 1 | IT Block | 1 | 35 | 35 PCs, Windows 11, VS Code/Python/Java |
| Software Lab 2 | IT Block | 1 | 30 | 30 PCs, Ubuntu 22.04, GCC/Python/Docker |
| Network Lab | IT Block | 2 | 25 | 25 PCs, 5 routers, 10 switches, Packet Tracer |
| Database Lab | IT Block | 2 | 30 | 30 PCs, Oracle/MySQL/PostgreSQL/MongoDB |
| Hardware Lab | IT Block | 3 | 20 | Oscilloscopes, Logic Analyzers, FPGA boards |
| AI/ML Lab | IT Block | 3 | 25 | 25 PCs, NVIDIA RTX 3060 GPUs, TensorFlow/PyTorch |

### 12.5 Managing Faculty

From **Manage Faculty** you can:
- View all faculty members and their current teaching loads
- Identify overloaded faculty (hours > max_hours)
- Reassign courses to balance load
- Add new faculty members

**Seeded Faculty (8 members):**

| Faculty | Specialization | Office | Department |
|---|---|---|---|
| Dr. Ahmed Khan | Operating Systems | FB-101 | Computer Science |
| Dr. Sara Ali | Database Systems | FB-102 | Computer Science |
| Dr. Usman Tariq | Computer Networks | FB-103 | Computer Science |
| Dr. Fatima Noor | Software Engineering | FB-201 | Computer Science |
| Dr. Bilal Ahmad | Artificial Intelligence | FB-202 | Computer Science |
| Dr. Aisha Malik | Data Science | FB-203 | Computer Science |
| Dr. Hassan Raza | Embedded Systems | FB-301 | Electrical Engineering |
| Dr. Zainab Khalid | Digital Logic | FB-302 | Electrical Engineering |

### 12.6 Managing Users

From **Manage Users** you can:
- View all registered users with their roles and departments
- Change a user's role (admin, faculty, student)
- Deactivate or delete user accounts
- View login activity

**Roles:**
- **admin:** Full system access including settings and resource management
- **faculty:** Can create bookings, view analytics, and manage own department
- **student:** Can view schedules, submit limited booking requests

### 12.7 System Settings

The **System Settings** panel on the admin dashboard allows you to configure core scheduling parameters. Each setting has an OS concept badge explaining its significance.

#### Default Scheduling Algorithm

| Setting | Options | Default | OS Concept |
|---|---|---|---|
| Default Algorithm | FCFS, SJF, RR, Priority | Round Robin (RR) | CPU Scheduler (Ch. 5) |

Select which algorithm the system uses by default for processing new booking requests.

#### Round Robin Quantum

| Setting | Range | Default | OS Concept |
|---|---|---|---|
| Time Quantum | 1 - 20 time units | 4 | Time Quantum (Ch. 5) |

Adjust the slider to set the Round Robin time quantum.

- **Smaller quantum (1-3):** More fair, higher overhead. Each booking gets frequent short turns
- **Larger quantum (10+):** Less fair, lower overhead. Approaches FCFS behavior

The scale shows:
```
1 (high overhead) ←————————————→ 20 (low fairness)
```

#### Priority Aging

| Setting | Options | Default | OS Concept |
|---|---|---|---|
| Priority Aging | On / Off (toggle) | On | Aging (Ch. 5) |

When **enabled**, the system gradually increases the priority of booking requests that have been waiting for a long time. This prevents **starvation** -- the situation where low-priority bookings never get scheduled.

When **disabled**, priority scheduling is strict -- only the highest-priority booking runs, regardless of how long others have waited.

#### Max Concurrent Bookings

| Setting | Range | Default | OS Concept |
|---|---|---|---|
| Max Concurrent | 1 - 20 | 5 | Semaphore Count (Ch. 6) |

Controls how many bookings can be actively processed simultaneously. This is analogous to a **counting semaphore** -- the maximum value of the semaphore controls concurrency.

```
1 (sequential) ←————————————→ 20 (high parallelism)
```

#### Saving Settings

Click **Save Settings** to apply changes. The button shows "Updating kernel parameters..." while saving, reinforcing the OS analogy that these are kernel-level configuration changes.

### 12.8 Recent Admin Activity Log

The right side of the admin dashboard shows a chronological log of recent administrative actions:

| Indicator | Action Type | Example |
|---|---|---|
| Blue dot | Resource | "Room CS-201 status changed to maintenance" |
| Teal dot | User | "New faculty Dr. Sarah added to CS department" |
| Amber dot | Settings | "Scheduling algorithm changed to Round Robin (q=4)" |
| Green dot | System | "Deadlock detected and auto-resolved via preemption" |

Each entry shows:
- A color-coded dot indicating the action category
- The action description
- Who performed it (admin name or "System")
- When it happened (relative time, e.g., "2 min ago")
- A type badge (resource, user, settings, system)

**OS Concept:** This is an **Audit Log** (Ch. 14: Protection) -- every privileged operation is logged, just like system calls in an OS are traced for security auditing.

---

## 13. OS Concepts Reference Guide

This section provides a complete glossary of every Operating System concept demonstrated in CUIScheduler.

### CPU Scheduling -- FCFS (First Come First Served)

| Field | Details |
|---|---|
| **Chapter** | Ch. 5: CPU Scheduling |
| **Real-world Analogy** | A queue at the university cafeteria -- whoever arrives first is served first |
| **CUIScheduler Mapping** | Booking requests processed in the order they are submitted |
| **Pages** | Scheduling Engine, Timetable (Auto-Schedule) |
| **Key Observations** | Watch the Gantt chart -- processes appear in strict arrival order. Notice the convoy effect when a long booking is first |

### CPU Scheduling -- SJF (Shortest Job First)

| Field | Details |
|---|---|
| **Chapter** | Ch. 5: CPU Scheduling |
| **Real-world Analogy** | An express checkout lane -- customers with fewer items go first |
| **CUIScheduler Mapping** | Shortest-duration booking requests are processed first |
| **Pages** | Scheduling Engine, Analytics (Algorithm Comparison) |
| **Key Observations** | Compare average waiting time with FCFS -- SJF is always equal or better. Watch for long bookings being pushed to the end |

### CPU Scheduling -- Round Robin

| Field | Details |
|---|---|
| **Chapter** | Ch. 5: CPU Scheduling |
| **Real-world Analogy** | Taking turns in a group presentation -- each person speaks for exactly 5 minutes, then passes to the next |
| **CUIScheduler Mapping** | Each booking gets a fixed time quantum before being paused and the next booking is processed |
| **Pages** | Scheduling Engine, Admin Panel (quantum configuration) |
| **Key Observations** | Count context switches in the metrics. Adjust quantum in admin settings and re-run to see how it affects performance. Small quantum = more switches, large quantum = fewer switches |

### CPU Scheduling -- Priority

| Field | Details |
|---|---|
| **Chapter** | Ch. 5: CPU Scheduling |
| **Real-world Analogy** | An emergency room -- critical patients are treated before non-urgent cases |
| **CUIScheduler Mapping** | Exam bookings (priority 1) are processed before regular lectures (priority 5) |
| **Pages** | Scheduling Engine, Admin Panel (aging toggle) |
| **Key Observations** | Look for high-priority late arrivals jumping ahead in the Gantt chart. Enable/disable aging to see starvation effects |

### Context Switching

| Field | Details |
|---|---|
| **Chapter** | Ch. 5: CPU Scheduling |
| **Real-world Analogy** | Switching between tasks at your desk -- you save your current work, switch to a new task, losing a few seconds in the transition |
| **CUIScheduler Mapping** | Every time Round Robin preempts a booking and starts the next one, a context switch occurs |
| **Pages** | Scheduling Engine (trace log shows "preempt" and "resume" actions) |
| **Key Observations** | Count the "context switches" metric after running Round Robin. Compare with FCFS (0 switches). The overhead is the trade-off for fairness |

### Process Management -- PCB (Process Control Block)

| Field | Details |
|---|---|
| **Chapter** | Ch. 3: Processes |
| **Real-world Analogy** | A student's enrollment card -- contains their ID, department, courses, and status |
| **CUIScheduler Mapping** | Each booking has a PCB: PID, state, priority, arrival time, burst time, waiting time, turnaround time |
| **Pages** | Scheduling Engine (Process Ready Queue), all booking views |
| **Key Observations** | Notice how each booking in the queue has all the PCB fields. The trace log shows PCB updates as processes change state |

### Process Management -- State Machine

| Field | Details |
|---|---|
| **Chapter** | Ch. 3: Processes |
| **Real-world Analogy** | A package delivery: ordered (new), in warehouse (ready), out for delivery (running), stuck at customs (waiting), delivered (completed) |
| **CUIScheduler Mapping** | Every booking transitions: New -> Ready -> Running -> Waiting/Completed |
| **Pages** | All booking views, color-coded states throughout the UI |
| **Key Observations** | Watch state colors change in the Process Ready Queue. The trace log records every state transition with the reason |

### Deadlock -- Resource Allocation Graph (RAG)

| Field | Details |
|---|---|
| **Chapter** | Ch. 7: Deadlocks |
| **Real-world Analogy** | Two people at a narrow bridge, each blocking the other from crossing |
| **CUIScheduler Mapping** | Processes (bookings) and resources (rooms) connected by assignment/request edges. A cycle = deadlock |
| **Pages** | Deadlock Detector (RAG Canvas) |
| **Key Observations** | Look for cycles in the graph. When detected, nodes glow red. Drag nodes to better visualize the cycle. Load the "Classic 2-Process" scenario for a clear example |

### Deadlock -- Banker's Algorithm

| Field | Details |
|---|---|
| **Chapter** | Ch. 7: Deadlocks |
| **Real-world Analogy** | A bank deciding whether to approve a loan -- only approves if the bank can still cover all other commitments |
| **CUIScheduler Mapping** | Before granting a resource, the system checks if a safe sequence exists where all processes can complete |
| **Pages** | Deadlock Detector (Banker's Matrix, Safe Sequence Display) |
| **Key Observations** | Read the MAX, ALLOCATION, NEED matrices. Follow the step-by-step trace to see how the algorithm checks each process. If a safe sequence exists, the system is safe |

### Synchronization -- Semaphore

| Field | Details |
|---|---|
| **Chapter** | Ch. 6: Synchronization Tools |
| **Real-world Analogy** | A parking lot with a limited number of spaces and a counter at the entrance |
| **CUIScheduler Mapping** | A lab with N workstations is a counting semaphore with max_count = N. wait() when entering, signal() when leaving |
| **Pages** | Concurrency Monitor (Semaphore Visualizer) |
| **Key Observations** | Watch the count decrement as processes enter. When count = 0, new processes are queued. Watch the signal() operation unblock a waiting process |

### Synchronization -- Mutex

| Field | Details |
|---|---|
| **Chapter** | Ch. 6: Synchronization Tools |
| **Real-world Analogy** | A single-occupancy restroom with a lock -- only one person can use it at a time |
| **CUIScheduler Mapping** | A classroom (single-use) has a mutex. One booking locks it; others must wait |
| **Pages** | Concurrency Monitor (Mutex Display) |
| **Key Observations** | Check the LOCKED/UNLOCKED status and the owner PID. See how waiters queue up and are served in order |

### Synchronization -- Race Condition

| Field | Details |
|---|---|
| **Chapter** | Ch. 6: Synchronization Tools |
| **Real-world Analogy** | Two students seeing the last seat in a class as "available" and both registering at the same time |
| **CUIScheduler Mapping** | Two concurrent booking requests for the same room -- without locks, both succeed (data corruption) |
| **Pages** | Concurrency Monitor (Race Condition Demo) |
| **Key Observations** | Compare the "Without Lock" and "With Lock" panels side by side. Notice how the mutex prevents the double-booking |

### Memory Management -- Bitmap

| Field | Details |
|---|---|
| **Chapter** | Ch. 8: Main Memory |
| **Real-world Analogy** | A hotel reception board with lights: green = vacant room, red = occupied room |
| **CUIScheduler Mapping** | Each resource slot is a bit: 0 = free, 1 = allocated. The bitmap shows all resources at a glance |
| **Pages** | Resource Map (Memory Bitmap section) |
| **Key Observations** | Count free vs. allocated squares. Hover over allocated squares to see which booking is using them. Notice how the bitmap changes as bookings are created and completed |

### Memory Management -- Fragmentation

| Field | Details |
|---|---|
| **Chapter** | Ch. 8: Main Memory |
| **Real-world Analogy** | A parking lot where cars are scattered across random spots, leaving many unusable small gaps |
| **CUIScheduler Mapping** | Scattered free time slots between bookings that are too small to use |
| **Pages** | Resource Map (Fragmentation Bar), Analytics (Fragmentation over Time) |
| **Key Observations** | Look at the fragmentation percentage. High fragmentation means resources are inefficiently used. Compaction merges gaps |

### IPC -- Message Queue

| Field | Details |
|---|---|
| **Chapter** | Ch. 3: Processes |
| **Real-world Analogy** | A departmental mailbox system where offices leave messages for each other |
| **CUIScheduler Mapping** | Departments send notifications (booking confirmations, conflict alerts) via a message queue |
| **Pages** | Notifications (Message Queue Visualizer, Inbox) |
| **Key Observations** | Watch the animated producer-consumer visualization. Notice FIFO ordering. Messages flow from sender (producer) through the buffer to receiver (consumer) |

### Scheduling -- Load Balancing

| Field | Details |
|---|---|
| **Chapter** | Ch. 5: CPU Scheduling |
| **Real-world Analogy** | Distributing students evenly across multiple bus routes so no single bus is overcrowded |
| **CUIScheduler Mapping** | Distributing bookings evenly across resources so no room is overbooked while others are empty |
| **Pages** | Analytics (Faculty Load Radar, Resource Utilization Bars) |
| **Key Observations** | Identify overloaded faculty (red) and underutilized resources. An ideal system has even distribution |

---

## 14. Demo Day Guide

This section provides a step-by-step script for demonstrating CUIScheduler to a professor or evaluator in approximately 10 minutes.

### Preparation Checklist

Before the demo:
- [ ] Ensure Docker containers are running (`docker compose up`)
- [ ] Open `http://localhost:3000` in Chrome
- [ ] Log in as admin (`admin@cui.edu.pk` / `admin123`)
- [ ] Verify the dashboard loads correctly
- [ ] Clear any previous scheduling results
- [ ] Have this guide open for reference

### Step-by-Step Demo Script

#### Step 1: Introduction (30 seconds)

**Navigate to:** Dashboard

**Say:** "This is CUIScheduler, an Intelligent Campus Resource Scheduling System for COMSATS University Islamabad, Wah Campus. Every feature maps to an Operating System concept from the Silberschatz textbook."

**Point out:** The OS Concept badges visible on the dashboard, the live system status, and the dark-themed professional interface.

#### Step 2: Dashboard Overview (1 minute)

**Navigate to:** Dashboard (already there)

**Say:** "The dashboard shows real-time campus status. We have stat cards showing active bookings, resources, and faculty. Each card has an OS concept badge -- for example, Active Bookings represents processes in the RUNNING state."

**Point out:**
- Stat cards with OS concept tooltips
- System Status panel showing current algorithm and queue length
- OS Concepts Active panel showing which concepts are running

#### Step 3: Scheduling Engine -- Creating Processes (2 minutes)

**Navigate to:** Scheduling Engine

**Say:** "The Scheduling Engine treats booking requests as processes. Let me show you how CPU scheduling algorithms work."

**Actions:**
1. Click **"Load Demo Set"** to populate the queue with pre-seeded bookings
2. Point out the Process Ready Queue showing PIDs, burst times, priorities, and states
3. Say: "Each booking is a process with a PCB containing PID, state, priority, arrival time, and burst time."

#### Step 4: Run FCFS Algorithm (1 minute)

**Actions:**
1. Select the **FCFS** tab
2. Click **"Run FCFS"**
3. Wait for results to appear

**Say:** "FCFS processes bookings in arrival order. Notice the Gantt chart shows processes executed sequentially."

**Point out:**
- The Gantt chart with processes in arrival order
- Average waiting time metric
- Zero context switches (non-preemptive)

#### Step 5: Compare All Algorithms (1.5 minutes)

**Actions:**
1. Click **"Compare All"**
2. Scroll to the comparison section

**Say:** "Now let's compare all four algorithms on the same dataset. Notice how SJF has the lowest average waiting time -- this is mathematically proven optimal. Round Robin has the most context switches because it preempts. Priority scheduling processes urgent bookings first."

**Point out:**
- SJF with lowest avg waiting time
- RR with highest context switches
- The "Best For" description under each algorithm

#### Step 6: Deadlock Detection (1.5 minutes)

**Navigate to:** Deadlock Detector

**Say:** "Now let's look at deadlock detection. This page shows a Resource Allocation Graph where circles are processes and squares are resources."

**Actions:**
1. Click **"Classic 2-Process Deadlock"** scenario
2. Wait for detection to run automatically

**Say:** "We loaded a classic deadlock scenario. Process P1 holds Lab-1 and wants CR-301. Process P2 holds CR-301 and wants Lab-1. All four Coffman conditions are met -- see the red indicators."

**Point out:**
- The cycle highlighted in red on the RAG
- All four Coffman conditions turning red
- The Banker's Algorithm matrix showing UNSAFE state
- The "DEADLOCK" status badge

**Actions:**
1. Click **"Resolve Deadlock"**

**Say:** "We can resolve the deadlock by preempting one process, just like an OS would."

#### Step 7: Concurrency Monitor (1 minute)

**Navigate to:** Concurrency Monitor

**Say:** "The Concurrency Monitor shows semaphores and mutexes protecting shared resources."

**Actions:**
1. Click **"Race Demo"**

**Say:** "Watch the Race Condition Demo. Without locks, two departments both see a room as free and double-book it. With a mutex lock, the second request correctly sees it as occupied."

**Point out:**
- Side-by-side comparison panels
- The semaphore count and wait queue visualization

#### Step 8: Resource Map and Memory Bitmap (30 seconds)

**Navigate to:** Resource Map

**Say:** "Resources are tracked using a memory bitmap -- each bit represents a room slot. Zero is free, one is allocated, exactly like OS physical memory management."

**Point out:**
- The bitmap grid with colored squares
- The fragmentation percentage

#### Step 9: Notifications as IPC (30 seconds)

**Navigate to:** Notifications

**Say:** "Department communications use an IPC message queue. Watch the animated producer-consumer visualization -- messages flow from sender through a bounded buffer to receiver."

**Point out:**
- The animated message queue visualizer
- Messages being produced and consumed in real-time

#### Step 10: Wrap Up (30 seconds)

**Navigate to:** Admin Panel

**Say:** "Finally, the Admin Panel lets us configure kernel-level parameters -- the scheduling algorithm, Round Robin quantum, priority aging, and max concurrent bookings. Each setting has an OS concept badge."

**Point out:**
- System Settings with OS concept badges
- The quantum slider
- The aging toggle

**Closing:** "CUIScheduler covers Chapters 3, 5, 6, 7, and 8 of the OS textbook through a real campus scheduling application. Thank you."

### Tips for a Great Demo

1. **Keep the pace steady** -- do not rush through algorithms, let them animate
2. **Always mention the OS concept** when pointing out a feature
3. **Use the correct terminology** -- say "process," not "booking" when explaining OS concepts
4. **Highlight the chapter references** on OS concept badges
5. **Let the visualizations tell the story** -- the Gantt charts, RAG graphs, and semaphore animations are very visual
6. **If something breaks**, use the Reset button and move to the next module
7. **Practice the flow** at least once before the actual demo
8. **Keep the Compare All results visible** -- they are the strongest proof of concept
9. **Memorize the four Coffman conditions** -- evaluators often ask about them
10. **End with the Admin Panel** to show that the system is configurable, not just a static demo

---

## 15. Troubleshooting and FAQ

### Common Issues and Solutions

#### Issue: The application does not load at http://localhost:3000

**Possible causes and solutions:**

1. **Docker containers are not running**
   ```bash
   docker compose up --build
   ```
   Wait for all services to start. Look for "Ready" messages in the logs.

2. **Port 3000 is already in use**
   ```bash
   # Find the process using port 3000
   lsof -i :3000
   # Kill it or change the port in docker-compose.yml
   ```

3. **Browser cache issue**
   - Hard refresh: Ctrl + Shift + R (Windows/Linux) or Cmd + Shift + R (Mac)
   - Try incognito/private browsing mode

#### Issue: Cannot log in with default credentials

**Solutions:**
1. Verify you are using the correct credentials:
   - Admin: `admin@cui.edu.pk` / `admin123`
   - Faculty: `faculty@cui.edu.pk` / `faculty123`
   - Student: `student@cui.edu.pk` / `student123`
2. Check that the database has been seeded:
   ```bash
   cd backend
   python -m seed.seed_data
   ```
3. Verify the backend is running at `http://localhost:8000/docs`

#### Issue: The scheduling engine shows an empty queue

**Solutions:**
1. Click **"Load Demo Set"** to populate with seeded data
2. Click **"Add 5 Random"** to generate test data
3. Manually create a booking request using the form

#### Issue: Deadlock detector shows no nodes on the RAG

**Solutions:**
1. Click one of the demo scenario buttons (e.g., "Classic 2-Process Deadlock")
2. Ensure the backend API is responsive (check `http://localhost:8000/docs`)
3. Click **Reset** and try loading a scenario again

#### Issue: Animations are choppy or slow

**Solutions:**
1. Use a Chromium-based browser (Chrome, Edge)
2. Enable hardware acceleration in browser settings
3. Close other resource-intensive tabs
4. Ensure your screen resolution is not significantly higher than 4K

#### Issue: The timetable grid shows no entries

**Solutions:**
1. Check the **department filter** -- it may be filtering out all entries
2. Navigate to the correct week using the arrow buttons
3. Ensure bookings exist in the database (load demo data)

### Frequently Asked Questions

#### "Why is my booking stuck in the 'waiting' state?"

A booking in the **waiting** state means it is blocked on a resource that is currently unavailable. This can happen because:
- The requested room or lab is currently occupied by another booking
- The booking is waiting for a resource held by another process (potential deadlock scenario)
- The semaphore count for the resource has reached 0

**What to do:**
1. Go to the **Concurrency Monitor** to check semaphore states
2. Go to the **Deadlock Detector** to check for circular waits
3. Wait for the current occupant to finish (the booking will auto-transition to "ready")

#### "What does the red glow on the RAG mean?"

The red glow indicates a **deadlock cycle**. Nodes (processes and resources) that are part of a circular wait chain are highlighted with a pulsing red glow animation. This means:
- These processes are permanently blocked
- Each process holds a resource needed by the next process in the chain
- Manual intervention (resolution) is required

To fix it: Click the **"Resolve Deadlock"** button.

#### "What is the difference between a semaphore and a mutex?"

| Feature | Semaphore | Mutex |
|---|---|---|
| **Count** | Can be > 1 (counting semaphore) | Always 0 or 1 (binary) |
| **Use case** | Resources with multiple instances (lab with 5 PCs) | Single-instance resources (one classroom) |
| **Owner** | No specific owner | Has an owner process |
| **Example** | A lab with 3 available workstations | A classroom that only one class can use |

#### "Why does Round Robin have so many context switches?"

Round Robin is a **preemptive** algorithm. Every time a process's quantum expires, the OS must:
1. Save the state of the current process
2. Load the state of the next process

Each of these save/load operations is a **context switch**. A smaller quantum means more frequent switches. This is the trade-off for fairness -- every process gets equal CPU time.

#### "What is the convoy effect in FCFS?"

The convoy effect occurs when a long-running process is at the front of the FCFS queue. All subsequent processes (even short ones) must wait for it to complete. This results in high average waiting time.

**Example:** If P1 has a burst time of 180 minutes and P2-P5 each have burst times of 10 minutes, P2 must wait 180 minutes even though it only needs 10 minutes. SJF avoids this by scheduling short jobs first.

#### "How does aging prevent starvation?"

Without aging, a priority 10 booking (very low priority) might never run if higher-priority bookings keep arriving. Aging solves this by:
1. Tracking how long each process has been waiting
2. Gradually incrementing the priority of waiting processes
3. Eventually, the long-waiting process's priority becomes high enough to be scheduled

You can enable/disable aging in **Admin Panel > System Settings > Priority Aging**.

#### "What does fragmentation percentage mean?"

Fragmentation percentage represents how scattered the free time slots are across the resource schedule.

- **0% fragmentation:** All free slots are contiguous (ideal)
- **50% fragmentation:** Half the free space is scattered in unusable small gaps
- **100% fragmentation:** Every free slot is isolated between bookings

**High fragmentation** means there is technically free time available, but the gaps are too small to accommodate new bookings. **Compaction** can consolidate these gaps.

#### "Can I use CUIScheduler for actual university scheduling?"

CUIScheduler was designed as an educational tool to demonstrate OS concepts. While it has the features of a real scheduling system (booking, conflict detection, timetable management), it would need additional work for production use:
- Role-based access control hardening
- Data validation and audit trails
- Integration with existing university systems (LMS, student portal)
- Performance optimization for large-scale data
- Backup and disaster recovery

#### "Which scheduling algorithm should I use?"

| Scenario | Recommended Algorithm | Why |
|---|---|---|
| Normal semester scheduling | FCFS | Fair, simple, first-come-first-served |
| Want to minimize waiting time | SJF | Mathematically optimal average wait time |
| Peak hours with many competing departments | Round Robin | Fair time-sharing, no starvation |
| Exam period with urgent bookings | Priority | Critical exams are scheduled first |

#### "How do I reset the entire system to its initial state?"

1. Stop the Docker containers: `docker compose down`
2. Remove the database volume: `docker compose down -v`
3. Restart: `docker compose up --build`
4. The seed data will be automatically recreated

#### "What do the time slots 08:00-17:00 represent?"

These are the university operating hours. The system supports scheduling within these time slots:

| Slot | Time |
|---|---|
| 1 | 08:00 - 09:00 |
| 2 | 09:00 - 10:00 |
| 3 | 10:00 - 11:00 |
| 4 | 11:00 - 12:00 |
| 5 | 12:00 - 13:00 |
| 6 | 13:00 - 14:00 |
| 7 | 14:00 - 15:00 |
| 8 | 15:00 - 16:00 |
| 9 | 16:00 - 17:00 |

Bookings can span multiple slots (e.g., a 3-hour lab from 08:00 to 11:00 spans slots 1-3).

---

## Appendix A: Pre-Seeded Data Summary

The system comes pre-loaded with the following data for immediate demonstration:

### Users: 3

| # | Name | Role | Department |
|---|---|---|---|
| 1 | Dr. Ahmed Khan (Admin) | Admin | Computer Science |
| 2 | Dr. Sara Ali | Faculty | Computer Science |
| 3 | Ali Hassan | Student | Computer Science |

### Resources: 24

| Category | Count | Details |
|---|---|---|
| Classrooms | 10 | CR-101 through CR-401, capacities 40-80 |
| Labs | 6 | Software, Network, Database, Hardware, AI/ML |
| Faculty | 8 | CS and EE department faculty members |

### Bookings: 60

| State | Count | Description |
|---|---|---|
| Completed | 20 | Past bookings with full scheduling data |
| Ready | 20+ | In the ready queue, awaiting scheduling |
| Running | 5 | Currently active bookings |
| Waiting | 8 | Blocked, waiting for resources |
| Blocked | 2 | Deadlock demo bookings |
| New | 7+ | Recently submitted, not yet in ready queue |

### Notifications: 8

Pre-seeded IPC messages demonstrating department communication patterns including lab sharing requests, midterm schedule announcements, resource conflict alerts, and system maintenance notices.

---

## Appendix B: Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + K` | Quick search / command palette |
| `Esc` | Close modals, panels, and dropdowns |
| `Left/Right Arrow` | Navigate weeks in timetable view |

---

## Appendix C: API Endpoints Reference

For developers and advanced users, the backend API is documented at `http://localhost:8000/docs` (Swagger UI). Key endpoint groups:

| Endpoint Group | Base Path | Description |
|---|---|---|
| Authentication | `/auth` | Login, register, token refresh |
| Bookings | `/bookings` | CRUD for booking requests |
| Resources | `/resources` | CRUD for rooms, labs, faculty |
| Scheduling | `/scheduling` | Run algorithms, get results |
| Deadlock | `/deadlock` | RAG data, detection, resolution |
| Concurrency | `/concurrency` | Semaphore/mutex state, simulation |
| Timetable | `/timetable` | Weekly entries, auto-schedule |
| Analytics | `/analytics` | Utilization, heatmap, comparisons |
| Notifications | `/notifications` | Message CRUD, mark read |
| Admin | `/admin` | Settings, user management |

---

## Appendix D: Glossary of Terms

| Term | Definition |
|---|---|
| **Arrival Time** | The time at which a booking request enters the system |
| **Banker's Algorithm** | A deadlock avoidance algorithm that checks if granting a resource request keeps the system in a safe state |
| **Bitmap** | A data structure where each bit represents the status (free/allocated) of a resource slot |
| **Burst Time** | The duration of a booking request (analogous to CPU burst time for a process) |
| **Coffman Conditions** | The four necessary conditions for deadlock: mutual exclusion, hold and wait, no preemption, circular wait |
| **Compaction** | The process of moving allocated blocks together to eliminate fragmentation gaps |
| **Context Switch** | The overhead of saving one process's state and loading another's when the CPU switches between processes |
| **Critical Section** | A code section that accesses shared resources and must not be executed by more than one process concurrently |
| **Deadlock** | A state where two or more processes are permanently blocked, each waiting for a resource held by another |
| **External Fragmentation** | Free memory/time slots that exist but are scattered in small, unusable pieces |
| **FCFS** | First Come First Served -- a scheduling algorithm that processes requests in arrival order |
| **Gantt Chart** | A bar chart showing the timeline of process execution on the CPU |
| **IPC** | Inter-Process Communication -- mechanisms for processes to exchange data |
| **Mutex** | A binary semaphore that provides mutual exclusion for a single-instance resource |
| **PCB** | Process Control Block -- a data structure containing all information about a process |
| **Preemption** | The act of forcibly stopping a running process to give CPU time to another |
| **Priority Scheduling** | A scheduling algorithm that selects the highest-priority process to run next |
| **Process** | An instance of a program in execution (in CUIScheduler: a booking request) |
| **Quantum** | The fixed time slice given to each process in Round Robin scheduling |
| **Race Condition** | A bug where the outcome depends on the timing of multiple concurrent processes |
| **RAG** | Resource Allocation Graph -- a directed graph showing process-resource relationships |
| **Ready Queue** | The list of processes that are ready to run and waiting for CPU time |
| **Round Robin** | A scheduling algorithm that gives each process an equal time quantum in circular order |
| **Safe Sequence** | An ordering of processes where each can complete using available resources |
| **Safe State** | A system state where a safe sequence exists (no deadlock is possible) |
| **Semaphore** | A synchronization primitive that uses a counter to control access to shared resources |
| **SJF** | Shortest Job First -- a scheduling algorithm that selects the process with the shortest burst time |
| **Starvation** | A situation where a process waits indefinitely because higher-priority processes keep preempting it |
| **Throughput** | The number of processes completed per unit of time |
| **Turnaround Time** | Total time from process arrival to completion (waiting time + burst time) |
| **Waiting Time** | The total time a process spends in the ready queue waiting for CPU time |

---

*CUIScheduler -- Intelligent Campus Resource Scheduling System*
*COMSATS University Islamabad, Wah Campus*
*Operating Systems Course Project*

*Textbook Reference: Operating System Concepts, 10th Edition*
*Abraham Silberschatz, Peter Baer Galvin, Greg Gagne*
