import { defineMiddleware } from "astro/middleware";
import * as jwt from "jsonwebtoken";

export const ASTRO_SESSION_KEY = "__session_id";

/**
 * @param {import('./index').Config} config
 */
export const jwtSession = (config) => {
  const { defaultSession = {} } = config;
  return defineMiddleware(async ({ cookies, locals }, next) => {
    const token = cookies.get(ASTRO_SESSION_KEY)?.value;

    try {
      locals.session = token
        ? jwt.verify(token, config.secret)
        : defaultSession;
    } catch (e) {
      cookies.delete(ASTRO_SESSION_KEY);
      locals.session = defaultSession;
    }

    const response = await next();

    cookies.set(ASTRO_SESSION_KEY, jwt.sign(locals.session, config.secret));

    return response;
  });
};
