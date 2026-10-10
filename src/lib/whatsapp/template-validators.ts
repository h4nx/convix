/**
 * Pure validators for message templates, run BEFORE the Meta submit
 * call so a misconfigured template fails at save time (with a specific
 * field-level error) rather than at the Meta API boundary (where the
 * error is a generic 400 + opaque rejection_reason hours later).
 *
 * Every validator throws `Error(message)` — callers catch and surface
 * to the UI. Caps follow Meta's published limits for the Cloud API
 * template surface (v21.0):
 *   https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates
 *
 * Per-element button validation lives here rather than as a JSONB CHECK
 * because Postgres CHECK constraints can't contain subqueries, and
 * generic CHECK violations don't give users an actionable error
 * ("button #3 has no `text`" beats "constraint violated").
 */

import type {
  MessageTemplate,
  TemplateButton,
  TemplateSampleValues,
} from '@/types';

export const TEMPLATE_LIMITS = {
  bodyMaxLength: 1024,
  footerMaxLength: 60,
  headerTextMaxLength: 60,
  buttonTextMaxLength: 25,
  maxButtonsTotal: 10,
  maxUrlButtons: 2,
  maxPhoneButtons: 1,
  maxCopyCodeButtons: 1,
  /** Meta: lowercase a-z, digits, underscore. Up to 512 chars. */
  nameRegex: /^[a-z0-9_]{1,512}$/,
} as const;

export interface TemplatePayload {
  name: string;
  category: MessageTemplate['category'];
  language: string;
  header_type?: MessageTemplate['header_type'];
  header_content?: string;
  header_media_url?: string;
  header_handle?: string;
  body_text: string;
  footer_text?: string;
  buttons?: TemplateButton[];
  sample_values?: TemplateSampleValues;
}

export function validateTemplateName(name: string): void {
  if (!name) throw new Error('El nombre de la plantilla es obligatorio.');
  if (!TEMPLATE_LIMITS.nameRegex.test(name)) {
    throw new Error(
      'El nombre de la plantilla solo puede usar letras minúsculas, dígitos y guiones bajos (1-512 caracteres).',
    );
  }
}

/**
 * Extract sorted, deduplicated {{N}} indices from a string. Returns
 * `[1, 2, 4]` for `"Hi {{1}} {{2}}, item {{4}}"`.
 */
export function extractVariableIndices(text: string): number[] {
  const matches = text.matchAll(/\{\{(\d+)\}\}/g);
  const set = new Set<number>();
  for (const m of matches) {
    const n = Number(m[1]);
    if (Number.isFinite(n) && n >= 1) set.add(n);
  }
  return [...set].sort((a, b) => a - b);
}

/**
 * Meta requires contiguous, 1-indexed variables. `{{1}} {{3}}` is
 * invalid — it must be `{{1}} {{2}}`.
 */
function assertContiguous(indices: number[], where: string): void {
  for (let i = 0; i < indices.length; i++) {
    if (indices[i] !== i + 1) {
      throw new Error(
        `Las variables de ${where} deben ser contiguas empezando en {{1}} — se encontró ${indices
          .map((n) => `{{${n}}}`)
          .join(', ')}.`,
      );
    }
  }
}

export function validateBody(bodyText: string): number[] {
  if (!bodyText.trim()) throw new Error('El texto del cuerpo es obligatorio.');
  if (bodyText.length > TEMPLATE_LIMITS.bodyMaxLength) {
    throw new Error(
      `El texto del cuerpo supera ${TEMPLATE_LIMITS.bodyMaxLength} caracteres (se recibieron ${bodyText.length}).`,
    );
  }
  const indices = extractVariableIndices(bodyText);
  assertContiguous(indices, 'Body');
  return indices;
}

export function validateFooter(footerText: string | undefined): void {
  if (!footerText) return;
  if (footerText.length > TEMPLATE_LIMITS.footerMaxLength) {
    throw new Error(
      `El texto del pie supera ${TEMPLATE_LIMITS.footerMaxLength} caracteres (se recibieron ${footerText.length}).`,
    );
  }
  if (extractVariableIndices(footerText).length > 0) {
    throw new Error('El texto del pie no puede contener variables {{N}} (regla de Meta).');
  }
}

