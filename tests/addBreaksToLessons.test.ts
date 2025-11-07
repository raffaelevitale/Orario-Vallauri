import { describe, it, expect } from 'vitest';
import { addBreaksToLessons } from '@/lib/orario/services/scheduleService';
import { Lesson } from '@/lib/orario/models/lesson';

function makeLesson(id:string, day:number, start:string, end:string, cls?:string): Lesson {
  return { id, subject:'Test', teacher:'T', classroom:'Aula', class: cls, dayOfWeek: day, startTime:start, endTime:end, color:'#000' };
}

describe('addBreaksToLessons', () => {
  it('adds predefined breaks only when lessons before and after', () => {
    const lessons = [
      makeLesson('L1',1,'07:50','08:50','5A INF'),
      makeLesson('L2',1,'08:50','09:45','5A INF'),
      makeLesson('L3',1,'11:00','11:55','5A INF'),
    ];
    addBreaksToLessons(lessons,1);
    const breaks = lessons.filter(l => l.isBreak);
    expect(breaks.some(b => b.startTime==='10:40' && b.endTime==='11:00')).toBe(true);
  });

  it('adds gap Intervallo between non consecutive teacher lessons (<60m)', () => {
    const lessons = [
      makeLesson('L1',2,'07:50','08:45','2C MEC'),
      makeLesson('L2',2,'09:35','10:25','2C MEC'),
    ];
    addBreaksToLessons(lessons,2);
    const gap = lessons.find(l => l.isBreak && l.startTime==='08:45' && l.endTime==='09:35');
    expect(gap).toBeDefined();
  });

  it('marks long gap as Libero (>60m)', () => {
    const lessons = [
      makeLesson('L1',4,'07:50','08:45','2C MEC'),
      makeLesson('L2',4,'12:20','13:10','2C MEC'),
    ];
    addBreaksToLessons(lessons,4);
    const libero = lessons.find(l => !l.isBreak && l.subject.includes('Libero'));
    expect(libero).toBeDefined();
  });

  it('does not insert breaks for non teacher schedule (no class prop)', () => {
    const lessons = [
      { id:'A', subject:'Test', teacher:'X', classroom:'A', dayOfWeek:1, startTime:'07:50', endTime:'08:50', color:'#000' },
      { id:'B', subject:'Test', teacher:'X', classroom:'A', dayOfWeek:1, startTime:'11:00', endTime:'11:55', color:'#000' }
    ];
    addBreaksToLessons(lessons,1);
    const gapBreak = lessons.find(l => l.startTime==='08:50' && l.endTime==='11:00');
    expect(gapBreak).toBeUndefined();
  });
});
