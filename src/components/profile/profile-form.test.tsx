import { MAX_EXPERIENCE } from '@/lib/constants/profile';
import { clientFetch } from '@/lib/fetch/client';
import {
  type FetchErrorResult,
  type FetchNoContentSuccessResult,
} from '@/lib/fetch/core';
import { FAIL_500, SUCCESS_204 } from '@/test/fixtures/fetch';
import type { MockClientFetch } from '@/test/types';
import { createDeferred } from '@/test/utils/async';
import type { ProfileResponse } from '@/types/profile';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { ProfileForm } from './profile-form';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('sonner', () => ({
  toast: { error: jest.fn() },
}));

jest.mock('@/lib/fetch/client', () => ({
  clientFetch: jest.fn(),
}));

const mockClientFetch = clientFetch as unknown as MockClientFetch;

const POSITION_ERROR_TEXT = '직무를 입력해주세요.' as const;
const EXPERIENCE_ERROR_TEXT =
  `경력은 0~${MAX_EXPERIENCE} 사이의 정수를 입력해주세요.` as const;

const VALID_POSITION = '프론트엔드';

const makeProfile = (
  overrides: Partial<ProfileResponse> = {},
): ProfileResponse => ({
  position: null,
  experience: null,
  skills: [],
  ...overrides,
});

const emptyProfile = makeProfile();

const filledProfile = makeProfile({
  position: VALID_POSITION,
  experience: 3,
  skills: ['Next.js', 'TypeScript'],
});

const getPositionInput = () => screen.getByLabelText(/직무/);
const getExperienceInput = () => screen.getByLabelText(/경력/);
const getSkillInput = () => screen.getByLabelText(/기술 스택/);
const getSaveButton = (name: RegExp | string = /저장/) =>
  screen.getByRole('button', { name });

const typePosition = async (
  user: ReturnType<typeof userEvent.setup>,
  value = VALID_POSITION,
) => {
  await user.type(getPositionInput(), value);
};

const submitWithValidPosition = async (
  user: ReturnType<typeof userEvent.setup>,
) => {
  await typePosition(user);
  await user.click(getSaveButton());
};

const FAIL_POSITION_400 = {
  ok: false,
  status: 400,
  message: POSITION_ERROR_TEXT,
} as const;

const FAIL_EXPERIENCE_400 = {
  ok: false,
  status: 400,
  message: EXPERIENCE_ERROR_TEXT,
} as const;

const renderProfileForm = (initialProfile = emptyProfile) => {
  const user = userEvent.setup();
  render(<ProfileForm initialProfile={initialProfile} />);
  return { user };
};

