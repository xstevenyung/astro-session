import jwt from "jsonwebtoken";
import merge from "lodash.merge";

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

export function createCookieSessionStorage<T = any>(
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

    const { data } = jwt.verify(cookies.get(cookie.name), cookie.secret);

    return new Session(data);
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

export class Session {
  #data = new Map();
  #flash = new Map();

  constructor(data = {}, flash = {}) {
    this.#data = new Map(Object.entries(data));
    this.#flash = new Map(Object.entries(flash));
  }

  get data() {
    return Object.fromEntries(this.#data);
  }

  get flashedData() {
    return Object.fromEntries(this.#flash);
  }

  set(key: string, value: any) {
    if (typeof value === "function") {
      value = value(this.get(key));
    }

    this.#data.set(key, value);

    return this;
  }

  get(key: string) {
    return this.#data.get(key);
  }

  has(key: string) {
    return this.#data.has(key);
  }

  clear() {
    this.#data.clear();
    return this;
  }

  flash(key: string, value?: any) {
    if (value === undefined) {
      const flashedValue = this.#flash.get(key);

      this.#flash.delete(key);

      return flashedValue;
    }

    this.#flash.set(key, value);

    return this;
  }

  toJSON() {
    return { data: Object.fromEntries(this.#data) };
  }
}
