import { TagList } from '@/components/common/tag-list';
import type { Feedback } from '@/models/answer';

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-500 dark:text-red-400';
};

export function FeedbackSection({ feedback }: { feedback: Feedback }) {
  const { score, summary, strengths, improvements, missingKeywords } = feedback;

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold uppercase tracking-wider">
        AI 피드백
      </h2>

      <div className="flex items-baseline gap-1">
        <span
          className={`font-inter text-5xl font-bold ${getScoreColor(score)}`}
        >
          {score}
        </span>
        <span className="text-sm text-muted-foreground">/ 100점</span>
      </div>

      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {summary}
      </p>

      {strengths.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-semibold">잘한 점</h3>
          <ul className="flex flex-col gap-1.5">
            {strengths.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
              >
                <span className="text-green-500">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {improvements.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-semibold">개선할 점</h3>
          <ul className="flex flex-col gap-1.5">
            {improvements.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
              >
                <span className="text-yellow-500">✦</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {missingKeywords.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">누락 키워드</h3>
          <TagList tags={missingKeywords} />
        </div>
      )}
    </section>
  );
}
