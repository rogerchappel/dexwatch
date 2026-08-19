import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflowUrl = new URL("../.github/workflows/release.yml", import.meta.url);

test("release workflow prepares trusted publishing before npm publish", async () => {
  const workflow = await readFile(workflowUrl, "utf8");
  const setupNode = workflow.indexOf("node-version: 22.14.0");
  const installNpm = workflow.indexOf("npm install --global npm@11.5.1");
  const publish = workflow.indexOf("npm publish ./*.tgz --provenance --access public");

  assert.notEqual(setupNode, -1, "release workflow must pin Node 22.14.0 or newer");
  assert.notEqual(installNpm, -1, "release workflow must install npm 11.5.1 or newer");
  assert.notEqual(publish, -1, "release workflow must retain the OIDC publish step");
  assert.ok(setupNode < installNpm, "Node must be configured before npm is upgraded");
  assert.ok(installNpm < publish, "trusted-publishing prerequisites must precede publish");
});
