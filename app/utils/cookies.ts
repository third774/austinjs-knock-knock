import { createCookie } from "@remix-run/cloudflare";

export const knockedCookie = createCookie("knocked", {
  maxAge: 120, // 2 minutes
});
