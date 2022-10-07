import jwt from "jsonwebtoken";

export type Session = {};

export function getSession(request: Request): Partial<Session> {
  const rawCookies = request.headers.get("cookie");

  if (!rawCookies) {
    return {};
  }

  const cookies = new Map();
  for (const rawCookie of rawCookies.split("; ")) {
    const [key, value] = rawCookie.split("=");
    cookies.set(key, value);
  }

  if (!cookies.get("session_id")) {
    return {};
  }

  return jwt.verify(
    cookies.get("session_id"),
    import.meta.env.APP_KEY
  ) as Session;
}

export function commitSession(session: Partial<Session>) {
  return `session_id=${jwt.sign(session, import.meta.env.APP_KEY)}; Path=/`;
}
