import type { APIContext } from "astro";
import { commitSession, getSession } from "../../utils/session";

export function get({ request }: APIContext) {
  const session = getSession(request);

  console.log(session);
  session.count = session.count ? session.count + 1 : 1;
  console.log(session);

  return new Response(null, {
    status: 302,
    headers: {
      location: "/",
      "set-cookie": commitSession(session),
    },
  });
}
