import assert from "node:assert/strict";
import test from "node:test";

import { buildResolvedValue, computeConfidence, normalizeCondition, verificationStatusFor } from "./accuracy.ts";
import { buildTradeInFinder } from "./engine.ts";
import { merchants, rawIngestRecords, valueRecords } from "./seed-data.ts";

test("normalizeCondition maps merchant buckets into simplified user conditions", () => {
  assert.equal(normalizeCondition("good condition").condition, "good");
  assert.equal(normalizeCondition("screen damage").condition, "damaged");
  assert.equal(normalizeCondition("not accepted").condition, "poor");
});

test("computeConfidence rewards fresh exact matches more than weaker parser results", () => {
  const merchant = merchants.find((entry) => entry.id === "apple");
  const raw = rawIngestRecords.find((entry) => entry.merchantId === "apple");
  assert.ok(merchant && raw);

  const exact = computeConfidence({
    merchant,
    raw,
    exactMatch: true,
    exactStorageMatch: true,
    parserQuality: 0.95,
    manualOverride: false,
    now: new Date(raw.retrievedAt),
  });

  const weak = computeConfidence({
    merchant,
    raw: { ...raw, parseStatus: "pending" },
    exactMatch: false,
    exactStorageMatch: false,
    parserQuality: 0.45,
    manualOverride: false,
    now: new Date(raw.retrievedAt),
  });

  assert.ok(exact > weak);
});

test("verificationStatusFor marks stale and low-confidence values honestly", () => {
  assert.equal(verificationStatusFor({ confidence: 0.9, stale: true, manualOverride: false, exactMatch: true }), "stale");
  assert.equal(verificationStatusFor({ confidence: 0.4, stale: false, manualOverride: false, exactMatch: false }), "low_confidence");
  assert.equal(verificationStatusFor({ confidence: 0.82, stale: false, manualOverride: true, exactMatch: true }), "manual");
});

test("buildResolvedValue shows ranges for low-confidence family-style values", () => {
  const base = valueRecords[0];
  const resolved = buildResolvedValue({ ...base, valueAmount: 300, confidenceScore: 0.5, verificationStatus: "low_confidence" }, "family_estimate", "Family estimate", []);
  assert.match(resolved.displayValue, /^\$\d+-\$\d+$/);
});

test("trade-in finder ranks a verified exact match above thinner estimates", () => {
  const model = buildTradeInFinder({
    currentDeviceSlug: "iphone-13-128",
    targetDeviceSlug: "iphone-16-pro-256",
    condition: "good",
  });

  assert.ok(model.paths.length > 0);
  assert.equal(model.paths[0].merchant.slug, "apple");
  assert.equal(model.paths[0].resolvedValue.fallbackLevel, "exact_verified");
});
