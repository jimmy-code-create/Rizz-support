// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SearchBox } from '@/components/search/SearchBox';
import { Accordion } from '@/components/ui/Accordion';
import { ToastProvider } from '@/components/ui/Toast';
import { SubmitPage } from '@/pages/SubmitPage';

beforeEach(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('SearchBox', () => {
  it('shows grouped results as the user types and navigates on click', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={<SearchBox variant="hero" inputLabel="Search help" />}
          />
          <Route path="/help/:slug" element={<div>Article destination</div>} />
        </Routes>
      </MemoryRouter>,
    );

    const input = screen.getByRole('combobox', { name: 'Search help' });
    await user.type(input, 'bug');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0);

    const option = screen.getByRole('option', { name: /How to report a bug/i });
    await user.click(option);
    expect(await screen.findByText('Article destination')).toBeInTheDocument();
  });

  it('opens a viewport-anchored panel on focus and closes it with Escape or an outside click', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SearchBox variant="hero" inputLabel="Search help" showPopular />
      </MemoryRouter>,
    );

    const input = screen.getByRole('combobox', { name: 'Search help' });
    await user.click(input);

    const panelId = input.getAttribute('aria-controls') ?? '';
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));

    const panel = document.getElementById(panelId);
    expect(panel).not.toBeNull();
    expect(panel?.style.position).toBe('fixed');
    expect(panel?.style.zIndex).toBe('45');
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);

    await user.keyboard('{Escape}');
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'false'));
    await waitFor(() => expect(document.getElementById(panelId)).toBeNull());

    await user.click(input);
    await waitFor(() => expect(document.getElementById(panelId)).not.toBeNull());
    await user.click(document.body);
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'false'));
    await waitFor(() => expect(document.getElementById(panelId)).toBeNull());
  });

  it('supports keyboard navigation and shows an empty state', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SearchBox variant="hero" inputLabel="Search help" />
      </MemoryRouter>,
    );
    const input = screen.getByRole('combobox', { name: 'Search help' });

    await user.type(input, 'zzzzqqqq');
    expect(screen.getByText(/^No results for/)).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, 'login');
    await user.keyboard('{ArrowDown}');
    const options = screen.getAllByRole('option');
    expect(options.some((option) => option.getAttribute('aria-selected') === 'true')).toBe(true);
  });
});

describe('Accordion', () => {
  const items = [
    { id: 'first', question: 'First question', answer: <p>First answer</p> },
    { id: 'second', question: 'Second question', answer: <p>Second answer</p> },
  ];

  it('expands and collapses with aria state', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);
    const button = screen.getByRole('button', { name: 'First question' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('region', { name: 'First question' })).toHaveAttribute('data-open', 'true');
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('SubmitPage', () => {
  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={['/submit']}>
        <ToastProvider>
          <Routes>
            <Route path="/submit" element={<SubmitPage />} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>,
    );

  it('validates required fields before sending anything', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    renderPage();

    await user.click(screen.getByRole('button', { name: /Submit support request/i }));

    expect(await screen.findByText(/Enter your full name/i)).toBeInTheDocument();
    expect(screen.getByText(/Enter the email address linked to your request/i)).toBeInTheDocument();
    expect(screen.getByText(/Choose the issue category/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('submits a valid request and shows the real reference returned by the API', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ticket: {
            reference: 'RZ-TEST12',
            subject: 'Upload issue',
            category: 'bug',
            priority: 'normal',
            status: 'open',
            createdAt: '2026-11-03T07:00:00.000Z',
            updatedAt: '2026-11-03T07:00:00.000Z',
            attachmentName: null,
          },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    renderPage();

    await user.type(screen.getByLabelText(/Full name/i), 'Alex Rivera');
    await user.type(screen.getByLabelText(/Email address/i), 'alex@example.com');
    await user.selectOptions(screen.getByLabelText(/Issue category/i), 'bug');
    await user.type(screen.getByLabelText(/Subject/i), 'Upload issue');
    await user.type(
      screen.getByLabelText(/Detailed description/i),
      'The upload spinner never finishes when I choose a PNG in my realm channel.',
    );

    await user.click(screen.getByRole('button', { name: /Submit support request/i }));

    expect(await screen.findByText('Your request is in.')).toBeInTheDocument();
    expect(screen.getByText('RZ-TEST12')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get('category')).toBe('bug');
  });

  it('keeps the form and reports a server-side failure', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong on our side.' } }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    renderPage();

    await user.type(screen.getByLabelText(/Full name/i), 'Alex Rivera');
    await user.type(screen.getByLabelText(/Email address/i), 'alex@example.com');
    await user.selectOptions(screen.getByLabelText(/Issue category/i), 'technical');
    await user.type(screen.getByLabelText(/Subject/i), 'Site will not load');
    await user.type(
      screen.getByLabelText(/Detailed description/i),
      'Every page shows a blank screen in my browser, even after a hard reload.',
    );
    await user.click(screen.getByRole('button', { name: /Submit support request/i }));

    await waitFor(() => {
      expect(screen.getByText('Something went wrong on our side.')).toBeInTheDocument();
    });
    expect(screen.queryByText('Your request is in.')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Full name/i)).toHaveValue('Alex Rivera');
  });
});
