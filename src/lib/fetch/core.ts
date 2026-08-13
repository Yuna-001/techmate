type ErrorBody = { error: string };

export type FetchErrorResult = {
  ok: false;
  status: number;
  message: string;
};

export type FetchSuccessResult<T> = {
  ok: true;
  status: number;
  data: T;
};

export type FetchNoContentSuccessResult = {
  ok: true;
  status: 204;
  data: null;
};

export type FetchInit = RequestInit & {
  expectNoContent?: boolean;
};

const isErrorBody = (value: unknown): value is ErrorBody => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof value.error === 'string'
  );
};

const parseBody = async (res: Response): Promise<unknown> => {
  const contentType = res.headers.get('content-type') ?? '';

  return contentType.includes('application/json')
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);
};

export async function parseResponse<T>(
  res: Response,
  expectNoContent?: false,
): Promise<FetchSuccessResult<T> | FetchErrorResult>;

export async function parseResponse(
  res: Response,
  expectNoContent: true,
): Promise<FetchNoContentSuccessResult | FetchErrorResult>;

export async function parseResponse<T>(
  res: Response,
  expectNoContent = false,
): Promise<
  FetchSuccessResult<T> | FetchNoContentSuccessResult | FetchErrorResult
> {
  if (!res.ok) {
    const body = await parseBody(res);

    const message =
      (isErrorBody(body) && body.error) ||
      (typeof body === 'string' && body.trim()) ||
      res.statusText ||
      '요청이 실패하였습니다.';

    return {
      ok: false,
      status: res.status,
      message,
    };
  }

  if (expectNoContent) {
    if (res.status !== 204) {
      throw new Error(
        `204 No Content 응답을 기대했지만 ${res.status} 응답을 받았습니다.`,
      );
    }

    return {
      ok: true,
      status: 204,
      data: null,
    };
  }

  if (res.status === 204) {
    throw new Error(
      '응답 본문이 필요한 요청인데 204 No Content 응답을 받았습니다.',
    );
  }

  const body = await parseBody(res);

  return {
    ok: true,
    status: res.status,
    data: body as T,
  };
}
