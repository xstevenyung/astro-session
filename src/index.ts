import jwt from "jsonwebtoken";
import merge from "lodash.merge";

export type Session = {};

export type CookieSessionOptions = {
  cookie: {
    name: string;
    path: string;
    secret: string;
  };
};

export const defaultCookieSessionOptions: CookieSessionOptions = {
  cookie: {
    name: "session_id",
    path: "/",
    secret: "not-secret",
  },
};

export function createCookieSessionStorage(
  options: Partial<CookieSessionOptions>
) {
  if (!options?.cookie?.secret) {
    console.warn(
      "[ASTRO SESSION] Warning: We didn't detect a secret, if you are in production please fix this ASAP to avoid any security issue."
    );
  }

  const { cookie } = merge(defaultCookieSessionOptions, options);

  const getSession = (request: Request): Partial<Session> => {
    const rawCookies = request.headers.get("cookie");

    if (!rawCookies) {
      return {};
    }

    const cookies = new Map();

    for (const rawCookie of rawCookies.split("; ")) {
      const [key, value] = rawCookie.split("=");
      cookies.set(key, value);
    }

    if (!cookies.get(cookie.name)) {
      return {};
    }

    return jwt.verify(cookies.get(cookie.name), cookie.secret) as Session;
  };

  const commitSession = (session: Partial<Session>) => {
    return [
      `${cookie.name}=${jwt.sign(session, cookie.secret)}`,
      `Path=${cookie.path}`,
    ].join("; ");
  };

  return { getSession, commitSession };
}
