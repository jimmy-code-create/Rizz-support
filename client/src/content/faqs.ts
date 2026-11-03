import type { CategoryId } from '@shared/support';

export interface Faq {
  id: string;
  question: string;
  answer: string;
  categoryId: CategoryId;
  keywords: string[];
  relatedSlug?: string;
}

export const FAQS: readonly Faq[] = [
  {
    id: 'what-is-rizz',
    question: 'What is Rizz?',
    answer:
      'Rizz is a browser-based social app built around four things: a feed of photos, reels, polls, and timed drops; realms, which are channels on your profile with their own roles, moderation, and permissions; live voice rooms you can start from a post or channel; and private messages with reactions, wallpapers, voice notes, and stories that disappear after 24 hours. You can use it on a phone or desktop browser without downloading an app.',
    categoryId: 'general',
    keywords: ['what is rizz', 'about', 'features', 'app', 'platform', 'social'],
    relatedSlug: 'how-to-get-started-with-rizz',
  },
  {
    id: 'how-do-i-create-an-account',
    question: 'How do I create an account?',
    answer:
      'Open rizzapp.onrender.com and select "Claim your @". Choose a username, add your email address, then set a password or use the email-code option on the sign-up screen. Select "Create account" and your handle is ready. You sign in later with your email address and password. Sign-up is free and does not ask for card details.',
    categoryId: 'account',
    keywords: ['create account', 'sign up', 'signup', 'register', 'username', 'free'],
    relatedSlug: 'how-to-get-started-with-rizz',
  },
  {
    id: 'cannot-log-in',
    question: 'What should I do if I cannot log in?',
    answer:
      'Check that you are on the official login page and that the email address and password are typed exactly. If you have forgotten your password, select "Forgot?" on the login screen and follow the reset instructions. Check your inbox and spam folder for the reset message. Try a private window or another browser. If you still cannot get in, submit a request with the Account issue category and include your @username and account email — never your password or a code.',
    categoryId: 'account',
    keywords: ['cannot log in', 'login problem', 'sign in', 'locked out', 'password', 'access'],
    relatedSlug: 'i-cannot-access-my-account',
  },
  {
    id: 'how-to-report-a-bug',
    question: 'How can I report a bug?',
    answer:
      'Use the support request form and choose "Bug report". Describe where the problem happened, what you did, what you expected, and what actually happened. Add your browser and device, plus a screenshot if it helps and does not contain private information. You will receive a ticket reference number that you can use to track the report.',
    categoryId: 'bugs',
    keywords: ['report bug', 'bug', 'error', 'broken', 'glitch', 'technical'],
    relatedSlug: 'how-to-report-a-bug',
  },
  {
    id: 'how-to-suggest-a-feature',
    question: 'How can I suggest a new feature?',
    answer:
      'Send it through the support form with the "Feature request" category. Explain the problem you are trying to solve, the outcome you want, and where in Rizz it applies. Keep each request to one idea. Submitting feedback records your suggestion, but it does not guarantee that a feature will ship or provide a delivery date.',
    categoryId: 'features',
    keywords: ['suggest feature', 'feature request', 'feedback', 'idea', 'improvement'],
    relatedSlug: 'how-to-submit-a-feature-request',
  },
  {
    id: 'why-website-not-loading',
    question: 'Why is the website not loading?',
    answer:
      'First check that your connection works by opening another site. Reload Rizz, then try a private/incognito window or a different browser to rule out an extension or stale session. Clearing site cookies and cached files often helps, though it will sign you out. If other sites load normally and Rizz still does not, submit a Technical issue request with the time, page, browser, and any error text.',
    categoryId: 'bugs',
    keywords: ['not loading', 'blank page', 'website down', 'loading problem', 'browser', 'slow'],
    relatedSlug: 'troubleshooting-common-website-issues',
  },
  {
    id: 'how-to-contact-support',
    question: 'How can I contact the support team?',
    answer:
      'Use this Support Center: submit a support request, then use your reference number and email address to track it. This is the support channel we can verify. We do not publish a support email address, phone number, Discord invite, or support hours, so avoid any third-party account claiming to be official Rizz support. Never share your password or an email code with anyone.',
    categoryId: 'general',
    keywords: ['contact support', 'support team', 'email', 'phone', 'discord', 'help'],
    relatedSlug: 'how-to-contact-the-support-team',
  },
  {
    id: 'report-inappropriate-behavior',
    question: 'How do I report inappropriate behavior?',
    answer:
      'Submit a request with the "Safety concern" category. Include the exact usernames involved, what happened, where it happened (realm, channel, post, voice room, or private message), and the dates or times if you have them. Use Urgent priority for threats, compromised accounts, or an ongoing safety risk. Add screenshots only if it is safe to do so. If there is an immediate risk to someone’s physical safety, contact your local emergency services.',
    categoryId: 'safety',
    keywords: ['report abuse', 'harassment', 'inappropriate behavior', 'safety', 'impersonation', 'scam'],
    relatedSlug: 'reporting-abuse-or-safety-concerns',
  },
  {
    id: 'is-rizz-free',
    question: 'Is Rizz free?',
    answer:
      'Yes. Rizz sign-up is free and does not require a card. Because no payment is needed to use Rizz, most people will not have a billing question. If something payment-related does come up, submit a request with the Other category and include the details.',
    categoryId: 'payments',
    keywords: ['free', 'cost', 'price', 'payment', 'billing', 'card'],
    relatedSlug: 'how-to-get-started-with-rizz',
  },
  {
    id: 'what-are-realms',
    question: 'What are realms?',
    answer:
      'Realms are the channels that live on a profile, such as #vibes, #drops, or #art-dump. Each one has its own roles, moderation, and permissions, and there is no separate server setup or invite process. Posts can be made in a realm channel, and you can start a voice room from a channel too.',
    categoryId: 'features',
    keywords: ['realms', 'channels', 'roles', 'moderation', 'permissions'],
    relatedSlug: 'how-to-get-started-with-rizz',
  },
  {
    id: 'what-is-a-voice-room',
    question: 'What is a voice room?',
    answer:
      'A voice room is a live conversation you can start from a post or a channel. Presence shows who is actually in the room, so you can see whether people are there before joining. Voice rooms work in a browser on a phone or desktop, with no download.',
    categoryId: 'features',
    keywords: ['voice room', 'voice', 'audio', 'microphone', 'call'],
    relatedSlug: 'troubleshooting-common-website-issues',
  },
  {
    id: 'do-stories-disappear',
    question: 'Do stories disappear?',
    answer:
      'Stories on Rizz disappear after 24 hours. Private messages also support reactions, wallpapers, and voice notes.',
    categoryId: 'features',
    keywords: ['stories', '24 hours', 'disappear', 'expire', 'messages'],
    relatedSlug: 'how-to-get-started-with-rizz',
  },
  {
    id: 'how-do-i-track-my-request',
    question: 'How do I track my support request?',
    answer:
      'Open ticket tracking and enter the reference number from your confirmation together with the email address you used on the request. You will see the request’s real status — Open, In Progress, Waiting for User, Resolved, or Closed — along with its submission date, last update, and any responses the team has added.',
    categoryId: 'general',
    keywords: ['track ticket', 'ticket status', 'reference number', 'request status', 'follow up'],
    relatedSlug: 'how-to-contact-the-support-team',
  },
  {
    id: 'what-information-should-i-never-share',
    question: 'What information should I never share?',
    answer:
      'Never send your password or an email sign-in code to anyone, including someone claiming to be support. Do not attach private messages, other people’s personal information, or sensitive documents to a ticket. Delete or blur personal details in screenshots before uploading them.',
    categoryId: 'safety',
    keywords: ['password', 'security', 'never share', 'email code', 'privacy', 'phishing'],
    relatedSlug: 'keeping-your-account-secure',
  },
] as const;

export function faqsForCategory(categoryId: string): Faq[] {
  return FAQS.filter((faq) => faq.categoryId === categoryId);
}
