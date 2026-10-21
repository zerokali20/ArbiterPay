import { NextResponse } from 'next/server';
import { db } from '@/db';
import { jobs, milestones, users } from '@/db/schema';
import { getInMemoryJob, saveInMemoryJob } from '@/lib/jobsStore';
import { eq, asc } from 'drizzle-orm';

// Static demo data returned when id === 'sample-demo-job'
const SAMPLE_DEMO_JOB = {
  job: {
    id: 'sample-demo-job',
    title: 'Production Microservice & Automated CI Pipeline',
    description:
      'Deliver a TypeScript microservice with Docker containerization, comprehensive test coverage, and CI/CD documentation.',
    status: 'draft',
    totalAmount: '150.00',
    currency: 'USD',
    freelancerPayPalEmail: 'sb-okeek53339723@personal.example.com',
    clientEmail: 'sb-bhnlh53339270@business.example.com',
    createdAt: new Date().toISOString(),
  },
  milestones: [
    {
      id: 'ms-01',
      title: 'Milestone 1: Core Service & Authentication',
      description: 'JWT authentication, registration, bcrypt hashing with tests.',
      amount: '50.00',
      position: 1,
      status: 'pending',
      acceptanceCriteria: [
        'POST /auth/register and /auth/login with bcrypt password hashing',
        'JWT middleware protecting routes',
        'Automated test suite with >80% code coverage',
      ],
    },
    {
      id: 'ms-02',
      title: 'Milestone 2: Dockerization & Health Checks',
      description: 'Multi-stage Dockerfile and health endpoints.',
      amount: '50.00',
      position: 2,
      status: 'pending',
      acceptanceCriteria: [
        'Multi-stage Dockerfile with non-root security user',
        'GET /health endpoint reporting status and uptime',
      ],
    },
    {
      id: 'ms-03',
      title: 'Milestone 3: CI/CD Pipeline & OpenAPI Spec',
      description: 'GitHub Actions workflow and OpenAPI documentation.',
      amount: '50.00',
      position: 3,
      status: 'pending',
      acceptanceCriteria: [
        'GitHub Actions workflow running lint and tests',
        'OpenAPI 3.0 specification file',
      ],
    },
  ],
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Return static demo data for the sample job
  if (id === 'sample-demo-job') {
    return NextResponse.json(SAMPLE_DEMO_JOB);
  }

  // 1. Check in-memory store first (immediate response)
  const memoryJob = getInMemoryJob(id);
  if (memoryJob) {
    return NextResponse.json({
      job: memoryJob,
      milestones: memoryJob.milestones,
    });
  }

  // 2. Query PostgreSQL if not in memory
  try {
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, id),
    });

    if (job) {
      const jobMilestones = await db
        .select()
        .from(milestones)
        .where(eq(milestones.jobId, id))
        .orderBy(asc(milestones.position));

      let freelancerPayPalEmail = '';
      if (job.freelancerId) {
        try {
          const freelancer = await db.query.users.findFirst({
            where: eq(users.id, job.freelancerId),
          });
          freelancerPayPalEmail = freelancer?.paypalEmail || freelancer?.email || '';
        } catch {
          // Non-fatal
        }
      }

      const formattedMilestones = jobMilestones.map((m) => {
        let criteriaList: string[] = [];
        if (Array.isArray(m.acceptanceCriteria)) {
          criteriaList = m.acceptanceCriteria.map((c: any) =>
            typeof c === 'string' ? c : c?.description || String(c)
          );
        } else if (typeof m.acceptanceCriteria === 'string') {
          try {
            const parsed = JSON.parse(m.acceptanceCriteria);
            criteriaList = Array.isArray(parsed)
              ? parsed.map((c: any) => (typeof c === 'string' ? c : c?.description || String(c)))
              : [m.acceptanceCriteria];
          } catch {
            criteriaList = [m.acceptanceCriteria];
          }
        }

        return {
          ...m,
          acceptanceCriteria: criteriaList,
        };
      });

      const fullJob = {
        ...job,
        freelancerPayPalEmail:
          freelancerPayPalEmail || 'sb-okeek53339723@personal.example.com',
        totalAmount: job.totalAmount,
        milestones: formattedMilestones,
      };

      // Cache into memory store
      saveInMemoryJob(fullJob as any);

      return NextResponse.json({
        job: fullJob,
        milestones: formattedMilestones,
      });
    }
  } catch (error: any) {
    console.warn('GET /api/jobs/[id] DB query error:', error.message);
  }

  return NextResponse.json({ error: 'Job not found' }, { status: 404 });
}
