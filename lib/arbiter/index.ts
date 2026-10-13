import { z } from 'zod';

export const CriterionResultSchema = z.object({
  criterionId: z.string().describe('Unique identifier of the criterion'),
  criterionDescription: z.string().describe('Exact description of criterion being verified'),
  status: z.enum(['pass', 'fail']).describe('Pass or fail verdict for this specific criterion'),
  reasoning: z.string().describe('Concise technical reasoning justifying the verdict'),
  quotedEvidence: z.string().describe('Direct citation, code excerpt, or excerpt from deliverable supporting verdict'),
});

export const ArbiterVerdictSchema = z.object({
  overallResult: z.enum(['pass', 'partial', 'fail']).describe(
    'Overall verdict: pass (all criteria met), partial (some met, recoverable), fail (unacceptable or mostly unmet)'
  ),
  confidence: z.number().min(0.0).max(1.0).describe(
    'Confidence score between 0.0 and 1.0 based on clarity and completeness of evidence'
  ),
  summary: z.string().describe('High-level executive summary of arbitration findings'),
  criteriaResults: z.array(CriterionResultSchema).describe('Individual evaluation per criterion'),
  fixList: z.array(z.string()).describe(
    'Actionable, specific bullet-point checklist for freelancer if overallResult is partial or fail. Empty array if pass.'
  ),
  modelUsed: z.string().describe('Identifier of model that produced verdict'),
  promptVersion: z.string().describe('Version of prompt executed'),
});

export type CriterionResult = z.infer<typeof CriterionResultSchema>;
export type ArbiterVerdict = z.infer<typeof ArbiterVerdictSchema>;

export const ARBITER_MODEL = process.env.ARBITER_MODEL || 'claude-3-5-sonnet-latest';
export const PROMPT_VERSION = 'v1.0.0';

export interface MilestoneContext {
  id: string;
  title: string;
  description: string;
  amount: string;
  criteria: Array<{ id: string; description: string }>;
}

export interface DeliverableSubmission {
  submissionType: 'github_repo' | 'file_upload' | 'text';
  content?: string;
  githubRepoUrl?: string;
  fileUrl?: string;
  filesInspected?: Array<{ path: string; content: string }>;
}

export function buildArbiterSystemPrompt(): string {
  return `You are ArbiterPay's neutral AI Escrow Arbiter.
Your duty is to impartially, objectively evaluate deliverables submitted by a freelancer against the agreed milestone acceptance criteria defined by the client.

NON-NEGOTIABLE PRINCIPLES:
1. The AI never moves money. You return a structured, evidence-backed evaluation verdict.
2. Evaluate strictly against checkable deliverables (code logic, tests, verifiable checklist items, concrete documentation). Do not reward or penalize based on subjective aesthetics.
3. Every verdict requires:
   - status ('pass' | 'fail') per criterion.
   - exact quotedEvidence from the deliverable demonstrating compliance or failure.
   - clear reasoning.
4. If overallResult is 'partial' or 'fail', provide a specific, actionable fixList so the freelancer can fix and resubmit. If 'pass', fixList must be empty.
5. Provide a calibrated confidence score (0.0 to 1.0). If deliverable files are incomplete, missing, or ambiguous, reflect lower confidence.
6. You MUST respond with ONLY valid JSON adhering strictly to the requested schema. No markdown wrapping, no introductory or concluding prose.`;
}

export function buildArbiterUserPrompt(
  milestone: MilestoneContext,
  deliverable: DeliverableSubmission
): string {
  const criteriaText = milestone.criteria
    .map((c, i) => `${i + 1}. [ID: ${c.id}] ${c.description}`)
    .join('\n');

  let deliverableDetails = `Type: ${deliverable.submissionType}\n`;
  if (deliverable.githubRepoUrl) deliverableDetails += `Repo: ${deliverable.githubRepoUrl}\n`;
  if (deliverable.content) deliverableDetails += `Summary / Note:\n${deliverable.content}\n`;
  if (deliverable.filesInspected && deliverable.filesInspected.length > 0) {
    deliverableDetails += `\nInspected Files:\n` +
      deliverable.filesInspected
        .map((f) => `--- File: ${f.path} ---\n${f.content}\n--- End File ---`)
        .join('\n\n');
  }

  return `MILESTONE UNDER REVIEW:
Title: ${milestone.title}
Amount: $${milestone.amount}
Description: ${milestone.description}

ACCEPTANCE CRITERIA:
${criteriaText}

SUBMITTED DELIVERABLE:
${deliverableDetails}

Return JSON with keys:
{
  "overallResult": "pass" | "partial" | "fail",
  "confidence": number between 0.0 and 1.0,
  "summary": string,
  "criteriaResults": [
    {
      "criterionId": string,
      "criterionDescription": string,
      "status": "pass" | "fail",
      "reasoning": string,
      "quotedEvidence": string
    }
  ],
  "fixList": string[],
  "modelUsed": "${ARBITER_MODEL}",
  "promptVersion": "${PROMPT_VERSION}"
}`;
}

/**
 * Execute Arbiter Evaluation via Claude API (or mock evaluator when API key is pending).
 */
export async function evaluateDeliverable(
  milestone: MilestoneContext,
  deliverable: DeliverableSubmission
): Promise<ArbiterVerdict> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('ANTHROPIC_API_KEY is not set in environment');
  }

  const systemPrompt = buildArbiterSystemPrompt();
  const userPrompt = buildArbiterUserPrompt(milestone, deliverable);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: ARBITER_MODEL,
      max_tokens: 2048,
      temperature: 0.1,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Claude API error (${response.status}): ${errorBody}`);
  }

  const result = await response.json();
  const textContent = result.content?.[0]?.text;

  if (!textContent) {
    throw new Error('No text returned in Claude response');
  }

  // Strip potential backticks
  const cleanedJson = textContent.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
  const parsed = JSON.parse(cleanedJson);

  // Validate with Zod schema
  return ArbiterVerdictSchema.parse(parsed);
}
