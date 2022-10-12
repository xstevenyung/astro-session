import type { APIContext } from "astro";
import { commitSession, getSession } from "../../utils/session";

export async function get({ request }: APIContext) {
  const session = await getSession(request);

  session.set("count", (value) => value + 1);

  return new Response(null, {
    status: 302,
    headers: {
      location: "/",
      "set-cookie": await commitSession(session),
    },
  });
}
