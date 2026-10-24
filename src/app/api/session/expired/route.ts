import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { EXPIRED_PARAM, LOGIN_PATH, SESSION_COOKIE } from "@/lib/auth/constants";

export async function GET(request: Request) {
  (await cookies()).delete(SESSION_COOKIE);
  const login = new URL(LOGIN_PATH, request.url);
  login.searchParams.set(EXPIRED_PARAM, "1");
  return NextResponse.redirect(login);
}
