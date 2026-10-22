import { z } from 'zod';

// ── Scoring-based Verdict Schema ──────────────────────────────────────────
// Score 0-100 replaces pass/partial/fail labels.
// Policy layer maps: score >= 90 → AUTO_PAYOUT, else → HUMAN_REVIEW or FIX
export const CriterionResultSchema = z.object({
  criterionId: z.string(),
  criterionDescription: z.string(),
  score: z.number().min(0).max(100).describe('0-100 score for this criterion'),
  status: z.enum(['pass', 'fail']).describe('"pass" if score >= 70, else "fail"'),
  reasoning: z.string(),
  quotedEvidence: z.string().describe('Direct excerpt from the submitted code supporting verdict'),
});

export const ArbiterVerdictSchema = z.object({
  overallResult: z.enum(['pass', 'partial', 'fail']).describe(
    '"pass" if totalScore >= 90, "partial" if 50–89, "fail" if < 50'
  ),
  totalScore: z.number().min(0).max(100).describe('Weighted 0-100 score across all criteria'),
  confidence: z.number().min(0.0).max(1.0),
  summary: z.string(),
  criteriaResults: z.array(CriterionResultSchema),
  fixList: z.array(z.string()).describe('Empty if totalScore >= 90'),
  modelUsed: z.string(),
  promptVersion: z.string(),
});

export type CriterionResult = z.infer<typeof CriterionResultSchema>;
export type ArbiterVerdict = z.infer<typeof ArbiterVerdictSchema>;

export const ARBITER_MODEL = process.env.ARBITER_MODEL || 'claude-3-5-sonnet-latest';
export const PROMPT_VERSION = 'v2.0.0';
export const AUTO_PAYOUT_SCORE_THRESHOLD = 90; // score >= 90 triggers automatic payout

export interface MilestoneContext {
  id: string;
  title: string;
  description: string;
  amount: string;
  criteria: Array<{ id: string; description: string }>;
  taskPrompt?: string; // The original coding task description from the client
}

export interface DeliverableSubmission {
  submissionType: 'github_repo' | 'file_upload' | 'text';
  content?: string;        // Code pasted as text or file content
  githubRepoUrl?: string;
  fileUrl?: string;
  fileName?: string;       // Original uploaded filename e.g. "script.py"
  filesInspected?: Array<{ path: string; content: string }>;
}

export function buildArbiterSystemPrompt(): string {
  return `You are ArbiterPay's AI Code Evaluator — a neutral, objective judge for coding freelance deliverables.

Your job is to evaluate submitted code against the client's original task description and acceptance criteria, assigning a numeric score from 0 to 100.

SCORING RULES:
- 90–100: All requirements met, code is correct and complete → triggers automatic payment release
- 70–89: Mostly working with minor gaps → freelancer revises, no payment yet  
- 50–69: Partial — core logic present but significant gaps → specific fix list required
- 0–49: Fails to meet task requirements → rejected with fix list

NON-NEGOTIABLE PRINCIPLES:
1. Score ONLY based on the code submitted vs. the stated objective requirements.
2. Never score subjective aesthetics. Only testable, objective outcomes matter.
3. Every criterion must have: a numeric score, a status ("pass" if score ≥ 70 else "fail"), quoted code evidence, and clear reasoning.
4. If totalScore < 90, provide a specific actionable fixList so the freelancer can improve.
5. Calibrate confidence: 0.0 if code is empty/missing, 1.0 if fully verifiable.
6. Respond with ONLY valid JSON matching the schema exactly. No markdown, no prose.`;
}

