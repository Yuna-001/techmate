import { TagList } from '@/components/common/tag-list';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type QuestionDetailSectionProps = {
  question: string;
  tags: string[];
  idealAnswer: string;
};

export function QuestionDetailSection({
  question,
  tags,
  idealAnswer,
}: QuestionDetailSectionProps) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center sm:gap-4 gap-3">
        <div className="font-semibold text-4xl">Q.</div>
        <h1 className="text-base break-keep">{question}</h1>
      </div>
      <TagList tags={tags} />
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <div className="flex items-center justify-start">
            <AccordionTrigger className="px-2 py-2.5 cursor-pointer hover:no-underline gap-2 -ml-1">
              모범 답변
            </AccordionTrigger>
          </div>
          <AccordionContent className="rounded-md p-4 bg-gray-200 dark:bg-gray-700">
            {idealAnswer}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
