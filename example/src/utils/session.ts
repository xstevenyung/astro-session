import { createCookieSessionStorage } from "astro-session";

export const { getSession, commitSession } = createCookieSessionStorage();
