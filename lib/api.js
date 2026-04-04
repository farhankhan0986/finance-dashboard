import { NextResponse } from 'next/server';

export function successResponse(data, message = 'Success', status = 200) {
  return NextResponse.json({
    success: true,
    message,
    data,
    errors: null,
  }, { status });
}

export function errorResponse(message = 'Error', status = 400, errors = null) {
  return NextResponse.json({
    success: false,
    message,
    data: null,
    errors,
  }, { status });
}
