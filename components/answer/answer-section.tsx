type AnswerSectionProps = {
  answer: string;
};

export function AnswerSection({ answer }: AnswerSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold uppercase tracking-wider">
        내 답변
      </h2>

      <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
        {answer}
      </p>
    </section>
  );
}
