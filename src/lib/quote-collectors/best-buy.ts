import { chromium, type Browser } from "playwright-core";

import { env } from "@/lib/env";
import type { CollectorExecutionInput, CollectorExecutionResult, QuoteArtifactCapture, QuoteCollector, QuotePreview } from "@/lib/quote-collectors/types";

const PARSER_VERSION = "bestbuy-live-v1";
const BEST_BUY_URL = "https://www.bestbuy.com/trade-in";

async function openBrowser() {
  if (env.BROWSER_WS_ENDPOINT) {
    return chromium.connectOverCDP(env.BROWSER_WS_ENDPOINT);
  }

  return chromium.launch({
    headless: true,
    executablePath: env.BROWSER_EXECUTABLE_PATH,
  });
}

function artifactId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function buildDeviceMatchers(deviceLabel: string) {
  const compact = deviceLabel.toLowerCase();
  const parts = compact.split(/\s+/).filter(Boolean);
  return [compact, ...parts.filter((part) => part.length > 2)];
}

function extractCandidateLines(text: string, deviceLabel: string) {
  const lines = text
    .split(/\n+/)
    .map((line) => normalizeText(line))
    .filter(Boolean);
  const matchers = buildDeviceMatchers(deviceLabel);
  return lines.filter((line) => {
    const lower = line.toLowerCase();
    return matchers.some((matcher) => lower.includes(matcher)) || (lower.includes("trade") && lower.includes("$"));
  });
}

function parseBestBuyPreview(text: string, input: CollectorExecutionInput): QuotePreview[] {
  const candidates = extractCandidateLines(text, input.deviceLabel);
  const previews: QuotePreview[] = [];

  for (const candidate of candidates) {
    const amountMatch = candidate.match(/\$(\d{2,4})/);
    if (!amountMatch) continue;

    const amount = Number(amountMatch[1]);
    if (!Number.isFinite(amount)) continue;

    previews.push({
      merchantSlug: "best-buy",
      deviceSlug: input.deviceSlug,
      condition: input.condition,
      targetDeviceSlug: input.targetDeviceSlug ?? null,
      valueAmount: amount,
      valueType: "store_credit",
      confidence: candidate.toLowerCase().includes(input.deviceLabel.toLowerCase()) ? 0.68 : 0.42,
      label: "Best Buy live capture preview",
      explanation: candidate.toLowerCase().includes(input.deviceLabel.toLowerCase())
        ? "Matched a visible line containing the requested device label and a dollar amount."
        : "Matched a generic Best Buy trade-in line containing a dollar amount; manual review recommended.",
      matchedText: candidate,
    });
  }

  return previews
    .sort((a, b) => b.confidence - a.confidence || (b.valueAmount ?? 0) - (a.valueAmount ?? 0))
    .slice(0, 3);
}

async function withPage<T>(browser: Browser, input: CollectorExecutionInput, fn: (page: import("playwright-core").Page) => Promise<T>) {
  const context = await browser.newContext({
    userAgent: input.userAgent ?? env.QUOTE_USER_AGENT,
    viewport: { width: 1440, height: 1200 },
  });
  const page = await context.newPage();
  try {
    return await fn(page);
  } finally {
    await context.close();
  }
}

export const bestBuyCollector: QuoteCollector = {
  merchantSlug: "best-buy",
  async run(input) {
    const startedAt = new Date().toISOString();
    const logs: string[] = [];
    const artifacts: QuoteArtifactCapture[] = [];

    let browser: Browser | null = null;

    try {
      logs.push("Opening browser session.");
      browser = await openBrowser();

      const result = await withPage(browser, input, async (page) => {
        logs.push(`Navigating to ${BEST_BUY_URL}.`);
        await page.goto(BEST_BUY_URL, { waitUntil: "domcontentloaded", timeout: 45000 });
        await page.waitForTimeout(2500);

        const html = await page.content();
        const text = await page.locator("body").innerText().catch(() => "");
        const currentUrl = page.url();

        artifacts.push({
          id: artifactId("bestbuy_html"),
          artifactType: "html",
          sourceUrl: currentUrl,
          payload: html.slice(0, 400000),
          capturedAt: new Date().toISOString(),
          parserVersion: PARSER_VERSION,
        });

        const previews = parseBestBuyPreview(text, input);
        if (previews.length) {
          logs.push(`Extracted ${previews.length} quote preview(s) from the live page text.`);
        } else {
          logs.push("No trustworthy Best Buy quote preview was parsed from the captured page.");
        }

        return {
          sourceUrl: currentUrl,
          previews,
        };
      });

      return {
        merchantSlug: input.merchantSlug,
        deviceSlug: input.deviceSlug,
        condition: input.condition,
        targetDeviceSlug: input.targetDeviceSlug ?? null,
        status: result.previews.length ? "captured" : "failed",
        startedAt,
        finishedAt: new Date().toISOString(),
        sourceUrl: result.sourceUrl,
        logs,
        previews: result.previews,
        artifacts,
        error: result.previews.length ? undefined : "No trustworthy quote preview could be parsed from the live Best Buy flow.",
      } satisfies CollectorExecutionResult;
    } catch (error) {
      return {
        merchantSlug: input.merchantSlug,
        deviceSlug: input.deviceSlug,
        condition: input.condition,
        targetDeviceSlug: input.targetDeviceSlug ?? null,
        status: "failed",
        startedAt,
        finishedAt: new Date().toISOString(),
        sourceUrl: BEST_BUY_URL,
        logs,
        previews: [],
        artifacts,
        error: error instanceof Error ? error.message : "Unknown collector failure",
      } satisfies CollectorExecutionResult;
    } finally {
      if (browser) {
        await browser.close().catch(() => undefined);
      }
    }
  },
};