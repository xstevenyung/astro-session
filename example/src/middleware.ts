import { sequence } from "astro:middleware";
import { jwtSession } from "astro-session";

// `context` and `next` are automatically typed
export const onRequest = sequence(
  jwtSession({
    secret: "not-secret",
    defaultSession: {
      user: null,
    },
  })
);
