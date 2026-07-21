/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as account from "../account.js";
import type * as auth from "../auth.js";
import type * as chat from "../chat.js";
import type * as checkins from "../checkins.js";
import type * as community from "../community.js";
import type * as dashboard from "../dashboard.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_dates from "../lib/dates.js";
import type * as lib_handle from "../lib/handle.js";
import type * as panic from "../panic.js";
import type * as profile from "../profile.js";
import type * as profiles from "../profiles.js";
import type * as progress from "../progress.js";
import type * as relapses from "../relapses.js";
import type * as services_streak from "../services/streak.js";
import type * as users from "../users.js";
import type * as validators_checkin from "../validators/checkin.js";
import type * as validators_profile from "../validators/profile.js";
import type * as validators_relapse from "../validators/relapse.js";
import type * as validators_vault from "../validators/vault.js";
import type * as vault from "../vault.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  account: typeof account;
  auth: typeof auth;
  chat: typeof chat;
  checkins: typeof checkins;
  community: typeof community;
  dashboard: typeof dashboard;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/dates": typeof lib_dates;
  "lib/handle": typeof lib_handle;
  panic: typeof panic;
  profile: typeof profile;
  profiles: typeof profiles;
  progress: typeof progress;
  relapses: typeof relapses;
  "services/streak": typeof services_streak;
  users: typeof users;
  "validators/checkin": typeof validators_checkin;
  "validators/profile": typeof validators_profile;
  "validators/relapse": typeof validators_relapse;
  "validators/vault": typeof validators_vault;
  vault: typeof vault;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
