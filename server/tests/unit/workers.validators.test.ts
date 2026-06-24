import { describe, it, expect } from 'vitest';
import {
  workerProfileSchema,
  workerProfileUpdateSchema,
  upsertSkillsSchema,
  portfolioCreateSchema,
  workerListQuerySchema,
  adminVerifyWorkerSchema,
} from '../../src/modules/workers/workers.validators';

describe('workerProfileSchema', () => {
  const valid = {
    headline: 'Expert electrician with 10+ years experience',
    bio: 'I have been doing residential and commercial electrical work for over a decade. Fully licensed and insured.',
    yearsExperience: 10,
    hourlyRate: 50000,
    city: 'Bengaluru',
    serviceRadiusKm: 15,
  };

  it('accepts a complete profile', () => {
    expect(workerProfileSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects short headline', () => {
    expect(workerProfileSchema.safeParse({ ...valid, headline: 'Hi' }).success).toBe(false);
  });

  it('rejects bio under 10 chars', () => {
    expect(workerProfileSchema.safeParse({ ...valid, bio: 'short' }).success).toBe(false);
  });

  it('rejects bio over 2000 chars', () => {
    expect(workerProfileSchema.safeParse({ ...valid, bio: 'a'.repeat(2001) }).success).toBe(false);
  });

  it('rejects negative experience', () => {
    expect(workerProfileSchema.safeParse({ ...valid, yearsExperience: -1 }).success).toBe(false);
  });

  it('rejects experience over 70', () => {
    expect(workerProfileSchema.safeParse({ ...valid, yearsExperience: 71 }).success).toBe(false);
  });

  it('rejects negative hourly rate', () => {
    expect(workerProfileSchema.safeParse({ ...valid, hourlyRate: -1 }).success).toBe(false);
  });

  it('rejects radius > 100km', () => {
    expect(workerProfileSchema.safeParse({ ...valid, serviceRadiusKm: 101 }).success).toBe(false);
  });

  it('rejects radius < 1km', () => {
    expect(workerProfileSchema.safeParse({ ...valid, serviceRadiusKm: 0 }).success).toBe(false);
  });

  it('accepts null hourlyRate', () => {
    expect(workerProfileSchema.safeParse({ ...valid, hourlyRate: null }).success).toBe(true);
  });
});

describe('workerProfileUpdateSchema', () => {
  it('accepts partial updates', () => {
    expect(workerProfileUpdateSchema.safeParse({ headline: 'New headline here' }).success).toBe(true);
  });
  it('rejects unknown fields', () => {
    expect(workerProfileUpdateSchema.safeParse({ foo: 'bar' }).success).toBe(false);
  });
  it('rejects empty payloads', () => {
    expect(workerProfileUpdateSchema.safeParse({}).success).toBe(false);
  });
});

describe('upsertSkillsSchema', () => {
  it('accepts empty skills array (clear all)', () => {
    expect(upsertSkillsSchema.safeParse({ skills: [] }).success).toBe(true);
  });
  it('accepts valid skills list', () => {
    expect(
      upsertSkillsSchema.safeParse({
        skills: [
          { skillId: '11111111-1111-1111-1111-111111111111', level: 'EXPERT' },
          { skillId: '22222222-2222-2222-2222-222222222222' }, // default INTERMEDIATE
        ],
      }).success,
    ).toBe(true);
  });
  it('rejects non-uuid skillId', () => {
    expect(
      upsertSkillsSchema.safeParse({ skills: [{ skillId: 'not-uuid' }] }).success,
    ).toBe(false);
  });
  it('rejects invalid level', () => {
    expect(
      upsertSkillsSchema.safeParse({ skills: [{ skillId: '11111111-1111-1111-1111-111111111111', level: 'GOD' }] }).success,
    ).toBe(false);
  });
  it('rejects over 30 skills', () => {
    const skills = Array.from({ length: 31 }, () => ({
      skillId: '11111111-1111-1111-1111-111111111111',
    }));
    expect(upsertSkillsSchema.safeParse({ skills }).success).toBe(false);
  });
});

describe('portfolioCreateSchema', () => {
  it('accepts a valid item', () => {
    expect(
      portfolioCreateSchema.safeParse({ imageUrl: 'https://cdn.example.com/img.jpg', caption: 'Hello' }).success,
    ).toBe(true);
  });
  it('rejects non-url', () => {
    expect(portfolioCreateSchema.safeParse({ imageUrl: 'not-a-url' }).success).toBe(false);
  });
  it('rejects caption > 280 chars', () => {
    expect(
      portfolioCreateSchema.safeParse({ imageUrl: 'https://x.com/y.jpg', caption: 'a'.repeat(281) }).success,
    ).toBe(false);
  });
});

describe('workerListQuerySchema', () => {
  it('coerces numeric and boolean strings', () => {
    const r = workerListQuerySchema.safeParse({ page: '2', pageSize: '50', minRating: '4.0', verifiedOnly: 'true' });
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.pageSize).toBe(50);
      expect(r.data.minRating).toBe(4.0);
      expect(r.data.verifiedOnly).toBe(true);
    } else throw new Error('expected success');
  });
  it('rejects bad sort', () => {
    expect(workerListQuerySchema.safeParse({ sort: 'price:asc' }).success).toBe(false);
  });
});

describe('adminVerifyWorkerSchema', () => {
  it('requires isVerified', () => {
    expect(adminVerifyWorkerSchema.safeParse({}).success).toBe(false);
    expect(adminVerifyWorkerSchema.safeParse({ isVerified: true }).success).toBe(true);
  });
});
