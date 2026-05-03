export interface FrequencyResponse {
  frequencyId: number;
  name: string;
  daysInterval: number | null;
  monthsInterval: number | null;
}

export enum Frequency {
  Weekly = 1,
  Biweekly = 2,
  Monthly = 3,
  SemiAnnually = 4,
  Annually = 5,
}
