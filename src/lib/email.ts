// The address is kept as fragments so it never appears as one literal string
// in source or build output. Joined only when a visitor asks to reveal it.
const LOCAL_PART = ['joel', 'trauger'];
const DOMAIN = ['gmail', 'com'];

export function assembleAddress(): string {
  return `${LOCAL_PART.join('.')}@${DOMAIN.join('.')}`;
}

export function mailtoHref(): string {
  return `mailto:${assembleAddress()}`;
}
