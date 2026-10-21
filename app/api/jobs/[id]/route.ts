import { NextResponse } from 'next/server';
import { db } from '@/db';
import { jobs, milestones, users } from '@/db/schema';
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
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Return static demo data for the sample job — no DB needed
  if (id === 'sample-demo-job') {
    return NextResponse.json(SAMPLE_DEMO_JOB);
  }

  try {
    // Query real job from DB
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, id),
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Query milestones ordered by position
    const jobMilestones = await db
      .select()
      .from(milestones)
      .where(eq(milestones.jobId, id))
      .orderBy(asc(milestones.position));

    // Try to get freelancer email
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

    return NextResponse.json({
      job: {
        ...job,
        freelancerPayPalEmail,
        totalAmount: job.totalAmount,
      },
      milestones: jobMilestones.map((m) => ({
        ...m,
        acceptanceCriteria: Array.isArray(m.acceptanceCriteria)
          ? m.acceptanceCriteria
          : JSON.parse((m.acceptanceCriteria as string) || '[]'),
      })),
    });
  } catch (error: any) {
    console.error('GET /api/jobs/[id] error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch job details' },
      { status: 500 }
    );
  }
}
