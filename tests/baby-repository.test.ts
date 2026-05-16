import { beforeEach, describe, expect, it } from 'vitest';
import { createBaby, listBabies, resetBabyStoreForTests, selectBaby } from '../src/infrastructure/repositories/baby-repository';

beforeEach(async () => {
  await resetBabyStoreForTests();
});

describe('baby repository', () => {
  it('persists across repeated reads in the file-backed store', async () => {
    const created = await createBaby({
      name: 'Mika',
      birthDate: '2026-05-01',
      timezone: 'Asia/Singapore',
      preferredLanguage: 'bilingual'
    });

    const listed = await listBabies();
    expect(listed).toHaveLength(1);
    expect(listed[0].id).toBe(created.id);

    const selected = await selectBaby(created.id);
    expect(selected.selectedAt).toBeUndefined();

    const reloaded = await listBabies();
    expect(reloaded).toHaveLength(1);
    expect(reloaded[0].id).toBe(created.id);
  });
});
