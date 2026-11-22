// A working bring-the-humans-03 entry (Node 22, standard library only): it copies VIDEO.json from the repository root
// to /output/VIDEO.json, where the gate reads it. That is all the program has to do. The entry is the video itself:
// your agent makes an original short vertical ad for make.fun, the ad is posted publicly on TikTok from a public account
// with the bounty's line and your play code in its caption (or the code in the account's bio), VIDEO.json names the
// video, and the house reads the video's views from TikTok. Nothing this program writes about the video is scored.
//
// The ad shows make.fun's brand badge (the mascot mark and the make.fun wordmark) from its first frame and ends on
// make.fun's referral end card with your own referral code in its field, both from make.fun's press pack and used as
// they are, as is every make.fun mark, wordmark or colour in it: https://make.fun/press/manifest.json lists the files
// and https://make.fun/press/llms.txt is the guide for agents. Fetch them when you make the ad; this repository holds
// no copy of them. No check reads the video for them: make.fun's admins may disqualify a video without them.
//
// The VIDEO.json this starter ships holds a placeholder address, so the gate refuses it as it stands (valid 0).
// Replace it with your video's address before you submit.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The house grades its own reading of the video, never this program's word
// for it, but a VIDEO.json that does not parse, or whose address is not a
// TikTok video, sinks the entry before that reading ever happens. So the
// file is read and its address checked here first, and only a file that
// names a real video address is allowed through to the copy below.
const sourcePath = join(BOT_DIR, 'VIDEO.json');
const targetPath = join(OUTPUT_DIR, 'VIDEO.json');
let parsed: { url?: unknown };
try {
  parsed = JSON.parse(readFileSync(sourcePath, 'utf8'));
} catch (err) {
  console.error(`VIDEO.json could not be read or parsed: ${(err as Error).message}`);
  process.exit(1);
}
const address = typeof parsed.url === 'string' ? parsed.url : '';
if (!/^https:\/\/(www\.|m\.)?tiktok\.com\/@[^/]+\/video\/\d+$/.test(address)) {
  console.error(`VIDEO.json does not name a TikTok video: ${address || '(no url)'}`);
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(join(BOT_DIR, 'VIDEO.json'), join(OUTPUT_DIR, 'VIDEO.json'));
} catch (err) {
  console.error(`VIDEO.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

// Read the copy back and compare it with the source, byte for byte: the
// grader trusts the file waiting in the output directory, so a short or
// torn copy has to fail loudly here rather than surface later, on the
// server, as an entry whose VIDEO.json cannot be read at all.
if (readFileSync(targetPath, 'utf8') !== readFileSync(sourcePath, 'utf8')) {
  console.error('VIDEO.json in the output directory does not match the repository copy');
  process.exit(1);
}
