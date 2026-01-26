/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as categories from "../categories.js";
import type * as chat from "../chat.js";
import type * as chatbot from "../chatbot.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as publicOrders from "../publicOrders.js";
import type * as sellers from "../sellers.js";
import type * as stats from "../stats.js";
import type * as storefronts from "../storefronts.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  categories: typeof categories;
  chat: typeof chat;
  chatbot: typeof chatbot;
  orders: typeof orders;
  products: typeof products;
  publicOrders: typeof publicOrders;
  sellers: typeof sellers;
  stats: typeof stats;
  storefronts: typeof storefronts;
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
