import { NextResponse } from 'next/server';
import { db } from '@/db';
import { jobs, milestones, users } from '@/db/schema';
import { recordLedgerEvent } from '@/lib/ledger';
import { saveInMemoryJob, getAllInMemoryJobs } from '@/lib/jobsStore';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';

export async function GET() {
  try {
    const allJobs = await db.query.jobs.findMany({
      orderBy: [desc(jobs.createdAt)],
    });

    if (allJobs && allJobs.length > 0) {
      return NextResponse.json({ success: true, jobs: allJobs });
    }
  } catch (error: any) {
    console.warn('DB query error, checking in-memory fallback:', error.message);
  }

  // Fallback to in-memory store + demo job
  const memoryJobs = getAllInMemoryJobs();
  if (memoryJobs.length > 0) {
    return NextResponse.json({ success: true, jobs: memoryJobs });
  }

  return NextResponse.json({
    success: true,
    jobs: [
      {
        id: 'sample-demo-job',
        title: 'Production Microservice & Automated CI Pipeline',
        description: 'Deliver a TypeScript microservice with Docker containerization, test coverage, and OpenAPI spec.',
        status: 'draft',
        totalAmount: '150.00',
        currency: 'USD',
        createdAt: new Date().toISOString(),
      },
    ],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      clientEmail,
      freelancerEmail,
      freelancerPayPalEmail,
      milestones: inputMilestones,
    } = body;

    if (!title || !description || !inputMilestones || inputMilestones.length < 2) {
      return NextResponse.json(
        { error: 'A job must have a title, description, and at least 2 milestones.' },
        { status: 400 }
      );
    }

    const targetClientEmail = clientEmail || 'sb-bhnlh53339270@business.example.com';
    const targetFreelancerEmail =
      freelancerPayPalEmail || freelancerEmail || 'sb-okeek53339723@personal.example.com';

    // Normalize milestones
    const normalizedMilestones = inputMilestones.map((m: any, idx: number) => {
      // Normalize criteria to array of string descriptions
      let criteriaList: string[] = [];
      if (Array.isArray(m.criteria)) {
        criteriaList = m.criteria.map((c: any) =>
          typeof c === 'string' ? c : c?.description || String(c)
        );
      } else if (Array.isArray(m.acceptanceCriteria)) {
        criteriaList = m.acceptanceCriteria.map((c: any) =>
          typeof c === 'string' ? c : c?.description || String(c)
        );
      }

      if (criteriaList.length === 0) {
        criteriaList = ['Verify deliverable meets requirements and tests pass.'];
      }

      return {
        title: m.title || `Milestone ${idx + 1}`,
        description: m.description || m.title || `Milestone ${idx + 1} deliverable`,
        amount: parseFloat(m.amount || '0').toFixed(2),
        position: idx + 1,
        criteria: criteriaList,
      };
    });

    // Calculate total amount
    const totalAmount = normalizedMilestones
      .reduce((sum: number, m: any) => sum + parseFloat(m.amount || '0'), 0)
      .toFixed(2);

    // Generate fallback UUID-compatible IDs
    const fallbackJobId = crypto.randomUUID();
    const memoryMilestones = normalizedMilestones.map((m: any, i: number) => ({
      id: crypto.randomUUID(),
      jobId: fallbackJobId,
      title: m.title,
      description: m.description,
      amount: m.amount,
      position: i + 1,
      status: 'pending',
      acceptanceCriteria: m.criteria,
    }));

    const memoryJob = {
      id: fallbackJobId,
      title,
      description,
      totalAmount,
      currency: 'USD',
      status: 'draft',
      clientEmail: targetClientEmail,
      freelancerPayPalEmail: targetFreelancerEmail,
      createdAt: new Date().toISOString(),
      milestones: memoryMilestones,
    };

    // Store in memory first so it's guaranteed reachable immediately
    saveInMemoryJob(memoryJob);

    // Try to persist to PostgreSQL if available
    try {
      let clientId: string;
      let freelancerId: string | undefined;

      const existingClient = await db.query.users.findFirst({
        where: eq(users.email, targetClientEmail),
      });

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const [newClient] = await db
          .insert(users)
          .values({
            email: targetClientEmail,
            name: 'Demo Client',
            role: 'client',
            paypalEmail: targetClientEmail,
          })
          .returning();
        clientId = newClient.id;
      }

      const existingFreelancer = await db.query.users.findFirst({
        where: eq(users.email, targetFreelancerEmail),
      });

      if (existingFreelancer) {
        freelancerId = existingFreelancer.id;
      } else {
        const [newFreelancer] = await db
          .insert(users)
          .values({
            email: targetFreelancerEmail,
            name: 'Demo Freelancer',
            role: 'freelancer',
            paypalEmail: targetFreelancerEmail,
          })
          .returning();
        freelancerId = newFreelancer.id;
      }

      // Create Job
      const [newJob] = await db
        .insert(jobs)
        .values({
          id: fallbackJobId,
          clientId,
          freelancerId,
          title,
          description,
          totalAmount,
          currency: 'USD',
          status: 'draft',
        })
        .returning();

      // Create Milestones
      const createdMilestones = [];
      for (const m of memoryMilestones) {
        const [createdM] = await db
          .insert(milestones)
          .values({
            id: m.id,
            jobId: newJob.id,
            title: m.title,
            description: m.description,
            amount: m.amount,
            position: m.position,
            acceptanceCriteria: m.acceptanceCriteria,
            status: 'pending',
          })
          .returning();
        createdMilestones.push(createdM);
      }

      // Record to Ledger
      await recordLedgerEvent({
        jobId: newJob.id,
        eventType: 'JOB_CREATED',
        actorType: 'client',
        actorId: clientId,
        details: {
          title,
          totalAmount,
          milestonesCount: createdMilestones.length,
          freelancerEmail: targetFreelancerEmail,
        },
      });

      return NextResponse.json({
        success: true,
        job: {
          ...newJob,
          freelancerPayPalEmail: targetFreelancerEmail,
        },
        milestones: createdMilestones,
      });
    } catch (dbErr: any) {
      console.warn('DB write bypassed, using memory store job:', dbErr.message);
      // Return memory job
      return NextResponse.json({
        success: true,
        job: memoryJob,
        milestones: memoryMilestones,
      });
    }
  } catch (error: any) {
    console.error('Job creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
