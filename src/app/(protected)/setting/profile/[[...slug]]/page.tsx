import { RetryButton } from '@/components/common/retry-button';
import { ProfileForm } from '@/components/profile/profile-form';
import { ProfileView } from '@/components/profile/profile-view';
import { serverFetch } from '@/lib/fetch/server';
import type { ProfileResponse } from '@/types/profile';
import { notFound } from 'next/navigation';

type ProfilePageProps = {
  params: Promise<{ slug?: string[] }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;

  const result = await serverFetch<ProfileResponse>('/api/me/profile', {
    cache: 'no-store',
  });

  if (!result.ok) {
    return (
      <div className="my-10">
        <RetryButton
          title="프로필을 가져오는 데 실패했습니다."
          description="잠시 후 다시 시도해주세요."
        />
      </div>
    );
  }

  const profile = result.data;

  if (!slug) {
    return <ProfileView profile={profile} />;
  }

  if (slug[0] === 'edit') {
    return <ProfileForm initialProfile={profile} />;
  }

  notFound();
}
