import { TagList } from '@/components/common/tag-list';
import type { Feedback } from '@/models/answer';

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

export function FeedbackSection({ feedback }: { feedback: Feedback }) {
  const { score, summary, strengths, improvements, missingKeywords } = feedback;

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold uppercase tracking-wider">
        AI 피드백
      </h2>

      <div className="flex items-baseline gap-1">
        <span className="sr-only">답변 점수: {score}점 / 100점</span>
        <span
          className={`text-5xl font-bold ${getScoreColor(score)}`}
          aria-hidden="true"
        >
          {score}
        </span>
        <span className="text-sm text-muted-foreground" aria-hidden="true">
          / 100점
        </span>
      </div>

      <p className="text-sm leading-relaxed text-foreground">{summary}</p>

      <FeedbackPointGroup
        title="잘한 점"
        items={strengths}
        marker="✓"
        markerClassName="text-green-500"
      />

      <FeedbackPointGroup
        title="개선할 점"
        items={improvements}
        marker="✦"
        markerClassName="text-yellow-500"
      />

      {missingKeywords.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-semibold">누락 키워드</h3>
          <TagList tags={missingKeywords} />
        </div>
      )}
    </section>
  );
}

type FeedbackPointGroupProps = {
  title: string;
  items: string[];
  marker: string;
  markerClassName: string;
};

function FeedbackPointGroup({
  title,
  items,
  marker,
  markerClassName,
}: FeedbackPointGroupProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-base font-semibold">{title}</h3>
      <ul className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-foreground"
          >
            <span className={markerClassName} aria-hidden="true">
              {marker}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
