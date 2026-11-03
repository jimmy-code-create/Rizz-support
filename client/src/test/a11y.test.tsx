// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
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
    await screen.findByText('Popular searches');
    await expectNoViolations();
    await user.type(input, 'bug');
    await screen.findByRole('listbox');
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
