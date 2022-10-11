import type { APIContext } from "astro";
import { commitSession, getSession } from "../../utils/session";

export function get({ request }: APIContext) {
  const session = getSession(request);

  session.set("count", (value) => value + 1);

  return new Response(null, {
    status: 302,
    headers: {
      location: "/",
      "set-cookie": commitSession(session),
    },
  });
}
