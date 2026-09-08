import { AbstractControl, FormGroup } from '@angular/forms';

export function isFieldInvalid(form: FormGroup | null | undefined, fieldName: string): boolean {
  const field = form?.get(fieldName);
  return !!(field && field.invalid && (field.dirty || field.touched));
}

export function getFieldError(
  form: FormGroup | null | undefined,
  fieldName: string,
  labels: Record<string, string> = {},
): string {
  const field = form?.get(fieldName);
  if (!field || !field.errors) {
    return '';
  }
  const label = labels[fieldName] || 'Ce champ';
  if (field.errors['required']) {
    return `${label} est obligatoire.`;
  }
  if (field.errors['minlength']) {
    return `${label} est trop court.`;
  }
  if (field.errors['maxlength']) {
    return `${label} est trop long.`;
  }
  if (field.errors['email']) {
    return `${label} n'est pas un e-mail valide.`;
  }
  if (field.errors['min']) {
    return `${label} est trop petit.`;
  }
  if (field.errors['max']) {
    return `${label} est trop grand.`;
  }
  return `${label} est invalide.`;
}

export function numericInputValue(raw: unknown): string {
  const match = String(raw ?? '').replace(',', '.').match(/\d+(?:\.\d+)?/);
  return match ? match[0] : '';
}

export function withUnit(raw: unknown, unit: string): string {
  const n = numericInputValue(raw);
  return n ? `${n} ${unit}` : '';
}

export function compareById(a: { id?: string } | string | null, b: { id?: string } | string | null): boolean {
  const idA = typeof a === 'string' ? a : a?.id;
  const idB = typeof b === 'string' ? b : b?.id;
  return !!idA && !!idB && idA === idB;
}

export function controlInvalid(control: AbstractControl | null | undefined): boolean {
  return !!(control && control.invalid && (control.dirty || control.touched));
}

/** Valeur `yyyy-MM-dd` pour un input date, à partir d’un ISO ou d’une Date. */
export function toDateInputValue(value: unknown): string {
  if (value == null) return '';
  const raw = String(value).trim();
  if (!raw || raw === 'null' || raw === 'undefined') return '';
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return '';
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${parsed.getFullYear()}-${month}-${day}`;
}

/** HTML utilisable par Quill (string HTML ou Delta `{ ops }`). */
export function toQuillHtml(raw: unknown): string {
  if (raw == null) return '';
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object' && Array.isArray((raw as { ops?: unknown }).ops)) {
    const text = (raw as { ops: Array<{ insert?: unknown }> }).ops
      .map((op) => (typeof op?.insert === 'string' ? op.insert : ''))
      .join('')
      .replace(/\n+$/g, '')
      .trim();
    return text ? `<p>${text.replace(/\n/g, '</p><p>')}</p>` : '';
  }
  return String(raw);
}
