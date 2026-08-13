type ProfileBase = {
  experience: number | null;
  skills: string[];
};

/** DB에 저장된 프로필 타입 (position 필수) */
export type ProfileDoc = ProfileBase & {
  position: string;
};

/** 프로필 조회 API 응답 타입 (프로필 문서가 없을 수 있어 초기 상태에서는 position이 null) */
export type ProfileResponse = ProfileBase & {
  position: string | null;
};
