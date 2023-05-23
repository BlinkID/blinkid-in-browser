/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

export const DEFEAULT_MB_HELP_ALLOW = false;

export const DEFEAULT_MB_HELP_ALLOW_LOBBY = false;

export const DEFEAULT_MB_HELP_ALLOW_ONBOARDING = false;

export const DEFEAULT_MB_HELP_ALLOW_ONBOARDING_PERPETUITY = false;

export const DEFAULT_MB_HELP_TOOLTOP_PAUSE_TIMEOUT_MS = 15000;

export interface MbHelpCallbacks {
  onOpen: () => void;
  onClose: () => void;
}
