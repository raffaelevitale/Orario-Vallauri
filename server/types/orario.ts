export interface OrarioParams {
  str: string;
}

export interface OrarioQuery {
  day: number;
}

export interface Lesson {
  hour: number;
  subject: string;
  teacher: string;
  room: string;
}

export interface Orario {
  class: string;
  schedule: {
    monday: Lesson[];
    tuesday: Lesson[];
    wednesday: Lesson[];
    thursday: Lesson[];
    friday: Lesson[];
  };
}
