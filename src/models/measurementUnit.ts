export type MeasurementUnit = {
  id: number;
  name: string;
  symbol: string;
};

export const MeasurementUnitsEnum = {
  Ml: 1,
  L: 2,
  Min: 3,
  H: 4,
} as const;

export type MeasurementUnitsEnum =
  (typeof MeasurementUnitsEnum)[keyof typeof MeasurementUnitsEnum];

export const isVolumeUnit = (id: number) =>
  id === MeasurementUnitsEnum.Ml || id === MeasurementUnitsEnum.L;

export const isTimeUnit = (id: number) =>
  id === MeasurementUnitsEnum.Min || id === MeasurementUnitsEnum.H;
