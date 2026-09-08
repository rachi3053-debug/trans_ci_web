export function parsePageInput(page: string | number | null | undefined): number | null {
  const pageNumber = typeof page === 'number' ? page : parseInt(String(page ?? ''), 10);
  if (Number.isNaN(pageNumber) || pageNumber < 1) {
    return null;
  }
  return pageNumber;
}

export function sanitizeNumericInput(target: HTMLInputElement): void {
  target.value = target.value.replace(/[^0-9]/g, '');
}
