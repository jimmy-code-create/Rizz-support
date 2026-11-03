// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/App';

beforeEach(() => {
  window.history.replaceState({}, '', '/');
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('support center shell', () => {
  it('renders the home page with navigation and footer', async () => {
    render(<App />);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'How can we help you?' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Back to Rizz/i })[0]).toHaveAttribute(
      'href',
      'https://rizzapp.onrender.com/',
    );
    expect(screen.getByText(/Rizz itself is unchanged by this support portal/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^Privacy/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^Terms/i })).not.toBeInTheDocument();
  });

  it('navigates to help articles and FAQs', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole('heading', { level: 1, name: 'How can we help you?' });

    const primaryNav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(primaryNav).getByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await user.click(within(primaryNav).getByRole('link', { name: 'Help Articles' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Help articles' })).toBeInTheDocument();
    expect(within(primaryNav).getByRole('link', { name: 'Help Articles' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(document.title).toContain('Help Articles');

    await user.click(within(primaryNav).getByRole('link', { name: 'FAQs' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Frequently asked questions' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /What is Rizz\?/ }).length).toBeGreaterThan(0);
  });

  it('opens the search palette, closes on Escape, and opens a result', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole('heading', { level: 1, name: 'How can we help you?' }, { timeout: 5000 });

    const opener = screen.getByRole('button', { name: 'Search the support center' });
    await user.click(opener);
    const dialog = await screen.findByRole('dialog', { name: 'Search the Rizz Support Center' });
    expect(within(dialog).getByRole('combobox')).toHaveFocus();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Search the Rizz Support Center' })).not.toBeInTheDocument());

    await user.click(opener);
    const reopened = await screen.findByRole('dialog', { name: 'Search the Rizz Support Center' });
    await user.type(within(reopened).getByRole('combobox'), 'bug');
    const option = await screen.findByRole('option', { name: /How to report a bug/i });
    await user.click(option);

    await waitFor(() => expect(window.location.pathname).toContain('/help/'));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Search the Rizz Support Center' })).not.toBeInTheDocument());
  });

  it('opens the mobile navigation, locks scroll, and closes after navigating', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole('heading', { level: 1, name: 'How can we help you?' }, { timeout: 5000 });

    const toggle = screen.getByRole('button', { name: 'Open navigation menu' });
    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(document.body.style.overflow).toBe('hidden');

    const mobileNav = screen.getByRole('navigation', { name: 'Mobile' });
    await user.click(within(mobileNav).getByRole('link', { name: 'Help Articles' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Help articles' }, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('renders an article page and a 404 for unknown routes', async () => {
    window.history.replaceState({}, '', '/help/how-to-report-a-bug');
    render(<App />);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'How to report a bug' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Capture these details first' }),
    ).toBeInTheDocument();

    cleanup();
    window.history.replaceState({}, '', '/does-not-exist');
    render(<App />);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'This page wandered off' }),
    ).toBeInTheDocument();
  });
});
