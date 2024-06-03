/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newE2EPage } from "@stencil/core/testing";

describe("blinkid-in-browser", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<blinkid-in-browser></blinkid-in-browser>");

    const element = await page.find("blinkid-in-browser");
    expect(element).toHaveClass("hydrated");
  });
});
