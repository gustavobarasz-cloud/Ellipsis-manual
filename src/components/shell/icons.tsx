// Small inline icons (no icon package).
const P = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
export const IconBack = () => (<svg viewBox="0 0 24 24" width="22" height="22" {...P} aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>);
export const IconMore = () => (<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>);
export const IconCard = () => (<svg viewBox="0 0 24 24" width="20" height="20" {...P} aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 10h10M7 14h6" /></svg>);
export const IconLearn = () => (<svg viewBox="0 0 24 24" {...P} aria-hidden="true"><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5z" /><path d="M4 19a2 2 0 012-2h13" /></svg>);
export const IconPractice = () => (<svg viewBox="0 0 24 24" {...P} aria-hidden="true"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.8" fill="currentColor" /></svg>);
export const IconJournal = () => (<svg viewBox="0 0 24 24" {...P} aria-hidden="true"><path d="M6 3h11a2 2 0 012 2v16l-4-2-4 2-4-2-3 2V5a2 2 0 012-2z" /><path d="M9 8h6M9 12h6" /></svg>);
export const IconClose = () => (<svg viewBox="0 0 24 24" width="22" height="22" {...P} aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>);
