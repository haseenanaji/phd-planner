import Link from 'next/link'

const features = [
  { icon: '📄', title: 'Paper Pipeline', desc: 'Track every paper from idea to published with a visual Kanban board.' },
  { icon: '📚', title: 'Literature Tracker', desc: 'Manage your reading list, add notes, and never lose a reference again.' },
  { icon: '🧪', title: 'Experiment Log', desc: 'Record hypotheses, methods, and outcomes for every experiment.' },
  { icon: '⏰', title: 'Deadline Tracker', desc: 'Never miss a conference or grant deadline with countdown alerts.' },
  { icon: '🤝', title: 'Advisor Hub', desc: 'Prep agendas, log meeting notes, and track action items with ease.' },
  { icon: '💡', title: 'Idea Backburner', desc: 'Capture stray research ideas instantly before they disappear.' },
  { icon: '🏆', title: 'Win Log', desc: 'Track wins and rejections to stay motivated through the PhD journey.' },
  { icon: '🤖', title: 'AI Assistant', desc: 'Claude AI summarises papers, drafts advisor emails, and builds hypotheses.' },
]

const testimonials = [
  { name: 'Priya S.', field: 'Computer Science PhD', text: 'I stopped using 5 different tools. This replaced all of them.' },
  { name: 'Marcus T.', field: 'Biomedical PhD', text: "The deadline tracker alone is worth it. I haven't missed a submission since." },
  { name: 'Aisha K.', field: 'Social Sciences PhD', text: 'The win log changed how I think about my progress. Game changer.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* Nav */}
      <nav className="border-b border-slate-800/50 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          <span className="font-bold text-lg text-white">PhDPlanner</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-slate-400 hover:text-white text-sm transition-colors">Log in</Link>
          <Link href="/signup" className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
            Get started — it&apos;s free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-amber-400 text-sm mb-8">
          <span>✨</span> 100% free for all PhD students
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
          The planner every<br />
          <span className="text-amber-400">PhD student needs</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
          Stop juggling Notion, spreadsheets, and sticky notes. PhDPlanner brings your papers,
          experiments, deadlines, and advisor meetings into one focused workspace — with AI to help you move faster.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-4 rounded-xl text-lg transition-colors">
            Start free — no credit card ever
          </Link>
          <Link href="#features" className="border border-slate-700 hover:border-slate-500 text-slate-300 px-8 py-4 rounded-xl text-lg transition-colors">
            See all features
          </Link>
        </div>
        <p className="text-slate-500 text-sm mt-4">Free forever · All features included · No limits</p>
      </section>

      {/* Social proof numbers */}
      <section className="border-y border-slate-800/50 py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          {[
            { value: '100%', label: 'Free, always' },
            { value: '8', label: 'Modules included' },
            { value: '∞', label: 'No limits' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-amber-400">{s.value}</div>
              <div className="text-slate-500 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white mb-4">Everything in one place</h2>
          <p className="text-slate-400 text-lg">8 purpose-built modules for every stage of your PhD — all free</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div key={f.title} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-amber-500/30 transition-colors">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-amber-500/10 to-slate-900 border border-amber-500/20 rounded-3xl p-10 flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1">
            <div className="text-amber-400 text-sm font-semibold mb-3 uppercase tracking-wider">AI Powered · Free</div>
            <h2 className="text-3xl font-bold text-white mb-4">Your AI research assistant</h2>
            <p className="text-slate-400 mb-6">Powered by Claude (Anthropic), the AI layer helps you work smarter — available to every user, free.</p>
            <ul className="space-y-3">
              {[
                '📄 Paste an abstract → get a concise summary',
                "✉️ Dump your week's notes → get a polished advisor email",
                '🧪 Describe a vague idea → get a testable hypothesis',
                '📅 Enter a milestone → get realistic deadline suggestions',
              ].map((item) => (
                <li key={item} className="text-slate-300 text-sm">{item}</li>
              ))}
            </ul>
          </div>
          <div className="flex-1 bg-slate-900 rounded-2xl p-6 border border-slate-800 font-mono text-sm w-full">
            <div className="text-slate-500 mb-2">// AI Assist</div>
            <div className="text-amber-400">You:</div>
            <div className="text-slate-300 mb-3 ml-2">&ldquo;Summarise this paper abstract...&rdquo;</div>
            <div className="text-emerald-400">Claude:</div>
            <div className="text-slate-300 ml-2 leading-relaxed">&ldquo;This paper proposes a novel approach to transformer attention that reduces complexity from O(n²) to O(n log n) while maintaining accuracy...&rdquo;</div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Loved by PhD students</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-300 mb-4 italic">&ldquo;{t.text}&rdquo;</p>
              <div className="font-semibold text-white">{t.name}</div>
              <div className="text-slate-500 text-sm">{t.field}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Ready to take control of your PhD?</h2>
        <p className="text-slate-400 mb-8">Join researchers who replaced chaos with clarity. Free, forever.</p>
        <Link href="/signup" className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-bold px-10 py-4 rounded-xl text-lg transition-colors">
          Get started free →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>© 2026 PhDPlanner · Free for all researchers · Powered by Claude AI</p>
      </footer>
    </div>
  )
}
