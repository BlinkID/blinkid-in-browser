/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

/**
 * @hidden
 * Private interface for letting RecognizerRunner inform VideoRecognizer when it
 * needs to clear timeout. This is usually required when multi-side recognizer has
 * finished scanning of the first side and needs a clean timeout start for the
 * recognition of the back side.
 */
export interface ClearTimeoutCallback
{
    /**
     * Called when recognition process wants to clear any timeouts imposed on it.
     */
    onClearTimeout(): void;
}
