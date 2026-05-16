export type D1DatabaseLike = {
  prepare: (query: string) => {
    bind: (...values: Array<string | number | boolean | null>) => unknown;
  };
};

export function createDbClient(binding: D1DatabaseLike | null | undefined | unknown) {
  if (!binding) {
    return null;
  }

  return binding as D1DatabaseLike;
}
