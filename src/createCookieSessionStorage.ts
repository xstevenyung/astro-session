import jwt from "jsonwebtoken";
import merge from "lodash.merge";
import { BaseDataType, Session } from "./session";

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

export function createCookieSessionStorage<DataType = BaseDataType>(
  options: Partial<CookieSessionOptions> = {}
) {
  if (!options?.cookie?.secret) {
    console.warn(
      "[ASTRO SESSION] Warning: We didn't detect a secret, if you are in production please fix this ASAP to avoid any security issue."
    );
  }

  const { cookie } = merge(defaultCookieSessionOptions, options);

  const getSession = <T = DataType>(request: Request): Session<T> => {
    const rawCookies = request.headers.get("cookie");

    if (!rawCookies) {
      return new Session<T>();
    }

    const cookies = new Map();

    for (const rawCookie of rawCookies.split("; ")) {
      const [key, value] = rawCookie.split("=");
      cookies.set(key, value);
    }

    if (!cookies.get(cookie.name)) {
      return new Session<T>();
    }

    try {
      const { data, flash } = jwt.verify(
        cookies.get(cookie.name),
        cookie.secret
      );
      return new Session<T>(data, flash);
    } catch (e) {
      // If signature verification fails, we will just set an empty session
      return new Session<T>();
    }
  };

  const commitSession = (session: Session<DataType>) => {
    return [
      `${cookie.name}=${jwt.sign(session.toJSON(), cookie.secret)}`,
      `Path=${cookie.path}`,
    ].join("; ");
  };

  // const destroySession = (session: Session) => {
  //   return new Session<DataType>();
  // };

  return { getSession, commitSession };
}
