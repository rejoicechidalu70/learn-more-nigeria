// Older phone browsers lack some modern features the AI Tutor relies on.
if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID !== "function") {
  (globalThis.crypto as { randomUUID: () => string }).randomUUID = () =>
    "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => {
      const n = Number(c);
      const r = globalThis.crypto.getRandomValues
        ? globalThis.crypto.getRandomValues(new Uint8Array(1))[0]!
        : Math.floor(Math.random() * 256);
      return (n ^ (r & (15 >> (n / 4)))).toString(16);
    });
}
if (!Array.prototype.at) {
  Object.defineProperty(Array.prototype, "at", {
    configurable: true,
    writable: true,
    value: function (this: unknown[], i: number) {
      const n = Math.trunc(i) || 0;
      return this[n < 0 ? this.length + n : n];
    },
  });
}
if (!String.prototype.replaceAll) {
  Object.defineProperty(String.prototype, "replaceAll", {
    configurable: true,
    writable: true,
    value: function (this: string, s: string | RegExp, r: string) {
      if (s instanceof RegExp) return this.replace(new RegExp(s.source, s.flags.includes("g") ? s.flags : s.flags + "g"), r);
      return this.split(s).join(r);
    },
  });
}
if (typeof (globalThis as { structuredClone?: unknown }).structuredClone !== "function") {
  (globalThis as { structuredClone: (v: unknown) => unknown }).structuredClone = (v) => JSON.parse(JSON.stringify(v));
}
export {};
