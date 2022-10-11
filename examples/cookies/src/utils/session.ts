import { createCookieSessionStorage } from "astro-session";

export type Data = {
  count: number;
};

export const { getSession, commitSession } = createCookieSessionStorage<Data>({
  count: 0,
});
