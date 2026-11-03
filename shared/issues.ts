import type { IssueCategory } from './support.ts';

/**
 * Public issue board contract. These records are deliberately separate from
 * support tickets: an issue is public, has no email or private replies, and
 * can be upvoted by the community.
 */
export const ISSUE_ID_PATTERN = /^IS-[0-9A-Z]{6}$/;

export const ISSUE_LIMITS = {
  title: 120,
  description: 600,
} as const;

export interface PublicIssue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: 'open';
  votes: number;
  voted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListIssuesResponse {
  issues: PublicIssue[];
}

export interface CreateIssueResponse {
  issue: PublicIssue;
}

export interface ToggleIssueVoteResponse {
  issue: PublicIssue;
}
