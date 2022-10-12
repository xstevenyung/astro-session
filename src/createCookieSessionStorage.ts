import jwt from "jsonwebtoken";
import merge from "lodash.merge";
import { BaseDataType, Session } from "./session";

export type CookieSessionOptions = {
  cookie: CookieOptions;
};

export type CookieOptions = {
  name: string;
  path: string;
  secret: string;
};

export type PartialCookieSessionOptions = Partial<{
  cookie: Partial<CookieSessionOptions["cookie"]>;
}>;

export function createCookieSessionStorage<DataType = BaseDataType>(
  initialData: DataType,
  options: PartialCookieSessionOptions = {}
) {
  const defaultCookieSessionOptions: CookieSessionOptions = {
    cookie: {
      name: "__session_id",
      path: "/",
      secret: "not-secret",
    },
  };

  if (!options?.cookie?.secret) {
    console.warn(
      "[ASTRO SESSION] Warning: We didn't detect a secret, if you are in production please fix this ASAP to avoid any security issue."
    );
  }

  const { cookie } = merge(defaultCookieSessionOptions, options);

  const createFreshSession = (data: Partial<DataType> = {}, flash: any = {}) =>
    new Session<DataType>(merge({ ...initialData }, data), flash);

  const getSession = async (request: Request): Promise<Session<DataType>> => {
    const rawCookies = request.headers.get("cookie");

    if (!rawCookies) {
      return createFreshSession();
    }

    const cookies = new Map();

    for (const rawCookie of rawCookies.split("; ")) {
      const [key, value] = rawCookie.split("=");
      cookies.set(key, value);
    }

    if (!cookies.get(cookie.name)) {
      return createFreshSession();
    }

    try {
      const { data, flash } = jwt.verify(
        cookies.get(cookie.name),
        cookie.secret
      );

      return createFreshSession(data, flash);
    } catch (e) {
      // If signature verification fails, we will just set an empty session
      return createFreshSession();
    }
  };

  const commitSession = async (session: Session<DataType>) => {
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
