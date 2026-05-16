import type { BabyDTO } from '../../domain/baby/baby.types';
import type { BabyRow } from '../db/schema/babies';

export function mapBabyRowToDto(row: BabyRow): BabyDTO {
  return {
    id: row.id,
    name: row.name,
    birthDate: row.birthDate,
    birthWeightKg: row.birthWeightKg ?? undefined,
    feedingMode: row.feedingMode,
    timezone: row.timezone,
    preferredLanguage: row.preferredLanguage,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}
