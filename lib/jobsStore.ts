// Shared in-memory store for created jobs and milestones to ensure 100% demo stability
// even if external Postgres has network latency, is sleeping, or in offline sandbox environments.

export interface StoredMilestone {
  id: string;
  jobId: string;
  title: string;
  description: string;
  amount: string;
  position: number;
  status: string;
  acceptanceCriteria: string[];
}

export interface StoredJob {
  id: string;
  title: string;
  description: string;
  status: string;
  totalAmount: string;
  currency: string;
  clientEmail?: string;
  freelancerPayPalEmail: string;
  createdAt: string;
  milestones: StoredMilestone[];
}

// Global declaration to survive hot module reload in Next.js development
declare global {
  // eslint-disable-next-line no-var
  var __arbiterJobsStore: Map<string, StoredJob> | undefined;
}

if (!global.__arbiterJobsStore) {
  global.__arbiterJobsStore = new Map<string, StoredJob>();
}

const store = global.__arbiterJobsStore;

export function saveInMemoryJob(job: StoredJob) {
  store.set(job.id, job);
}

export function getInMemoryJob(id: string): StoredJob | undefined {
  return store.get(id);
}

export function updateInMemoryJobStatus(id: string, status: string) {
  const job = store.get(id);
  if (job) {
    job.status = status;
    store.set(id, job);
  }
}

export function updateInMemoryMilestoneStatus(
  jobId: string,
  milestoneId: string,
  status: string
) {
  const job = store.get(jobId);
  if (job) {
    job.milestones = job.milestones.map((m) =>
      m.id === milestoneId ? { ...m, status } : m
    );
    store.set(jobId, job);
  }
}

export function getAllInMemoryJobs(): StoredJob[] {
  return Array.from(store.values());
}
