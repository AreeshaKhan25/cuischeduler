export const OS_CONCEPTS = {
  FCFS: { name: "CPU Scheduling — FCFS", chapter: "Ch.5", description: "First Come First Served — requests processed in arrival order, like a process ready queue. Simple but causes convoy effect." },
  SJF: { name: "CPU Scheduling — SJF", chapter: "Ch.5", description: "Shortest Job First — request with smallest duration runs next. Minimizes average waiting time but needs burst time prediction." },
  ROUND_ROBIN: { name: "CPU Scheduling — Round Robin", chapter: "Ch.5", description: "Each request gets a fixed time quantum. Preemptive, fair, ideal for time-sharing. Context switches on quantum expiry." },
  PRIORITY: { name: "CPU Scheduling — Priority", chapter: "Ch.5", description: "Highest priority runs first. Aging increments waiting processes' priority to prevent starvation." },
  DEADLOCK_RAG: { name: "Deadlock — RAG Cycle", chapter: "Ch.7", description: "Resource Allocation Graph cycle = deadlock. Processes wait for resources held by each other in a circle." },
  BANKERS: { name: "Deadlock — Banker's Algorithm", chapter: "Ch.7", description: "Avoidance algorithm. Checks if granting a request keeps system in a safe state. Only allocates if safe sequence exists." },
  SEMAPHORE: { name: "Synchronization — Semaphore", chapter: "Ch.6", description: "Counting semaphore controls shared resource access. wait() blocks when count=0, signal() unblocks a waiter." },
  MUTEX: { name: "Synchronization — Mutex", chapter: "Ch.6", description: "Binary semaphore. One process owns the lock. Prevents race conditions in critical sections." },
  RACE_CONDITION: { name: "Synchronization — Race Cond.", chapter: "Ch.6", description: "Without locks, two processes can both read 'free' and both book the same room — corrupting data." },
  MEMORY_BITMAP: { name: "Memory Mgmt — Bitmap", chapter: "Ch.8", description: "Resource pool tracked as a bitmap. Each bit = one room/slot. 0=free, 1=used. Mirrors physical memory page tracking." },
  FRAGMENTATION: { name: "Memory Mgmt — Fragmentation", chapter: "Ch.8", description: "Scattered free time slots = external fragmentation. Compaction merges them, like OS memory compaction." },
  PCB: { name: "Process Mgmt — PCB", chapter: "Ch.3", description: "Each booking is a process. Process Control Block stores: PID, state, priority, arrival time, burst time, waiting time." },
  PROCESS_STATES: { name: "Process Mgmt — State Machine", chapter: "Ch.3", description: "New → Ready → Running → Waiting → Completed. Every booking follows exact OS process state transitions." },
  IPC_MSGQUEUE: { name: "IPC — Message Queue", chapter: "Ch.3", description: "Departments send notifications via message queue — same IPC mechanism used between OS processes." },
  LOAD_BALANCE: { name: "Scheduling — Load Balancing", chapter: "Ch.5", description: "Distribute workload evenly across resources. Mirrors OS load balancing in multi-processor scheduling." },
  CONTEXT_SWITCH: { name: "CPU — Context Switch", chapter: "Ch.5", description: "Round Robin preemption = context switch. Save current process state, load next process. Has overhead cost." },
} as const;

export type OSConceptKey = keyof typeof OS_CONCEPTS;
export type OSConcept = typeof OS_CONCEPTS[OSConceptKey];
