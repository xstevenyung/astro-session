import type { APIContext } from "astro";
import { commitSession, getSession } from "../../utils/session";

export function get({ request }: APIContext) {
  const session = getSession(request);

  session.flash("success", "let's go!");

  return new Response(null, {
    status: 302,
    headers: {
      location: "/",
      "set-cookie": commitSession(session),
    },
  });
}
