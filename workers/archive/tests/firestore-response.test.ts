import { describe, expect, it } from "vitest";
import { parseBatchGetResponse } from "../src/firestore";

const found = {
  found: {
    name: "projects/onirc-production/databases/(default)/documents/users/test/dreams/memory",
    fields: { title: { stringValue: "Memory" } },
  },
};

const missing = {
  missing: "projects/onirc-production/databases/(default)/documents/users/test/publicationLinks/memory",
};

describe("Firestore batchGet response parsing", () => {
  it("accepts the JSON array returned by the production REST API", () => {
    expect(parseBatchGetResponse(JSON.stringify([found, missing]))).toEqual([found, missing]);
  });

  it("accepts newline-delimited responses from streamed runtimes", () => {
    expect(parseBatchGetResponse(`${JSON.stringify(found)}\n${JSON.stringify(missing)}\n`)).toEqual([found, missing]);
  });

  it("accepts an empty response", () => {
    expect(parseBatchGetResponse("  \n")).toEqual([]);
  });
});
