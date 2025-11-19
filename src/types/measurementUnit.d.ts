export enum MeasurementUnitsEnum {
  Ml = 1,
  L = 2,
  Min = 3,
  H = 4,
}

export interface MeasurementUnit {
  id: number;
  name: string;
  symbol: string;
}
