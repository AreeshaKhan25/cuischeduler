interface BookingData { id: number; process_id: string; title: string; resource_id: number | null; state: string; priority?: number; }
interface ResourceData { id: number; name: string; type: string; }
interface Node { id: string; label: string; type: string; in_cycle: boolean; }
interface Edge { source: string; target: string; label: string; in_cycle: boolean; }

export function buildRag(bookings: BookingData[], resources: ResourceData[]) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const resMap = new Map(resources.map(r => [r.id, r]));
  const pSeen = new Set<string>();
  const rSeen = new Set<string>();

  for (const b of bookings) {
    const pid = b.process_id || `P${b.id}`;
    if (!pSeen.has(pid)) { nodes.push({ id: pid, label: `${pid}: ${b.title}`, type: "process", in_cycle: false }); pSeen.add(pid); }
    if (b.resource_id && resMap.has(b.resource_id)) {
      const rk = `R${b.resource_id}`;
      if (!rSeen.has(rk)) { const r = resMap.get(b.resource_id)!; nodes.push({ id: rk, label: `${rk}: ${r.name}`, type: "resource", in_cycle: false }); rSeen.add(rk); }
      if (b.state === "running" || b.state === "completed") edges.push({ source: rk, target: pid, label: "assigned_to", in_cycle: false });
      else if (b.state === "waiting" || b.state === "blocked") edges.push({ source: pid, target: rk, label: "requests", in_cycle: false });
    }
  }
  return { nodes, edges };
}

export function detectCycleDfs(nodes: Node[], edges: Edge[]) {
  const adj: Record<string, string[]> = {};
  for (const n of nodes) adj[n.id] = [];
  for (const e of edges) { if (adj[e.source]) adj[e.source].push(e.target); }

  const visited = new Set<string>();
  const recStack = new Set<string>();
  const parent: Record<string, string | null> = {};
  const allCycles: string[][] = [];

  function dfs(node: string): boolean {
    visited.add(node); recStack.add(node);
    let found = false;
    for (const nb of (adj[node] || [])) {
      if (!visited.has(nb)) { parent[nb] = node; if (dfs(nb)) found = true; }
      else if (recStack.has(nb)) {
        const cycle = [nb]; let cur = node;
        while (cur !== nb) { cycle.push(cur); cur = parent[cur] || nb; }
        cycle.push(nb); cycle.reverse(); allCycles.push(cycle); found = true;
      }
    }
    recStack.delete(node); return found;
  }

  for (const n of nodes) { if (!visited.has(n.id)) { parent[n.id] = null; dfs(n.id); } }

  const cycleNodes = new Set<string>();
  const cycleEdges = new Set<string>();
  for (const c of allCycles) { for (let i = 0; i < c.length - 1; i++) { cycleNodes.add(c[i]); cycleEdges.add(`${c[i]}->${c[i + 1]}`); } }
  for (const n of nodes) if (cycleNodes.has(n.id)) n.in_cycle = true;
  for (const e of edges) if (cycleEdges.has(`${e.source}->${e.target}`)) e.in_cycle = true;

  return {
    has_deadlock: allCycles.length > 0,
    deadlocked_processes: nodes.filter(n => n.in_cycle && n.type === "process").map(n => n.id),
    deadlocked_resources: nodes.filter(n => n.in_cycle && n.type === "resource").map(n => n.id),
    cycle: allCycles[0] || [],
    cycle_description: allCycles.length > 0 ? allCycles[0].join(" -> ") : null,
    nodes, edges,
  };
}

export function runBankers(processes: string[], resources: string[], maxMatrix: number[][], allocMatrix: number[][], available: number[]) {
  const nP = processes.length, nR = resources.length;
  const need = maxMatrix.map((row, i) => row.map((v, j) => v - allocMatrix[i][j]));
  const work = [...available];
  const finish = new Array(nP).fill(false);
  const safeSeq: string[] = [];
  const steps: { step: number; process_id: string; work_before: number[]; need: number[]; allocation: number[]; work_after: number[]; can_finish: boolean; explanation: string }[] = [];
  let stepNum = 0;

  while (true) {
    let found = false;
    for (let i = 0; i < nP; i++) {
      if (finish[i]) continue;
      if (need[i].every((n, j) => n <= work[j])) {
        stepNum++;
        const wb = [...work];
        for (let j = 0; j < nR; j++) work[j] += allocMatrix[i][j];
        steps.push({ step: stepNum, process_id: processes[i], work_before: wb, need: [...need[i]], allocation: [...allocMatrix[i]], work_after: [...work], can_finish: true, explanation: `${processes[i]} can finish. Release allocation. New Work = [${work}].` });
        finish[i] = true; safeSeq.push(processes[i]); found = true; break;
      }
    }
    if (!found) {
      for (let i = 0; i < nP; i++) { if (!finish[i]) { stepNum++; steps.push({ step: stepNum, process_id: processes[i], work_before: [...work], need: [...need[i]], allocation: [...allocMatrix[i]], work_after: [...work], can_finish: false, explanation: `${processes[i]} cannot finish.` }); } }
      break;
    }
  }

  const isSafe = finish.every(Boolean);
  return {
    is_safe: isSafe, safe_sequence: isSafe ? safeSeq : null, steps,
    processes: processes.map((p, i) => ({ process_id: p, allocation: [...allocMatrix[i]], max_need: [...maxMatrix[i]], need: [...need[i]] })),
    available: [...available],
    os_concept_note: isSafe ? `SAFE state. Safe sequence: ${safeSeq.join(" -> ")}.` : "UNSAFE state. No safe sequence exists.",
  };
}