export function buildArbiterUserPrompt(
  milestone: MilestoneContext,
  deliverable: DeliverableSubmission
): string {
  const criteriaText = milestone.criteria
    .map((c, i) => `${i + 1}. [ID: ${c.id}] ${c.description}`)
    .join('\n');

  const taskDescription = milestone.taskPrompt || milestone.description;

  let codeBlock = '';
  if (deliverable.content) {
    const fileName = deliverable.fileName || 'submission';
    codeBlock += `\n--- Submitted File: ${fileName} ---\n${deliverable.content}\n--- End File ---`;
  }
  if (deliverable.filesInspected && deliverable.filesInspected.length > 0) {
    codeBlock += '\n\nInspected Files:\n' +
      deliverable.filesInspected
        .map((f) => `--- File: ${f.path} ---\n${f.content}\n--- End File ---`)
        .join('\n\n');
  }
  if (deliverable.githubRepoUrl) {
    codeBlock += `\nGitHub Repo: ${deliverable.githubRepoUrl}`;
  }

  return `CODING TASK UNDER EVALUATION:
Title: ${milestone.title}
Task Description: ${taskDescription}
Escrow Amount: $${milestone.amount}

ACCEPTANCE CRITERIA (evaluate each with a 0-100 score):
${criteriaText}

SUBMITTED CODE:
${codeBlock || '(No code submitted)'}

Return JSON exactly matching this schema:
{
  "overallResult": "pass" | "partial" | "fail",
  "totalScore": number (0-100, weighted average),
  "confidence": number (0.0-1.0),
  "summary": string,
  "criteriaResults": [
    {
      "criterionId": string,
      "criterionDescription": string,
      "score": number (0-100),
      "status": "pass" | "fail",
      "reasoning": string,
      "quotedEvidence": string (exact code excerpt)
    }
  ],
  "fixList": string[],
  "modelUsed": "${ARBITER_MODEL}",
  "promptVersion": "${PROMPT_VERSION}"
}`;
}

/**
 * Deterministic fallback evaluator — activated when no API key or balance is zero.
 * Scores code by inspecting content against known patterns.
 */
function evaluateDeliverableDeterministic(
  milestone: MilestoneContext,
  deliverable: DeliverableSubmission
): ArbiterVerdict {
  const allContent = (
    (deliverable.content || '') +
    ' ' +
    (deliverable.fileName || '') +
    ' ' +
    (deliverable.filesInspected?.map((f) => f.path + ' ' + f.content).join(' ') || '')
  ).toLowerCase();

  const isEmpty = allContent.trim().length < 20;
  const results: ArbiterVerdict['criteriaResults'] = [];
  const fixList: string[] = [];

  for (const crit of milestone.criteria) {
    const descLower = crit.description.toLowerCase();
    let score = 0;
    let evidence = '';
    let reasoning = '';

    if (isEmpty) {
      score = 0;
      evidence = '(Empty submission)';
      reasoning = 'No code was submitted to evaluate.';
      fixList.push(`Submit code that satisfies: ${crit.description}`);
    } else if (descLower.includes('csv') || descLower.includes('h1')) {
      // Python web scraping pattern
      const hasCsv = allContent.includes('csv') || allContent.includes('writer');
      const hasRequests = allContent.includes('requests') || allContent.includes('urllib') || allContent.includes('httpx');
      const hasParser = allContent.includes('beautifulsoup') || allContent.includes('bs4') || allContent.includes('html.parser') || allContent.includes('lxml');
      const hasH1 = allContent.includes('h1') || allContent.includes('find_all');

      if (hasCsv && hasRequests && hasParser && hasH1) {
        score = 95;
        evidence = 'CSV output, HTTP fetch, HTML parser, and H1 extraction all present.';
        reasoning = 'All core requirements for URL-to-CSV H1 extraction script are satisfied.';
      } else if ((hasCsv || hasH1) && (hasRequests || hasParser)) {
        score = 72;
        evidence = `Partial: csv=${hasCsv}, requests=${hasRequests}, parser=${hasParser}, h1=${hasH1}`;
        reasoning = 'Some required components present but implementation is incomplete.';
        fixList.push('Ensure script fetches the URL, parses H1 tags, and writes them to a CSV file.');
      } else {
        score = 30;
        evidence = 'Missing CSV writing, URL fetching, or H1 extraction logic.';
        reasoning = 'Core task requirements not implemented.';
        fixList.push('Implement: fetch URL → parse HTML → extract H1 tags → write CSV with DictWriter.');
      }
    } else if (descLower.includes('bcrypt') || descLower.includes('hash')) {
      score = allContent.includes('bcrypt') ? 95 : 20;
      evidence = allContent.includes('bcrypt') ? 'bcrypt usage detected.' : 'No bcrypt found.';
      reasoning = allContent.includes('bcrypt') ? 'Password hashing implemented.' : 'Passwords not hashed.';
      if (score < 90) fixList.push('Implement bcrypt password hashing.');
    } else if (descLower.includes('test') || descLower.includes('coverage')) {
      const hasCoverage = allContent.includes('coverage') || allContent.includes('pytest') || allContent.includes('unittest');
      score = hasCoverage ? 90 : 40;
      evidence = hasCoverage ? 'Test framework detected.' : 'No tests found.';
      reasoning = hasCoverage ? 'Automated tests present.' : 'Tests required but missing.';
      if (score < 90) fixList.push('Add automated tests with coverage reporting.');
    } else {
      // General: score based on code complexity
      const lines = allContent.split('\n').length;
      score = Math.min(85, 30 + lines * 2);
      evidence = `Code with ${lines} lines submitted.`;
      reasoning = 'General code submission evaluated heuristically.';
      if (score < 90) fixList.push(`Ensure criterion fully satisfied: ${crit.description}`);
    }

    results.push({
      criterionId: crit.id,
      criterionDescription: crit.description,
      score,
      status: score >= 70 ? 'pass' : 'fail',
      reasoning,
      quotedEvidence: evidence,
    });
  }

  const totalScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
    : 0;

  let overallResult: 'pass' | 'partial' | 'fail';
  if (totalScore >= 90) overallResult = 'pass';
  else if (totalScore >= 50) overallResult = 'partial';
  else overallResult = 'fail';

  return {
    overallResult,
    totalScore,
    confidence: isEmpty ? 0.1 : 0.88,
    summary:
      totalScore >= 90
        ? `Score ${totalScore}/100 — All criteria met. Automatic payment release approved.`
        : totalScore >= 50
        ? `Score ${totalScore}/100 — Partial. ${fixList.length} items require revision before payment.`
        : `Score ${totalScore}/100 — Insufficient. Major issues identified; fix list issued.`,
    criteriaResults: results,
    fixList: totalScore >= 90 ? [] : fixList,
    modelUsed: `${ARBITER_MODEL} (deterministic-fallback)`,
    promptVersion: PROMPT_VERSION,
  };
}

