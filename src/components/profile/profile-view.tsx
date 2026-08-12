import { TagList } from '@/components/common/tag-list';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { ProfileResponse } from '@/types/profile';
import Link from 'next/link';

type ProfileViewProps = {
  profile: ProfileResponse;
};

export function ProfileView({ profile }: ProfileViewProps) {
  const { position, experience, skills } = profile;

  const emptyText = (
    <span className="text-sm text-muted-foreground">
      아직 설정되지 않았습니다.
    </span>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label id="position-label">직무</Label>
        <div
          aria-labelledby="position-label"
          className="h-9 flex items-center md:text-sm text-base"
        >
          {position ?? emptyText}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label id="experience-label">경력</Label>
        <div
          aria-labelledby="experience-label"
          className="h-9 flex items-center md:text-sm text-base"
        >
          {experience === null ? emptyText : `${experience}년`}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label id="skills-label" className="break-keep">
          기술 스택
        </Label>
        <div aria-labelledby="skills-label" className="space-y-2 mt-2">
          {skills.length > 0 ? <TagList tags={skills} /> : emptyText}
        </div>
      </div>
      <Button asChild className="w-full mt-5">
        <Link href="/setting/profile/edit">수정</Link>
      </Button>
    </div>
  );
}
