import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const HAIKU_MODEL = 'claude-haiku-4-5-20251001'
export const SONNET_MODEL = 'claude-sonnet-4-6'

export async function summarizePaper(abstract: string): Promise<string> {
  const message = await client.messages.create({
    model: HAIKU_MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a research assistant helping a PhD student analyze academic papers.

Please analyze this abstract and provide a structured summary with:
1. **Key Contributions** (2-3 bullet points)
2. **Research Gaps Addressed** (1-2 bullet points)
3. **Relevance to PhD Work** (1 paragraph assessment)
4. **Methodology** (brief description)

Abstract:
${abstract}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type === 'text') {
    return content.text
  }
  throw new Error('Unexpected response type')
}

export async function draftAdvisorUpdate(notes: string): Promise<string> {
  const message = await client.messages.create({
    model: SONNET_MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `You are helping a PhD student write a professional weekly progress update for their advisor.

Based on these raw notes, draft a polished weekly progress summary that includes:
1. **This Week's Accomplishments** (bullet points)
2. **Challenges & Blockers** (if any)
3. **Next Week's Plan** (bullet points)
4. **Questions for Advisor** (if applicable)

Keep the tone professional but conversational. Be specific and concrete.

Raw notes from the student:
${notes}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type === 'text') {
    return content.text
  }
  throw new Error('Unexpected response type')
}

export async function buildHypothesis(idea: string): Promise<string> {
  const message = await client.messages.create({
    model: HAIKU_MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a research methodology expert helping a PhD student develop testable hypotheses from vague ideas.

Transform this research idea into a rigorous, testable hypothesis with:
1. **Refined Hypothesis Statement** (clear If/Then or formal hypothesis format)
2. **Independent Variables** (what you manipulate)
3. **Dependent Variables** (what you measure)
4. **Control Variables** (what you hold constant)
5. **Suggested Experimental Design** (brief methodology)
6. **Success Metrics** (how you'll know if the hypothesis is supported)
7. **Potential Confounds** (risks to validity)

Vague idea:
${idea}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type === 'text') {
    return content.text
  }
  throw new Error('Unexpected response type')
}

export async function suggestDeadline(milestone: string, context: string): Promise<string> {
  const today = new Date().toISOString().split('T')[0]
  const message = await client.messages.create({
    model: HAIKU_MODEL,
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `You are a PhD project planning expert. Today is ${today}.

Based on this milestone type and context, suggest a realistic deadline and project timeline with:
1. **Recommended Deadline** (specific date)
2. **Rationale** (why this timeline is realistic)
3. **Key Milestones** (intermediate checkpoints leading to the deadline)
4. **Risk Factors** (what could cause delays)

Milestone: ${milestone}
Additional context: ${context}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type === 'text') {
    return content.text
  }
  throw new Error('Unexpected response type')
}

export { client as anthropic }
