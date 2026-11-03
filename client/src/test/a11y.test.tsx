// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { App } from '@/App';

beforeEach(() => {
  document.documentElement.lang = 'en';
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function audit() {
  const results = await axe.run(document, {
    rules: {
      // jsdom has no layout engine, so contrast and geometry-based checks cannot run.
      'color-contrast': { enabled: false },
      'target-size': { enabled: false },
    },
  });
  return results.violations.map((violation) => ({
    id: violation.id,
    help: violation.help,
    nodes: violation.nodes.map((node) => node.target.join(' ')),
  }));
}

async function expectNoViolations() {
  const violations = await audit();
  if (violations.length) console.log(JSON.stringify(violations, null, 2));
  expect(violations).toEqual([]);
}

describe('accessibility', () => {
  it('home page has no axe violations', async () => {
    window.history.replaceState({}, '', '/');
    render(<App />);
    await screen.findByRole('heading', { level: 1, name: 'How can we help you?' });
    await expectNoViolations();
  });

  it('search suggestions panel has no axe violations', async () => {
    window.history.replaceState({}, '', '/');
    const user = userEvent.setup();
    render(<App />);
    const input = await screen.findByRole('combobox', { name: 'Search help, articles, or common issues' });
    await user.click(input);
    await screen.findByText('Search suggestions');
    await expectNoViolations();
    await user.type(input, 'bug');
    await screen.findByRole('listbox');
    await expectNoViolations();
  });

  it('command palette and inline results have no axe violations', async () => {
    window.history.replaceState({}, '', '/');
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole('heading', { level: 1, name: 'How can we help you?' });

    await user.click(screen.getByRole('button', { name: 'Search the support center' }));
    const dialog = await screen.findByRole('dialog', { name: 'Search the Rizz Support Center' });
    await expectNoViolations();

    await user.type(within(dialog).getByRole('combobox'), 'bug');
    await within(dialog).findByRole('option', { name: /How to report a bug/i });
    await expectNoViolations();
  });

  it('help, FAQ and article pages have no axe violations', async () => {
    window.history.replaceState({}, '', '/help');
    render(<App />);
    await screen.findByRole('heading', { level: 1, name: 'Help articles' });
    await expectNoViolations();

    cleanup();
    window.history.replaceState({}, '', '/faqs');
    render(<App />);
    await screen.findByRole('heading', { level: 1, name: 'Frequently asked questions' });
    await expectNoViolations();

    cleanup();
    window.history.replaceState({}, '', '/help/how-to-report-a-bug');
    render(<App />);
    await screen.findByRole('heading', { level: 1, name: 'How to report a bug' });
    await expectNoViolations();
  });

  it('issue board and report form have no axe violations', async () => {
    const user = userEvent.setup();
    const issue = {
      id: 'IS-ABC123',
      title: 'Voice room joins fail on a slow connection',
      description:
        'Joining a voice room sometimes leaves the join button spinning without entering the room.',
      category: 'technical',
      status: 'open',
      votes: 1,
      voted: false,
      createdAt: '2026-11-03T07:00:00.000Z',
      updatedAt: '2026-11-03T07:00:00.000Z',
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ issues: [issue] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    window.history.replaceState({}, '', '/issues');
    render(<App />);
    await screen.findByRole('heading', { level: 1, name: 'Community issue board' });
    await screen.findByText(issue.title);
    await expectNoViolations();

    await user.click(
      screen.getByRole('button', {
        name: 'Actions for Voice room joins fail on a slow connection',
      }),
    );
    await screen.findByRole('menu');
    await expectNoViolations();

    cleanup();
    vi.unstubAllGlobals();
    window.history.replaceState({}, '', '/issues/new');
    render(<App />);
    await screen.findByRole('heading', { level: 1, name: 'Report a public issue' });
    await expectNoViolations();
  });

  it('submit and track pages have no axe violations', async () => {
    window.history.replaceState({}, '', '/submit');
    render(<App />);
    await screen.findByRole('heading', { level: 1, name: "Tell us what's going on" });
    await expectNoViolations();

    cleanup();
    window.history.replaceState({}, '', '/track');
    render(<App />);
    await screen.findByRole('heading', { level: 1, name: 'Track a support request' });
    await expectNoViolations();
  });
});
