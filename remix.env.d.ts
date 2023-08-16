/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/cloudflare" />
/// <reference types="@cloudflare/workers-types" />

// need to import the module in order for the declaration
// below to extend it instead of overwriting it.
// https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
import "@remix-run/server-runtime";

declare module "@remix-run/server-runtime" {
  export interface AppLoadContext {
    env: {
      WEBHOOK_URL?: string;
    };
  }
}
