export interface RecordMeasurementUnit {
  id: number;
  symbol: string;
  name?: string;
}

export interface RecordHabit {
  id: number;
  name: string;
  measurementUnitId?: number;
  idMeasurementUnit?: number;
  measurementUnit?: RecordMeasurementUnit;
}

export interface RecordUserHabit {
  id: number;
  measurementUnit?: RecordMeasurementUnit;
  habit?: RecordHabit;
}

export interface RecordData {
  id: number;
  value: number;
  date: string;
  userHabitId?: number;
  userHabit?: RecordUserHabit;
}
