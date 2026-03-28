interface ProcessInput {
  id: number;
  process_id: string;
  title: string;
  arrival_time: number;
  duration_minutes: number;
  priority: number;
}

interface ProcessInfo {
  processId: string;
  bookingId: number;
  arrivalTime: number;
  burstTime: number;
  remainingTime: number;
  priority: number;
  originalPriority: number;
  waitingTime: number;
  turnaroundTime: number;
  completionTime: number;
  startTime: number | null;
  started: boolean;
}

interface Step {
  time: number;
  action: string;
  process_id: string;
  detail: string;
  os_concept_note: string;
  ready_queue: string[];
}

interface GanttBar {
  process_id: string;
  booking_id: number;
  start: number;
  end: number;
  state: string;
}

function buildProcesses(requests: ProcessInput[]): ProcessInfo[] {
  return requests.map(r => ({
    processId: r.process_id || `P${r.id}`,
    bookingId: r.id,
    arrivalTime: r.arrival_time || 0,
    burstTime: r.duration_minutes || 60,
    remainingTime: r.duration_minutes || 60,
    priority: r.priority || 5,
    originalPriority: r.priority || 5,
    waitingTime: 0,
    turnaroundTime: 0,
    completionTime: 0,
    startTime: null,
    started: false,
  }));
}

function buildResult(algorithm: string, processes: ProcessInfo[], steps: Step[], gantt: GanttBar[], osNote: string) {
  const metrics = processes.map(p => ({
    process_id: p.processId, booking_id: p.bookingId, arrival_time: p.arrivalTime,
    burst_time: p.burstTime, waiting_time: p.waitingTime, turnaround_time: p.turnaroundTime,
    completion_time: p.completionTime, priority: p.originalPriority,
  }));

  const n = processes.length || 1;
  const totalW = processes.reduce((s, p) => s + p.waitingTime, 0);
  const totalT = processes.reduce((s, p) => s + p.turnaroundTime, 0);
  const totalBurst = processes.reduce((s, p) => s + p.burstTime, 0);
  const makespan = Math.max(...processes.map(p => p.completionTime), 1);
  const ctxSwitches = steps.filter(s => s.action === "preempt").length;

  return {
    algorithm, steps, gantt_chart: gantt, metrics,
    avg_waiting_time: Math.round((totalW / n) * 100) / 100,
    avg_turnaround_time: Math.round((totalT / n) * 100) / 100,
    total_context_switches: ctxSwitches,
    cpu_utilization: Math.round((totalBurst / makespan) * 10000) / 100,
    throughput: Math.round((n / makespan) * 10000) / 10000,
    os_concept_note: osNote,
  };
}

export function runFcfs(requests: ProcessInput[]) {
  const procs = buildProcesses(requests);
  procs.sort((a, b) => a.arrivalTime - b.arrivalTime || a.bookingId - b.bookingId);
  const steps: Step[] = [];
  const gantt: GanttBar[] = [];
  let t = 0;

  for (const p of procs) {
    if (t < p.arrivalTime) t = p.arrivalTime;
    p.startTime = t;
    p.waitingTime = t - p.arrivalTime;
    const rq = procs.filter(q => q.arrivalTime <= t && q.remainingTime > 0 && q.processId !== p.processId).map(q => q.processId);
    steps.push({ time: t, action: "dispatch", process_id: p.processId, detail: `Dispatching ${p.processId} (burst=${p.burstTime}min)`, os_concept_note: `FCFS dispatches ${p.processId} - first arrived, first served.`, ready_queue: rq });
    gantt.push({ process_id: p.processId, booking_id: p.bookingId, start: t, end: t + p.burstTime, state: "running" });
    t += p.burstTime;
    p.completionTime = t;
    p.turnaroundTime = p.completionTime - p.arrivalTime;
    p.remainingTime = 0;
    steps.push({ time: t, action: "complete", process_id: p.processId, detail: `${p.processId} completed. Wait=${p.waitingTime}min, TAT=${p.turnaroundTime}min.`, os_concept_note: `Process ${p.processId} finishes. Turnaround = ${p.turnaroundTime}min.`, ready_queue: procs.filter(q => q.arrivalTime <= t && q.remainingTime > 0).map(q => q.processId) });
  }

  return buildResult("FCFS", procs, steps, gantt, "First Come First Served - non-preemptive, FIFO ordering.");
}

