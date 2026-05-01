#!/usr/bin/env node

import { createHash } from "node:crypto";
import { createWriteStream } from "node:fs";
import {
  appendFile,
  mkdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname, join } from "node:path";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

const DEFAULT_SEEDS = [
  "https://basic.smartedu.cn/",
  "https://topic.ykt.cbern.com.cn/web/ncet-xedu/config/site.js",
  "https://topic.ykt.cbern.com.cn/web/ncet-xedu/config/theme.css",
  "https://topic.ykt.cbern.com.cn/web/ncet-xedu/s/school.json",
  "https://grey-config.ykt.cbern.com.cn/web_config.json",
  "https://api.ykt.cbern.com.cn/zxx/api_static/conf/6_7_17/searchconfig_platform.json",
  "https://api.ykt.cbern.com.cn/zxx/api_static/data/6_6_6/librarylist.json",
  "https://bdcs-file-1.ykt.cbern.com.cn/bdxcloud/configs/gradeSection.json",
  "https://bdcs-file-1.ykt.cbern.com.cn/bdxcloud/configs/job_title.json",
  "https://bdcs-file-1.ykt.cbern.com.cn/bdxcloud/configs/subjectCode.json",
  "https://bdcs-file-1.ykt.cbern.com.cn/studio/school/section.json",
  "https://bdcs-file-2.ykt.cbern.com.cn/bdxcloud/configs/resource_display.json",
  "https://cdncs.ykt.cbern.com.cn/v0.1/static/content_co_upload/question_bank/questions_tag_extra_config.json",
  "https://download.ykt.cbern.com.cn/json/release.json",
];

const DEFAULT_ALLOWED_HOSTS = new Set([
  "basic.smartedu.cn",
  "h5.basic.smartedu.cn",
  "topic.ykt.cbern.com.cn",
  "grey-config.ykt.cbern.com.cn",
  "api.ykt.cbern.com.cn",
  "bdcs-file-1.ykt.cbern.com.cn",
  "bdcs-file-2.ykt.cbern.com.cn",
  "cdncs.ykt.cbern.com.cn",
  "download.ykt.cbern.com.cn",
  "s-file-1.ykt.cbern.com.cn",
  "s-file-2.ykt.cbern.com.cn",
  "r1-ndr.ykt.cbern.com.cn",
  "r2-ndr.ykt.cbern.com.cn",
  "r3-ndr.ykt.cbern.com.cn",
  "x-api.ykt.eduyun.cn",
  "x-search.ykt.eduyun.cn",
  "x-recommend-service.ykt.eduyun.cn",
]);

const TEXT_EXTENSIONS = new Set([
  ".css",
  ".csv",
  ".html",
  ".js",
  ".json",
  ".map",
  ".md",
  ".mjs",
  ".svg",
  ".text",
  ".txt",
  ".xml",
  ".yaml",
  ".yml",
]);

const DOCUMENT_EXTENSIONS = new Set([
  ".doc",
  ".docx",
  ".epub",
  ".htm",
  ".html",
  ".pdf",
  ".ppt",
  ".pptx",
  ".rtf",
  ".xls",
  ".xlsx",
]);

const ASSET_EXTENSIONS = new Set([
  ".avif",
  ".bmp",
  ".css",
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".js",
  ".json",
  ".map",
  ".png",
  ".svg",
  ".ttf",
  ".txt",
  ".webp",
  ".woff",
  ".woff2",
  ".xml",
]);

const BLOCKED_EXTENSIONS = new Set([
  ".3gp",
  ".aac",
  ".apk",
  ".avi",
  ".deb",
  ".dmg",
  ".exe",
  ".flac",
  ".flv",
  ".ipa",
  ".m3u8",
  ".m4a",
  ".m4s",
  ".m4v",
  ".mkv",
  ".mov",
  ".mp3",
  ".mp4",
  ".mpeg",
  ".mpg",
  ".ogg",
  ".opus",
  ".rpm",
  ".msi",
  ".rmvb",
  ".ts",
  ".wav",
  ".webm",
]);

const BLOCKED_URL_PARTS = [
  "/video/",
  "/videos/",
  "/app_version/",
  "/limitation_support_ncet_xedu/",
  "/releases/",
  "serviceName=video_deploy_service",
  "video_deploy_service",
  ".720.",
  ".1080.",
];

