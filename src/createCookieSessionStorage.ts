import jwt from "jsonwebtoken";
import merge from "lodash.merge";
import { Session } from "./session";

export type CookieSessionOptions = {
  cookie: {
    name: string;
    path: string;
    secret: string;
  };
};

export const defaultCookieSessionOptions: CookieSessionOptions = {
  cookie: {
    name: "__session_id",
    path: "/",
    secret: "not-secret",
  },
};

export function createCookieSessionStorage(
  options: Partial<CookieSessionOptions> = {}
) {
  if (!options?.cookie?.secret) {
    console.warn(
      "[ASTRO SESSION] Warning: We didn't detect a secret, if you are in production please fix this ASAP to avoid any security issue."
    );
  }

  const { cookie } = merge(defaultCookieSessionOptions, options);

  const getSession = (request: Request): Session => {
    const rawCookies = request.headers.get("cookie");

    if (!rawCookies) {
      return new Session();
    }

    const cookies = new Map();

    for (const rawCookie of rawCookies.split("; ")) {
      const [key, value] = rawCookie.split("=");
      cookies.set(key, value);
    }

    if (!cookies.get(cookie.name)) {
      return new Session();
    }

    try {
      const { data, flash } = jwt.verify(
        cookies.get(cookie.name),
        cookie.secret
      );
      return new Session(data, flash);
    } catch (e) {
      // If signature verification fails, we will just set an empty session
      return new Session();
    }
  };

  const commitSession = (session: Session) => {
    return [
      `${cookie.name}=${jwt.sign(session.toJSON(), cookie.secret)}`,
      `Path=${cookie.path}`,
    ].join("; ");
  };

  // const destroySession = (session: Session) => {
  //   return new Session();
  // };

  return { getSession, commitSession };
}
