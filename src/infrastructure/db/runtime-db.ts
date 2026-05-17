import type { D1DatabaseLike } from './client';

let runtimeDb: D1DatabaseLike | null = null;

export function setRuntimeDb(binding: D1DatabaseLike | null | undefined | unknown) {
  runtimeDb = binding ? (binding as D1DatabaseLike) : null;
}

export function getRuntimeDb() {
  return runtimeDb;
}