const args = parseArgs(process.argv.slice(2));
const outDir = args.out || "smartedu_basic_download";
const maxFiles = Number(args.maxFiles || args.max || 5000);
const maxBytes = parseSize(args.maxBytes || "3GB");
const concurrency = Number(args.concurrency || 4);
const delayMs = Number(args.delayMs || 120);
const allowedHosts = new Set([
  ...DEFAULT_ALLOWED_HOSTS,
  ...String(args.allowedHost || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
]);

const state = {
  queued: [],
  seen: new Set(),
  downloaded: 0,
  skipped: 0,
  failed: 0,
  totalBytes: 0,
  startedAt: new Date().toISOString(),
  lastLogAt: 0,
};

const manifest = [];
const errors = [];
const skipped = [];

await mkdir(outDir, { recursive: true });
await mkdir(join(outDir, "files"), { recursive: true });
await mkdir(join(outDir, "_logs"), { recursive: true });

for (const seed of [...DEFAULT_SEEDS, ...String(args.seed || "").split(",")]) {
  enqueue(seed, "seed");
}

await runQueue();
await flushReports();

console.log(
  JSON.stringify(
    {
      outDir,
      downloaded: state.downloaded,
      skipped: state.skipped,
      failed: state.failed,
      queuedOrSeen: state.seen.size,
      totalBytes: state.totalBytes,
      maxFiles,
      maxBytes,
      startedAt: state.startedAt,
      finishedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);

async function runQueue() {
  const workers = Array.from({ length: concurrency }, (_, index) => worker(index));
  await Promise.all(workers);
}

async function worker(index) {
  while (true) {
    if (state.downloaded >= maxFiles || state.totalBytes >= maxBytes) {
      return;
    }

    const item = state.queued.shift();
    if (!item) {
      if (state.active) {
        await sleep(200);
        continue;
      }
      return;
    }

    state.active = (state.active || 0) + 1;
    try {
      await sleep(index * delayMs);
      await downloadOne(item);
    } finally {
      state.active -= 1;
    }
  }
}

async function downloadOne(item) {
  const url = normalizeUrl(item.url, item.base);
  if (!url) return;

  const blockReason = shouldSkip(url);
  if (blockReason) {
    addSkipped(url.href, blockReason, item.source);
    return;
  }

  if (state.downloaded >= maxFiles || state.totalBytes >= maxBytes) return;

  let response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "*/*",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.7",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/124.0 Safari/537.36 SmartEduPublicArchiver/1.0",
      },
      redirect: "follow",
    });
  } catch (error) {
    addError(url.href, "fetch", error);
    return;
  }

  const finalUrl = new URL(response.url || url.href);
  const finalSkip = shouldSkip(finalUrl);
  if (finalSkip) {
    addSkipped(finalUrl.href, finalSkip, item.source);
    return;
  }

  if (!response.ok) {
    addError(finalUrl.href, `http_${response.status}`, new Error(response.statusText));
    return;
  }

  const contentType = response.headers.get("content-type") || "";
  if (isBlockedContentType(contentType)) {
    addSkipped(finalUrl.href, `blocked_content_type:${contentType}`, item.source);
    return;
  }

  const contentLength = Number(response.headers.get("content-length") || "0");
  if (contentLength && state.totalBytes + contentLength > maxBytes) {
    addSkipped(finalUrl.href, "max_bytes_would_exceed", item.source);
    return;
  }

  const outputPath = localPathForUrl(finalUrl);
  await mkdir(dirname(outputPath), { recursive: true });

  const tmpPath = `${outputPath}.download`;
  let bytes = 0;
  const hash = createHash("sha256");
  try {
    const counter = new Transform({
      transform(chunk, _encoding, callback) {
        bytes += chunk.length;
        hash.update(chunk);
        if (state.totalBytes + bytes > maxBytes) {
          callback(new Error("max_bytes_exceeded"));
          return;
        }
        callback(null, chunk);
      },
    });
    await pipeline(response.body, counter, createWriteStream(tmpPath));
    await rename(tmpPath, outputPath);
  } catch (error) {
    await rm(tmpPath, { force: true });
    if (String(error.message || error).includes("max_bytes")) {
      addSkipped(finalUrl.href, "max_bytes_exceeded", item.source);
    } else {
      addError(finalUrl.href, "write", error);
    }
    return;
  }

  state.downloaded += 1;
  state.totalBytes += bytes;
  const entry = {
    url: finalUrl.href,
    source: item.source,
    path: outputPath,
    contentType,
    bytes,
    sha256: hash.digest("hex"),
    fetchedAt: new Date().toISOString(),
  };
  manifest.push(entry);
  await appendFile(join(outDir, "_logs", "downloaded_urls.txt"), `${finalUrl.href}\n`);

  const ext = extensionOf(finalUrl);
  if (isTextLike(contentType, ext, bytes)) {
    try {
      const text = await readFile(outputPath, "utf8");
      discoverUrls(text, finalUrl).forEach((next) => enqueue(next, finalUrl.href));
    } catch (error) {
      addError(finalUrl.href, "parse_text", error);
    }
  }

  maybeLog();
}

function enqueue(rawUrl, source, base) {
  const url = normalizeUrl(rawUrl, base);
  if (!url) return;

  const key = canonicalKey(url);
  if (state.seen.has(key)) return;
  state.seen.add(key);

  const reason = shouldSkip(url);
  if (reason) {
    addSkipped(url.href, reason, source);
    return;
  }

  state.queued.push({ url: url.href, source });
}

