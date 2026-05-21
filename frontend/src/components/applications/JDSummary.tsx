import type { JDSummary as JDSummaryType } from '../../types';

interface Props {
  summary: JDSummaryType;
  compact?: boolean;
}

export default function JDSummary({ summary, compact }: Props) {
  if (compact) {
    return (
      <div className="space-y-1">
        {summary.tech_stack?.slice(0, 4).map((t, i) => (
          <span key={i} className="inline-block mr-1 px-1.5 py-0.5 bg-[#6c63ff]/15 text-[#6c63ff] text-xs rounded">
            {t}
          </span>
        ))}
        {(summary.tech_stack?.length ?? 0) > 4 && (
          <span className="text-xs text-[#8b90a7]">+{summary.tech_stack.length - 4} more</span>
        )}
      </div>
    );
  }

  const sections = [
    { title: 'Required Skills', items: summary.required_skills },
    { title: 'Nice to Have', items: summary.nice_to_have },
    { title: 'Tech Stack', items: summary.tech_stack },
    { title: 'Responsibilities', items: summary.responsibilities },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-sm">
        <span className="text-[#8b90a7]">Experience: <span className="text-white">{summary.experience_required}</span></span>
        <span className="text-[#8b90a7]">Location: <span className="text-white">{summary.work_location}</span></span>
      </div>
      {sections.map(({ title, items }) =>
        items?.length > 0 ? (
          <div key={title}>
            <h4 className="text-xs font-semibold text-[#8b90a7] uppercase tracking-wider mb-2">{title}</h4>
            <ul className="space-y-1">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#e8eaf0]">
                  <span className="text-[#6c63ff] mt-1 shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null
      )}
    </div>
  );
}
