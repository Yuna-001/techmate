/**
 * @jest-environment node
 */

import { parseResponse } from '@/lib/fetch/core';

describe('parseResponse', () => {
  describe('성공 응답', () => {
    test('204(No Content)이면 data를 null로 반환한다', async () => {
      const res = new Response(null, { status: 204 });

      const result = await parseResponse(res, true);

      expect(result).toEqual({ ok: true, status: 204, data: null });
    });

    test('성공 응답이 JSON이면 바디를 JSON으로 파싱해 data로 반환한다', async () => {
      const res = new Response(JSON.stringify({ a: 1 }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });

      const result = await parseResponse<{ a: number }>(res);

      expect(result).toEqual({ ok: true, status: 200, data: { a: 1 } });
    });

    test('성공 응답이 JSON이 아니면 바디를 문자열로 파싱해 data로 반환한다', async () => {
      const res = new Response('성공', {
        status: 200,
        headers: { 'content-type': 'text/plain' },
      });

      const result = await parseResponse<string>(res);

      expect(result).toEqual({ ok: true, status: 200, data: '성공' });
    });
  });

  describe('실패 응답', () => {
    test('에러 바디가 { error } 형식이면 error를 message로 반환한다', async () => {
      const res = new Response(
        JSON.stringify({ error: '직무를 입력해주세요.' }),
        {
          status: 400,
          statusText: 'Bad Request',
          headers: { 'content-type': 'application/json' },
        },
      );

      const result = await parseResponse(res);

      expect(result).toEqual({
        ok: false,
        status: 400,
        message: '직무를 입력해주세요.',
      });
    });

    test('에러 바디가 문자열이면 해당 문자열을 공백을 제외하고 message로 반환한다', async () => {
      const res = new Response('권한이 없습니다.', {
        status: 401,
        statusText: 'Unauthorized',
        headers: { 'content-type': 'text/plain' },
      });

      const result = await parseResponse(res);

      expect(result).toEqual({
        ok: false,
        status: 401,
        message: '권한이 없습니다.',
      });
    });

    test('에러 바디가 비어 있거나 공백뿐이면 statusText를 message로 반환한다', async () => {
      const res = new Response('   ', {
        status: 500,
        statusText: 'Internal Server Error',
        headers: { 'content-type': 'text/plain' },
      });

      const result = await parseResponse(res);

      expect(result).toEqual({
        ok: false,
        status: 500,
        message: 'Internal Server Error',
      });
    });

    test('에러 바디를 유효한 메시지로 만들 수 없고 statusText도 비어 있으면 기본 에러 문구를 반환한다', async () => {
      const res = new Response('{', {
        status: 502,
        statusText: '',
        headers: { 'content-type': 'application/json' },
      });

      const result = await parseResponse(res);

      expect(result).toEqual({
        ok: false,
        status: 502,
        message: '요청이 실패하였습니다.',
      });
    });
  });
});
