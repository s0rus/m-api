export interface Record {
  date: Date;
  count: number;
  id: string;
}

export interface MessageCountData {
  content: Record[];
  todaysCount: number;
  avgCount: number;
  maxCount: number;
  minCount: number;
}
