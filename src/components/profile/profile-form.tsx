'use client';

import { LoadingButton } from '@/components/common/loading-button';
import { TagList } from '@/components/common/tag-list';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MAX_EXPERIENCE } from '@/lib/constants/profile';
import { clientFetch } from '@/lib/fetch/client';
import type { ProfileResponse } from '@/types/profile';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

type FormErrors = {
  position?: string;
  experience?: string;
};

type ProfileFormProps = {
  initialProfile: ProfileResponse;
};

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [skillInput, setSkillInput] = useState<string>('');
  const [skills, setSkills] = useState<string[]>(initialProfile.skills);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const router = useRouter();

  const errorInputClass = 'border-destructive focus-visible:ring-destructive';

  const handleSkillInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key !== 'Enter' && e.key !== ',') return;

    const newTag = skillInput.trim();

    if (!newTag) return;
    e.preventDefault();

    if (!skills.includes(newTag)) {
      setSkills([...skills, newTag]);
    }

    setSkillInput('');
  };

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();

    if (isSubmitting) return;

    const newErrors: FormErrors = {};

    const fd = new FormData(event.target as HTMLFormElement);

    const position = (fd.get('position') ?? '').toString().trim();

    if (!position) {
      newErrors.position = '직무를 입력해주세요.';
    }

    const rawExperience = fd.get('experience');

    let experience: number | null = null;

    if (typeof rawExperience === 'string' && rawExperience.trim() !== '') {
      const n = Number(rawExperience);

      if (!Number.isInteger(n) || n < 0 || n > MAX_EXPERIENCE) {
        newErrors.experience = `경력은 0~${MAX_EXPERIENCE} 사이의 정수를 입력해주세요.`;
      } else {
        experience = n;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    let navigated = false;

    try {
      const result = await clientFetch('/api/me/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position, experience, skills }),
        expectNoContent: true,
      });

      if (result.ok) {
        navigated = true;
        router.push('/setting/profile');
        return;
      }

      const serverErrors: FormErrors = {};

      if (result.message.includes('직무')) {
        serverErrors.position = result.message;
      }
      if (result.message.includes('경력')) {
        serverErrors.experience = result.message;
      }

      if (Object.keys(serverErrors).length === 0) {
        toast.error('프로필 저장에 실패했습니다.', {
          description: '잠시 후 다시 시도해주세요.',
        });
        return;
      }

      setErrors(serverErrors);
    } catch {
      toast.error('네트워크 오류가 발생했습니다.', {
        description: '인터넷 연결을 확인한 후 다시 시도해주세요.',
      });
    } finally {
      // 리다이렉트 시 버튼 깜빡임 방지용 조건
      if (!navigated) setIsSubmitting(false);
    }
  };

  const handleRemoveSkill = (index: number) => {
    setSkills((prevSkills) => prevSkills.filter((_, i) => i !== index));
  };

  const clearError = (key: keyof FormErrors) => {
    setErrors((prev) => {
      if (prev[key] === undefined) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="position" className="break-keep">
          직무 (필수)
        </Label>
        <Input
          id="position"
          name="position"
          type="text"
          defaultValue={initialProfile.position ?? ''}
          aria-invalid={!!errors.position}
          className={errors.position ? errorInputClass : ''}
          onChange={() => clearError('position')}
          placeholder="ex) 프론트엔드 개발자"
        />
        <InputErrorText message={errors.position} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="experience" className="break-keep">
          경력 (선택)
        </Label>
        <div className="relative">
          <Input
            id="experience"
            name="experience"
            type="number"
            className={`no-spinner ${errors.experience ? errorInputClass : ''}`}
            aria-invalid={!!errors.experience}
            defaultValue={initialProfile.experience ?? undefined}
            onChange={() => clearError('experience')}
            onWheel={(e) => e.currentTarget.blur()}
            min={0}
            max={MAX_EXPERIENCE}
            step={1}
            placeholder="ex) 0, 1, 2 ..."
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            년
          </span>
        </div>
        <InputErrorText message={errors.experience} />
      </div>
      <div className="flex flex-col gap-2 mb-4">
        <Label htmlFor="skills" className="break-keep">
          기술 스택 (선택)
        </Label>
        <Input
          type="text"
          name="skills"
          value={skillInput}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSkillInput(e.target.value)
          }
          onKeyDown={handleSkillInputKeyDown}
          placeholder="기술 스택을 입력 후 Enter"
          id="skills"
        />
        <div className="space-y-2 pt-1">
          <TagList tags={skills} onRemove={handleRemoveSkill} />
        </div>
      </div>
      <LoadingButton
        className="w-full mt-5"
        isLoading={isSubmitting}
        loadingText="저장 중..."
      >
        저장
      </LoadingButton>
    </form>
  );
}

function InputErrorText({ message }: { message?: string }) {
  return (
    <p
      role="alert"
      className={`text-[0.7rem] text-destructive min-h-4 ${
        message ? 'visible' : 'invisible'
      }`}
    >
      {message ?? ' '}
    </p>
  );
}