export interface HeaderValidationResult {
  /** number of {{N}} placeholders in a TEXT header — 0 or 1. */
  variableCount: number;
}

export function validateHeader(
  payload: Pick<
    TemplatePayload,
    'header_type' | 'header_content' | 'header_media_url' | 'header_handle'
  >,
): HeaderValidationResult {
  const { header_type, header_content, header_media_url, header_handle } = payload;
  if (!header_type) return { variableCount: 0 };

  if (header_type === 'text') {
    if (!header_content || !header_content.trim()) {
      throw new Error('El encabezado de texto requiere header_content.');
    }
    if (header_content.length > TEMPLATE_LIMITS.headerTextMaxLength) {
      throw new Error(
        `El texto del encabezado supera ${TEMPLATE_LIMITS.headerTextMaxLength} caracteres (se recibieron ${header_content.length}).`,
      );
    }
    const indices = extractVariableIndices(header_content);
    if (indices.length > 1) {
      throw new Error(
        `El encabezado de texto admite como máximo una variable — se encontraron ${indices.length} (regla de Meta).`,
      );
    }
    if (indices.length === 1 && indices[0] !== 1) {
      throw new Error('La variable del encabezado de texto debe ser {{1}} (regla de Meta).');
    }
    return { variableCount: indices.length };
  }

  // image / video / document need either a public URL or a Resumable
  // Upload handle. Either one — Meta accepts both example forms.
  if (!header_media_url && !header_handle) {
    throw new Error(
      `El encabezado ${header_type} requiere una URL de muestra pública (header_media_url) o un handle de subida reanudable (header_handle).`,
    );
  }
  if (header_media_url) {
    try {
      const u = new URL(header_media_url);
      if (u.protocol !== 'https:' && u.protocol !== 'http:') {
        throw new Error('header_media_url debe usar http(s).');
      }
    } catch {
      throw new Error('header_media_url debe ser una URL válida.');
    }
  }
  return { variableCount: 0 };
}

function countButtonsByType(
  buttons: TemplateButton[],
): Record<TemplateButton['type'], number> {
  const counts: Record<TemplateButton['type'], number> = {
    QUICK_REPLY: 0,
    URL: 0,
    PHONE_NUMBER: 0,
    COPY_CODE: 0,
  };
  for (const b of buttons) counts[b.type]++;
  return counts;
}

