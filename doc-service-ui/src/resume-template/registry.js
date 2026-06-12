import classic from './templates/classic';
import modern from './templates/modern';
import minimal from './templates/minimal';
import elegant from './templates/elegant';
import compact from './templates/compact';
import bold from './templates/bold';
import professional from './templates/professional';

const TEMPLATES = [classic, modern, minimal, elegant, compact, bold, professional];

export const TEMPLATE_MAP = Object.fromEntries(TEMPLATES.map((t) => [t.code, t]));
export const TEMPLATE_LIST = TEMPLATES;
export const DEFAULT_CODE = 'classic';

export function getTemplate(code) {
    return TEMPLATE_MAP[code] || TEMPLATE_MAP[DEFAULT_CODE];
}
