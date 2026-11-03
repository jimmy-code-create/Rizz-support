import { ArrowUpRight, Link2, LifeBuoy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { issueCategoryLabel, type IssueCategory } from '@shared/support';
import type { PublicIssue } from '@shared/issues';
import { Badge } from '@/components/ui/Badge';
import { ActionMenu, type ActionMenuItem } from '@/components/ui/ActionMenu';
import { VoteButton } from '@/components/issues/VoteButton';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/format';
import { copyTextToClipboard } from '@/lib/clipboard';

function supportRequestHref(issue: PublicIssue): string {
  const params = new URLSearchParams({
    category: SUBMIT_TOPIC[issue.category],
    subject: issue.title,
    description: `Reported on the public issue board as ${issue.id}.\n\n${issue.description}\n\nWhat happened for you:`,
    issue: issue.id,
  });
  return `/submit?${params.toString()}`;
}

const SUBMIT_TOPIC: Record<IssueCategory, string> = {
  account: 'account',
  technical: 'bugs',
  bug: 'bugs',
  feature: 'features',
  safety: 'safety',
  other: 'general',
};

interface IssueCardProps {
  issue: PublicIssue;
  pending: boolean;
  onToggleVote: () => void;
  index?: number;
  highlighted?: boolean;
}

export function IssueCard({ issue, pending, onToggleVote, index = 0, highlighted = false }: IssueCardProps) {
  const { toast } = useToast();
  const reported = formatDate(issue.createdAt);

  const copyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${issue.id}`;
    try {
      await copyTextToClipboard(url);
      toast({ title: 'Issue link copied', tone: 'success' });
    } catch {
      toast({
        title: 'Could not copy the link',
        description: 'Select the address bar and copy it manually.',
        tone: 'error',
      });
    }
  };

  const items: ActionMenuItem[] = [
    { label: 'Copy issue link', icon: Link2, onSelect: copyLink },
    {
      label: 'Submit this problem to support',
      icon: LifeBuoy,
      to: supportRequestHref(issue),
    },
  ];

  return (
    <article
      id={issue.id}
      style={{ animationDelay: `${Math.min(index, 5) * 40}ms` }}
      className={`animate-fade-up scroll-mt-24 rounded-panel border bg-card p-5 shadow-card sm:p-6 ${
        highlighted ? 'border-lime/40 ring-1 ring-lime/15' : 'border-line-subtle'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{issueCategoryLabel(issue.category)}</Badge>
          <Badge tone="lime" dot>
            Open
          </Badge>
        </div>
        <ActionMenu label={`Actions for ${issue.title}`} items={items} />
      </div>

      <h2 className="mt-4 text-[17px] font-medium leading-[1.35] tracking-[-0.025em] text-ink sm:text-[18px]">
        {issue.title}
      </h2>
      <p className="mt-2.5 whitespace-pre-line text-[13px] leading-[1.75] text-muted">
        {issue.description}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line-subtle pt-4">
        <VoteButton issue={issue} pending={pending} onToggle={onToggleVote} />
        <p className="text-[11px] text-faint">
          {reported ? <>Reported {reported}</> : 'Community report'}
        </p>
      </div>

      {issue.voted ? (
        <p className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 border-t border-line-subtle pt-3 text-[11.5px] text-faint">
          Need a private reply?
          <Link
            to={supportRequestHref(issue)}
            className="inline-flex items-center gap-1 font-medium text-lime transition-colors hover:text-lime-deep"
          >
            Submit this problem to support
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        </p>
      ) : null}
    </article>
  );
}