export function validateButtons(buttons: TemplateButton[] | undefined): void {
  if (!buttons || buttons.length === 0) return;
  if (buttons.length > TEMPLATE_LIMITS.maxButtonsTotal) {
    throw new Error(
      `Las plantillas pueden tener como máximo ${TEMPLATE_LIMITS.maxButtonsTotal} botones (se recibieron ${buttons.length}).`,
    );
  }

  const counts = countButtonsByType(buttons);
  if (counts.URL > TEMPLATE_LIMITS.maxUrlButtons) {
    throw new Error(
      `Como máximo ${TEMPLATE_LIMITS.maxUrlButtons} botones URL permitidos (se recibieron ${counts.URL}).`,
    );
  }
  if (counts.PHONE_NUMBER > TEMPLATE_LIMITS.maxPhoneButtons) {
    throw new Error(
      `Como máximo ${TEMPLATE_LIMITS.maxPhoneButtons} botón PHONE_NUMBER permitido (se recibieron ${counts.PHONE_NUMBER}).`,
    );
  }
  if (counts.COPY_CODE > TEMPLATE_LIMITS.maxCopyCodeButtons) {
    throw new Error(
      `Como máximo ${TEMPLATE_LIMITS.maxCopyCodeButtons} botón COPY_CODE permitido (se recibieron ${counts.COPY_CODE}).`,
    );
  }

  // Meta rule: QUICK_REPLY buttons must be contiguous — they can't be
  // interleaved with CTA buttons. Easiest check: walk the array; once
  // we leave the QUICK_REPLY block, we must not see another.
  let sawNonQR = false;
  for (const b of buttons) {
    if (b.type === 'QUICK_REPLY') {
      if (sawNonQR) {
        throw new Error(
          'Los botones QUICK_REPLY no pueden mezclarse con botones URL / PHONE_NUMBER / COPY_CODE — agrúpalos al inicio.',
        );
      }
    } else {
      sawNonQR = true;
    }
  }

  for (let i = 0; i < buttons.length; i++) {
    const b = buttons[i];
    if (!b.text?.trim()) {
      throw new Error(`Botón n.º ${i + 1} (${b.type}) no tiene texto.`);
    }
    if (b.text.length > TEMPLATE_LIMITS.buttonTextMaxLength) {
      throw new Error(
        `Botón n.º ${i + 1} el texto supera ${TEMPLATE_LIMITS.buttonTextMaxLength} caracteres.`,
      );
    }
    switch (b.type) {
      case 'URL': {
        if (!b.url?.trim()) {
          throw new Error(`Botón URL n.º ${i + 1} no tiene url.`);
        }
        try {
          new URL(b.url);
        } catch {
          throw new Error(`Botón URL n.º ${i + 1} tiene una URL no válida.`);
        }
        const urlVars = extractVariableIndices(b.url);
        if (urlVars.length > 1) {
          throw new Error(
            `Botón URL n.º ${i + 1} puede tener como máximo una variable (regla de Meta).`,
          );
        }
        if (urlVars.length === 1) {
          if (urlVars[0] !== 1) {
            throw new Error(
              `La variable del botón URL n.º ${i + 1} debe ser {{1}} (regla de Meta).`,
            );
          }
          if (!b.example?.trim()) {
            throw new Error(
              `El botón URL n.º ${i + 1} usa {{1}} — Meta exige un valor de ejemplo.`,
            );
          }
        }
        break;
      }
      case 'PHONE_NUMBER':
        if (!b.phone_number?.trim()) {
          throw new Error(
            `Botón PHONE_NUMBER n.º ${i + 1} no tiene phone_number.`,
          );
        }
        break;
      case 'COPY_CODE':
        if (!b.example?.trim()) {
          throw new Error(
            `Botón COPY_CODE n.º ${i + 1} no tiene valor de ejemplo.`,
          );
        }
        break;
    }
  }
}

/**
 * Sample values must be supplied 1:1 with the variables in the body
 * (and header, if it has one). Meta uses these for human review.
 */
export function validateSampleValues(
  payload: TemplatePayload,
  bodyVarCount: number,
  headerVarCount: number,
): void {
  const samples = payload.sample_values ?? {};
  const body = samples.body ?? [];
  const header = samples.header ?? [];

  if (body.length !== bodyVarCount) {
    throw new Error(
      `El cuerpo tiene ${bodyVarCount} variable(s) — indica exactamente ${bodyVarCount} valor(es) de muestra (se recibieron ${body.length}).`,
    );
  }
  if (header.length !== headerVarCount) {
    throw new Error(
      `El encabezado tiene ${headerVarCount} variable(s) — indica exactamente ${headerVarCount} valor(es) de muestra (se recibieron ${header.length}).`,
    );
  }
  for (let i = 0; i < body.length; i++) {
    if (!body[i] || !body[i].trim()) {
      throw new Error(`Valor de muestra del cuerpo n.º ${i + 1} está vacío.`);
    }
  }
  for (let i = 0; i < header.length; i++) {
    if (!header[i] || !header[i].trim()) {
      throw new Error(`Valor de muestra del encabezado n.º ${i + 1} está vacío.`);
    }
  }
}

/**
 * Run every validator. Throws on the first failure with a specific,
 * field-level message. Returns the variable counts so callers can
 * reuse them when building the Meta components payload.
 */
export function validateTemplatePayload(payload: TemplatePayload): {
  bodyVarCount: number;
  headerVarCount: number;
} {
  validateTemplateName(payload.name);
  if (!payload.language?.trim()) {
    throw new Error('El idioma es obligatorio.');
  }
  const bodyVars = validateBody(payload.body_text);
  validateFooter(payload.footer_text);
  const headerResult = validateHeader(payload);
  validateButtons(payload.buttons);
  validateSampleValues(payload, bodyVars.length, headerResult.variableCount);
  return {
    bodyVarCount: bodyVars.length,
    headerVarCount: headerResult.variableCount,
  };
}
