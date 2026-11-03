// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/Toast';
import { IssuesPage } from '@/pages/IssuesPage';
import { NewIssuePage } from '@/pages/NewIssuePage';
import { SubmitPage } from '@/pages/SubmitPage';

const ISSUE = {
  id: 'IS-ABC123',
  title: 'Voice room joins fail on a slow connection',
  description:
    'Joining a voice room sometimes leaves the join button spinning without entering the room.',
  category: 'technical' as const,
  status: 'open' as const,
  votes: 1,
  voted: false,
  createdAt: '2026-11-03T07:00:00.000Z',
  updatedAt: '2026-11-03T07:00:00.000Z',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function renderBoard() {
  return render(
    <MemoryRouter initialEntries={['/issues']}>
      <ToastProvider>
        <Routes>
          <Route path="/issues" element={<IssuesPage />} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('public issue board', () => {
  it('renders reports, saves a vote, and exposes a working actions menu', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      if (url === '/api/issues' && (!init || init.method === 'GET')) {
        return jsonResponse({ issues: [ISSUE] });
      }
      if (url === `/api/issues/${ISSUE.id}/vote` && init?.method === 'POST') {
        return jsonResponse({ issue: { ...ISSUE, votes: 2, voted: true } });
      }
      throw new Error(`Unexpected fetch: ${url} ${init?.method ?? 'GET'}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    renderBoard();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Community issue board' }),
    ).toBeInTheDocument();
    expect(await screen.findByText(ISSUE.title)).toBeInTheDocument();

    const vote = screen.getByRole('button', { name: /Upvote “Voice room joins fail/i });
    await user.click(vote);
    await waitFor(() => expect(vote).toHaveAttribute('aria-pressed', 'true'));
    expect(within(vote).getByText('2')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/issues/${ISSUE.id}/vote`,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(screen.getByRole('link', { name: /Submit this problem to support/i })).toHaveAttribute(
      'href',
      expect.stringContaining('category=bugs'),
    );

    const trigger = screen.getByRole('button', {
      name: 'Actions for Voice room joins fail on a slow connection',
    });
    await user.click(trigger);
    const menu = await screen.findByRole('menu');
    const copyItem = within(menu).getByRole('menuitem', { name: 'Copy issue link' });
    await waitFor(() => expect(copyItem).toHaveFocus());

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    const reopened = await screen.findByRole('menu');
    await user.click(within(reopened).getByRole('menuitem', { name: 'Copy issue link' }));

    expect(await screen.findByText('Issue link copied')).toBeInTheDocument();
  });

  it('prefills a private support request from a public issue', async () => {
    const prefilledDescription =
      'Reported on the public issue board as IS-ABC123.\n\nJoining a voice room sometimes leaves the join button spinning without entering the room.\n\nWhat happened for you:';
    const entry = `/submit?category=bugs&subject=${encodeURIComponent(ISSUE.title)}&description=${encodeURIComponent(prefilledDescription)}&issue=IS-ABC123`;

    render(
      <MemoryRouter initialEntries={[entry]}>
        <ToastProvider>
          <Routes>
            <Route path="/submit" element={<SubmitPage />} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('note')).toHaveTextContent(/Following up on public issue/i);
    expect(screen.getByRole('note')).toHaveTextContent('IS-ABC123');
    expect(screen.getByLabelText(/Issue category/i)).toHaveValue('bug');
    expect(screen.getByLabelText(/Subject/i)).toHaveValue(ISSUE.title);
    expect(screen.getByLabelText(/Detailed description/i)).toHaveValue(prefilledDescription);
  });

  it('validates a public report before sending it, then publishes and navigates', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      if (url === '/api/issues' && init?.method === 'POST') {
        return jsonResponse({ issue: { ...ISSUE, id: 'IS-NEW123' } }, 201);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/issues/new']}>
        <ToastProvider>
          <Routes>
            <Route path="/issues/new" element={<NewIssuePage />} />
            <Route path="/issues" element={<div>Board destination</div>} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Publish issue' }));
    expect(await screen.findByText(/at least 4 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 20 characters/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText(/Issue title/i), 'Messages fail to send');
    await user.selectOptions(screen.getByLabelText(/Category/i), 'technical');
    await user.type(
      screen.getByLabelText(/What is happening/i),
      'Sending a message leaves it stuck in the pending state until I reload the page.',
    );
    await user.click(screen.getByRole('button', { name: 'Publish issue' }));

    expect(await screen.findByText('Board destination')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('POST');
    const body = JSON.parse(String(init.body)) as Record<string, string>;
    expect(body.title).toBe('Messages fail to send');
    expect(body.category).toBe('technical');
    expect(body.website).toBe('');
  });
});
