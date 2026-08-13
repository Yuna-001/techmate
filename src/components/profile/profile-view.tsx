import { TagList } from '@/components/common/tag-list';
import { Button } from '@/components/ui/button';
import type { ProfileResponse } from '@/types/profile';
import Link from 'next/link';

type ProfileViewProps = {
  profile: ProfileResponse;
};

export function ProfileView({ profile }: ProfileViewProps) {
  const { position, experience, skills } = profile;
  const viewLabelClass =
    'flex items-center gap-2 text-sm leading-none font-medium select-none break-keep';

  const emptyText = (
    <span className="text-sm text-muted-foreground">
      아직 설정되지 않았습니다.
    </span>
  );

  return (
    <div className="flex flex-col gap-5">
      <dl className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <dt className={viewLabelClass}>직무</dt>
          <dd className="h-9 flex items-center md:text-sm text-base">
            {position ?? emptyText}
          </dd>
        </div>
        <div className="flex flex-col gap-2">
          <dt className={viewLabelClass}>경력</dt>
          <dd className="h-9 flex items-center md:text-sm text-base">
            {experience === null ? emptyText : `${experience}년`}
          </dd>
        </div>
        <div className="flex flex-col gap-2">
          <dt className={viewLabelClass}>기술 스택</dt>
          <dd className="space-y-2 mt-2">
            {skills.length > 0 ? <TagList tags={skills} /> : emptyText}
          </dd>
        </div>
      </dl>
      <Button asChild className="w-full mt-5">
        <Link href="/setting/profile/edit">수정</Link>
      </Button>
    </div>
  );
}
