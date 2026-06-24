import { describe, it, expect } from 'vitest';
import { computeCompleteness } from '../../src/modules/workers/workers.service';

describe('computeCompleteness', () => {
  const full = {
    headline: 'Master plumber with 15 years of experience',
    bio: 'I provide full-service residential plumbing. Emergencies, installations, repairs.',
    yearsExperience: 15,
    hourlyRate: 60000,
    city: 'Mumbai',
    skillsCount: 3,
    portfolioCount: 5,
  };

  it('returns 100 when all criteria are met', () => {
    expect(computeCompleteness(full)).toBe(100);
  });

  it('returns 0 when nothing is filled', () => {
    expect(
      computeCompleteness({
        headline: '',
        bio: '',
        yearsExperience: 0,
        hourlyRate: null,
        city: '',
        skillsCount: 0,
        portfolioCount: 0,
      }),
    ).toBe(0);
  });

  it('counts >= 50-char bio as complete', () => {
    const r = computeCompleteness({ ...full, bio: 'a'.repeat(50) });
    // bio passes, everything else passes -> 100
    expect(r).toBe(100);
  });

  it('counts < 50-char bio as incomplete', () => {
    const r = computeCompleteness({ ...full, bio: 'too short' });
    expect(r).toBeLessThan(100);
  });

  it('counts hourlyRate = 0 as incomplete', () => {
    const r = computeCompleteness({ ...full, hourlyRate: 0 });
    expect(r).toBeLessThan(100);
  });

  it('counts >= 1 skill and >= 1 portfolio as complete', () => {
    const partial = computeCompleteness({ ...full, skillsCount: 0, portfolioCount: 0 });
    expect(partial).toBeLessThan(100);
    const fullSkills = computeCompleteness({ ...full, skillsCount: 1, portfolioCount: 1 });
    expect(fullSkills).toBe(100);
  });

  it('returns whole percentages (rounded)', () => {
    const r = computeCompleteness({
      headline: 'Hello there',
      bio: 'a'.repeat(60),
      yearsExperience: 1,
      hourlyRate: 100,
      city: 'X',
      skillsCount: 0,
      portfolioCount: 0,
    });
    expect(Number.isInteger(r)).toBe(true);
  });
});
