import { EnhancedPageObject, EnhancedSectionInstance, PageObjectModel } from "nightwatch";

const pinwheelCommands = {
  waitForReady(this: EnhancedPageObject): EnhancedPageObject {
    return this
      .waitForElementVisible("@app")
      .waitForElementVisible("@wwtComponent");
  }
};
