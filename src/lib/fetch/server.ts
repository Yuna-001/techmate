import { headers } from 'next/headers';
import {
  type FetchErrorResult,
  type FetchInit,
  type FetchNoContentSuccessResult,
  type FetchSuccessResult,
  parseResponse,
} from './core';

// 일반 JSON 응답용 오버로드
export function serverFetch<T>(
  path: string,
  init?: FetchInit & { expectNoContent?: false },
): Promise<FetchSuccessResult<T> | FetchErrorResult>;

// 204 No Content 응답용 오버로드
export function serverFetch(
  path: string,
  init: FetchInit & { expectNoContent: true },
): Promise<FetchNoContentSuccessResult | FetchErrorResult>;

// 실제 구현부
export async function serverFetch<T>(
  path: string,
  init?: FetchInit,
): Promise<
  FetchSuccessResult<T> | FetchNoContentSuccessResult | FetchErrorResult
> {
  const h = await headers();
  const host = h.get('host');
  const protocol =
    h.get('x-forwarded-proto') ??
    (process.env.NODE_ENV === 'development' ? 'http' : 'https');
  const origin = `${protocol}://${host}`;

  const { expectNoContent, ...requestInit } = init ?? {};

  const res = await fetch(`${origin}${path}`, {
    ...requestInit,
    headers: {
      ...(requestInit.headers ?? {}),
      cookie: h.get('cookie') ?? '',
    },
  });

  if (expectNoContent) {
    return parseResponse(res, true);
  }

  return parseResponse<T>(res, false);
}