function discoverUrls(text, baseUrl) {
  const found = new Set();

  addAbsoluteMatches(text, found);
  addQuotedPathMatches(text, found, baseUrl);
  addHtmlAttributeMatches(text, found, baseUrl);
  addCssUrlMatches(text, found, baseUrl);
  addWebpackChunkMatches(text, found, baseUrl);
  addJsonUrlValues(text, found, baseUrl);

  return [...found];
}

function addHtmlAttributeMatches(text, found, baseUrl) {
  const attr = /\b(?:href|src|data-src|poster|action)=("[^"]+"|'[^']+'|[^\s>]+)/gi;
  for (const match of text.matchAll(attr)) {
    const value = cleanUrl(match[1].replace(/^["']|["']$/g, ""));
    const url = normalizeUrl(value, baseUrl.href);
    if (url) found.add(url.href);
  }
}

function addAbsoluteMatches(text, found) {
  const absolute = /https?:\/\/[^\s"'`<>)\\]+/g;
  for (const match of text.matchAll(absolute)) {
    found.add(cleanUrl(match[0]));
  }

  const protocolRelative = /(?<!:)\/\/[A-Za-z0-9.-]+\.[A-Za-z]{2,}[^\s"'`<>)\\]*/g;
  for (const match of text.matchAll(protocolRelative)) {
    found.add(`https:${cleanUrl(match[0])}`);
  }
}

function addQuotedPathMatches(text, found, baseUrl) {
  const quoted = /["'`]((?:\.\.?\/|\/)[^"'`<>\\\s]{2,})["'`]/g;
  for (const match of text.matchAll(quoted)) {
    const value = cleanUrl(match[1]);
    if (looksWorthFetching(value)) {
      const url = normalizeUrl(value, baseUrl.href);
      if (url) found.add(url.href);
    }
  }
}

function addCssUrlMatches(text, found, baseUrl) {
  const cssUrl = /url\(([^)]+)\)/g;
  for (const match of text.matchAll(cssUrl)) {
    const value = cleanUrl(match[1].replace(/^["']|["']$/g, ""));
    const url = normalizeUrl(value, baseUrl.href);
    if (url) found.add(url.href);
  }
}

function addWebpackChunkMatches(text, found, baseUrl) {
  if (!text.includes('return"js/"+e+"-"') && !text.includes("return'js/'+e+'-'")) {
    return;
  }

  const chunkMap = /(\d+):"([a-f0-9]{8,})"/g;
  for (const match of text.matchAll(chunkMap)) {
    const url = normalizeUrl(`/js/${match[1]}-${match[2]}.js`, baseUrl.href);
    if (url) found.add(url.href);
  }
}

function addJsonUrlValues(text, found, baseUrl) {
  if (!(text.trim().startsWith("{") || text.trim().startsWith("["))) return;

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return;
  }

  const visit = (value) => {
    if (typeof value === "string") {
      const cleaned = cleanUrl(value);
      if (
        /^https?:\/\//.test(cleaned) ||
        /^\/\//.test(cleaned) ||
        looksWorthFetching(cleaned)
      ) {
        const url = normalizeUrl(cleaned, baseUrl.href);
        if (url) found.add(url.href);
      }
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (value && typeof value === "object") {
      Object.values(value).forEach(visit);
    }
  };

  visit(json);
}

function looksWorthFetching(value) {
  if (!value || value.startsWith("#") || value.startsWith("data:")) return false;
  if (/^\w+:/.test(value) && !/^https?:/.test(value)) return false;

  const clean = value.split(/[?#]/)[0];
  const ext = pathExtension(clean);
  if (ext && (ASSET_EXTENSIONS.has(ext) || DOCUMENT_EXTENSIONS.has(ext))) return true;

  return (
    clean.includes("/api_static/") ||
    clean.includes("/bdxcloud/") ||
    clean.includes("/configs/") ||
    clean.includes("/ndrs/") ||
    clean.includes("/ndrv2/") ||
    clean.includes("/static/") ||
    clean.endsWith("/fulls.json") ||
    clean.endsWith("/site.json") ||
    clean.endsWith("/sitelist.json")
  );
}

function normalizeUrl(raw, base) {
  if (!raw || typeof raw !== "string") return null;
  let value = cleanUrl(raw);
  if (!value || value.startsWith("data:") || value.startsWith("blob:")) return null;

  if (value.startsWith("//")) value = `https:${value}`;

  let url;
  try {
    url = new URL(value, base || undefined);
  } catch {
    return null;
  }

  if (!["http:", "https:"].includes(url.protocol)) return null;
  url.hash = "";
  return url;
}

function cleanUrl(value) {
  return String(value)
    .trim()
    .replace(/^["'`]+|["'`,;]+$/g, "")
    .replace(/&amp;/g, "&");
}

function canonicalKey(url) {
  return url.href;
}

function shouldSkip(url) {
  if (!allowedHosts.has(url.hostname)) return `host_not_allowed:${url.hostname}`;

  const lowerHref = url.href.toLowerCase();
  for (const part of BLOCKED_URL_PARTS) {
    if (lowerHref.includes(part.toLowerCase())) return `blocked_url_part:${part}`;
  }

  const ext = extensionOf(url);
  if (BLOCKED_EXTENSIONS.has(ext)) return `blocked_extension:${ext}`;

  return "";
}

function isBlockedContentType(contentType) {
  const lower = contentType.toLowerCase();
  return lower.startsWith("video/") || lower.startsWith("audio/") || lower.includes("mpegurl");
}

function isTextLike(contentType, ext, bytes) {
  const lower = contentType.toLowerCase();
  if (lower.startsWith("text/")) return true;
  if (lower.includes("json") || lower.includes("javascript") || lower.includes("xml")) return true;
  if (TEXT_EXTENSIONS.has(ext)) return true;
  return bytes > 0 && bytes < 4 * 1024 * 1024 && [".svg", ".html"].includes(ext);
}

function localPathForUrl(url) {
  const pathParts = url.pathname
    .split("/")
    .filter(Boolean)
    .map((part) => safeSegment(decodeURIComponentSafe(part)));

  let fileName = pathParts.pop() || "index.html";
  if (!pathExtension(fileName)) {
    fileName = `${fileName}.html`;
  }

  if (url.search) {
    const hash = createHash("sha1").update(url.search).digest("hex").slice(0, 10);
    const ext = pathExtension(fileName);
    fileName = `${fileName.slice(0, fileName.length - ext.length)}__q_${hash}${ext}`;
  }

  return join(outDir, "files", safeSegment(url.hostname), ...pathParts, fileName);
}

function safeSegment(value) {
  return value.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").slice(0, 150) || "_";
}

function decodeURIComponentSafe(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function extensionOf(url) {
  return pathExtension(url.pathname.toLowerCase());
}

function pathExtension(path) {
  const last = path.split("/").pop() || "";
  const index = last.lastIndexOf(".");
  if (index <= 0) return "";
  return last.slice(index).toLowerCase();
}

function addSkipped(url, reason, source) {
  state.skipped += 1;
  skipped.push({ url, reason, source, at: new Date().toISOString() });
}

function addError(url, phase, error) {
  state.failed += 1;
  errors.push({
    url,
    phase,
    message: error?.message || String(error),
    at: new Date().toISOString(),
  });
}

async function flushReports() {
  await writeFile(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  await writeFile(join(outDir, "errors.json"), JSON.stringify(errors, null, 2), "utf8");
  await writeFile(join(outDir, "skipped.json"), JSON.stringify(skipped, null, 2), "utf8");
  await writeFile(
    join(outDir, "summary.json"),
    JSON.stringify(
      {
        downloaded: state.downloaded,
        skipped: state.skipped,
        failed: state.failed,
        queuedOrSeen: state.seen.size,
        totalBytes: state.totalBytes,
        maxFiles,
        maxBytes,
        startedAt: state.startedAt,
        finishedAt: new Date().toISOString(),
        note:
          "Public SmartEdu archive. Video, audio, stream, and non-allowlisted hosts were skipped.",
      },
      null,
      2,
    ),
    "utf8",
  );

  try {
    const filesDir = join(outDir, "files");
    const info = await stat(filesDir);
    if (!info.isDirectory()) throw new Error("files output is not a directory");
  } catch (error) {
    addError(outDir, "verify_output", error);
  }
}

function maybeLog() {
  const now = Date.now();
  if (now - state.lastLogAt < 5000) return;
  state.lastLogAt = now;
  console.error(
    `[smartedu] downloaded=${state.downloaded} queued=${state.queued.length} skipped=${state.skipped} failed=${state.failed} bytes=${state.totalBytes}`,
  );
}

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const [key, inlineValue] = arg.slice(2).split("=", 2);
    const value =
      inlineValue !== undefined
        ? inlineValue
        : argv[i + 1] && !argv[i + 1].startsWith("--")
          ? argv[++i]
          : "true";
    parsed[key] = value;
  }
  return parsed;
}

function parseSize(value) {
  const match = String(value)
    .trim()
    .match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/i);
  if (!match) return Number(value) || 0;
  const amount = Number(match[1]);
  const unit = (match[2] || "b").toLowerCase();
  const multiplier = {
    b: 1,
    kb: 1024,
    mb: 1024 ** 2,
    gb: 1024 ** 3,
  }[unit];
  return Math.floor(amount * multiplier);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