export function runSjf(requests: ProcessInput[]) {
  const procs = buildProcesses(requests);
  const completed: ProcessInfo[] = [];
  const steps: Step[] = [];
  const gantt: GanttBar[] = [];
  let t = 0;
  const remaining = [...procs];

  while (remaining.length > 0) {
    const avail = remaining.filter(p => p.arrivalTime <= t);
    if (avail.length === 0) { t = Math.min(...remaining.map(p => p.arrivalTime)); continue; }
    avail.sort((a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime);
    const sel = avail[0];
    sel.startTime = t;
    sel.waitingTime = t - sel.arrivalTime;
    const rq = avail.filter(p => p.processId !== sel.processId).map(p => p.processId);
    steps.push({ time: t, action: "dispatch", process_id: sel.processId, detail: `SJF selects ${sel.processId} (burst=${sel.burstTime}min)`, os_concept_note: `SJF picks shortest burst. Optimal for avg waiting time.`, ready_queue: rq });
    gantt.push({ process_id: sel.processId, booking_id: sel.bookingId, start: t, end: t + sel.burstTime, state: "running" });
    t += sel.burstTime;
    sel.completionTime = t;
    sel.turnaroundTime = sel.completionTime - sel.arrivalTime;
    sel.remainingTime = 0;
    steps.push({ time: t, action: "complete", process_id: sel.processId, detail: `${sel.processId} completed. Wait=${sel.waitingTime}min, TAT=${sel.turnaroundTime}min.`, os_concept_note: `${sel.processId} completes.`, ready_queue: remaining.filter(p => p !== sel && p.arrivalTime <= t).map(p => p.processId) });
    remaining.splice(remaining.indexOf(sel), 1);
    completed.push(sel);
  }

  return buildResult("SJF", completed, steps, gantt, "Shortest Job First - optimal avg waiting time, may starve long processes.");
}

export function runRoundRobin(requests: ProcessInput[], quantum = 30) {
  const procs = buildProcesses(requests);
  procs.sort((a, b) => a.arrivalTime - b.arrivalTime || a.bookingId - b.bookingId);
  const steps: Step[] = [];
  const gantt: GanttBar[] = [];
  let t = 0;
  const readyQ: ProcessInfo[] = [];
  const completed: ProcessInfo[] = [];
  let ctxSwitches = 0;
  const arrivedSet = new Set<string>();
  const allProcs = [...procs];

  for (const p of allProcs) {
    if (p.arrivalTime <= t && !arrivedSet.has(p.processId)) { readyQ.push(p); arrivedSet.add(p.processId); }
  }

  while (readyQ.length > 0 || allProcs.some(p => p.remainingTime > 0)) {
    if (readyQ.length === 0) {
      const pending = allProcs.filter(p => p.remainingTime > 0 && !arrivedSet.has(p.processId));
      if (pending.length === 0) break;
      t = Math.min(...pending.map(p => p.arrivalTime));
      for (const p of allProcs) { if (p.arrivalTime <= t && !arrivedSet.has(p.processId) && p.remainingTime > 0) { readyQ.push(p); arrivedSet.add(p.processId); } }
      continue;
    }

    const cur = readyQ.shift()!;
    if (!cur.started) { cur.startTime = t; cur.started = true; }
    const exec = Math.min(quantum, cur.remainingTime);
    steps.push({ time: t, action: "dispatch", process_id: cur.processId, detail: `RR dispatches ${cur.processId} (remaining=${cur.remainingTime}min, quantum=${quantum}min)`, os_concept_note: `Round Robin gives ${cur.processId} a ${quantum}min quantum.`, ready_queue: readyQ.map(p => p.processId) });
    gantt.push({ process_id: cur.processId, booking_id: cur.bookingId, start: t, end: t + exec, state: "running" });
    t += exec;
    cur.remainingTime -= exec;

    for (const p of allProcs) { if (p.arrivalTime <= t && !arrivedSet.has(p.processId) && p.remainingTime > 0) { readyQ.push(p); arrivedSet.add(p.processId); } }

    if (cur.remainingTime <= 0) {
      cur.completionTime = t;
      cur.turnaroundTime = cur.completionTime - cur.arrivalTime;
      cur.waitingTime = cur.turnaroundTime - cur.burstTime;
      completed.push(cur);
      steps.push({ time: t, action: "complete", process_id: cur.processId, detail: `${cur.processId} completed.`, os_concept_note: `${cur.processId} finishes within quantum.`, ready_queue: readyQ.map(p => p.processId) });
    } else {
      readyQ.push(cur);
      ctxSwitches++;
      steps.push({ time: t, action: "preempt", process_id: cur.processId, detail: `${cur.processId} preempted. Remaining=${cur.remainingTime}min. Context switch #${ctxSwitches}.`, os_concept_note: `Quantum expired. Context switch performed.`, ready_queue: readyQ.map(p => p.processId) });
    }
  }

  const res = buildResult("Round Robin", completed, steps, gantt, `Round Robin (quantum=${quantum}min) - preemptive, fair time-sharing.`);
  res.total_context_switches = ctxSwitches;
  return res;
}

export function runPriority(requests: ProcessInput[]) {
  const procs = buildProcesses(requests);
  const completed: ProcessInfo[] = [];
  const steps: Step[] = [];
  const gantt: GanttBar[] = [];
  let t = 0;
  const remaining = [...procs];

  while (remaining.length > 0) {
    const avail = remaining.filter(p => p.arrivalTime <= t);
    if (avail.length === 0) { t = Math.min(...remaining.map(p => p.arrivalTime)); continue; }

    for (const p of avail) {
      const waitSoFar = t - p.arrivalTime;
      const agingBoost = Math.floor(waitSoFar / 5);
      p.priority = Math.max(1, p.originalPriority - agingBoost);
    }

    avail.sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime);
    const sel = avail[0];
    sel.startTime = t;
    sel.waitingTime = t - sel.arrivalTime;
    const rq = avail.filter(p => p.processId !== sel.processId).map(p => p.processId);
    steps.push({ time: t, action: "dispatch", process_id: sel.processId, detail: `Priority selects ${sel.processId} (priority=${sel.priority}, burst=${sel.burstTime}min)`, os_concept_note: `Priority scheduling with aging to prevent starvation.`, ready_queue: rq });
    gantt.push({ process_id: sel.processId, booking_id: sel.bookingId, start: t, end: t + sel.burstTime, state: "running" });
    t += sel.burstTime;
    sel.completionTime = t;
    sel.turnaroundTime = sel.completionTime - sel.arrivalTime;
    sel.remainingTime = 0;
    steps.push({ time: t, action: "complete", process_id: sel.processId, detail: `${sel.processId} completed. Wait=${sel.waitingTime}min, TAT=${sel.turnaroundTime}min.`, os_concept_note: `${sel.processId} completes.`, ready_queue: remaining.filter(p => p !== sel && p.arrivalTime <= t).map(p => p.processId) });
    remaining.splice(remaining.indexOf(sel), 1);
    completed.push(sel);
  }

  return buildResult("Priority", completed, steps, gantt, "Priority Scheduling with aging - serves critical tasks first while preventing starvation.");
}

export function compareAll(requests: ProcessInput[], quantum = 30) {
  const fcfs = runFcfs(JSON.parse(JSON.stringify(requests)));
  const sjf = runSjf(JSON.parse(JSON.stringify(requests)));
  const rr = runRoundRobin(JSON.parse(JSON.stringify(requests)), quantum);
  const prio = runPriority(JSON.parse(JSON.stringify(requests)));
  const results = [fcfs, sjf, rr, prio];
  const best = results.reduce((a, b) => a.avg_waiting_time < b.avg_waiting_time ? a : b);

  return {
    results, best_algorithm: best.algorithm,
    recommendation: `${best.algorithm} performs best with avg waiting time of ${best.avg_waiting_time}min.`,
    os_concept_note: "Comparing FCFS, SJF, Round Robin, and Priority scheduling algorithms.",
  };
}