describe('ProfileForm', () => {
  describe('초기 렌더링', () => {
    test('initialProfile이 있을 때 직무와 경력이 입력 필드의 기본값으로 렌더링된다', () => {
      render(<ProfileForm initialProfile={filledProfile} />);

      expect(getPositionInput()).toHaveValue(filledProfile.position);
      expect(getExperienceInput()).toHaveValue(filledProfile.experience);
    });

    test('initialProfile이 있을 때 기술 스택이 태그 목록으로 렌더링된다', () => {
      render(<ProfileForm initialProfile={filledProfile} />);

      expect(screen.getByText('Next.js')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
    });

    test('initialProfile이 null/빈 값이면 입력 필드는 비어 있고 태그는 렌더링되지 않는다', () => {
      render(<ProfileForm initialProfile={emptyProfile} />);

      expect(getPositionInput()).toHaveValue('');
      expect(getExperienceInput()).toHaveValue(null);

      expect(screen.queryByText('Next.js')).not.toBeInTheDocument();
      expect(screen.queryByText('TypeScript')).not.toBeInTheDocument();
    });

    test('초기 렌더링 시 에러 메시지를 표시하지 않는다', () => {
      render(<ProfileForm initialProfile={emptyProfile} />);

      expect(getPositionInput()).toHaveAttribute('aria-invalid', 'false');
      expect(getExperienceInput()).toHaveAttribute('aria-invalid', 'false');
    });

    test('초기 렌더링 시 저장 버튼은 활성화 상태로 렌더링된다', () => {
      render(<ProfileForm initialProfile={emptyProfile} />);

      expect(getSaveButton()).not.toBeDisabled();
    });

    test('초기 렌더링 시 기술 스택 입력창은 비어 있다', () => {
      render(<ProfileForm initialProfile={emptyProfile} />);

      expect(getSkillInput()).toHaveValue('');
    });
  });

  describe('클라이언트 유효성 검사', () => {
    let mockClientFetch: jest.Mock;
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
      originalFetch = global.fetch;
      mockClientFetch = jest.fn();
      global.fetch = mockClientFetch;
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    test('직무를 빈 값으로 저장하면 에러 문구를 표시한다', async () => {
      const { user } = renderProfileForm();

      await user.click(getSaveButton());

      expect(screen.getByText(POSITION_ERROR_TEXT)).toBeInTheDocument();
      expect(mockClientFetch).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    test.each(['-1', String(MAX_EXPERIENCE + 1), '0.7'])(
      `경력이 %s이면 에러 문구를 표시한다`,
      async (value) => {
        const { user } = renderProfileForm();

        const experienceInput = getExperienceInput();

        await user.clear(experienceInput);
        await user.type(experienceInput, value);

        await submitWithValidPosition(user);

        expect(screen.getByText(EXPERIENCE_ERROR_TEXT)).toBeInTheDocument();
        expect(mockClientFetch).not.toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
      },
    );

    test('직무 에러가 표시된 뒤 직무를 수정하면 에러 문구가 사라진다', async () => {
      const { user } = renderProfileForm();

      const submitButton = screen.getByRole('button', { name: '저장' });

      await user.click(submitButton);

      expect(screen.getByText(POSITION_ERROR_TEXT)).toBeInTheDocument();

      await typePosition(user);

      expect(screen.queryByText(POSITION_ERROR_TEXT)).not.toBeInTheDocument();
    });

    test('경력 에러가 표시된 뒤 경력을 수정하면 에러 문구가 사라진다', async () => {
      const { user } = renderProfileForm();

      const experienceInput = getExperienceInput();

      await user.clear(experienceInput);
      await user.type(experienceInput, '-1');

      await submitWithValidPosition(user);

      expect(screen.getByText(EXPERIENCE_ERROR_TEXT)).toBeInTheDocument();

      await user.clear(experienceInput);

      expect(screen.queryByText(EXPERIENCE_ERROR_TEXT)).not.toBeInTheDocument();
    });
  });

  describe('기술 스택 입력', () => {
    test.each([
      ['Enter', '{Enter}'],
      ['콤마(,)', ','],
    ])(
      '기술 스택을 입력 후 %s를 누르면 입력한 기술 스택이 목록에 추가되고 input이 비워진다',
      async (_, key) => {
        const { user } = renderProfileForm();

        const skillInput = getSkillInput();

        await user.type(skillInput, `React${key}`);

        expect(skillInput).toHaveValue('');
        expect(screen.getByText('React')).toBeInTheDocument();
      },
    );

    test.each([
      ['Enter', '{Enter}'],
      ['콤마(,)', ','],
    ])(
      '공백만 입력하고 %s를 누르면 기술 스택이 추가되지 않는다',
      async (_, key) => {
        const { user } = renderProfileForm();

        const skillInput = getSkillInput();

        await user.type(skillInput, ` ${key}`);

        expect(screen.queryByText('React')).not.toBeInTheDocument();
        expect(screen.queryByText('TypeScript')).not.toBeInTheDocument();
      },
    );

    test('같은 기술 스택을 다시 입력하면 중복 추가되지 않는다', async () => {
      const { user } = renderProfileForm();

      const skillInput = getSkillInput();

      await user.type(skillInput, 'React{Enter}');
      await user.type(skillInput, 'React{Enter}');

      expect(screen.getAllByText('React')).toHaveLength(1);
    });
  });

  describe('기술 스택 삭제', () => {
    test('배지의 X 버튼을 누르면 해당 기술 스택이 삭제된다', async () => {
      const { user } = renderProfileForm();

      const skillInput = getSkillInput();

      await user.type(skillInput, 'React{Enter}');
      await user.type(skillInput, 'TypeScript{Enter}');

      await user.click(screen.getByRole('button', { name: 'React 삭제' }));

      expect(screen.queryByText('React')).not.toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
    });
  });

  describe('제출', () => {
    describe('저장 성공', () => {
      test('유효한 입력값으로 제출하면 프로필 저장 요청을 보낸다', async () => {
        mockClientFetch.mockResolvedValueOnce(SUCCESS_204);

        const { user } = renderProfileForm();

        await submitWithValidPosition(user);

        expect(mockClientFetch).toHaveBeenCalledTimes(1);
        expect(mockClientFetch).toHaveBeenCalledWith('/api/me/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(makeProfile({ position: VALID_POSITION })),
          expectNoContent: true,
        });
      });

      test('프로필 저장에 성공하면 프로필 보기 페이지로 이동한다', async () => {
        mockClientFetch.mockResolvedValueOnce(SUCCESS_204);

        const { user } = renderProfileForm();

        await submitWithValidPosition(user);

        expect(mockPush).toHaveBeenCalledWith('/setting/profile');
      });
    });

    describe('저장 요청 중 상태', () => {
      test('저장 요청 중에는 저장 버튼이 비활성화된다', async () => {
        const deferred = createDeferred<
          FetchNoContentSuccessResult | FetchErrorResult
        >();
        mockClientFetch.mockReturnValueOnce(deferred.promise);

        const { user } = renderProfileForm();

        await typePosition(user);

        const saveButton = getSaveButton();

        await user.click(saveButton);

        expect(mockClientFetch).toHaveBeenCalledTimes(1);

        const loadingButton = getSaveButton(/저장 중/);

        expect(loadingButton).toBe(saveButton);
        expect(loadingButton).toBeDisabled();

        expect(mockPush).not.toHaveBeenCalled();

        deferred.resolve(SUCCESS_204);

        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith('/setting/profile');
        });
      });
    });

    describe('저장 요청 실패 처리', () => {
      test('저장 요청이 실패하면 저장 버튼이 다시 활성화된다', async () => {
        const deferred = createDeferred<
          FetchNoContentSuccessResult | FetchErrorResult
        >();
        mockClientFetch.mockReturnValueOnce(deferred.promise);

        const { user } = renderProfileForm();

        await typePosition(user);

        const saveButton = getSaveButton();
        await user.click(saveButton);

        expect(mockClientFetch).toHaveBeenCalledTimes(1);
        expect(saveButton).toBeDisabled();

        deferred.resolve(FAIL_500);

        await waitFor(() => {
          expect(saveButton).toBeEnabled();
        });

        expect(mockPush).not.toHaveBeenCalled();
      });

      test('서버 메시지에 "직무"가 포함되면 직무 에러 문구를 표시한다', async () => {
        mockClientFetch.mockResolvedValueOnce(FAIL_POSITION_400);

        const { user } = renderProfileForm();

        await submitWithValidPosition(user);

        expect(mockClientFetch).toHaveBeenCalledTimes(1);

        expect(
          await screen.findByText(POSITION_ERROR_TEXT),
        ).toBeInTheDocument();
      });

      test('서버 메시지에 "경력"이 포함되면 경력 에러 문구를 표시한다', async () => {
        mockClientFetch.mockResolvedValueOnce(FAIL_EXPERIENCE_400);

        const { user } = renderProfileForm();

        const experienceInput = getExperienceInput();
        await user.clear(experienceInput);
        await user.type(experienceInput, '3');

        await submitWithValidPosition(user);

        expect(mockClientFetch).toHaveBeenCalledTimes(1);

        expect(
          await screen.findByText(EXPERIENCE_ERROR_TEXT),
        ).toBeInTheDocument();
      });

      test('서버 메시지에 "직무" 또는 "경력"이 없으면 일반 에러 토스트를 표시한다', async () => {
        mockClientFetch.mockResolvedValueOnce(FAIL_500);

        const { user } = renderProfileForm();

        await submitWithValidPosition(user);

        expect(mockClientFetch).toHaveBeenCalledTimes(1);

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith(
            '프로필 저장에 실패했습니다.',
            {
              description: '잠시 후 다시 시도해주세요.',
            },
          );
        });
      });

      test('요청 중 네트워크 오류가 발생하면 네트워크 에러 토스트를 표시한다', async () => {
        mockClientFetch.mockRejectedValue(new Error());

        const { user } = renderProfileForm();

        await submitWithValidPosition(user);

        expect(mockClientFetch).toHaveBeenCalledTimes(1);

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith(
            '네트워크 오류가 발생했습니다.',
            {
              description: '인터넷 연결을 확인한 후 다시 시도해주세요.',
            },
          );
        });
      });
    });
  });
});
