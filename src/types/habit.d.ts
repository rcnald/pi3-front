declare global {
  type Unit = {
    id: number;
    name: string;
    symbol: string;
  };

  type Habit = {
    id: number;
    name: string;
    unit: Unit;
  };

  type Goal = 'Sleep' | 'Water' | 'PhysicalActivity';
}

export {};

export enum Habits {
  Water = 1,
  Sleep = 2,
  PhysicalActivity = 3,
}
