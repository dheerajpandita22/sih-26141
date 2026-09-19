const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";

function randomChars(len: number, rng: () => number = Math.random): string {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += ALPHABET[Math.floor(rng() * ALPHABET.length)];
  }
  return out;
}

export function genSignatureId(rng?: () => number): string {
  return `SIG-${randomChars(8, rng)}`;
}

export function genSessionId(rng?: () => number): string {
  return `SES-${randomChars(6, rng)}`;
}

export function genRequestId(rng?: () => number): string {
  return `REQ-${randomChars(10, rng)}`;
}

export function genNonce(rng?: () => number): string {
  return `${randomChars(4, rng)}-${randomChars(4, rng)}-${randomChars(4, rng)}`;
}

export function genLogId(rng?: () => number): string {
  return `LOG-${randomChars(8, rng)}-${Date.now().toString(36)}`;
}

export function genHistoryId(rng?: () => number): string {
  return `HIS-${randomChars(6, rng)}-${Date.now().toString(36)}`;
}
