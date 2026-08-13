import {
  type FetchErrorResult,
  type FetchInit,
  type FetchNoContentSuccessResult,
  type FetchSuccessResult,
  parseResponse,
} from '@/lib/fetch/core';

export function clientFetch<T>(
  path: string,
  init?: FetchInit & { expectNoContent?: false },
): Promise<FetchSuccessResult<T> | FetchErrorResult>;

export function clientFetch(
  path: string,
  init: FetchInit & { expectNoContent: true },
): Promise<FetchNoContentSuccessResult | FetchErrorResult>;

export async function clientFetch<T>(
  path: string,
  init?: FetchInit,
): Promise<
  FetchSuccessResult<T> | FetchNoContentSuccessResult | FetchErrorResult
> {
  const { expectNoContent, ...requestInit } = init ?? {};

  const res = await fetch(path, requestInit);

  if (expectNoContent) {
    return parseResponse(res, true);
  }

  return parseResponse<T>(res, false);
}
