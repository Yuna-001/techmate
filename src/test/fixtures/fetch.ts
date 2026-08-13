export const SERVER_ERROR_TEXT = '서버 에러가 발생했습니다.' as const;

export const SUCCESS_204 = {
  ok: true,
  status: 204,
  data: null,
} as const;

export const FAIL_500 = {
  ok: false,
  status: 500,
  message: SERVER_ERROR_TEXT,
} as const;
