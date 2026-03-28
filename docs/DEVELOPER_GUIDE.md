# CUIScheduler Developer Guide

**Comprehensive Technical Reference for the Intelligent Campus Resource Scheduling System**

COMSATS University Islamabad, Wah Campus -- Operating Systems Course Project

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Getting Started for Developers](#2-getting-started-for-developers)
3. [Project Structure](#3-project-structure)
4. [Backend Architecture](#4-backend-architecture)
5. [Frontend Architecture](#5-frontend-architecture)
6. [The OS Concept Badge System](#6-the-os-concept-badge-system)
7. [Data Models and Type System](#7-data-models-and-type-system)
8. [API Reference](#8-api-reference)
9. [Algorithms Deep Dive](#9-algorithms-deep-dive)
10. [Database Schema](#10-database-schema)
11. [Deployment Guide](#11-deployment-guide)
12. [Testing Guide](#12-testing-guide)
13. [Extending the System](#13-extending-the-system)
14. [Troubleshooting for Developers](#14-troubleshooting-for-developers)
15. [Code Style and Conventions](#15-code-style-and-conventions)

---

## 1. Project Overview

### 1.1 Architecture Diagram

```
+------------------------------------------------------+
|                     BROWSER                          |
|                                                      |
|  +------------------+   +-----------------------+    |
|  |  Next.js 14 App  |   |  WebSocket Client     |    |
|  |  (React 18, TS)  |   |  (lib/websocket.ts)   |    |
|  +--------+---------+   +-----------+-----------+    |
|           |                         |                |
+-----------+-------------------------+----------------+
            |  HTTP REST (Axios)      |  ws://
            v                         v
+------------------------------------------------------+
|                  FastAPI Backend                      |
|                                                      |
|  +--------+  +----------+  +-----------+  +--------+ |
|  | Auth   |  | Routers  |  | WebSocket |  | CORS   | |
|  | (JWT)  |  | (/api/*) |  | Manager   |  | Middle | |
|  +--------+  +----+-----+  +-----------+  +--------+ |
|                   |                                   |
|  +----------------v------------------+                |
|  |         Services Layer            |                |
|  |  +-------------+  +------------+ |                |
|  |  | Scheduling  |  | Deadlock   | |                |
|  |  | Engine      |  | Detector   | |                |
|  |  +-------------+  +------------+ |                |
|  |  +-------------+  +------------+ |                |
|  |  | Concurrency |  | Memory     | |                |
|  |  | Manager     |  | Manager    | |                |
|  |  +-------------+  +------------+ |                |
|  +-----------------------------------+                |
|                   |                                   |
|  +----------------v------------------+                |
|  |      SQLAlchemy ORM Layer         |                |
|  |  +------+ +--------+ +--------+  |                |
|  |  | User | | Booking| |Resource|  |                |
|  |  +------+ +--------+ +--------+  |                |
|  |  +----------+ +--------------+    |                |
|  |  |Timetable | |Notification  |    |                |
|  |  +----------+ +--------------+    |                |
|  +-----------------------------------+                |
|                   |                                   |
+-------------------+-----------------------------------+
                    |
         +----------v-----------+
         |   PostgreSQL 15      |
         |   (prod)             |
         |   or SQLite (dev)    |
         +----------------------+
```

### 1.2 Tech Stack with Version Numbers

| Layer        | Technology                   | Version  | Purpose                                     |
|-------------|------------------------------|----------|---------------------------------------------|
| **Frontend** | Next.js                      | 14.2.3   | React framework with App Router             |
|             | React                        | 18.3.1   | UI component library                        |
|             | TypeScript                   | 5.4.x    | Type-safe JavaScript                        |
|             | Tailwind CSS                 | 3.4.x    | Utility-first CSS framework                 |
|             | Framer Motion                | 11.x     | Animation library                           |
|             | Recharts                     | 2.12.x   | Chart components for React                  |
|             | D3.js                        | 7.9.x    | Data visualization (RAG graph)              |
|             | Zustand                      | 4.5.x    | Lightweight state management                |
|             | @dnd-kit                     | 6.1/8.0  | Drag and drop toolkit                       |
|             | @tanstack/react-table        | 8.17.x   | Headless table library                      |
|             | Axios                        | 1.7.x    | HTTP client                                 |
|             | Lucide React                 | 0.400.x  | Icon library                                |
|             | Radix UI                     | Various  | Accessible primitive components             |
|             | date-fns                     | 3.6.x    | Date utility library                        |
|             | jsPDF + jspdf-autotable      | 2.5/3.8  | PDF export                                  |
|             | react-hot-toast              | 2.4.x    | Toast notifications                         |
|             | react-countup                | 6.5.x    | Animated number counters                    |
|             | clsx + tailwind-merge        | 2.1/2.3  | Conditional CSS class utilities             |
|             | class-variance-authority     | 0.7.x    | Component variant API                       |
| **Backend** | FastAPI                      | 0.110.0  | Async Python web framework                  |
|             | Uvicorn                      | 0.29.0   | ASGI server                                 |
|             | SQLAlchemy                   | 2.0.29   | ORM and database toolkit                    |
|             | Alembic                      | 1.13.1   | Database migration tool                     |
|             | psycopg2-binary              | 2.9.9    | PostgreSQL adapter                          |
|             | python-jose                  | 3.3.0    | JWT token handling                          |
|             | passlib[bcrypt]              | 1.7.4    | Password hashing                            |
|             | Pydantic                     | 2.6.4    | Data validation and serialization           |
|             | websockets                   | 12.0     | WebSocket protocol support                  |
|             | python-dotenv                | 1.0.1    | Environment variable loading                |
|             | httpx                        | 0.27.0   | Async HTTP client (testing)                 |
| **Database** | PostgreSQL                   | 15       | Production relational database              |
|             | SQLite                       | 3.x      | Development database (zero config)          |
| **Infra**   | Docker Compose               | 3.8      | Multi-container orchestration               |

### 1.3 Design Philosophy and Principles

CUIScheduler is built on several core principles:

1. **OS Concepts as First-Class Citizens**: Every feature maps directly to an Operating System concept. Bookings are processes, resources are devices/memory, scheduling uses real CPU scheduling algorithms, and deadlock detection uses actual RAG cycle detection. Every API response includes an `os_concept_note` explaining the OS parallel.

2. **Real Utility, Real Teaching**: This is not a toy demo. It solves a genuine campus scheduling problem while transparently demonstrating OS internals. Students can see scheduling theory applied to their own classroom and lab bookings.

3. **Separation of Concerns**: The backend follows a clean three-layer pattern: Routers (HTTP handling) -> Services (business logic / OS algorithms) -> Models (data persistence). The frontend mirrors this with Pages -> Components -> Hooks/Stores -> API layer.

4. **Progressive Enhancement**: The frontend works with mock/client-side data when the backend is unavailable. Every Zustand store includes local fallback logic, so the UI can demonstrate OS concepts even offline.

5. **Dark-First, Information-Dense UI**: The interface is designed for an academic audience that needs to see data density -- Gantt charts, matrices, graphs, queues -- all visible simultaneously. The dark theme reduces eye strain during extended use.

### 1.4 OS Concept Integration Approach

Each module in the system maps to a specific OS textbook chapter:

| System Module       | OS Concept                  | Textbook Chapter |
|--------------------|-----------------------------|-----------------|
| Scheduling Engine  | CPU Scheduling (FCFS, SJF, RR, Priority) | Ch. 5 |
| Deadlock Detector  | Deadlock Detection (RAG) + Avoidance (Banker's) | Ch. 7 |
| Concurrency Monitor| Semaphores, Mutexes, Race Conditions | Ch. 6 |
| Resource Map       | Memory Management (Bitmap, Fragmentation) | Ch. 8 |
| Booking System     | Process Management (PCB, State Machine) | Ch. 3 |
| Notifications      | Inter-Process Communication (Message Queue) | Ch. 3 |
| Analytics          | Load Balancing, Throughput Analysis | Ch. 5 |
| Timetable Builder  | Batch Scheduling, Resource Allocation | Ch. 5 |

Every API response contains an `os_concept_note` field that explains how the operation relates to OS theory. The frontend displays these notes via the OS Concept Badge system and the OS Concept Sidebar panel.

---

## 2. Getting Started for Developers

### 2.1 Prerequisites

| Tool       | Minimum Version | Recommended | Check Command              |
|------------|----------------|-------------|---------------------------|
| Node.js    | 18.x           | 20.x LTS   | `node --version`          |
| npm        | 9.x            | 10.x       | `npm --version`           |
| Python     | 3.10           | 3.11+      | `python --version`        |
| pip        | 23.x           | Latest      | `pip --version`           |
| Docker     | 24.x           | Latest      | `docker --version`        |
| Docker Compose | 2.x       | Latest      | `docker compose version`  |
| Git        | 2.x            | Latest      | `git --version`           |

Docker is optional if you prefer running services locally.

### 2.2 Cloning and Setup

```bash
git clone <repository-url> cuischeduler
cd cuischeduler
```

### 2.3 Running with Docker Compose (Recommended)

The simplest way to run everything:

```bash
docker compose up --build
```

This command:
1. Starts PostgreSQL 15 with the `cuischeduler` database
2. Waits for PostgreSQL health check to pass
3. Runs Alembic migrations on the backend
4. Seeds the database with demo data (users, resources, bookings, notifications)
5. Starts the FastAPI backend on port 8000
6. Starts the Next.js frontend on port 3000

Access points after startup:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Swagger UI (API Docs)**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

To stop all services:

```bash
docker compose down
```

To stop and remove all data volumes:

```bash
docker compose down -v
```

### 2.4 Running Without Docker (Local Development)

#### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# On Linux/macOS:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# The backend uses SQLite by default when DATABASE_URL is not set.
# No database setup needed for development.

# Seed the database with demo data
python seed/seed_data.py

# Start the development server with hot-reload
uvicorn main:app --reload --port 8000
```

#### Frontend Setup

```bash
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

The frontend dev server starts on http://localhost:3000.

### 2.5 Environment Variables Reference

#### Backend Environment Variables

| Variable         | Default Value                                  | Description                                    |
|-----------------|-----------------------------------------------|------------------------------------------------|
| `DATABASE_URL`  | `sqlite:///./cuischeduler.db`                 | Database connection string. Use `postgresql://user:pass@host:port/db` for PostgreSQL. |
| `SECRET_KEY`    | `cuischeduler-secret-key-change-in-production-2024` | JWT signing key. **Must be changed in production.** |
| `FRONTEND_URL`  | `http://localhost:3000`                       | Frontend origin for CORS configuration.        |

#### Frontend Environment Variables

| Variable              | Default Value              | Description                         |
|----------------------|---------------------------|-------------------------------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000`   | Backend API base URL.               |
| `NEXT_PUBLIC_WS_URL`  | `ws://localhost:8000/ws`  | WebSocket connection URL.           |

#### Docker Compose Environment Variables (set in docker-compose.yml)

| Variable            | Value (Docker)                                           | Service   |
|--------------------|----------------------------------------------------------|-----------|
| `POSTGRES_DB`       | `cuischeduler`                                           | postgres  |
| `POSTGRES_USER`     | `cui`                                                    | postgres  |
| `POSTGRES_PASSWORD` | `cuisecure2025`                                          | postgres  |
| `DATABASE_URL`      | `postgresql://cui:cuisecure2025@postgres:5432/cuischeduler` | backend |
| `SECRET_KEY`        | `cuischeduler_jwt_secret_key_2025_os_project`            | backend   |
| `FRONTEND_URL`      | `http://localhost:3000`                                  | backend   |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000`                                | frontend  |
| `NEXT_PUBLIC_WS_URL`  | `ws://localhost:8000`                                  | frontend  |

### 2.6 Verifying the Setup

After starting both services, verify everything works:

```bash
# 1. Check backend health
curl http://localhost:8000/health
# Expected: {"status":"healthy","os_concept_note":"Health check - like an OS watchdog timer..."}

# 2. Check API root
curl http://localhost:8000/
# Expected: JSON with API name, version, and endpoint listing

# 3. Login with default admin account
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cui.edu.pk","password":"admin123"}'
# Expected: JSON with access_token and user object

# 4. Check frontend loads
# Open http://localhost:3000 in a browser
```

### 2.7 Default Accounts

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| Admin   | admin@cui.edu.pk    | admin123    |
| Faculty | faculty@cui.edu.pk  | faculty123  |
| Student | student@cui.edu.pk  | student123  |

---

## 3. Project Structure

### 3.1 Top-Level Structure

```
cuischeduler/
+-- docker-compose.yml          # Multi-container orchestration
+-- README.md                   # Project overview and quick start
+-- docs/                       # Documentation
|   +-- DEVELOPER_GUIDE.md      # This file
+-- backend/                    # FastAPI Python backend
+-- frontend/                   # Next.js React frontend
```

### 3.2 Backend Directory Structure

```
backend/
+-- main.py                     # FastAPI app creation, middleware, router registration
+-- database.py                 # SQLAlchemy engine, session factory, Base class
+-- requirements.txt            # Python package dependencies
+-- Dockerfile                  # Backend container image
+-- alembic.ini                 # Alembic migration configuration
+-- alembic/                    # Database migration scripts
|   +-- versions/               # Individual migration files
|   +-- env.py                  # Migration environment setup
+-- models/                     # SQLAlchemy ORM model definitions
|   +-- __init__.py             # Model imports
|   +-- user.py                 # User model (id, email, name, hashed_password, role, department)
|   +-- resource.py             # Resource model (id, name, type, building, floor, capacity, status, features)
|   +-- booking.py              # Booking model (process fields: process_id, state, priority, arrival_time, etc.)
|   +-- timetable.py            # TimetableEntry model (booking_id, resource_id, day_of_week, times)
|   +-- notification.py         # Notification model (from/to department, type, subject, body, read, os_concept)
+-- schemas/                    # Pydantic request/response models
|   +-- __init__.py
|   +-- user.py                 # UserCreate, UserLogin, UserResponse, Token
|   +-- resource.py             # ResourceCreate, ResourceUpdate, ResourceResponse, ResourceAvailability, ResourcePoolState
|   +-- booking.py              # BookingCreate, BookingUpdate, BookingResponse, BookingStateTransition, BookingQueueResponse
|   +-- scheduling.py           # SchedulingRequest, SchedulingResult, BankersRequest, BankersResult, SemaphoreState, etc.
|   +-- timetable.py            # TimetableEntryCreate, TimetableEntryUpdate, WeekTimetableResponse, AutoScheduleRequest
|   +-- analytics.py            # Analytics response models
|   +-- notification.py         # NotificationCreate, NotificationResponse, NotificationQueueState
+-- routers/                    # API endpoint handlers
|   +-- __init__.py             # Router exports
|   +-- auth.py                 # /api/auth/* -- login, register, me
|   +-- resources.py            # /api/resources/* -- CRUD, availability, pool state, schedule
|   +-- bookings.py             # /api/bookings/* -- CRUD, queue, state transitions
|   +-- scheduling.py           # /api/scheduling/* -- run algorithm, compare, metrics
|   +-- deadlock.py             # /api/deadlock/* -- RAG, analyze, bankers, scenario, resolve
|   +-- timetable.py            # /api/timetable/* -- CRUD, auto-schedule
|   +-- analytics.py            # /api/analytics/* -- utilization, algorithms, heatmap, faculty-load, fragmentation
|   +-- notifications.py        # /api/notifications/* -- CRUD, read status, queue state
+-- services/                   # Business logic and OS algorithm implementations
|   +-- scheduling_engine.py    # FCFS, SJF, Round Robin, Priority scheduling algorithms
|   +-- deadlock_detector.py    # RAG construction, DFS cycle detection, Banker's algorithm, scenario creation, resolution
|   +-- concurrency_manager.py  # Semaphore wait/signal, mutex, race condition demo, concurrent booking simulation
|   +-- memory_manager.py       # Bitmap allocation, fragmentation calculation, compaction
+-- websocket/                  # Real-time communication
|   +-- manager.py              # ConnectionManager: connect, disconnect, broadcast, event-specific broadcasts
+-- seed/                       # Database seeding
|   +-- seed_data.py            # Creates demo users, resources (24), bookings (60), notifications (8)
```

### 3.3 Frontend Directory Structure

```
frontend/
+-- package.json                # Dependencies and scripts
+-- tsconfig.json               # TypeScript configuration
+-- tailwind.config.ts          # Tailwind CSS configuration with custom design tokens
+-- postcss.config.mjs          # PostCSS configuration
+-- next.config.mjs             # Next.js configuration
+-- Dockerfile                  # Frontend container image
+-- types/
|   +-- index.ts                # All shared TypeScript interfaces and type aliases
+-- constants/
|   +-- osConcepts.ts           # OS_CONCEPTS constant mapping with names, chapters, descriptions
+-- lib/
|   +-- api.ts                  # Axios instance with JWT interceptor, all API module exports
|   +-- auth.ts                 # Token and user management via localStorage
|   +-- websocket.ts            # WebSocketManager class (singleton, reconnect, event dispatch)
|   +-- utils.ts                # cn() utility (clsx + tailwind-merge)
+-- hooks/
|   +-- useScheduler.ts         # Zustand store for scheduling: queue, algorithm, run, compare, demo data
|   +-- useDeadlock.ts          # Zustand store for deadlock: RAG, analysis, bankers, scenarios
|   +-- useConcurrency.ts       # Zustand store for concurrency: semaphores, mutexes, race demo
|   +-- useResources.ts         # Zustand store for resources: CRUD, pool state, availability
|   +-- useTimetable.ts         # Zustand store for timetable: entries, auto-schedule, week navigation
|   +-- useWebSocket.ts         # React hook wrapping WebSocketManager with auto-connect and event subscriptions
+-- components/
|   +-- ui/                     # Reusable UI primitives
|   |   +-- OSConceptBadge.tsx  # OS concept label with tooltip, pulse animation, 3 position modes
|   |   +-- ProcessStateChip.tsx# Colored chip showing process state (new/ready/running/waiting/completed/blocked)
|   |   +-- PCBCard.tsx         # Process Control Block card displaying all process fields
|   |   +-- StatCard.tsx        # Dashboard stat card with icon, value, label, delta
|   |   +-- GlowCard.tsx        # Card with glow border effect on hover
|   |   +-- ResourceDot.tsx     # Small colored dot indicating resource status
|   |   +-- LivePulse.tsx       # Animated pulsing dot for "live" indicators
|   |   +-- AlgorithmBadge.tsx  # Badge showing scheduling algorithm name with color coding
|   +-- layout/                 # Layout shell components
|   |   +-- Sidebar.tsx         # Left navigation with OS concept legend, collapsible
|   |   +-- TopBar.tsx          # Top bar with search, notifications, OS panel toggle, user menu
|   |   +-- PageHeader.tsx      # Page title with OS concept badge and breadcrumbs
|   |   +-- OSConceptSidebar.tsx# Right panel showing OS concept explanations for current page
|   +-- scheduler/              # Scheduling Engine page components
|   +-- deadlock/               # Deadlock Detector page components
|   +-- concurrency/            # Concurrency Monitor page components
|   +-- resources/              # Resource Map page components
|   +-- timetable/              # Timetable Builder page components
|   +-- analytics/              # Analytics page components
|   +-- shared/                 # Cross-cutting components
|       +-- DataTable.tsx       # Generic data table using @tanstack/react-table
+-- app/                        # Next.js App Router pages
|   +-- layout.tsx              # Root layout: Sidebar, TopBar, OSConceptSidebar, Toaster, fonts
|   +-- globals.css             # CSS custom properties, keyframes, scrollbar styles
|   +-- page.tsx                # Landing/redirect page
|   +-- dashboard/
|   |   +-- page.tsx            # Dashboard: Gantt chart, utilization rings, process queue, semaphore status
|   +-- scheduler/
|   |   +-- page.tsx            # Scheduling Engine: algorithm selection, queue, Gantt, step trace, comparison
|   +-- deadlock/
|   |   +-- page.tsx            # Deadlock Detector: D3 RAG graph, Banker's matrix, scenarios, resolution
|   +-- concurrency/
|   |   +-- page.tsx            # Concurrency Monitor: semaphore viz, mutex, race condition demo
|   +-- resources/
|   |   +-- page.tsx            # Resource Map: floor plans, bitmap allocation, fragmentation
|   +-- timetable/
|   |   +-- page.tsx            # Timetable: drag-and-drop weekly grid, auto-schedule, export
|   +-- analytics/
|   |   +-- page.tsx            # Analytics: algorithm comparison, utilization, heatmap, faculty load
|   +-- notifications/
|   |   +-- page.tsx            # Notifications: IPC message queue visualization
|   +-- admin/
|   |   +-- page.tsx            # Admin panel overview
|   |   +-- rooms/page.tsx      # Room management CRUD
|   |   +-- labs/page.tsx       # Lab management CRUD
|   |   +-- faculty/page.tsx    # Faculty management CRUD
|   |   +-- users/page.tsx      # User management CRUD
|   +-- (auth)/
|       +-- login/page.tsx      # Login form
|       +-- register/page.tsx   # Registration form
```

### 3.4 Shared Contracts

The frontend and backend share type contracts at the API boundary:

- **Backend** defines the shape via Pydantic schemas (`backend/schemas/*.py`)
- **Frontend** mirrors these as TypeScript interfaces (`frontend/types/index.ts`)
- The API layer (`frontend/lib/api.ts`) bridges the two
- Every response includes an `os_concept_note` string field

---

## 4. Backend Architecture

### 4.1 FastAPI Application Structure (main.py Walkthrough)

The entry point `main.py` performs the following in order:

1. **Import all routers** from the `routers/` package via `routers/__init__.py`
2. **Create the FastAPI app** with title, description, and version metadata
3. **Configure CORS middleware** allowing origins on ports 3000 (Next.js) and 5173 (Vite, if used for testing). Allows all methods and headers with credentials.
4. **Register 8 routers** under the `/api` prefix:
   - `/api/auth` -- Authentication
   - `/api/resources` -- Resource management
   - `/api/bookings` -- Booking management
   - `/api/scheduling` -- Scheduling algorithms
   - `/api/deadlock` -- Deadlock detection/avoidance
   - `/api/timetable` -- Timetable management
   - `/api/analytics` -- Analytics and reporting
   - `/api/notifications` -- IPC notification system
5. **Startup event** creates all database tables via `Base.metadata.create_all()`
6. **WebSocket endpoint** at `/ws` accepts connections, echoes with acknowledgments, and handles disconnects
7. **Root endpoint** (`GET /`) returns API metadata with endpoint listing
8. **Health check** (`GET /health`) returns system status

### 4.2 Database Layer

#### 4.2.1 Database Connection (`database.py`)

The database module provides:

```python
# Automatic database selection based on DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cuischeduler.db")

# SQLite: disables thread safety check (required for FastAPI)
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
# PostgreSQL: connection pooling with pre-ping and overflow
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_size=10, max_overflow=20)
```

The `get_db()` dependency provides a database session per request with automatic cleanup:

```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### 4.2.2 SQLAlchemy Models

**User Model** (`models/user.py`)

| Column           | Type         | Constraints                | Description                |
|-----------------|-------------|----------------------------|----------------------------|
| `id`            | Integer     | Primary key, indexed       | Unique user identifier     |
| `email`         | String(255) | Unique, indexed, not null  | Login email address        |
| `name`          | String(255) | Not null                   | Display name               |
| `hashed_password` | String(255) | Not null                | Bcrypt password hash       |
| `role`          | Enum        | Default: student           | One of: admin, faculty, student |
| `department`    | String(100) | Default: "Computer Science"| Academic department        |
| `created_at`    | DateTime    | Default: now(UTC)          | Account creation timestamp |

Relationships:
- `bookings_requested` -> Booking (via `requested_by` FK)
- `bookings_faculty` -> Booking (via `faculty_id` FK)

**Resource Model** (`models/resource.py`)

| Column       | Type         | Constraints                | Description                  |
|-------------|-------------|----------------------------|------------------------------|
| `id`        | Integer     | Primary key, indexed       | Unique resource identifier   |
| `name`      | String(255) | Not null                   | Display name (e.g., "CR-101") |
| `type`      | Enum        | Not null                   | One of: classroom, lab, faculty, exam_slot |
| `building`  | String(100) | Default: "Main Building"   | Building location            |
| `floor`     | Integer     | Default: 1                 | Floor number                 |
| `capacity`  | Integer     | Default: 40                | Maximum occupancy            |
| `status`    | Enum        | Default: available         | One of: available, occupied, maintenance |
| `features`  | JSON        | Default: {}                | Flexible feature dictionary  |
| `department`| String(100) | Default: "Computer Science"| Owning department            |

Relationships:
- `bookings` -> Booking (via `resource_id` FK)
- `timetable_entries` -> TimetableEntry (via `resource_id` FK)

**Booking Model** (`models/booking.py`) -- The OS Process

| Column            | Type         | Constraints          | OS Concept Parallel          |
|------------------|-------------|----------------------|------------------------------|
| `id`             | Integer     | Primary key          | Internal identifier          |
| `process_id`     | String(20)  | Unique, indexed      | **PID** (Process ID)         |
| `title`          | String(255) | Not null             | Process name                 |
| `course_code`    | String(20)  | Nullable             | Process metadata             |
| `department`     | String(100) | Default: CS          | Process owner                |
| `faculty_id`     | Integer     | FK -> users.id       | Associated faculty           |
| `resource_id`    | Integer     | FK -> resources.id   | **Allocated device/memory**  |
| `resource_type`  | String(50)  | Default: classroom   | Device type                  |
| `requested_by`   | Integer     | FK -> users.id       | Process creator (fork parent)|
| `date`           | Date        | Not null             | Scheduled date               |
| `start_time`     | Time        | Nullable             | Execution start              |
| `end_time`       | Time        | Nullable             | Execution end                |
| `duration_minutes` | Integer   | Default: 60          | **Burst time**               |
| `priority`       | Integer     | Default: 5           | **Process priority** (1=highest) |
| `state`          | Enum        | Default: new         | **Process state** (see state machine) |
| `arrival_time`   | Float       | Default: 0           | **Arrival time in ready queue** |
| `waiting_time`   | Float       | Default: 0           | **Waiting time** (computed)  |
| `turnaround_time`| Float       | Default: 0           | **Turnaround time** (computed)|
| `algorithm_used` | String(50)  | Nullable             | Which scheduler processed it |
| `os_concept_note`| String(500) | Nullable             | OS concept explanation       |
| `created_at`     | DateTime    | Default: now(UTC)    | Process creation time        |

**BookingState Enum** (Process State Machine):
```
new -> ready -> running -> completed
                       \-> waiting -> ready
                       \-> blocked -> ready
                                  \-> new
```

Valid transitions (enforced by the API):
```python
STATE_TRANSITIONS = {
    "new":       ["ready"],
    "ready":     ["running", "waiting"],
    "running":   ["completed", "waiting", "blocked"],
    "waiting":   ["ready", "blocked"],
    "blocked":   ["ready", "new"],
    "completed": [],
}
```

**TimetableEntry Model** (`models/timetable.py`)

| Column          | Type       | Constraints          | Description                |
|----------------|-----------|----------------------|----------------------------|
| `id`           | Integer   | Primary key          | Entry identifier           |
| `booking_id`   | Integer   | FK -> bookings.id    | Associated booking/process |
| `resource_id`  | Integer   | FK -> resources.id   | Assigned resource          |
| `day_of_week`  | String(20)| Not null             | "Monday" through "Friday"  |
| `start_time`   | Time      | Not null             | Slot start time            |
| `end_time`     | Time      | Not null             | Slot end time              |
| `week_start_date` | Date   | Nullable             | Week this entry belongs to |

**Notification Model** (`models/notification.py`)

| Column            | Type        | Constraints      | Description               |
|------------------|------------|------------------|---------------------------|
| `id`             | Integer    | Primary key      | Message identifier        |
| `from_department`| String(100)| Nullable         | Sender department (process)|
| `to_department`  | String(100)| Nullable         | Recipient department      |
| `type`           | String(50) | Default: "info"  | Message type: info, alert, request, response |
| `subject`        | String(255)| Not null         | Message subject line      |
| `body`           | Text       | Nullable         | Message body content      |
| `read`           | Boolean    | Default: False   | Read/consumed status      |
| `created_at`     | DateTime   | Default: now(UTC)| Timestamp                 |
| `os_concept`     | String(255)| Nullable         | IPC concept explanation   |

#### 4.2.3 SQLite vs PostgreSQL Configuration

The system auto-detects the database from `DATABASE_URL`:

- **SQLite** (default for development): Zero configuration, file-based. Set `check_same_thread=False` for FastAPI async compatibility.
- **PostgreSQL** (production via Docker): Connection pooling with `pool_size=10`, `max_overflow=20`, and `pool_pre_ping=True` for stale connection detection.

#### 4.2.4 Migration Strategy with Alembic

Alembic is configured for PostgreSQL migrations in the Docker environment:

```bash
# Generate a new migration after model changes
alembic revision --autogenerate -m "description"

# Apply all pending migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

In Docker, `alembic upgrade head` runs automatically before the server starts (see `docker-compose.yml` command). For SQLite development, tables are created via `Base.metadata.create_all()` on startup.

### 4.3 Authentication System

#### 4.3.1 JWT Token Flow

```
Client                          Server
  |                               |
  |  POST /api/auth/login         |
  |  {email, password}            |
  |------------------------------>|
  |                               | 1. Query user by email
  |                               | 2. Verify bcrypt hash
  |                               | 3. Create JWT with sub=user.id
  |  {access_token, user}         |
  |<------------------------------|
  |                               |
  |  GET /api/bookings            |
  |  Authorization: Bearer <jwt>  |
  |------------------------------>|
  |                               | 1. Decode JWT
  |                               | 2. Extract user ID from "sub"
  |                               | 3. Query user from DB
  |  {data}                       |
  |<------------------------------|
```

JWT Configuration:
- **Algorithm**: HS256
- **Expiry**: 24 hours (1440 minutes)
- **Payload**: `{"sub": user_id, "exp": expiry_timestamp}`
- **Secret Key**: `SECRET_KEY` environment variable

#### 4.3.2 Password Hashing

```python
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hash a password
hashed = pwd_context.hash("plaintext_password")

# Verify a password
is_valid = pwd_context.verify("plaintext_password", hashed)
```

Uses `passlib` with the `bcrypt` scheme. The `deprecated="auto"` flag ensures automatic migration if the hashing scheme changes.

#### 4.3.3 User Roles and Permissions

| Role    | Description                | Permissions                    |
|---------|---------------------------|--------------------------------|
| admin   | System administrator      | Full CRUD on all entities      |
| faculty | University faculty member  | Create/manage own bookings     |
| student | Student user              | View resources, limited booking|

The `get_current_user` dependency extracts the user from the JWT token. It returns `None` if no token is provided (soft authentication), allowing public endpoints to work without a token.

### 4.4 API Routers

All routers are mounted under the `/api` prefix via `main.py`.

#### 4.4.1 Auth Router (`/api/auth`)

| Method | Endpoint           | Description                    | Auth Required |
|--------|--------------------|--------------------------------|--------------|
| POST   | `/api/auth/register` | Create new user account       | No           |
| POST   | `/api/auth/login`    | Authenticate and get JWT token| No           |
| GET    | `/api/auth/me`       | Get current authenticated user| Yes          |

#### 4.4.2 Resources Router (`/api/resources`)

| Method | Endpoint                         | Description                          | Auth |
|--------|----------------------------------|--------------------------------------|------|
| GET    | `/api/resources`                 | List all resources (filterable by type, building, department, status) | No |
| GET    | `/api/resources/pool-state`      | Get bitmap allocation state for all resource pools (memory management view) | No |
| GET    | `/api/resources/availability`    | Get available time slots per resource (filterable by date, type, building) | No |
| GET    | `/api/resources/{id}`            | Get single resource by ID            | No   |
| GET    | `/api/resources/{id}/schedule`   | Get all bookings assigned to a resource | No |
| POST   | `/api/resources`                 | Create a new resource                | No   |
| PUT    | `/api/resources/{id}`            | Update resource fields               | No   |
| DELETE | `/api/resources/{id}`            | Delete a resource                    | No   |

#### 4.4.3 Bookings Router (`/api/bookings`)

| Method | Endpoint                          | Description                          | Auth |
|--------|-----------------------------------|--------------------------------------|------|
| GET    | `/api/bookings`                   | List bookings (filterable by state, department, resource_type, date) | No |
| GET    | `/api/bookings/queue`             | Get ready queue sorted by selected algorithm | No |
| GET    | `/api/bookings/{id}`              | Get single booking                   | No   |
| POST   | `/api/bookings`                   | Create new booking (auto-assigns process_id) | No |
| PUT    | `/api/bookings/{id}`              | Update booking fields                | No   |
| PATCH  | `/api/bookings/{id}/state`        | Transition booking state (enforces valid transitions) | No |
| DELETE | `/api/bookings/{id}`              | Delete a booking                     | No   |

The queue endpoint accepts an `algorithm` query parameter: `fcfs`, `sjf`, `priority`, or `round_robin`.

#### 4.4.4 Scheduling Router (`/api/scheduling`)

| Method | Endpoint                          | Description                          |
|--------|-----------------------------------|--------------------------------------|
| POST   | `/api/scheduling/run`             | Run a scheduling algorithm on specified bookings |
| POST   | `/api/scheduling/compare`         | Run all 4 algorithms and compare metrics |
| GET    | `/api/scheduling/metrics`         | Get historical scheduling metrics (completed bookings) |
| GET    | `/api/scheduling/current-algorithm` | Get the currently active scheduling algorithm |

#### 4.4.5 Deadlock Router (`/api/deadlock`)

| Method | Endpoint                          | Description                          |
|--------|-----------------------------------|--------------------------------------|
| GET    | `/api/deadlock/rag`               | Build and return Resource Allocation Graph with cycle detection |
| POST   | `/api/deadlock/analyze`           | Full deadlock analysis with resolution options |
| POST   | `/api/deadlock/bankers`           | Run Banker's Algorithm with step-by-step trace |
| POST   | `/api/deadlock/scenario`          | Create demo deadlock scenario (classic, chain, safe) |
| POST   | `/api/deadlock/resolve`           | Resolve deadlock using specified strategy |

#### 4.4.6 Timetable Router (`/api/timetable`)

| Method | Endpoint                          | Description                          |
|--------|-----------------------------------|--------------------------------------|
| GET    | `/api/timetable`                  | Get timetable entries (filterable by department, resource_id, week_start) |
| POST   | `/api/timetable`                  | Create timetable entry (with conflict detection) |
| PUT    | `/api/timetable/{id}`             | Update timetable entry (with conflict detection) |
| DELETE | `/api/timetable/{id}`             | Delete timetable entry               |
| POST   | `/api/timetable/auto-schedule`    | Auto-schedule bookings using selected algorithm |

#### 4.4.7 Analytics Router (`/api/analytics`)

| Method | Endpoint                          | Description                          |
|--------|-----------------------------------|--------------------------------------|
| GET    | `/api/analytics/utilization`      | Resource utilization percentages (filterable by type) |
| GET    | `/api/analytics/algorithms`       | Algorithm comparison from historical data |
| GET    | `/api/analytics/heatmap`          | 7x16 usage heatmap matrix (days x hours) |
| GET    | `/api/analytics/faculty-load`     | Faculty teaching load distribution   |
| GET    | `/api/analytics/fragmentation`    | Resource pool fragmentation analysis |

#### 4.4.8 Notifications Router (`/api/notifications`)

| Method | Endpoint                             | Description                          |
|--------|--------------------------------------|--------------------------------------|
| GET    | `/api/notifications`                 | List notifications (filterable by department, type, unread_only) |
| GET    | `/api/notifications/queue-state`     | Get IPC message queue state (counts, departments) |
| POST   | `/api/notifications`                 | Create new notification (broadcasts via WebSocket) |
| PATCH  | `/api/notifications/{id}/read`       | Mark single notification as read     |
| PATCH  | `/api/notifications/read-all`        | Mark all notifications as read (bulk consume) |

### 4.5 Services Layer

#### 4.5.1 SchedulingEngine (`services/scheduling_engine.py`)

The `SchedulingEngine` class implements four CPU scheduling algorithms. Each accepts a list of booking request dictionaries and returns a result with step-by-step traces, Gantt chart data, and metrics.

**Internal Process Representation:**

```python
class ProcessInfo:
    process_id: str          # PID
    booking_id: int          # Database reference
    arrival_time: float      # When process enters ready queue
    burst_time: float        # Total CPU time needed
    remaining_time: float    # Time left (for preemptive algorithms)
    priority: int            # Lower number = higher priority
    original_priority: int   # Before aging adjustments
    waiting_time: float      # Computed: turnaround - burst
    turnaround_time: float   # Computed: completion - arrival
    completion_time: float   # When process finished
    start_time: float        # When process first ran
    started: bool            # Has the process been dispatched at least once
```

**Methods:**

- `run_fcfs(requests)` -- First Come First Served
- `run_sjf(requests)` -- Shortest Job First (non-preemptive)
- `run_round_robin(requests, quantum=30)` -- Round Robin with configurable quantum
- `run_priority(requests, aging=True)` -- Priority scheduling with optional aging
- `compare_all(requests, quantum=30)` -- Run all four and return comparison

See [Section 9: Algorithms Deep Dive](#9-algorithms-deep-dive) for detailed algorithm walkthroughs.

#### 4.5.2 DeadlockDetector (`services/deadlock_detector.py`)

**Methods:**

- `build_rag(bookings, resources)` -- Constructs Resource Allocation Graph
  - Running/completed bookings create assignment edges (resource -> process)
  - Waiting/blocked bookings create request edges (process -> resource)
- `detect_cycle_dfs(nodes, edges)` -- DFS-based cycle detection
  - Uses adjacency list representation
  - Three-color DFS: visited set + recursion stack
  - Extracts cycle path by tracing parent pointers
  - Marks `in_cycle` on affected nodes and edges
- `run_bankers(processes, resources, max_matrix, allocation_matrix, available)` -- Banker's Algorithm
  - Computes Need matrix: Need[i][j] = Max[i][j] - Allocation[i][j]
  - Iteratively finds processes whose Need <= Work
  - Produces step-by-step trace with explanations
  - Returns safe/unsafe state and safe sequence
- `create_demo_scenario(scenario_type, db)` -- Creates deadlock scenarios
  - "classic": Two-process mutual deadlock
  - "chain": Three-process circular wait
  - "safe": No-deadlock demonstration
- `resolve_deadlock(bookings, strategy, db)` -- Deadlock resolution
  - "terminate_youngest": Kill newest process
  - "preempt_lowest_priority": Preempt from lowest priority
  - "rollback": Roll all deadlocked processes to ready state

#### 4.5.3 ConcurrencyManager (`services/concurrency_manager.py`)

Manages synchronization primitives with thread-safe operations.

**SemaphoreState** tracks:
- `value` (current count), `max_value`, `waiting_queue`, `holding_processes`

**MutexState** tracks:
- `locked`, `owner` (PID), `waiting_queue`

**Methods:**

- `initialize_semaphores(resources)` -- Create semaphores for resources. Labs get capacity-based counting semaphores (up to 3 concurrent sections); classrooms get binary semaphores (1).
- `sem_wait(resource_id, process_id)` -- P operation. If value > 0: decrement and acquire. Else: block and enqueue.
- `sem_signal(resource_id, process_id)` -- V operation. If waiting queue non-empty: wake first waiter (FIFO). Else: increment value.
- `simulate_concurrent_bookings(resource_id, n_processes)` -- Simulate N processes competing for one resource through the semaphore.
- `race_condition_demo(resource_id)` -- Demonstrate lost updates without synchronization vs. correct behavior with mutex protection. Shows interleaved read-modify-write producing wrong results.
- `get_all_states()` -- Return all semaphore and mutex states.

All operations are protected by a `threading.Lock` for thread safety.

#### 4.5.4 MemoryManager (`services/memory_manager.py`)

Models resource pools as memory using bitmap allocation.

**Methods:**

- `get_pool_state(resources, bookings)` -- Computes bitmap allocation state for each resource type:
  - Groups resources by type (classroom, lab, faculty, exam_slot)
  - Each resource instance is one "memory block"
  - Booked resources (running/waiting/blocked) = allocated (bit = 1)
  - Free resources = available (bit = 0)
  - Calculates external fragmentation ratio: `1 - (largest_free_block / total_free)`
  - Returns per-type and overall statistics
- `compact(resource_type, db)` -- Compaction/defragmentation:
  - Moves active bookings to fill gaps at the beginning
  - Consolidates free blocks at the end
  - Returns list of moves performed

### 4.6 WebSocket System

#### 4.6.1 ConnectionManager (`websocket/manager.py`)

The `ConnectionManager` class manages WebSocket connections:

```python
class ConnectionManager:
    active_connections: List[WebSocket]

    async def connect(websocket)       # Accept and track connection
    def disconnect(websocket)          # Remove from active list
    async def send_personal(msg, ws)   # Send to one client
    async def broadcast(event, data)   # Send to all connected clients
```

#### 4.6.2 Event Types and Payloads

| Event Type              | Trigger                              | Payload Fields                          |
|------------------------|--------------------------------------|-----------------------------------------|
| `booking_created`       | New booking created                  | id, process_id, title, state, os_concept_note |
| `booking_state_changed` | Booking state transition             | id, process_id, title, old_state, new_state, os_concept_note |
| `deadlock_detected`     | Deadlock analysis finds cycle        | deadlocked_processes, cycle, os_concept_note |
| `deadlock_resolved`     | Deadlock resolved                    | strategy, victim, os_concept_note       |
| `scheduling_complete`   | Algorithm execution finished         | algorithm, booking_count, avg_waiting_time, os_concept_note |
| `resource_updated`      | Resource created/updated/deleted     | id, name, action, os_concept_note       |
| `notification`          | New notification created             | id, from, to, subject, type, os_concept_note |
| `ack`                   | Client message acknowledged          | event, data, os_concept_note            |

#### 4.6.3 Broadcasting Mechanism

Every broadcast wraps the payload in a standard envelope:
```json
{
  "event": "event_type",
  "data": {
    "...payload...",
    "os_concept_note": "OS concept explanation"
  }
}
```

Disconnected clients are automatically cleaned up during broadcast.

### 4.7 Pydantic Schemas

Key request/response models in `schemas/`:

**SchedulingRequest:**
```python
class SchedulingRequest(BaseModel):
    algorithm: str           # fcfs, sjf, round_robin, priority
    booking_ids: List[int]   # Which bookings to schedule
    quantum: Optional[int] = 30  # Time quantum for Round Robin
```

**BankersRequest:**
```python
class BankersRequest(BaseModel):
    processes: List[Dict[str, Any]]    # Process identifiers
    resources: List[str]               # Resource names
    max_matrix: List[List[int]]        # Maximum demand matrix
    allocation_matrix: List[List[int]] # Current allocation matrix
    available: List[int]               # Available resource vector
```

**Token (Auth Response):**
```python
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    os_concept_note: str
```

---

## 5. Frontend Architecture

### 5.1 Next.js 14 App Router Structure

The application uses the Next.js 14 App Router with the following conventions:

- `app/layout.tsx` -- Root layout (wraps all pages)
- `app/page.tsx` -- Landing page at `/`
- `app/<route>/page.tsx` -- Page component for each route
- `app/(auth)/` -- Route group for authentication pages (no layout nesting)
- All page components are client components (`"use client"`) because they use hooks and interactivity

### 5.2 Layout System

The root layout (`app/layout.tsx`) provides the application shell:

```
+-----------------------------------------------------------+
|  TopBar (fixed, h-16)                                     |
+--------+------------------------------------------+-------+
|        |                                          |       |
| Side   |  Main Content Area                       |  OS   |
| bar    |  (AnimatePresence transitions)           | Panel |
| (280px |  (p-6)                                   |(320px)|
| or     |                                          |       |
| 68px   |                                          |       |
| when   |                                          |       |
| col-   |  {children}                              |       |
| lapsed)|                                          |       |
|        |                                          |       |
+--------+------------------------------------------+-------+
                                    Toast (bottom-right)
```

State management:
- `sidebarCollapsed` -- toggleable, shifts main content `ml-[280px]` vs `ml-[68px]`
- `osPanelOpen` -- toggleable, shifts main content `mr-[320px]` vs `mr-0`

Page transitions use Framer Motion's `AnimatePresence` with fade + slide.

### 5.3 Design System

#### 5.3.1 CSS Custom Properties

All colors are defined as CSS custom properties in `globals.css`:

| Variable             | Value       | Usage                            |
|---------------------|-------------|----------------------------------|
| `--bg-primary`      | `#0f1117`   | Page background (deepest dark)   |
| `--bg-secondary`    | `#161b27`   | Card/sidebar backgrounds         |
| `--bg-tertiary`     | `#1e2435`   | Elevated surfaces                |
| `--bg-hover`        | `#252d42`   | Hover state backgrounds          |
| `--border`          | `#2a3347`   | Primary borders                  |
| `--border-light`    | `#3a4560`   | Subtle borders/dividers          |
| `--text-primary`    | `#f0f4ff`   | Headings and primary text        |
| `--text-secondary`  | `#8892aa`   | Body text, descriptions          |
| `--text-tertiary`   | `#5a6480`   | Muted labels, captions           |
| `--accent-blue`     | `#4f8ef7`   | Primary accent (links, active)   |
| `--accent-blue-soft`| `#1a2f5e`   | Blue background tint             |
| `--accent-teal`     | `#2dd4bf`   | Secondary accent                 |
| `--accent-teal-soft`| `#0d2e2a`   | Teal background tint             |
| `--success`         | `#22c55e`   | Success states                   |
| `--success-soft`    | `#0a2e17`   | Success background tint          |
| `--warning`         | `#f59e0b`   | Warning states                   |
| `--warning-soft`    | `#2d1f05`   | Warning background tint          |
| `--danger`          | `#ef4444`   | Error/danger states              |
| `--danger-soft`     | `#2d0a0a`   | Danger background tint           |
| `--os-bg`           | `#7c1d1d`   | OS concept badge background      |
| `--os-border`       | `#ef4444`   | OS concept badge border          |
| `--os-text`         | `#fca5a5`   | OS concept badge text            |
| `--os-glow`         | `rgba(239,68,68,0.25)` | OS concept badge glow  |

#### 5.3.2 Typography

Three font families are loaded via Google Fonts:

| Font              | CSS Class      | Usage                                   |
|-------------------|----------------|-----------------------------------------|
| **Playfair Display** | `font-display` | Page headings, logo text, section titles. A serif display font conveying academic authority. |
| **DM Sans**       | `font-sans`    | Body text, labels, descriptions, UI elements. The default body font -- clean and highly readable. |
| **JetBrains Mono**| `font-mono`    | Code snippets, OS concept badges, process IDs, technical data, chapter references. Monospaced for precision. |

#### 5.3.3 Color Palette

The OS Concept Legend in the sidebar defines the concept-color mapping:

| Concept            | Color (hex) | Tailwind Context   |
|--------------------|-------------|--------------------|
| CPU Scheduling     | `#4f8ef7`   | accent-blue        |
| Deadlock           | `#ef4444`   | danger             |
| Concurrency        | `#2dd4bf`   | accent-teal        |
| Memory/Resources   | `#f59e0b`   | warning            |
| Synchronization    | `#c084fc`   | (custom purple)    |

#### 5.3.4 Motion/Animation System

Custom animations defined in `tailwind.config.ts`:

| Animation       | Duration/Timing     | Description                            |
|----------------|---------------------|----------------------------------------|
| `os-pulse`     | 2s ease-in-out loop | Box-shadow pulse on OS concept badges  |
| `live-pulse`   | 2s ease-in-out loop | Scale + opacity pulse for live indicators |
| `glow-hover`   | 0.3s ease forwards  | Box-shadow glow on card hover          |

Page transitions use Framer Motion:
```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -8 }}
  transition={{ duration: 0.2, ease: "easeOut" }}
>
```

### 5.4 Component Library

#### 5.4.1 UI Components

**OSConceptBadge** -- See [Section 6](#6-the-os-concept-badge-system) for full details.

**ProcessStateChip** (`components/ui/ProcessStateChip.tsx`)
- Displays a colored chip for each process state
- Color mapping: new=gray, ready=blue, running=green, waiting=yellow, completed=teal, blocked=red

**PCBCard** (`components/ui/PCBCard.tsx`)
- Renders a Process Control Block card showing: PID, state, priority, arrival time, burst time, waiting time, turnaround time
- Includes an OSConceptBadge in the corner

**StatCard** (`components/ui/StatCard.tsx`)
- Dashboard statistics card with: icon, numeric value (with react-countup animation), label, optional delta/trend indicator

**GlowCard** (`components/ui/GlowCard.tsx`)
- Card with a soft glow border effect on hover using the `glow-hover` animation
- Used for dashboard widgets and feature cards

**ResourceDot** (`components/ui/ResourceDot.tsx`)
- Tiny colored circle indicating resource status: green=available, yellow=reserved, red=occupied, gray=maintenance

**LivePulse** (`components/ui/LivePulse.tsx`)
- Animated pulsing dot (green) used next to "Live" labels to indicate real-time data

**AlgorithmBadge** (`components/ui/AlgorithmBadge.tsx`)
- Badge displaying the algorithm name (FCFS, SJF, RR, Priority) with color coding per algorithm

#### 5.4.2 Layout Components

**Sidebar** (`components/layout/Sidebar.tsx`)
- Fixed left navigation panel (280px expanded, 68px collapsed)
- Three navigation sections: Overview, OS Concepts, Management
- OS Concepts section shows chapter references (Ch.5, Ch.6, Ch.7, Ch.8) next to each link
- Bottom: OS Concept Map legend with color dots
- Collapse toggle button at the very bottom

**TopBar** (`components/layout/TopBar.tsx`)
- Fixed top bar (h-16)
- Controls: sidebar toggle, search, notification bell (with unread count), OS panel toggle, user avatar/menu

**PageHeader** (`components/layout/PageHeader.tsx`)
- Standardized page header with title (font-display), optional subtitle, and OS concept badge

**OSConceptSidebar** (`components/layout/OSConceptSidebar.tsx`)
- Right slide-out panel (320px) showing OS concept explanations relevant to the current page
- Displays concept name, description, chapter reference, and related textbook content

#### 5.4.3 Feature Component Directories

Each major page has a corresponding component directory:

- `components/scheduler/` -- Gantt chart, queue table, algorithm selector, step trace viewer, comparison charts
- `components/deadlock/` -- D3 RAG graph, Banker's matrix, scenario controls, resolution panel
- `components/concurrency/` -- Semaphore visualization, mutex display, race condition demo
- `components/resources/` -- Resource grid, bitmap visualization, floor plan, fragmentation chart
- `components/timetable/` -- Weekly grid (with @dnd-kit), entry form, auto-schedule controls
- `components/analytics/` -- Utilization bars, algorithm comparison (Recharts), heatmap, faculty load radar

### 5.5 State Management with Zustand

Each major feature module has its own Zustand store:

#### useScheduler (`hooks/useScheduler.ts`)

**State:**
```typescript
interface SchedulerState {
  bookingQueue: BookingRequest[];        // Process ready queue
  schedulingResult: SchedulingResult | null;  // Algorithm output
  comparison: AlgorithmComparison[] | null;   // All-algorithm comparison
  selectedAlgorithm: SchedulingAlgorithm;     // FCFS | SJF | RR | PRIORITY
  quantum: number;                       // Round Robin time quantum (default 30)
  agingEnabled: boolean;                 // Priority aging toggle
  isRunning: boolean;                    // Algorithm executing flag
  currentStep: number;                   // Step-through animation position
}
```

**Actions:**
- `fetchQueue()` -- Fetch ready queue from backend API
- `addToQueue(booking)` / `removeFromQueue(id)` -- Local queue management
- `runAlgorithm()` -- Run selected algorithm (API with client-side fallback)
- `compareAll()` -- Run all 4 algorithms for comparison
- `setAlgorithm(algo)` -- Change selected algorithm
- `setQuantum(q)` / `setAging(enabled)` -- Configuration
- `reset()` -- Clear all state
- `nextStep()` / `setCurrentStep(step)` -- Step-through control
- `loadDemoSet()` -- Load 5 predefined demo bookings
- `addRandomBookings(count)` -- Generate random bookings

**Mock Data Strategy:** If the backend API is unreachable, `runAlgorithm()` falls back to `generateLocalResult()` which implements the same scheduling logic client-side. This ensures the UI always works for demos.

#### useDeadlock (`hooks/useDeadlock.ts`)
- Manages RAG data, deadlock analysis, Banker's algorithm state, demo scenarios

#### useConcurrency (`hooks/useConcurrency.ts`)
- Manages semaphore states, mutex states, simulation steps, race condition demo data

#### useResources (`hooks/useResources.ts`)
- Manages resource list, pool state, availability data, CRUD operations

#### useTimetable (`hooks/useTimetable.ts`)
- Manages timetable entries, week navigation, auto-schedule results, drag-and-drop state

### 5.6 API Integration Layer (`lib/api.ts`)

The Axios instance is configured with:

1. **Base URL**: `NEXT_PUBLIC_API_URL` or fallback to `http://localhost:8000/api/v1`
2. **Request Interceptor**: Attaches `Authorization: Bearer <token>` from localStorage
3. **Response Interceptor**: On 401 status, removes token and redirects to `/login`

The module exports typed API objects:
- `authApi` -- login, register, getMe
- `resourcesApi` -- getAll, getById, create, update, delete, getAvailability, getPoolState
- `bookingsApi` -- getAll, getById, create, update, delete, getQueue, updateState
- `schedulingApi` -- run, compare, getMetrics
- `deadlockApi` -- getRAG, analyze, runBankers, createScenario, resolve
- `concurrencyApi` -- getSemaphores, simulate, getMutexes, raceDemo
- `timetableApi` -- get, create, update, delete, autoSchedule
- `analyticsApi` -- getUtilization, getAlgorithms, getHeatmap, getFacultyLoad, getFragmentation
- `notificationsApi` -- getAll, create, markRead, markAllRead, getQueueState

### 5.7 WebSocket Integration

#### Client-Side Manager (`lib/websocket.ts`)

The `WebSocketManager` class provides:

- **Singleton pattern** via `getWebSocketManager()`
- **Auto-reconnection** with exponential backoff (base 1s, factor 1.5, max 30s, max 10 attempts)
- **Event system** with `on(event, handler)` returning an unsubscribe function
- **Wildcard listener** via `on("*", handler)` for all events
- **SSR-safe**: Guards all WebSocket operations with `typeof window !== "undefined"`

#### React Hook (`hooks/useWebSocket.ts`)

```typescript
function useWebSocket(options?: {
  autoConnect?: boolean;      // Default: true
  events?: Record<string, (data: unknown) => void>;
}): {
  isConnected: boolean;
  send: (type: string, data: unknown) => void;
  connect: () => void;
  disconnect: () => void;
}
```

Usage in components:
```tsx
const { isConnected, send } = useWebSocket({
  events: {
    booking_created: (data) => { /* handle new booking */ },
    deadlock_detected: (data) => { /* show alert */ },
  },
});
```

### 5.8 Auth Management (`lib/auth.ts`)

Simple localStorage-based token and user management:

```typescript
getToken(): string | null          // Read JWT from localStorage
setToken(token: string): void      // Store JWT
removeToken(): void                // Clear JWT and user data
getUser(): User | null             // Read cached user object
setUser(user: User): void          // Cache user object
isAuthenticated(): boolean         // Check if token exists
logout(): void                     // Clear everything, redirect to /login
```

All functions are SSR-safe with `typeof window !== "undefined"` guards.

---

## 6. The OS Concept Badge System

### 6.1 Design Specification

Every page in CUIScheduler must display which OS concept it demonstrates. The `OSConceptBadge` is the primary visual element for this. It appears as a red-tinted badge with a CPU icon, the concept name, and an optional chapter reference. The badge pulses with a glow animation to draw attention.

### 6.2 OSConceptBadge Component API

```typescript
interface OSConceptBadgeProps {
  concept: string;           // Display text (e.g., "CPU Scheduling -- FCFS")
  description?: string;      // Tooltip body text explaining the concept
  chapter?: string;          // Chapter reference (e.g., "Ch.5")
  size?: "sm" | "md" | "lg"; // Badge size variant (default: "md")
  pulse?: boolean;           // Enable pulse animation (default: true)
  position?: "inline" | "corner" | "banner";  // Positioning mode (default: "inline")
}
```

### 6.3 Position Modes

| Mode    | CSS                                  | Usage                              |
|---------|--------------------------------------|------------------------------------|
| `inline`| `inline-flex`                        | Inline with text/headers           |
| `corner`| `absolute top-3 right-3 z-10`       | Positioned in top-right of parent  |
| `banner`| `flex w-full justify-between items-center` | Full-width bar at top of section |

### 6.4 Placement Rules

OS Concept Badges **must** appear in:
1. **PageHeader** -- Every page header includes a banner-mode badge identifying the primary OS concept
2. **Feature Cards** -- Each major card/panel has a corner-mode badge
3. **Algorithm Results** -- Inline badges next to algorithm metrics
4. **Sidebar Navigation** -- Chapter labels next to OS concept page links

### 6.5 OS_CONCEPTS Constant (`constants/osConcepts.ts`)

All OS concepts are defined in a single constant for consistency:

```typescript
export const OS_CONCEPTS = {
  FCFS:           { name: "CPU Scheduling -- FCFS",     chapter: "Ch.5", description: "..." },
  SJF:            { name: "CPU Scheduling -- SJF",      chapter: "Ch.5", description: "..." },
  ROUND_ROBIN:    { name: "CPU Scheduling -- Round Robin", chapter: "Ch.5", description: "..." },
  PRIORITY:       { name: "CPU Scheduling -- Priority", chapter: "Ch.5", description: "..." },
  DEADLOCK_RAG:   { name: "Deadlock -- RAG Cycle",      chapter: "Ch.7", description: "..." },
  BANKERS:        { name: "Deadlock -- Banker's Algorithm", chapter: "Ch.7", description: "..." },
  SEMAPHORE:      { name: "Synchronization -- Semaphore", chapter: "Ch.6", description: "..." },
  MUTEX:          { name: "Synchronization -- Mutex",    chapter: "Ch.6", description: "..." },
  RACE_CONDITION: { name: "Synchronization -- Race Cond.", chapter: "Ch.6", description: "..." },
  MEMORY_BITMAP:  { name: "Memory Mgmt -- Bitmap",      chapter: "Ch.8", description: "..." },
  FRAGMENTATION:  { name: "Memory Mgmt -- Fragmentation", chapter: "Ch.8", description: "..." },
  PCB:            { name: "Process Mgmt -- PCB",         chapter: "Ch.3", description: "..." },
  PROCESS_STATES: { name: "Process Mgmt -- State Machine", chapter: "Ch.3", description: "..." },
  IPC_MSGQUEUE:   { name: "IPC -- Message Queue",       chapter: "Ch.3", description: "..." },
  LOAD_BALANCE:   { name: "Scheduling -- Load Balancing", chapter: "Ch.5", description: "..." },
  CONTEXT_SWITCH: { name: "CPU -- Context Switch",      chapter: "Ch.5", description: "..." },
} as const;
```

### 6.6 How to Add a New OS Concept

1. Add the concept to `OS_CONCEPTS` in `frontend/constants/osConcepts.ts`:
   ```typescript
   NEW_CONCEPT: { name: "Category -- Name", chapter: "Ch.X", description: "..." },
   ```
2. Use it in a component:
   ```tsx
   import { OS_CONCEPTS } from "@/constants/osConcepts";
   <OSConceptBadge
     concept={OS_CONCEPTS.NEW_CONCEPT.name}
     description={OS_CONCEPTS.NEW_CONCEPT.description}
     chapter={OS_CONCEPTS.NEW_CONCEPT.chapter}
   />
   ```
3. Add the corresponding `os_concept_note` in backend API responses.

### 6.7 Styling Details

The badge uses custom Tailwind classes mapped to CSS variables:

```css
/* Background */  bg-os-bg      -> var(--os-bg)      = #7c1d1d
/* Border */      border-os-border -> var(--os-border) = #ef4444
/* Text */        text-os-text   -> var(--os-text)    = #fca5a5
/* Glow */        shadow-os-glow -> 0 0 12px var(--os-glow) = rgba(239,68,68,0.25)
/* Animation */   animate-os-pulse -> osPulse 2s ease-in-out infinite
```

Tooltip uses Radix UI's `Tooltip` component with a custom styled content panel.

---

## 7. Data Models and Type System

### 7.1 Shared TypeScript Types (`types/index.ts`)

#### Enums (Union Types)

```typescript
type ResourceType = 'classroom' | 'lab' | 'faculty' | 'exam_slot';
type ResourceStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';
type ProcessState = 'new' | 'ready' | 'running' | 'waiting' | 'completed' | 'blocked';
type SchedulingAlgorithm = 'FCFS' | 'SJF' | 'RR' | 'PRIORITY';
```

#### Core Interfaces

| Interface          | Fields                                   | OS Parallel            |
|-------------------|-----------------------------------------|------------------------|
| `Resource`        | id, name, type, building, floor, capacity, status, features, department | Hardware device/memory block |
| `BookingRequest`  | id, process_id, title, course_code, department, faculty_id, resource_id, resource_type, requested_by, date, start/end_time, duration_minutes, priority, state, arrival_time, waiting_time, turnaround_time, algorithm_used, os_concept_note, created_at | OS Process (PCB) |
| `SchedulingStep`  | step_number, process_id, action, time_unit, reason, os_concept_note, queue_snapshot, gantt_bar | Scheduler trace step |
| `SchedulingResult`| algorithm, steps, gantt_chart, metrics (avg_waiting, avg_turnaround, cpu_util, throughput, context_switches), os_concept_summary | Scheduler output |
| `RAGNode`         | id, type (process/resource), label, x, y, instances, in_cycle | RAG vertex |
| `RAGEdge`         | id, source, target, type (assignment/request), in_cycle | RAG edge |
| `DeadlockAnalysis`| has_deadlock, cycle_nodes, cycle_description, banker_safe, safe_sequence, banker_matrix, resolution_options, os_concept_note | Deadlock analysis result |
| `SemaphoreState`  | id, resource_name, count, max_count, wait_queue, history | Counting semaphore |
| `MutexState`      | id, resource_name, locked, owner_pid, wait_queue | Binary mutex |
| `ResourcePoolState`| total_slots, allocated_slots, free_slots, fragmentation_pct, bitmap, allocation_map | Memory pool state |
| `IPCMessage`      | id, from_department, to_department, type, subject, body, read, created_at, os_concept | IPC message |
| `TimetableEntry`  | id, booking_id, resource_id, resource_name, course_code, title, faculty_name, department, day_of_week, start_time, end_time, color | Scheduled process slot |
| `User`            | id, email, name, role, department, created_at | System user/process owner |
| `AnalyticsData`   | utilization, algorithm_comparison, heatmap, faculty_load, fragmentation_history | System metrics |

### 7.2 BookingRequest as OS Process Mapping

The `BookingRequest` type is the central model, mapping directly to an OS process:

| BookingRequest Field | OS Process Equivalent        | Description                          |
|---------------------|------------------------------|--------------------------------------|
| `process_id`        | **PID** (Process ID)         | Unique identifier (P1, P2, ...)      |
| `duration_minutes`  | **Burst Time**               | CPU time needed for execution        |
| `priority`          | **Process Priority**         | Scheduling priority (1 = highest)    |
| `state`             | **Process State**            | Position in the state machine        |
| `arrival_time`      | **Arrival Time**             | When process enters the ready queue  |
| `waiting_time`      | **Waiting Time**             | Time spent in ready queue            |
| `turnaround_time`   | **Turnaround Time**          | Total time from arrival to completion|
| `algorithm_used`    | **Scheduler Policy**         | Which algorithm scheduled this       |
| `resource_id`       | **Allocated Device/Memory**  | Which resource the process holds     |
| `os_concept_note`   | **PCB Metadata**             | OS concept explanation               |

### 7.3 SQLAlchemy to Pydantic to TypeScript Correspondence

| SQLAlchemy Model | Pydantic Schema      | TypeScript Interface | Role                  |
|-----------------|---------------------|---------------------|-----------------------|
| `User`          | `UserResponse`      | `User`              | User entity           |
| `Resource`      | `ResourceResponse`  | `Resource`          | Resource entity       |
| `Booking`       | `BookingResponse`   | `BookingRequest`    | Process/Booking       |
| `TimetableEntry`| `TimetableEntryResponse` | `TimetableEntry` | Timetable slot       |
| `Notification`  | `NotificationResponse` | `IPCMessage`     | IPC message           |

### 7.4 Enum Values and Their Meanings

**BookingState / ProcessState:**
| Value      | OS State    | Description                                      |
|-----------|-------------|--------------------------------------------------|
| `new`     | New         | Created but not admitted to ready queue           |
| `ready`   | Ready       | In the ready queue, waiting for CPU dispatch      |
| `running` | Running     | Currently executing (resource allocated)          |
| `waiting` | Waiting     | Blocked on I/O or waiting for a resource          |
| `completed`| Terminated | Execution finished, resources released            |
| `blocked` | Blocked     | Cannot proceed (deadlock or permanent contention) |

**ResourceType:**
| Value       | Description                              |
|------------|------------------------------------------|
| `classroom` | Lecture room with projector/whiteboard   |
| `lab`       | Computer/hardware laboratory             |
| `faculty`   | Faculty member (as a schedulable resource)|
| `exam_slot` | Examination time slot                    |

**ResourceStatus:**
| Value        | Description                    |
|-------------|--------------------------------|
| `available`  | Ready for allocation           |
| `occupied`   | Currently in use               |
| `maintenance`| Under maintenance, unavailable |

---

## 8. API Reference

### 8.1 Authentication

#### POST /api/auth/register

Create a new user account.

**Request Body:**
```json
{
  "email": "newuser@cui.edu.pk",
  "name": "New User",
  "password": "password123",
  "role": "student",
  "department": "Computer Science"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 4,
    "email": "newuser@cui.edu.pk",
    "name": "New User",
    "role": "student",
    "department": "Computer Science",
    "created_at": "2026-03-28T10:00:00Z"
  },
  "os_concept_note": "New user process created - like a process being spawned in the OS."
}
```

**Example curl:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@cui.edu.pk","name":"Test User","password":"test123","role":"student"}'
```

#### POST /api/auth/login

Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "email": "admin@cui.edu.pk",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "admin@cui.edu.pk",
    "name": "Dr. Ahmed Khan (Admin)",
    "role": "admin",
    "department": "Computer Science",
    "created_at": "2026-03-28T08:00:00Z"
  },
  "os_concept_note": "Authentication successful - like an OS verifying process credentials. The JWT token is analogous to a process ID (PID)."
}
```

**Example curl:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cui.edu.pk","password":"admin123"}'
```

#### GET /api/auth/me

Get the currently authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": 1,
  "email": "admin@cui.edu.pk",
  "name": "Dr. Ahmed Khan (Admin)",
  "role": "admin",
  "department": "Computer Science",
  "created_at": "2026-03-28T08:00:00Z"
}
```

**Example curl:**
```bash
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### 8.2 Resources

#### GET /api/resources

List all resources with optional filters.

**Query Parameters:** `type`, `building`, `department`, `status`

**Example curl:**
```bash
curl "http://localhost:8000/api/resources?type=lab&department=Computer%20Science"
```

#### GET /api/resources/pool-state

Get bitmap allocation state for all resource pools.

**Example curl:**
```bash
curl http://localhost:8000/api/resources/pool-state
```

**Response includes per-type pools:**
```json
{
  "pools": [
    {
      "resource_type": "classroom",
      "total": 10,
      "allocated": 3,
      "free": 7,
      "bitmap": [1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
      "allocation_map": {"CR-101": "P36", "CR-201": "P38", "CR-301": "allocated", ...},
      "fragmentation_ratio": 0.4286,
      "fragments": 3,
      "largest_free_block": 3,
      "os_concept_note": "Resource pool 'classroom': bitmap=[1,0,0,1,0,0,1,0,0,0]..."
    }
  ],
  "overall_total": 24,
  "overall_allocated": 8,
  "overall_free": 16,
  "overall_fragmentation": 0.2500,
  "os_concept_note": "Resource pool state shows bitmap allocation across all resource types..."
}
```

#### POST /api/resources

Create a new resource.

**Example curl:**
```bash
curl -X POST http://localhost:8000/api/resources \
  -H "Content-Type: application/json" \
  -d '{"name":"CR-501","type":"classroom","building":"Academic Block C","floor":5,"capacity":50,"department":"Computer Science"}'
```

#### GET /api/resources/{id}/schedule

Get all bookings assigned to a specific resource.

**Example curl:**
```bash
curl http://localhost:8000/api/resources/1/schedule
```

### 8.3 Bookings

#### POST /api/bookings

Create a new booking (automatically assigns a process_id).

**Request Body:**
```json
{
  "title": "OS Lecture",
  "course_code": "CS371",
  "department": "Computer Science",
  "resource_id": 1,
  "resource_type": "classroom",
  "requested_by": 1,
  "date": "2026-03-28",
  "start_time": "09:00",
  "end_time": "10:30",
  "duration_minutes": 90,
  "priority": 3
}
```

**Example curl:**
```bash
curl -X POST http://localhost:8000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"title":"OS Lecture","course_code":"CS371","date":"2026-03-28","duration_minutes":90,"priority":3,"requested_by":1,"resource_type":"classroom"}'
```

#### GET /api/bookings/queue?algorithm=sjf

Get the ready queue sorted by the selected algorithm.

**Example curl:**
```bash
curl "http://localhost:8000/api/bookings/queue?algorithm=sjf"
```

**Response:**
```json
{
  "algorithm": "sjf",
  "queue": [ /* bookings sorted by duration_minutes ascending */ ],
  "os_concept_note": "Ready queue sorted by burst time (shortest first). SJF minimizes average waiting time..."
}
```

#### PATCH /api/bookings/{id}/state

Transition a booking to a new state. The API enforces valid transitions.

**Request Body:**
```json
{
  "state": "ready",
  "os_concept_note": "Optional custom note"
}
```

**Example curl:**
```bash
curl -X PATCH http://localhost:8000/api/bookings/50/state \
  -H "Content-Type: application/json" \
  -d '{"state":"ready"}'
```

### 8.4 Scheduling

#### POST /api/scheduling/run

Run a scheduling algorithm on specified bookings.

**Request Body:**
```json
{
  "algorithm": "round_robin",
  "booking_ids": [21, 22, 23, 24, 25],
  "quantum": 30
}
```

**Response:**
```json
{
  "algorithm": "Round Robin",
  "steps": [
    {
      "time": 0,
      "action": "dispatch",
      "process_id": "P21",
      "detail": "RR dispatches P21 (remaining=180min, quantum=30min)...",
      "os_concept_note": "Round Robin gives P21 a time quantum of 30min...",
      "ready_queue": ["P22", "P23"]
    },
    ...
  ],
  "gantt_chart": [
    {"process_id": "P21", "booking_id": 21, "start": 0, "end": 30, "state": "running"},
    ...
  ],
  "metrics": [
    {"process_id": "P21", "booking_id": 21, "arrival_time": 100, "burst_time": 180, "waiting_time": 150, "turnaround_time": 330, "completion_time": 430, "priority": 1},
    ...
  ],
  "avg_waiting_time": 95.0,
  "avg_turnaround_time": 178.0,
  "total_context_switches": 12,
  "cpu_utilization": 97.56,
  "throughput": 0.0115,
  "os_concept_note": "Round Robin (quantum=30min) is a preemptive algorithm..."
}
```

**Example curl:**
```bash
curl -X POST http://localhost:8000/api/scheduling/run \
  -H "Content-Type: application/json" \
  -d '{"algorithm":"fcfs","booking_ids":[21,22,23,24,25]}'
```

#### POST /api/scheduling/compare

Run all 4 algorithms and compare metrics.

**Example curl:**
```bash
curl -X POST http://localhost:8000/api/scheduling/compare \
  -H "Content-Type: application/json" \
  -d '{"algorithm":"fcfs","booking_ids":[21,22,23,24,25]}'
```

### 8.5 Deadlock

#### GET /api/deadlock/rag

Build and return the Resource Allocation Graph with cycle detection.

**Example curl:**
```bash
curl http://localhost:8000/api/deadlock/rag
```

#### POST /api/deadlock/analyze

Full deadlock analysis with resolution options.

**Example curl:**
```bash
curl -X POST http://localhost:8000/api/deadlock/analyze
```

#### POST /api/deadlock/bankers

Run Banker's Algorithm with step-by-step trace.

**Request Body:**
```json
{
  "processes": [{"id": "P1"}, {"id": "P2"}, {"id": "P3"}],
  "resources": ["Classroom", "Lab", "Faculty"],
  "max_matrix": [[7, 5, 3], [3, 2, 2], [9, 0, 2]],
  "allocation_matrix": [[0, 1, 0], [2, 0, 0], [3, 0, 2]],
  "available": [3, 3, 2]
}
```

**Example curl:**
```bash
curl -X POST http://localhost:8000/api/deadlock/bankers \
  -H "Content-Type: application/json" \
  -d '{"processes":[{"id":"P1"},{"id":"P2"},{"id":"P3"}],"resources":["A","B","C"],"max_matrix":[[7,5,3],[3,2,2],[9,0,2]],"allocation_matrix":[[0,1,0],[2,0,0],[3,0,2]],"available":[3,3,2]}'
```

#### POST /api/deadlock/scenario

Create demo deadlock scenarios for classroom demonstration.

**Request Body:**
```json
{"scenario_type": "classic"}
```

Scenario types: `classic` (2-process), `chain` (3-process circular), `safe` (no deadlock).

**Example curl:**
```bash
curl -X POST http://localhost:8000/api/deadlock/scenario \
  -H "Content-Type: application/json" \
  -d '{"scenario_type":"classic"}'
```

#### POST /api/deadlock/resolve

Resolve detected deadlock.

**Request Body:**
```json
{"strategy": "terminate_youngest"}
```

Strategies: `terminate_youngest`, `preempt_lowest_priority`, `rollback`.

**Example curl:**
```bash
curl -X POST http://localhost:8000/api/deadlock/resolve \
  -H "Content-Type: application/json" \
  -d '{"strategy":"terminate_youngest"}'
```

### 8.6 Timetable

#### POST /api/timetable/auto-schedule

Auto-schedule bookings into timetable slots using a scheduling algorithm.

**Request Body:**
```json
{
  "algorithm": "sjf",
  "booking_ids": [21, 22, 23],
  "week_start_date": "2026-03-23"
}
```

**Example curl:**
```bash
curl -X POST http://localhost:8000/api/timetable/auto-schedule \
  -H "Content-Type: application/json" \
  -d '{"algorithm":"sjf","booking_ids":[21,22,23]}'
```

### 8.7 Analytics

#### GET /api/analytics/utilization

Resource utilization percentages.

**Example curl:**
```bash
curl "http://localhost:8000/api/analytics/utilization?resource_type=lab"
```

#### GET /api/analytics/heatmap

Usage heatmap as a 7x16 normalized matrix (days x hours 8-23).

**Example curl:**
```bash
curl http://localhost:8000/api/analytics/heatmap
```

#### GET /api/analytics/faculty-load

Faculty teaching load distribution.

**Example curl:**
```bash
curl http://localhost:8000/api/analytics/faculty-load
```

#### GET /api/analytics/fragmentation

Resource pool fragmentation analysis.

**Example curl:**
```bash
curl http://localhost:8000/api/analytics/fragmentation
```

### 8.8 Notifications

#### GET /api/notifications/queue-state

Get IPC message queue overview.

**Example curl:**
```bash
curl http://localhost:8000/api/notifications/queue-state
```

#### POST /api/notifications

Send a new notification (IPC message).

**Request Body:**
```json
{
  "from_department": "Computer Science",
  "to_department": "Admin",
  "type": "request",
  "subject": "Lab Extension Request",
  "body": "Requesting extended lab hours for project week.",
  "os_concept": "IPC message passing between department processes."
}
```

**Example curl:**
```bash
curl -X POST http://localhost:8000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{"from_department":"CS","to_department":"Admin","type":"request","subject":"Test","body":"Test message"}'
```

#### PATCH /api/notifications/read-all

Mark all notifications as read (bulk queue consumption).

**Example curl:**
```bash
curl -X PATCH http://localhost:8000/api/notifications/read-all
```

---

## 9. Algorithms Deep Dive

### 9.1 First Come First Served (FCFS)

**Implementation:** `SchedulingEngine.run_fcfs()`

**Algorithm:**
```
1. Sort all processes by arrival_time (then by booking_id for tie-breaking)
2. Set current_time = 0
3. For each process P in sorted order:
   a. If current_time < P.arrival_time:
        Record idle period, advance current_time to P.arrival_time
   b. Set P.start_time = current_time
   c. Set P.waiting_time = current_time - P.arrival_time
   d. Add Gantt bar: [current_time, current_time + P.burst_time]
   e. current_time += P.burst_time
   f. Set P.completion_time = current_time
   g. Set P.turnaround_time = P.completion_time - P.arrival_time
4. Compute average waiting time and turnaround time
```

**Time Complexity:** O(n log n) for sorting, O(n) for scheduling = O(n log n)

**Data Structures:** Sorted list (Python list with `.sort()`)

**Key OS Insight:** FCFS is non-preemptive. Once a process starts, it runs to completion. This is the simplest scheduler but suffers from the **convoy effect** -- short processes stuck behind long ones get inflated waiting times.

### 9.2 Shortest Job First (SJF)

**Implementation:** `SchedulingEngine.run_sjf()`

**Algorithm:**
```
1. remaining = all processes (unsorted)
2. Set current_time = 0
3. While remaining is not empty:
   a. available = processes with arrival_time <= current_time
   b. If no available:
        Advance current_time to earliest arrival, continue
   c. Sort available by burst_time (then arrival_time)
   d. selected = first in sorted available (shortest burst)
   e. Execute selected fully (same as FCFS step 3b-3g)
   f. Remove selected from remaining
4. Compute averages
```

**Time Complexity:** O(n^2) in worst case (re-scanning available list each iteration)

**Optimality:** SJF is provably optimal for minimizing average waiting time among non-preemptive algorithms. However, it requires knowing burst times in advance (in practice, estimated via exponential averaging).

**Key OS Insight:** SJF can cause **starvation** of long-burst processes if short ones keep arriving. This motivates the need for aging in priority-based schedulers.

### 9.3 Round Robin (RR)

**Implementation:** `SchedulingEngine.run_round_robin(requests, quantum=30)`

**Algorithm:**
```
1. Sort processes by arrival_time
2. Initialize ready_queue with processes that have arrived at time 0
3. Set current_time = 0, context_switches = 0
4. While ready_queue is not empty OR any process has remaining_time > 0:
   a. If ready_queue is empty:
        Advance to next arrival, add newly arrived to queue, continue
   b. Pop current_proc from front of ready_queue
   c. exec_time = min(quantum, current_proc.remaining_time)
   d. Add Gantt bar: [current_time, current_time + exec_time]
   e. current_time += exec_time
   f. current_proc.remaining_time -= exec_time
   g. Add any newly arrived processes to ready_queue
   h. If current_proc.remaining_time <= 0:
        Process completed. Compute waiting/turnaround times.
      Else:
        Push current_proc to back of ready_queue (context switch)
        context_switches++
5. Compute averages
```

**Time Complexity:** O(total_burst / quantum * n) in worst case

**Data Structures:** FIFO queue (Python list with `.pop(0)` and `.append()`)

**Context Switch Counting:** Every preemption (step 4h, else branch) increments the context switch counter. The total is reported in the result.

**Key OS Insight:** Round Robin is the foundation of time-sharing operating systems. The quantum size creates a direct tradeoff:
- **Small quantum** = Better response time, more context switch overhead
- **Large quantum** = Less overhead, degrades toward FCFS behavior

### 9.4 Priority Scheduling with Aging

**Implementation:** `SchedulingEngine.run_priority(requests, aging=True)`

**Algorithm:**
```
1. Sort processes by arrival_time
2. remaining = all processes
3. Set current_time = 0
4. While remaining is not empty:
   a. available = processes with arrival_time <= current_time
   b. If no available:
        Advance to next arrival, continue
   c. If aging is enabled:
        For each process P in available:
          wait_so_far = current_time - P.arrival_time
          aging_boost = floor(wait_so_far / 5)
          P.priority = max(1, P.original_priority - aging_boost)
   d. Sort available by priority ASC (lower = higher priority), then arrival_time
   e. selected = first in sorted available
   f. Execute selected fully (non-preemptive)
   g. Remove selected from remaining
5. Compute averages
```

**Aging Increment Logic:**
- For every 5 time units a process has been waiting, its priority decreases by 1 (lower number = higher priority)
- `aging_boost = floor(wait_time / 5)`
- `effective_priority = max(1, original_priority - aging_boost)`
- This prevents indefinite starvation of low-priority processes

**Key OS Insight:** Without aging, priority scheduling can cause **indefinite starvation** -- a low-priority process may never run if higher-priority processes keep arriving. Aging is the classic solution: gradually increase the priority of waiting processes.

### 9.5 Deadlock Detection: DFS Cycle Detection

**Implementation:** `DeadlockDetector.detect_cycle_dfs()`

**Algorithm:**
```
1. Build adjacency list from RAG edges
2. Initialize: visited = {}, rec_stack = {}, parent = {}
3. For each unvisited node:
   a. DFS(node):
      i.   Add node to visited and rec_stack
      ii.  For each neighbor of node:
           - If not visited: set parent, recurse DFS(neighbor)
           - If in rec_stack: CYCLE FOUND
             * Trace back via parent pointers to extract cycle path
             * Add cycle to all_cycles list
      iii. Remove node from rec_stack
4. Mark all nodes and edges in cycles as in_cycle = True
5. Return has_deadlock, cycle paths, deadlocked processes/resources
```

**Adjacency List Representation:**
```python
adjacency = {node_id: [neighbor_ids]}
# Example:
# P1 -> [R1]     (P1 requests R1)
# R1 -> [P2]     (R1 assigned to P2)
# P2 -> [R2]     (P2 requests R2)
# R2 -> [P1]     (R2 assigned to P1)
# Cycle: P1 -> R1 -> P2 -> R2 -> P1
```

**Three-Color DFS:** Uses `visited` (white->gray->black) and `rec_stack` (in current DFS path) to distinguish back edges (cycles) from cross edges.

**Time Complexity:** O(V + E) where V = nodes, E = edges

### 9.6 Banker's Algorithm

**Implementation:** `DeadlockDetector.run_bankers()`

**Safety Algorithm:**
```
Input: processes[], resources[], Max[][], Allocation[][], Available[]

1. Compute Need matrix: Need[i][j] = Max[i][j] - Allocation[i][j]
2. Work = copy(Available)
3. Finish = [False] * n_processes
4. safe_sequence = []
5. Repeat:
   a. Find unfinished process i where Need[i] <= Work (element-wise)
   b. If found:
      - Work = Work + Allocation[i]  (release resources)
      - Finish[i] = True
      - Append process[i] to safe_sequence
      - Restart scan from beginning
   c. If not found: break
6. If all Finish[i] == True: SAFE state (safe_sequence is valid)
   Else: UNSAFE state (deadlock possible)
```

**Matrix Operations:**
- Need[i][j] = Max[i][j] - Allocation[i][j]
- Comparison: Need[i] <= Work checks ALL resource types: `all(need[i][j] <= work[j] for j in range(n_res))`
- Release: `work[j] += allocation[i][j]` for all j

**Step-by-Step Trace:** Each iteration produces a step with:
- Current Work vector (before and after)
- Need and Allocation for the checked process
- Whether the process can finish
- Human-readable explanation string

### 9.7 Semaphore Implementation

**Implementation:** `ConcurrencyManager.sem_wait()` and `sem_signal()`

**sem_wait (P operation):**
```
lock(global_lock)
if semaphore.value > 0:
    semaphore.value -= 1
    semaphore.holding_processes.append(process_id)
    return ACQUIRED
else:
    semaphore.waiting_queue.append(process_id)
    return BLOCKED
unlock(global_lock)
```

**sem_signal (V operation):**
```
lock(global_lock)
semaphore.holding_processes.remove(process_id)
if semaphore.waiting_queue is not empty:
    woken = semaphore.waiting_queue.pop(0)  # FIFO wake-up
    semaphore.holding_processes.append(woken)
    # value stays same (transferred to new holder)
else:
    semaphore.value += 1
unlock(global_lock)
```

The FIFO wake-up policy prevents starvation in the waiting queue.

### 9.8 Memory Bitmap and Fragmentation

**Implementation:** `MemoryManager.get_pool_state()`

**Bitmap Construction:**
```
For each resource type (classroom, lab, faculty, exam_slot):
  bitmap = []
  For each resource of this type (sorted by ID):
    If resource has an active booking (running/waiting/blocked):
      bitmap.append(1)  # Allocated
    Else:
      bitmap.append(0)  # Free
```

**Fragmentation Measurement:**
```
fragments = count of contiguous free regions
largest_free_block = length of longest contiguous free run
fragmentation_ratio = 1 - (largest_free_block / total_free)
```

A fragmentation ratio of 0 means all free space is contiguous. A ratio approaching 1 means free space is highly scattered.

**Compaction Algorithm:**
```
1. Get all active bookings for the resource type, ordered by booking ID
2. Get all resources of the type, ordered by resource ID
3. For each booking:
   a. Assign it to the next available (unassigned) resource
   b. If the assignment is different from current, record the move
4. Commit changes
Result: All bookings are packed at the beginning, free space consolidated at the end
```

---

## 10. Database Schema

### 10.1 ER Diagram

```
+-------------------+          +-------------------+
|      users        |          |    resources      |
+-------------------+          +-------------------+
| PK id             |          | PK id             |
|    email (unique) |          |    name           |
|    name           |          |    type (enum)    |
|    hashed_password|          |    building       |
|    role (enum)    |          |    floor          |
|    department     |          |    capacity       |
|    created_at     |          |    status (enum)  |
+--------+--+------+          |    features (JSON)|
         |  |                  |    department     |
         |  |                  +--------+----------+
         |  |                           |
         |  |    +----------------------+
         |  |    |                      |
         |  +----+------+              |
         |       |      |              |
+--------v-------v------v---------+    |
|           bookings              |    |
+---------------------------------+    |
| PK id                           |    |
|    process_id (unique, indexed) |    |
|    title                        |    |
|    course_code                  |    |
| FK faculty_id -> users.id      |    |
| FK resource_id -> resources.id--+----+
|    resource_type                |
| FK requested_by -> users.id    |
|    date                         |
|    start_time                   |
|    end_time                     |
|    duration_minutes             |
|    priority                     |
|    state (enum)                 |
|    arrival_time                 |
|    waiting_time                 |
|    turnaround_time              |
|    algorithm_used               |
|    os_concept_note              |
|    created_at                   |
+-------+-------------------------+
        |                          |
        |                          |
+-------v-------+         +-------v-----------+
|timetable_entries|         |  (no FK)         |
+----------------+         |                   |
| PK id          |         +-------------------+
| FK booking_id--+         |   notifications   |
| FK resource_id-+-------->+-------------------+
|    day_of_week |         | PK id             |
|    start_time  |         |    from_department |
|    end_time    |         |    to_department   |
|    week_start  |         |    type            |
+----------------+         |    subject         |
                           |    body            |
                           |    read            |
                           |    created_at      |
                           |    os_concept      |
                           +-------------------+
```

### 10.2 Table Details

#### users

| Column           | Type                | Constraints             |
|-----------------|---------------------|------------------------|
| id              | INTEGER             | PRIMARY KEY, AUTOINCREMENT |
| email           | VARCHAR(255)        | UNIQUE, NOT NULL, INDEX |
| name            | VARCHAR(255)        | NOT NULL               |
| hashed_password | VARCHAR(255)        | NOT NULL               |
| role            | ENUM(admin,faculty,student) | NOT NULL, DEFAULT student |
| department      | VARCHAR(100)        | DEFAULT 'Computer Science' |
| created_at      | DATETIME            | DEFAULT CURRENT_TIMESTAMP |

#### resources

| Column     | Type                           | Constraints                  |
|-----------|-------------------------------|------------------------------|
| id        | INTEGER                       | PRIMARY KEY, AUTOINCREMENT   |
| name      | VARCHAR(255)                  | NOT NULL                     |
| type      | ENUM(classroom,lab,faculty,exam_slot) | NOT NULL            |
| building  | VARCHAR(100)                  | DEFAULT 'Main Building'      |
| floor     | INTEGER                       | DEFAULT 1                    |
| capacity  | INTEGER                       | DEFAULT 40                   |
| status    | ENUM(available,occupied,maintenance) | DEFAULT available     |
| features  | JSON                          | DEFAULT {}                   |
| department| VARCHAR(100)                  | DEFAULT 'Computer Science'   |

#### bookings

| Column           | Type                | Constraints                  |
|-----------------|---------------------|------------------------------|
| id              | INTEGER             | PRIMARY KEY, AUTOINCREMENT   |
| process_id      | VARCHAR(20)         | UNIQUE, NOT NULL, INDEX      |
| title           | VARCHAR(255)        | NOT NULL                     |
| course_code     | VARCHAR(20)         | NULLABLE                     |
| department      | VARCHAR(100)        | DEFAULT 'Computer Science'   |
| faculty_id      | INTEGER             | FK -> users.id, NULLABLE     |
| resource_id     | INTEGER             | FK -> resources.id, NULLABLE |
| resource_type   | VARCHAR(50)         | DEFAULT 'classroom'          |
| requested_by    | INTEGER             | FK -> users.id, NOT NULL     |
| date            | DATE                | NOT NULL                     |
| start_time      | TIME                | NULLABLE                     |
| end_time        | TIME                | NULLABLE                     |
| duration_minutes| INTEGER             | DEFAULT 60                   |
| priority        | INTEGER             | DEFAULT 5                    |
| state           | ENUM(new,ready,running,waiting,completed,blocked) | DEFAULT new |
| arrival_time    | FLOAT               | DEFAULT 0                    |
| waiting_time    | FLOAT               | DEFAULT 0                    |
| turnaround_time | FLOAT               | DEFAULT 0                    |
| algorithm_used  | VARCHAR(50)         | NULLABLE                     |
| os_concept_note | VARCHAR(500)        | NULLABLE                     |
| created_at      | DATETIME            | DEFAULT CURRENT_TIMESTAMP    |

#### timetable_entries

| Column          | Type        | Constraints                  |
|----------------|------------|------------------------------|
| id             | INTEGER    | PRIMARY KEY, AUTOINCREMENT   |
| booking_id     | INTEGER    | FK -> bookings.id, NULLABLE  |
| resource_id    | INTEGER    | FK -> resources.id, NOT NULL |
| day_of_week    | VARCHAR(20)| NOT NULL                     |
| start_time     | TIME       | NOT NULL                     |
| end_time       | TIME       | NOT NULL                     |
| week_start_date| DATE       | NULLABLE                     |

#### notifications

| Column          | Type        | Constraints                  |
|----------------|------------|------------------------------|
| id             | INTEGER    | PRIMARY KEY, AUTOINCREMENT   |
| from_department| VARCHAR(100)| NULLABLE                    |
| to_department  | VARCHAR(100)| NULLABLE                    |
| type           | VARCHAR(50)| DEFAULT 'info'               |
| subject        | VARCHAR(255)| NOT NULL                    |
| body           | TEXT       | NULLABLE                     |
| read           | BOOLEAN    | DEFAULT FALSE                |
| created_at     | DATETIME   | DEFAULT CURRENT_TIMESTAMP    |
| os_concept     | VARCHAR(255)| NULLABLE                    |

### 10.3 Indexes

| Table     | Column(s)          | Type    |
|-----------|-------------------|---------|
| users     | id                | Primary |
| users     | email             | Unique  |
| resources | id                | Primary |
| bookings  | id                | Primary |
| bookings  | process_id        | Unique  |
| timetable_entries | id        | Primary |
| notifications | id            | Primary |

### 10.4 Seed Data Overview

The `seed/seed_data.py` script creates the following on first run (idempotent):

| Entity        | Count | Details                                           |
|--------------|-------|---------------------------------------------------|
| Users        | 3     | Admin, Faculty, Student accounts                  |
| Resources    | 24    | 10 classrooms, 6 labs, 8 faculty                  |
| Bookings     | 60    | 20 completed, 25 ready, 5 running, 8 waiting, 2 blocked (deadlock demo) |
| Notifications| 8     | Various IPC message types between departments     |

Resource details:
- **Classrooms** (10): CR-101 through CR-401, capacities 40-80, across Academic Blocks A and B
- **Labs** (6): Software Lab 1-2, Network Lab, Database Lab, Hardware Lab, AI/ML Lab, in IT Block
- **Faculty** (8): Dr. Ahmed Khan through Dr. Zainab Khalid, various specializations

Booking states distribution provides data for all OS concept demonstrations:
- Completed bookings have pre-computed scheduling metrics
- Ready bookings serve as the scheduling queue
- Running/waiting/blocked bookings create the RAG for deadlock detection

---

## 11. Deployment Guide

### 11.1 Docker Compose Deployment (Recommended)

```bash
# Build and start all services
docker compose up --build -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Reset everything (including database)
docker compose down -v
```

The `docker-compose.yml` defines three services:

1. **postgres**: PostgreSQL 15 Alpine with health check
2. **backend**: FastAPI with Alembic migrations, seeding, and Uvicorn
3. **frontend**: Next.js development server

Volumes:
- `postgres_data`: Persists database across restarts
- `frontend_node_modules`: Caches node_modules inside the container

### 11.2 Manual Deployment

#### Backend

```bash
cd backend

# Set environment variables
export DATABASE_URL="postgresql://user:password@host:5432/cuischeduler"
export SECRET_KEY="your-production-secret-key-min-32-chars"
export FRONTEND_URL="https://your-frontend-domain.com"

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Seed database
python seed/seed_data.py

# Start production server
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### Frontend

```bash
cd frontend

# Set environment variables
export NEXT_PUBLIC_API_URL="https://your-api-domain.com"
export NEXT_PUBLIC_WS_URL="wss://your-api-domain.com/ws"

# Install and build
npm install
npm run build

# Start production server
npm start
```

### 11.3 Database Setup

#### PostgreSQL (Production)

```sql
CREATE DATABASE cuischeduler;
CREATE USER cui WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE cuischeduler TO cui;
```

Set `DATABASE_URL=postgresql://cui:your_secure_password@localhost:5432/cuischeduler`.

#### SQLite (Development)

No setup needed. The database file `cuischeduler.db` is created automatically in the backend directory.

### 11.4 CORS Configuration

The backend allows these origins by default:

```python
allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

For production, update `main.py` to include your production frontend URL or use the `FRONTEND_URL` environment variable.

### 11.5 Production Considerations

1. **Change SECRET_KEY**: Use a cryptographically random 32+ character string
2. **Use PostgreSQL**: SQLite is single-writer and not suitable for production
3. **HTTPS**: Use a reverse proxy (Nginx) with TLS certificates
4. **Workers**: Run Uvicorn with `--workers 4` (or use Gunicorn with Uvicorn workers)
5. **WebSocket proxy**: Configure Nginx to proxy WebSocket connections to `/ws`
6. **Database backups**: Set up regular PostgreSQL backups
7. **Logging**: Configure structured logging for production monitoring

---

## 12. Testing Guide

### 12.1 Testing Backend Endpoints

#### Using Swagger UI

Navigate to http://localhost:8000/docs for the interactive Swagger UI. You can:
1. Click "Try it out" on any endpoint
2. Fill in parameters
3. Execute and see the response
4. Use the "Authorize" button to set your JWT token

#### Curl Examples

```bash
# 1. Login and save token
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cui.edu.pk","password":"admin123"}' | python -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

echo $TOKEN

# 2. List all bookings in ready state
curl -s "http://localhost:8000/api/bookings?state=ready" | python -m json.tool

# 3. Get the ready queue sorted by SJF
curl -s "http://localhost:8000/api/bookings/queue?algorithm=sjf" | python -m json.tool

# 4. Run FCFS on first 5 ready bookings
curl -s -X POST http://localhost:8000/api/scheduling/run \
  -H "Content-Type: application/json" \
  -d '{"algorithm":"fcfs","booking_ids":[21,22,23,24,25]}' | python -m json.tool

# 5. Check for deadlocks
curl -s http://localhost:8000/api/deadlock/rag | python -m json.tool

# 6. Run Banker's Algorithm
curl -s -X POST http://localhost:8000/api/deadlock/bankers \
  -H "Content-Type: application/json" \
  -d '{"processes":[{"id":"P1"},{"id":"P2"},{"id":"P3"}],"resources":["A","B","C"],"max_matrix":[[7,5,3],[3,2,2],[9,0,2]],"allocation_matrix":[[0,1,0],[2,0,0],[3,0,2]],"available":[3,3,2]}' | python -m json.tool

# 7. Get resource pool bitmap state
curl -s http://localhost:8000/api/resources/pool-state | python -m json.tool

# 8. Create a deadlock scenario
curl -s -X POST http://localhost:8000/api/deadlock/scenario \
  -H "Content-Type: application/json" \
  -d '{"scenario_type":"classic"}' | python -m json.tool

# 9. Get analytics heatmap
curl -s http://localhost:8000/api/analytics/heatmap | python -m json.tool

# 10. Send an IPC notification
curl -s -X POST http://localhost:8000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{"from_department":"CS","to_department":"EE","type":"request","subject":"Lab swap","body":"Can we swap labs?"}' | python -m json.tool
```

### 12.2 Testing Frontend Pages

Open the browser and navigate to each page:

| URL                  | What to Test                                |
|----------------------|---------------------------------------------|
| `/dashboard`         | Stats load, charts render, live indicators  |
| `/scheduler`         | Load demo set, run FCFS/SJF/RR/Priority, step through, compare |
| `/deadlock`          | RAG graph renders (D3), create scenarios, run Banker's |
| `/concurrency`       | Semaphore visualization, race condition demo |
| `/resources`         | Resource grid, bitmap visualization, fragmentation |
| `/timetable`         | Week grid, drag-and-drop, auto-schedule     |
| `/analytics`         | Utilization bars, algorithm comparison, heatmap |
| `/notifications`     | Message list, mark read, queue state         |
| `/admin`             | CRUD tables for rooms, labs, faculty, users  |
| `/login`             | Login with test accounts                     |

### 12.3 Seed Data for Testing

The seed data provides a rich testing baseline:

- **20 completed bookings** with varied algorithms and metrics (for analytics)
- **25 ready bookings** (the scheduling queue to run algorithms on)
- **5 running bookings** (for concurrency and real-time display)
- **8 waiting bookings** (for deadlock graph edges)
- **2 blocked bookings** (pre-seeded deadlock condition)
- **8 notifications** (IPC messages between departments)

To re-seed the database:
```bash
# SQLite: delete the file and re-seed
rm backend/cuischeduler.db
cd backend && python seed/seed_data.py

# PostgreSQL (Docker): reset volumes
docker compose down -v && docker compose up --build
```

---

## 13. Extending the System

### 13.1 Adding a New Scheduling Algorithm

1. **Backend** -- Add the algorithm to `SchedulingEngine`:

```python
# backend/services/scheduling_engine.py

def run_multilevel_queue(self, requests, queue_config):
    """Multilevel Queue scheduling - Ch.5 advanced topic."""
    processes = self._build_processes(requests)
    # ... implementation ...
    return self._build_result("Multilevel Queue", completed, steps, gantt,
        "Multilevel Queue separates processes into priority classes...")
```

2. **Backend** -- Wire it into the router:

```python
# backend/routers/scheduling.py
elif algo == "multilevel_queue":
    result = engine.run_multilevel_queue(requests_data, request.queue_config)
```

3. **Frontend** -- Add to the algorithm type:

```typescript
// frontend/types/index.ts
type SchedulingAlgorithm = 'FCFS' | 'SJF' | 'RR' | 'PRIORITY' | 'MLQ';
```

4. **Frontend** -- Add to the store's comparison:

```typescript
// frontend/hooks/useScheduler.ts
// Add to compareAll algorithms list
const algorithms: SchedulingAlgorithm[] = ["FCFS", "SJF", "RR", "PRIORITY", "MLQ"];
```

5. **Frontend** -- Add OS concept:

```typescript
// frontend/constants/osConcepts.ts
MULTILEVEL_QUEUE: { name: "CPU Scheduling -- Multilevel Queue", chapter: "Ch.5", description: "..." },
```

### 13.2 Adding a New Resource Type

1. **Backend** -- Add to the enum:

```python
# backend/models/resource.py
class ResourceType(str, enum.Enum):
    classroom = "classroom"
    lab = "lab"
    faculty = "faculty"
    exam_slot = "exam_slot"
    seminar_hall = "seminar_hall"  # NEW
```

2. **Backend** -- Run migration:

```bash
alembic revision --autogenerate -m "add seminar_hall resource type"
alembic upgrade head
```

3. **Frontend** -- Update type:

```typescript
// frontend/types/index.ts
type ResourceType = 'classroom' | 'lab' | 'faculty' | 'exam_slot' | 'seminar_hall';
```

4. **Backend** -- Add seed data:

```python
# backend/seed/seed_data.py
Resource(name="Seminar Hall A", type=ResourceType.seminar_hall, ...)
```

### 13.3 Adding a New Page/Module

1. **Create the page:**

```
frontend/app/new-module/page.tsx
```

```tsx
"use client";
import { PageHeader } from "@/components/layout/PageHeader";
import { OS_CONCEPTS } from "@/constants/osConcepts";

export default function NewModulePage() {
  return (
    <div>
      <PageHeader
        title="New Module"
        concept={OS_CONCEPTS.NEW_CONCEPT}
      />
      {/* Page content */}
    </div>
  );
}
```

2. **Add to sidebar navigation:**

```typescript
// frontend/components/layout/Sidebar.tsx
// Add to the appropriate navSections array
{ label: "New Module", href: "/new-module", icon: SomeIcon, chapter: "Ch.X" },
```

3. **Create a Zustand store:**

```typescript
// frontend/hooks/useNewModule.ts
import { create } from "zustand";

interface NewModuleState {
  data: SomeType[];
  fetchData: () => Promise<void>;
}

export const useNewModule = create<NewModuleState>((set) => ({
  data: [],
  fetchData: async () => { /* ... */ },
}));
```

4. **Create API module:**

```typescript
// Add to frontend/lib/api.ts
export const newModuleApi = {
  getAll: () => api.get("/new-module"),
  // ...
};
```

5. **Add backend router:**

```python
# backend/routers/new_module.py
router = APIRouter(prefix="/new-module", tags=["New Module"])
```

Register in `routers/__init__.py` and `main.py`.

### 13.4 Adding a New OS Concept Badge

See [Section 6.6](#66-how-to-add-a-new-os-concept).

### 13.5 Adding a New API Endpoint

1. **Define Pydantic schema** in `backend/schemas/`
2. **Add endpoint** to the appropriate router in `backend/routers/`
3. **Include `os_concept_note`** in the response
4. **Add to frontend API module** in `frontend/lib/api.ts`
5. **Document** in this guide

### 13.6 Modifying Seed Data

Edit `backend/seed/seed_data.py`. The script is idempotent -- it checks if data exists before seeding. To re-seed:

```bash
# SQLite
rm backend/cuischeduler.db
python backend/seed/seed_data.py

# PostgreSQL
# Drop and recreate the database, then run seed
```

---

## 14. Troubleshooting for Developers

### 14.1 Common Build Errors

**Frontend: Module not found**
```
Module not found: Can't resolve '@/components/...'
```
Fix: Check `tsconfig.json` has `"@/*": ["./*"]` path alias configured.

**Backend: ImportError for models**
```
ImportError: cannot import name 'TimetableEntry' from 'models'
```
Fix: Ensure `models/__init__.py` imports all models.

### 14.2 Database Connection Issues

**SQLite "database is locked"**
```
sqlite3.OperationalError: database is locked
```
Fix: This happens when multiple processes access SQLite simultaneously. Either:
- Restart the server (only one Uvicorn worker for SQLite)
- Switch to PostgreSQL for multi-worker setups

**PostgreSQL connection refused (Docker)**
```
psycopg2.OperationalError: could not connect to server
```
Fix: Ensure the `postgres` service is healthy before the backend starts. The `depends_on` with `condition: service_healthy` in `docker-compose.yml` handles this, but if running manually, wait for PostgreSQL to be ready.

### 14.3 CORS Issues

**Browser shows "CORS policy" error**
```
Access to XMLHttpRequest has been blocked by CORS policy
```
Fix: Ensure `main.py` includes your frontend URL in `allow_origins`. For development:
```python
allow_origins=["http://localhost:3000"]
```

### 14.4 TypeScript Type Errors

**Type mismatch between API response and interface**

The backend may return slightly different field names or types. Check:
1. The Pydantic schema in `backend/schemas/`
2. The TypeScript interface in `frontend/types/index.ts`
3. Ensure they match field-by-field

**Missing optional fields**

Use `?` in TypeScript interfaces for fields that may not be present:
```typescript
interface Resource {
  features?: string[];  // May be absent or empty
}
```

### 14.5 D3 Type Compatibility

**Type errors with D3 selections**
```
Property 'selectAll' does not exist on type 'Selection<...>'
```
Fix: Install D3 type definitions: `npm install -D @types/d3`. Use explicit type parameters:
```typescript
import * as d3 from "d3";
const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
```

### 14.6 bcrypt/passlib Compatibility

**passlib deprecation warnings**
```
DeprecationWarning: 'crypt' is deprecated
```
This is a known issue with passlib and Python 3.12+. The warning is cosmetic and does not affect functionality. To suppress:
```python
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
```

Alternatively, pin to a compatible passlib version or use `bcrypt` directly:
```python
pip install bcrypt==4.0.1  # Known compatible version
```

**Hash format errors**
```
ValueError: hash could not be identified
```
Fix: Ensure passwords are hashed with bcrypt (the `$2b$` prefix). If re-seeding, delete the old database and re-run the seed script.

---

## 15. Code Style and Conventions

### 15.1 Python (Backend)

**FastAPI Patterns:**
- Routers use dependency injection via `Depends(get_db)` for database sessions
- Services are instantiated once per module (singleton pattern)
- All responses include `os_concept_note` strings
- Error handling uses `HTTPException` with descriptive messages

**Service Layer Pattern:**
```python
# Router calls service, service returns dict
# Router does NOT contain business logic
result = engine.run_fcfs(requests_data)
return result
```

**Naming Conventions:**
- Files: `snake_case.py`
- Classes: `PascalCase` (e.g., `SchedulingEngine`, `BookingState`)
- Functions: `snake_case` (e.g., `run_fcfs`, `get_pool_state`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `STATE_TRANSITIONS`, `SECRET_KEY`)
- Route paths: `kebab-case` (e.g., `/pool-state`, `/queue-state`)

**Import Organization:**
```python
# 1. Standard library
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

# 2. Third-party
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# 3. Local
from database import get_db
from models.booking import Booking, BookingState
from services.scheduling_engine import SchedulingEngine
```

### 15.2 TypeScript/React (Frontend)

**Component Patterns:**
- All page and interactive components are client components (`"use client"`)
- Components receive data via props or Zustand stores (not prop drilling)
- Each Zustand store has a `try/catch` with fallback data for offline resilience

**Hook Pattern:**
```typescript
// hooks/useXxx.ts
export const useXxx = create<XxxState>((set, get) => ({
  // State
  data: [],
  isLoading: false,

  // Actions
  fetchData: async () => {
    try {
      const res = await xxxApi.getAll();
      set({ data: res.data });
    } catch {
      // Keep current state (offline fallback)
    }
  },
}));
```

**Naming Conventions:**
- Files: `PascalCase.tsx` for components, `camelCase.ts` for utilities and hooks
- Components: `PascalCase` (e.g., `OSConceptBadge`, `ProcessStateChip`)
- Hooks: `useCamelCase` (e.g., `useScheduler`, `useWebSocket`)
- Types/Interfaces: `PascalCase` (e.g., `BookingRequest`, `SchedulingResult`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `OS_CONCEPTS`)

### 15.3 CSS (Tailwind + CSS Variables)

- All colors use CSS custom properties mapped through `tailwind.config.ts`
- Never use hardcoded hex values in components -- use Tailwind classes like `bg-bg-primary`, `text-accent-blue`
- The exception is the OS Concept Legend in Sidebar.tsx which uses inline styles for the color dots
- Responsive design is mobile-aware but optimized for desktop (this is a management tool)
- Animations use Tailwind's `animate-*` classes backed by keyframes in `tailwind.config.ts`

### 15.4 File Naming Conventions

| Layer      | Convention      | Examples                              |
|-----------|-----------------|---------------------------------------|
| Backend models | `snake_case.py` | `user.py`, `booking.py`, `timetable.py` |
| Backend routers| `snake_case.py` | `auth.py`, `deadlock.py`, `scheduling.py` |
| Backend services| `snake_case.py`| `scheduling_engine.py`, `deadlock_detector.py` |
| Backend schemas| `snake_case.py` | `user.py`, `scheduling.py`           |
| Frontend pages | `page.tsx`     | `app/dashboard/page.tsx`              |
| Frontend components | `PascalCase.tsx` | `OSConceptBadge.tsx`, `Sidebar.tsx` |
| Frontend hooks | `camelCase.ts` | `useScheduler.ts`, `useWebSocket.ts`  |
| Frontend lib  | `camelCase.ts`  | `api.ts`, `auth.ts`, `websocket.ts`   |
| Frontend types | `camelCase.ts` | `index.ts`                            |
| Frontend constants | `camelCase.ts` | `osConcepts.ts`                   |

### 15.5 Import Organization (Frontend)

```typescript
// 1. React/Next.js
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

// 2. Third-party libraries
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Clock } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

// 3. Internal - types and constants
import { BookingRequest, SchedulingAlgorithm } from "@/types";
import { OS_CONCEPTS } from "@/constants/osConcepts";

// 4. Internal - hooks and stores
import { useScheduler } from "@/hooks/useScheduler";
import { useWebSocket } from "@/hooks/useWebSocket";

// 5. Internal - components
import { OSConceptBadge } from "@/components/ui/OSConceptBadge";
import { PageHeader } from "@/components/layout/PageHeader";

// 6. Internal - utilities
import { cn } from "@/lib/utils";
```

---

## Appendix: Quick Reference Card

### Default URLs
| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:3000         |
| Backend   | http://localhost:8000         |
| API Docs  | http://localhost:8000/docs    |
| WebSocket | ws://localhost:8000/ws        |

### Quick Commands
```bash
# Start everything
docker compose up --build

# Backend only (local)
cd backend && uvicorn main:app --reload

# Frontend only (local)
cd frontend && npm run dev

# Re-seed database
python backend/seed/seed_data.py

# View API docs
open http://localhost:8000/docs
```

### OS Concept Quick Reference
| Concept          | System Feature    | API Endpoint                |
|-----------------|-------------------|-----------------------------|
| FCFS/SJF/RR/Priority | Scheduling    | POST /api/scheduling/run    |
| RAG + Cycle Detection | Deadlock     | GET /api/deadlock/rag       |
| Banker's Algorithm | Deadlock Avoidance | POST /api/deadlock/bankers |
| Semaphore/Mutex  | Concurrency       | GET /api/concurrency/semaphores |
| Bitmap/Fragmentation | Memory Mgmt  | GET /api/resources/pool-state |
| Process States   | Booking States    | PATCH /api/bookings/{id}/state |
| IPC Message Queue| Notifications     | GET /api/notifications/queue-state |

---

*This document was last updated on March 28, 2026.*
*CUIScheduler v1.0.0 -- COMSATS University Islamabad, Wah Campus.*