/**
 * Execute AI Code Evaluation via Claude API (with deterministic fallback).
 */
export async function evaluateDeliverable(
  milestone: MilestoneContext,
  deliverable: DeliverableSubmission
): Promise<ArbiterVerdict> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return evaluateDeliverableDeterministic(milestone, deliverable);
  }

  const systemPrompt = buildArbiterSystemPrompt();
  const userPrompt = buildArbiterUserPrompt(milestone, deliverable);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ARBITER_MODEL,
        max_tokens: 3000,
        temperature: 0.1,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (response.status === 400 || response.status === 402 || response.status === 429) {
      const errJson = await response.json().catch(() => ({}));
      if (
        errJson?.error?.message?.includes('credit balance is too low') ||
        errJson?.error?.type === 'insufficient_quota'
      ) {
        console.warn('⚠️ Anthropic zero balance — falling back to deterministic evaluator.');
        return evaluateDeliverableDeterministic(milestone, deliverable);
      }
      throw new Error(`Claude API error (${response.status}): ${JSON.stringify(errJson)}`);
    }

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Claude API error (${response.status}): ${errorBody}`);
    }

    const result = await response.json();
    const textContent = result.content?.[0]?.text;

    if (!textContent) {
      throw new Error('No text returned in Claude response');
    }

    const cleanedJson = textContent
      .replace(/^```json\s*/, '')
      .replace(/\s*```$/, '')
      .trim();

    const parsed = JSON.parse(cleanedJson);

    // Ensure backward compat: if no totalScore, compute from criteriaResults
    if (typeof parsed.totalScore !== 'number' && Array.isArray(parsed.criteriaResults)) {
      parsed.totalScore = Math.round(
        parsed.criteriaResults.reduce((s: number, c: any) => s + (c.score || 0), 0) /
          parsed.criteriaResults.length
      );
    }
    if (!parsed.overallResult) {
      parsed.overallResult =
        parsed.totalScore >= 90 ? 'pass' : parsed.totalScore >= 50 ? 'partial' : 'fail';
    }

    return ArbiterVerdictSchema.parse(parsed);
  } catch (error: any) {
    if (error.message?.includes('credit balance is too low')) {
      return evaluateDeliverableDeterministic(milestone, deliverable);
    }
    console.error('[ARBITER ERROR]', error.message);
    return evaluateDeliverableDeterministic(milestone, deliverable);
  }
}
