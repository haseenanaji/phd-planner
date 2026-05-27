import { NextRequest, NextResponse } from 'next/server'
import { summarizePaper, draftAdvisorUpdate, buildHypothesis, suggestDeadline } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, ...params } = body

    if (!action) {
      return NextResponse.json({ error: 'Missing action parameter' }, { status: 400 })
    }

    let result: string

    switch (action) {
      case 'summarize_paper': {
        if (!params.abstract) {
          return NextResponse.json({ error: 'Missing abstract' }, { status: 400 })
        }
        result = await summarizePaper(params.abstract)
        break
      }

      case 'draft_advisor_update': {
        if (!params.notes) {
          return NextResponse.json({ error: 'Missing notes' }, { status: 400 })
        }
        result = await draftAdvisorUpdate(params.notes)
        break
      }

      case 'build_hypothesis': {
        if (!params.idea) {
          return NextResponse.json({ error: 'Missing idea' }, { status: 400 })
        }
        result = await buildHypothesis(params.idea)
        break
      }

      case 'suggest_deadline': {
        if (!params.milestone) {
          return NextResponse.json({ error: 'Missing milestone' }, { status: 400 })
        }
        result = await suggestDeadline(params.milestone, params.context ?? '')
        break
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error('AI route error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
