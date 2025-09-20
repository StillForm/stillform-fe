"use client";

import { useCallback } from "react";

type EventName =
  | "nav_click"
  | "market_search"
  | "product_action"
  | "auction_bid"
  | "blind_open"
  | "creator_create"
  | "creator_publish"
  | "creator_save_draft"
  | "profile_asset_click"
  | "asset_request_redemption"
  | "ai_generate"
  | "ai_set_as_draft"
  | "ai_refine"
  | "wallet_connect";

interface AnalyticsPayload {
  [key: string]: unknown;
}

export function logEvent(event: EventName, payload: AnalyticsPayload = {}) {
  // Placeholder analytics bridge - replace with real tracker integration.
  if (process.env.NODE_ENV !== "production") {
    console.info(`[analytics] ${event}`, payload);
  }
}

export function useAnalytics(event: EventName) {
  return useCallback(
    (payload: AnalyticsPayload = {}) => {
      logEvent(event, payload);
    },
    [event],
  );
}
