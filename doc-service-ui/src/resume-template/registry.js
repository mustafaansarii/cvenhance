import classic from './templates/classic';
import modern from './templates/modern';
import minimal from './templates/minimal';
import elegant from './templates/elegant';
import compact from './templates/compact';
import bold from './templates/bold';
import professional from './templates/professional';
import williamLucas from './templates/williamLucas';
import jakeResume from './templates/jakeResume';
import zayden from './templates/zayden';
import drSameer from './templates/drSameer';
import mrAbrahm from './templates/mrAbrahm';
import drEmilyChen from './templates/drEmilyChen';
import ramanSingh from './templates/ramanSingh';
import michaelRodriguez from './templates/michaelRodriguez';
import priyaSharma from './templates/priyaSharma';
import kumarMukesh from './templates/kumarMukesh';
import timeline from './templates/timeline';
import violetRodriguez from './templates/violetRodriguez';
import ankitaTiwari from './templates/ankitaTiwari';
import margaritaPerez from './templates/margaritaPerez';

const TEMPLATES = [
    classic, modern, minimal, elegant, compact, bold, professional, timeline,
    violetRodriguez, ankitaTiwari, margaritaPerez,
    williamLucas, jakeResume, zayden, drSameer, mrAbrahm, drEmilyChen,
    ramanSingh, michaelRodriguez, priyaSharma, kumarMukesh,
];

export const TEMPLATE_MAP = Object.fromEntries(TEMPLATES.map((t) => [t.code, t]));
export const TEMPLATE_LIST = TEMPLATES;
export const DEFAULT_CODE = 'classic';

export function getTemplate(code) {
    return TEMPLATE_MAP[code] || TEMPLATE_MAP[DEFAULT_CODE];
}
