import type {
  FetchErrorResult,
  FetchInit,
  FetchNoContentSuccessResult,
  FetchSuccessResult,
} from '@/lib/fetch/core';

export type MockClientFetch = jest.Mock<
  Promise<
    FetchSuccessResult<unknown> | FetchNoContentSuccessResult | FetchErrorResult
  >,
  [path: string, init?: FetchInit]
>;
