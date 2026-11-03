import type { CategoryId } from '@shared/support';

export type ArticleBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'steps'; items: string[] }
  | { type: 'list'; items: string[] }
  | { type: 'note'; title?: string; text: string };

export interface HelpArticle {
  slug: string;
  title: string;
  description: string;
  categoryId: CategoryId;
  /** Date this guide was written/verified by the support team. */
  updatedAt: string;
  keywords: string[];
  featuredRank?: number;
  blocks: ArticleBlock[];
}

export const ARTICLES: readonly HelpArticle[] = [
  {
    slug: 'how-to-get-started-with-rizz',
    title: 'How to get started with Rizz',
    description:
      'Create your account, claim your username, and learn what the feed, realms, voice rooms, and messages are for.',
    categoryId: 'account',
    updatedAt: '2026-11-03',
    featuredRank: 1,
    keywords: ['getting started', 'sign up', 'signup', 'create account', 'username', 'new user'],
    blocks: [
      {
        type: 'p',
        text: 'Rizz is a browser-based social app that combines a feed, profile channels called realms, live voice rooms, and private messaging. You do not need to download anything to use it, and creating an account is free.',
      },
      { type: 'h2', text: 'Create your account' },
      {
        type: 'steps',
        items: [
          'Open the official Rizz site at [rizzapp.onrender.com](https://rizzapp.onrender.com/).',
          'Select **Claim your @** to go to the sign-up screen.',
          'Choose the username you want. This becomes your public @ handle, so pick something you are happy to keep.',
          'Add your email address, then choose a password or use the email-code option shown on the sign-up screen.',
          'Select **Create account**. You will land in Rizz with your new handle. When you return later, sign in with your email address and password.',
        ],
      },
      {
        type: 'note',
        title: 'No card needed',
        text: 'Rizz sign-up is free and does not ask for payment details. You only need a username, an email address, and a way to sign in.',
      },
      { type: 'h2', text: 'Find your way around' },
      {
        type: 'list',
        items: [
          '**The feed** shows photos, reels, polls, and timed drops from the people you follow.',
          '**Realms** are channels on a profile — such as #vibes, #drops, or #art-dump — with their own roles, moderation, and permissions.',
          '**Voice rooms** can be started from a post or a channel, and presence shows who is actually in the room before you join.',
          '**Messages** covers private chat with reactions, wallpapers, and voice notes, plus stories that disappear after 24 hours.',
        ],
      },
      { type: 'h2', text: 'If something goes wrong' },
      {
        type: 'p',
        text: 'Start with the help articles, then [submit a request](/submit) if you are still stuck. Choose **Account issue** for anything related to sign-up or access, or **Technical issue** if the site itself is misbehaving. Save the ticket reference you receive so you can [track the request](/track) later.',
      },
    ],
  },
  {
    slug: 'i-cannot-access-my-account',
    title: 'I cannot access my account',
    description:
      'Work through the usual sign-in causes, then send the right details to support without sharing anything sensitive.',
    categoryId: 'account',
    updatedAt: '2026-11-03',
    featuredRank: 2,
    keywords: ['login', 'log in', 'sign in', 'locked out', 'password', 'access', 'email code'],
    blocks: [
      {
        type: 'p',
        text: 'Rizz signs you in with the email address on your account and your password. Most access problems come down to a mistyped email address, a mistyped password, or a reset that was never completed. Work through the checks below before you contact support.',
      },
      { type: 'h2', text: 'Check the basics' },
      {
        type: 'steps',
        items: [
          'Open the official login page at [rizzapp.onrender.com/login](https://rizzapp.onrender.com/login) rather than an old bookmark or a search result.',
          'Enter the email address on your account and re-type your password carefully. Watch for caps lock and keyboard layout changes.',
          'If you have forgotten the password, select **Forgot?** on the login screen and follow the instructions to reset it. Check your inbox and spam folder for the reset message.',
          'Try a private/incognito window or a different browser. A stale session or browser extension can interrupt sign-in.',
          'Make sure you are using the same email address you registered with. The username is not the sign-in field.',
        ],
      },
      {
        type: 'note',
        title: 'Support will never ask for your password',
        text: 'Do not include your password or an email sign-in code in a support request. Nobody on the support team needs either one to look into an access problem.',
      },
      { type: 'h2', text: 'Send a request with the right details' },
      {
        type: 'p',
        text: 'If you still cannot get in, [submit a request](/submit) and choose **Account issue**. Include:',
      },
      {
        type: 'list',
        items: [
          'Your @username and the email address on the account.',
          'What happens when you try to sign in, including the exact error message if one appears.',
          'Whether you have tried the **Forgot?** reset flow, and what happened if you did.',
          'The browser and device you are using, plus the time the problem started.',
        ],
      },
      {
        type: 'p',
        text: 'Account recovery is handled by a person, not automatically by this form. Once your request is in, keep the reference number and use [ticket tracking](/track) to check for updates or a request for more information.',
      },
    ],
  },
  {
    slug: 'how-to-report-a-bug',
    title: 'How to report a bug',
    description:
      'A good bug report gets fixed faster. Here is exactly what to capture before you submit one.',
    categoryId: 'bugs',
    updatedAt: '2026-11-03',
    featuredRank: 3,
    keywords: ['bug report', 'error', 'broken', 'glitch', 'crash', 'report a problem'],
    blocks: [
      {
        type: 'p',
        text: 'A bug is anything in Rizz that behaves differently from what it is supposed to do: a page that will not load, a post that fails to publish, a voice room that drops, or an error message you cannot get past.',
      },
      { type: 'h2', text: 'Capture these details first' },
      {
        type: 'list',
        items: [
          '**Where it happened** — the page and, if relevant, the realm or channel name.',
          '**What you did** — the short sequence of actions leading up to the problem.',
          '**What you expected** and **what actually happened**.',
          '**When it started** and whether it happens every time or only sometimes.',
          '**Your browser and device**, for example Chrome on Windows 11 or Safari on iPhone.',
          '**A screenshot or short description of any error message.** Blur or crop anything private before attaching it.',
        ],
      },
      { type: 'h2', text: 'Submit the report' },
      {
        type: 'steps',
        items: [
          'Open the [support request form](/submit).',
          'Choose **Bug report** as the issue category, or **Technical issue** if the whole site is failing rather than one feature.',
          'Use a subject that names the problem in a few words, such as "Images fail to upload in #art-dump".',
          'Put the reproduction steps, expected result, and actual result in the description. Plain facts are more useful than a long story.',
          'Attach one screenshot if it helps, then submit.',
        ],
      },
      {
        type: 'note',
        title: 'Keep it clean',
        text: 'Never attach passwords, email codes, private messages, or someone else’s personal information. Attachments are limited to 5 MB and must be PNG, JPEG, WebP, PDF, or plain text.',
      },
      {
        type: 'p',
        text: 'If you already sent the same report, do not submit it again. Use [ticket tracking](/track) with your reference number and email to see whether it is open, in progress, or resolved.',
      },
    ],
  },
  {
    slug: 'troubleshooting-common-website-issues',
    title: 'Troubleshooting common website issues',
    description:
      'Step-by-step checks for pages that will not load, buttons that do nothing, and voice rooms that fail to connect.',
    categoryId: 'bugs',
    updatedAt: '2026-11-03',
    featuredRank: 5,
    keywords: ['not loading', 'blank page', 'slow', 'voice', 'microphone', 'browser', 'cache', 'fix'],
    blocks: [
      {
        type: 'p',
        text: 'Before you report a technical issue, run through these checks. They resolve a large share of browser-side problems without needing a support ticket.',
      },
      { type: 'h2', text: 'Pages that will not load' },
      {
        type: 'steps',
        items: [
          'Reload the page once. On desktop use Ctrl+R (Windows/Linux) or Cmd+R (macOS) to make a fresh request.',
          'Confirm your internet connection works by opening another site.',
          'Try a private/incognito window. If Rizz works there, a browser extension or stale session is the likely cause.',
          'Turn off extensions one at a time, or test in a different browser.',
          'Clear cookies and cached files for the Rizz site. This will sign you out, so make sure you know your sign-in details first.',
          'Try another network or device. Some school, office, and public networks block parts of browser apps.',
        ],
      },
      { type: 'h2', text: 'Voice rooms that fail to connect' },
      {
        type: 'p',
        text: 'Voice rooms run in the browser, so the browser needs permission to use your microphone. If you cannot hear anyone or nobody can hear you, check the site permissions in your browser settings, make sure the correct microphone is selected, and confirm you are not muted by the operating system. A headset or a different browser can help isolate the problem.',
      },
      { type: 'h2', text: 'When to contact support' },
      {
        type: 'p',
        text: 'If the problem continues and other sites behave normally, [submit a request](/submit) with **Technical issue** selected. Include the page you were on, the time it happened, your browser and device, and any error message. A screenshot is welcome, as long as it does not show private information.',
      },
      {
        type: 'note',
        title: 'Check your connection first',
        text: 'Rizz is a browser app, so an unstable connection can look like a broken feature. If posts, images, and voice all fail at once, test another site before assuming the problem is on Rizz.',
      },
    ],
  },
  {
    slug: 'how-to-submit-a-feature-request',
    title: 'How to submit a feature request',
    description:
      'Explain the problem behind your idea so the team can understand it, evaluate it, and connect it to other feedback.',
    categoryId: 'features',
    updatedAt: '2026-11-03',
    featuredRank: 4,
    keywords: ['feature request', 'feedback', 'suggestion', 'idea', 'improvement'],
    blocks: [
      {
        type: 'p',
        text: 'Feature requests are read as product feedback. You do not need a polished proposal — a clear description of the problem and the outcome you want is enough.',
      },
      { type: 'h2', text: 'Write a request that is easy to act on' },
      {
        type: 'list',
        items: [
          '**Lead with the problem.** What are you trying to do, and where does Rizz get in the way today?',
          '**Describe the outcome** rather than only the interface. "I want to find a realm’s rules before joining" is more useful than "add a rules button".',
          '**Keep it to one idea per request.** Separate requests are easier to review and track.',
          '**Include context** such as whether it affects the feed, realms, voice rooms, messages, or stories.',
        ],
      },
      { type: 'h2', text: 'Send it through the form' },
      {
        type: 'steps',
        items: [
          'Open the [support request form](/submit).',
          'Choose **Feature request** as the issue category.',
          'Set priority to **Normal** unless the missing capability is blocking something important.',
          'Describe the problem, the outcome you want, and who it would help.',
          'Submit and keep the ticket reference for your records.',
        ],
      },
      {
        type: 'note',
        title: 'What to expect',
        text: 'Submitting a request records your feedback; it does not guarantee that a feature will be built or give you a delivery date. Priority describes urgency for you, not a commitment from the team.',
      },
      {
        type: 'p',
        text: 'If you need to add detail after submitting, use the reference number with [ticket tracking](/track) to check whether the request is still open and waiting for information.',
      },
    ],
  },
  {
    slug: 'how-to-contact-the-support-team',
    title: 'How to contact the support team',
    description:
      'The verified ways to reach Rizz support, what to include, and how to follow your request after it is sent.',
    categoryId: 'general',
    updatedAt: '2026-11-03',
    featuredRank: 6,
    keywords: ['contact', 'support', 'talk to someone', 'help', 'email', 'human'],
    blocks: [
      {
        type: 'p',
        text: 'This Support Center is the support channel we can verify for Rizz. It combines help articles, FAQs, a request form, and ticket tracking in one place.',
      },
      { type: 'h2', text: 'Before you write in' },
      {
        type: 'p',
        text: 'Search the [help articles](/help) and [FAQs](/faqs) first — many questions about sign-up, sign-in, realms, voice rooms, and stories already have an answer there. If you find what you need, you save yourself a wait.',
      },
      { type: 'h2', text: 'Send a request' },
      {
        type: 'steps',
        items: [
          'Open the [support request form](/submit).',
          'Choose the issue category that best matches the problem.',
          'Write a clear subject and include what happened, what you expected, and any error text.',
          'Add your browser and device if the issue is technical. Attach one screenshot if it helps.',
          'Submit the form and save the ticket reference number shown on the confirmation.',
        ],
      },
      { type: 'h2', text: 'Follow the request' },
      {
        type: 'p',
        text: 'Go to [ticket tracking](/track) and enter the reference number together with the email address you used on the form. You will see the actual status stored for your request and any response history the team has added.',
      },
      {
        type: 'note',
        title: 'Channels we do not publish',
        text: 'We do not list a support email address, phone number, Discord invite, response-time promise, or support hours, because we cannot verify them for Rizz. Treat any third-party account claiming to be official Rizz support as untrusted, and never send your password or email code to anyone.',
      },
    ],
  },
  {
    slug: 'reporting-abuse-or-safety-concerns',
    title: 'Reporting abuse or a safety concern',
    description:
      'How to report harassment, impersonation, scams, or suspicious activity with the details the team needs.',
    categoryId: 'safety',
    updatedAt: '2026-11-03',
    keywords: ['safety', 'abuse', 'harassment', 'impersonation', 'scam', 'report'],
    blocks: [
      {
        type: 'p',
        text: 'If someone on Rizz is harassing you, impersonating another person, sharing suspicious links, or behaving in a way that feels unsafe, report it to support with as much specific detail as you can.',
      },
      { type: 'h2', text: 'Protect yourself first' },
      {
        type: 'list',
        items: [
          'Stop interacting with the account. You do not need to reply to prove that something happened.',
          'Do not click links that look unfamiliar or ask you to sign in again.',
          'Save the evidence you already have: usernames, timestamps, links, and screenshots. Do not download unknown files.',
          'If your account may be compromised, stop using links from the conversation and report it right away. Support can advise on the options available for your account.',
          'If there is an immediate risk to someone’s physical safety, contact your local emergency services. Support requests are not an emergency channel.',
        ],
      },
      { type: 'h2', text: 'What to include in the report' },
      {
        type: 'steps',
        items: [
          'Open the [support request form](/submit) and choose **Safety concern**.',
          'Use **Urgent** priority if the situation involves a threat, a compromised account, or an ongoing safety risk. Otherwise **High** is appropriate.',
          'Name the accounts involved exactly as they appear, and describe what happened in chronological order.',
          'Include where it happened — a realm, channel, post, voice room, or private message — with dates and times where you have them.',
          'Attach a screenshot only if it is safe to do so and does not expose personal information about you or anyone else.',
        ],
      },
      {
        type: 'note',
        title: 'What not to send',
        text: 'Never send your password, an email sign-in code, or someone else’s private information. Support will not ask you for credentials. Do not repost harmful content elsewhere while a report is being reviewed.',
      },
      {
        type: 'p',
        text: 'After submitting, keep your ticket reference. You can check whether the report is open, in progress, or waiting on you through [ticket tracking](/track). If support needs more context, they will add a response to the ticket.',
      },
    ],
  },
  {
    slug: 'keeping-your-account-secure',
    title: 'Keeping your account secure',
    description:
      'Practical habits that protect your Rizz account, and what to do if you notice something suspicious.',
    categoryId: 'safety',
    updatedAt: '2026-11-03',
    keywords: ['security', 'password', 'phishing', 'hacked', 'protect', 'account safety'],
    blocks: [
      {
        type: 'p',
        text: 'Your account is protected by the sign-in details you chose at sign-up. A few habits make a meaningful difference, especially on a social app where impersonation is common.',
      },
      { type: 'h2', text: 'Everyday habits' },
      {
        type: 'list',
        items: [
          'Use a password you do not reuse anywhere else. A password manager makes this easy.',
          'Treat email sign-in codes like keys. Rizz will not need you to read one out to another person.',
          'Avoid signing in on shared or public devices. If you must, do not leave the session open when you are done.',
          'Keep your browser up to date, and avoid sign-in pages reached through links in messages.',
          'Check the address bar before you type a password: the official Rizz site is **rizzapp.onrender.com**.',
        ],
      },
      { type: 'h2', text: 'Avoiding impersonation and phishing' },
      {
        type: 'p',
        text: 'A common scam is a message from an account that looks like staff or a friend and asks for your password, an email code, or a payment. Rizz support will never ask for your password or email code through a message or this form. If someone does, stop the conversation and report the account.',
      },
      { type: 'h2', text: 'If something looks wrong' },
      {
        type: 'p',
        text: 'Signs to watch for include sign-in attempts you did not make, messages you did not send, content posted from your account, or a password-reset message you did not request. Report it through the [support form](/submit) using **Safety concern**. Include your @username, what you noticed, and when it started — but never your password or a code.',
      },
      {
        type: 'note',
        title: 'You can always ask first',
        text: 'If you are unsure whether a request is genuine, submit a support request and ask. Verify before you act, not after.',
      },
    ],
  },
] as const;

export function articleBySlug(slug: string): HelpArticle | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}

export function articleSearchText(article: HelpArticle): string {
  return article.blocks
    .map((block) => {
      if (block.type === 'p' || block.type === 'h2') return block.text;
      if (block.type === 'note') return block.text;
      return block.items.join(' ');
    })
    .join(' ')
    .replace(/\*\*|\[|\]|\([^)]*\)/g, ' ');
}

export function readingTimeMinutes(article: HelpArticle): number {
  const words = articleSearchText(article).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function articlesInCategory(categoryId: string): HelpArticle[] {
  return ARTICLES.filter((article) => article.categoryId === categoryId);
}

export function popularArticles(limit = 6): HelpArticle[] {
  return [...ARTICLES]
    .filter((article) => article.featuredRank !== undefined)
    .sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99))
    .slice(0, limit);
}

export function relatedArticles(article: HelpArticle, limit = 3): HelpArticle[] {
  const sameCategory = ARTICLES.filter(
    (candidate) => candidate.slug !== article.slug && candidate.categoryId === article.categoryId,
  );
  const others = ARTICLES.filter(
    (candidate) => candidate.slug !== article.slug && candidate.categoryId !== article.categoryId,
  );
  return [...sameCategory, ...others].slice(0, limit);
}
