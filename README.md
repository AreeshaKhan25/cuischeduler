# CUIScheduler — Intelligent Campus Resource Scheduling System

**COMSATS University Islamabad, Wah Campus — Operating Systems Course Project**

A production-grade university resource scheduling system that demonstrates core Operating System concepts through a real, useful campus application.

## OS Concepts Demonstrated

| Concept | Chapter | Where |
|---------|---------|-------|
| CPU Scheduling (FCFS, SJF, RR, Priority) | Ch. 5 | Scheduling Engine |
| Deadlock Detection (RAG) | Ch. 7 | Deadlock Detector |
| Deadlock Avoidance (Banker's Algorithm) | Ch. 7 | Deadlock Detector |
| Synchronization (Semaphore, Mutex) | Ch. 6 | Concurrency Monitor |
| Race Conditions & Critical Sections | Ch. 6 | Concurrency Monitor |
| Memory Management (Bitmap, Fragmentation) | Ch. 8 | Resource Map |
| Process Management (PCB, State Machine) | Ch. 3 | All booking views |
| Inter-Process Communication (Message Queue) | Ch. 3 | Notifications |
| Load Balancing | Ch. 5 | Analytics |
| Context Switching | Ch. 5 | Round Robin Scheduler |

## Quick Start

```bash
docker compose up --build
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cui.edu.pk | admin123 |
| Faculty | faculty@cui.edu.pk | faculty123 |
| Student | student@cui.edu.pk | student123 |

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion, Recharts, D3.js, Zustand, @dnd-kit
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL, Alembic, WebSockets
- **Deployment:** Docker Compose

## Pages

1. **Dashboard** — Live overview with Gantt chart, resource utilization rings, process queue, semaphore status
2. **Scheduling Engine** — Run FCFS/SJF/Round Robin/Priority with animated Gantt charts and step-by-step traces
3. **Resource Map** — Building floor plans, memory bitmap allocation, fragmentation visualization
4. **Deadlock Detector** — D3 Resource Allocation Graph, Banker's Algorithm matrix, cycle detection
5. **Timetable Builder** — Drag-and-drop weekly timetable with conflict detection
6. **Concurrency Monitor** — Semaphore/mutex visualization, race condition demo
7. **Analytics** — Algorithm comparison charts, usage heatmaps, faculty load radar
8. **Notifications** — IPC message queue visualization
9. **Admin Panel** — CRUD management for rooms, labs, faculty, users, system settings

## Development

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && pip install -r requirements.txt && uvicorn main:app --reload
```
