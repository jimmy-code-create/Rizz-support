// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import {
  BRAND_LOGO_FALLBACK,
  BRAND_LOGO_URL,
  BrandLogo,
  BrandMark,
} from '@/components/ui/Brand';

afterEach(cleanup);

describe('Rizz brand logo', () => {
  it('requests the official app logo', () => {
    const { container } = render(<BrandLogo className="size-8" />);
    const image = container.querySelector('img');

    expect(image).not.toBeNull();
    expect(image).toHaveAttribute('src', BRAND_LOGO_URL);
    expect(image).toHaveAttribute('aria-hidden', 'true');
    expect(image).toHaveAttribute('draggable', 'false');
  });

  it('falls back to the local mark when the official asset fails', () => {
    const { container } = render(<BrandMark />);
    const image = container.querySelector('img');

    expect(image).not.toBeNull();
    expect(image).toHaveAttribute('src', BRAND_LOGO_URL);

    fireEvent.error(image as HTMLImageElement);

    expect(image).toHaveAttribute('src', BRAND_LOGO_FALLBACK);
  });
});
