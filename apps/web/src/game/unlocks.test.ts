import { describe, expect, it } from 'vitest';
import { getMissionStatus, getUnlockedMissionIds } from './unlocks';
import type { Mission } from '@/content/types';

function mission(id: string, prerequisiteMissionIds: string[] = []): Mission {
  return {
    id,
    title: id,
    icon: '🎯',
    category: 'lingo',
    subtitle: '',
    order: 0,
    prerequisiteMissionIds,
    lessonIds: [],
    completionXp: 100,
  };
}

const missions: Mission[] = [
  mission('a'),
  mission('b', ['a']),
  mission('c', ['a', 'b']),
];

describe('getUnlockedMissionIds', () => {
  it('unlocks missions with no prerequisites by default', () => {
    expect(getUnlockedMissionIds([], missions)).toEqual(['a']);
  });

  it('unlocks a mission once all of its prerequisites are completed', () => {
    expect(getUnlockedMissionIds(['a'], missions)).toEqual(['a', 'b']);
  });

  it('does not unlock a mission if only some prerequisites are met', () => {
    expect(getUnlockedMissionIds(['a'], missions)).not.toContain('c');
  });

  it('unlocks the final mission once every prerequisite is done', () => {
    expect(getUnlockedMissionIds(['a', 'b'], missions)).toEqual(['a', 'b', 'c']);
  });
});

describe('getMissionStatus', () => {
  it('reports completed', () => {
    expect(getMissionStatus('a', ['a'], ['a'])).toBe('completed');
  });

  it('reports active for an unlocked, incomplete mission', () => {
    expect(getMissionStatus('b', ['a'], ['a', 'b'])).toBe('active');
  });

  it('reports locked otherwise', () => {
    expect(getMissionStatus('c', ['a'], ['a', 'b'])).toBe('locked');
  });
});
