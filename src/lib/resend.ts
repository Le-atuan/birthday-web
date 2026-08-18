import { Resend } from "resend";

// Lazily constructed: the Resend SDK throws in its constructor when no API
// key is present, which would break `next build`'s route-data collection
// (Route Handlers are module-evaluated at build time, unlike Server
// Actions). A getter defers construction to request time, same pattern as
// `createSupabaseServerClient`.
let client: Resend | null = null;

export function getResendClient(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("Missing RESEND_API_KEY environment variable");
    }
    client = new Resend(apiKey);
  }
  return client;
}
