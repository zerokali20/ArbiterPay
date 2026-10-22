import { NextResponse } from 'next/server';
import { db } from '@/db';
import { jobs, milestones, users } from '@/db/schema';
import { getInMemoryJob, saveInMemoryJob } from '@/lib/jobsStore';
import { eq, asc } from 'drizzle-orm';

// Static demo data returned when id === 'sample-demo-job'
const SAMPLE_DEMO_JOB = {
  job: {
    id: 'sample-demo-job',
    title: 'Python Web Scraper: URL → CSV of H1 Tags',
    description:
      'Write a Python script that accepts a URL as a command-line argument, fetches the page HTML, extracts all H1 tags, and outputs them as a CSV file (h1_tags.csv). Script must handle invalid URLs and network errors gracefully.',
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
      title: 'Milestone 1: Core Scraper — URL Input & H1 Extraction',
      description:
        'Script accepts a URL via sys.argv, fetches HTML with requests, parses it with BeautifulSoup, and extracts all H1 tags.',
      amount: '75.00',
      position: 1,
      status: 'pending',
      acceptanceCriteria: [
        'Script accepts a URL as a command-line argument (sys.argv or argparse)',
        'Script fetches the URL using the requests library (or httpx/urllib)',
        'Script parses the HTML and extracts all H1 tags using BeautifulSoup (bs4)',
        'Script outputs a valid CSV file (h1_tags.csv) with DictWriter or csv.writer',
        'Script handles errors gracefully: invalid URLs, HTTP errors, and network failures',
      ],
    },
    {
      id: 'ms-02',
      title: 'Milestone 2: Output Quality & Edge Cases',
      description:
        'CSV output is correctly formatted, empty H1 lists are handled, and the script exits with a non-zero code on fatal errors.',
      amount: '75.00',
      position: 2,
      status: 'pending',
      acceptanceCriteria: [
        'CSV header row present (e.g., "index,h1_text" or similar)',
        'Handles pages with zero H1 tags without crashing',
        'Script exits with sys.exit(1) on fatal errors and prints a clear message to stderr',
        'requirements.txt or inline comments listing dependencies (requests, beautifulsoup4)',
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
