import {
  pgTable,
  uuid,
  text,
  timestamp,
  decimal,
  integer,
  boolean,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';

// ─── Enums ───────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['client', 'freelancer', 'admin']);

export const jobStatusEnum = pgEnum('job_status', [
  'draft',
  'funded',
  'in_progress',
  'completed',
  'cancelled',
  'disputed',
]);

export const milestoneStatusEnum = pgEnum('milestone_status', [
  'pending',
  'in_progress',
  'submitted',
  'passed',
  'partial',
  'failed',
  'disputed',
  'paid',
]);

export const submissionTypeEnum = pgEnum('submission_type', [
  'github_repo',
  'file_upload',
  'text',
]);

export const verdictResultEnum = pgEnum('verdict_result', ['pass', 'partial', 'fail']);

export const actorTypeEnum = pgEnum('actor_type', [
  'client',
  'freelancer',
  'system',
  'arbiter',
  'admin',
]);

// ─── Tables ──────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull(),
  paypalEmail: text('paypal_email'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const jobs = pgTable('jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id')
    .references(() => users.id)
    .notNull(),
  freelancerId: uuid('freelancer_id').references(() => users.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: jobStatusEnum('status').notNull().default('draft'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('USD'),
  paypalOrderId: text('paypal_order_id'),
  paypalCaptureId: text('paypal_capture_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const milestones = pgTable('milestones', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobId: uuid('job_id')
    .references(() => jobs.id)
    .notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  acceptanceCriteria: jsonb('acceptance_criteria').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  position: integer('position').notNull(),
  status: milestoneStatusEnum('status').notNull().default('pending'),
  payoutBatchId: text('payout_batch_id'),
  payoutItemId: text('payout_item_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const submissions = pgTable('submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  milestoneId: uuid('milestone_id')
    .references(() => milestones.id)
    .notNull(),
  freelancerId: uuid('freelancer_id')
    .references(() => users.id)
    .notNull(),
  submissionType: submissionTypeEnum('submission_type').notNull(),
  content: text('content'),
  fileUrl: text('file_url'),
  githubRepoUrl: text('github_repo_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const verdicts = pgTable('verdicts', {
  id: uuid('id').defaultRandom().primaryKey(),
  submissionId: uuid('submission_id')
    .references(() => submissions.id)
    .notNull(),
  milestoneId: uuid('milestone_id')
    .references(() => milestones.id)
    .notNull(),
  overallResult: verdictResultEnum('overall_result').notNull(),
  confidence: decimal('confidence', { precision: 3, scale: 2 }).notNull(),
  criteriaResults: jsonb('criteria_results').notNull(),
  fixList: jsonb('fix_list'),
  modelUsed: text('model_used').notNull(),
  promptVersion: text('prompt_version').notNull(),
  rawResponse: jsonb('raw_response').notNull(),
  routedToHuman: boolean('routed_to_human').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const paymentEvents = pgTable('payment_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobId: uuid('job_id').references(() => jobs.id),
  milestoneId: uuid('milestone_id').references(() => milestones.id),
  eventType: text('event_type').notNull(),
  paypalEventId: text('paypal_event_id').notNull().unique(),
  paypalResourceId: text('paypal_resource_id'),
  status: text('status').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }),
  currency: text('currency').default('USD'),
  rawPayload: jsonb('raw_payload').notNull(),
  processed: boolean('processed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const ledger = pgTable('ledger', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobId: uuid('job_id').references(() => jobs.id),
  milestoneId: uuid('milestone_id').references(() => milestones.id),
  eventType: text('event_type').notNull(),
  actorType: actorTypeEnum('actor_type').notNull(),
  actorId: uuid('actor_id'),
  details: jsonb('details').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
