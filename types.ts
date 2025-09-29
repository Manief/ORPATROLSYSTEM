

export interface Company {
  id: string;
  name: string;
  customId?: string | null;
}

export interface Site {
  id: string;
  companyId: string;
  name: string;
  address: string;
  customId?: string | null;
}

export interface Area {
  id: string;
  siteId: string;
  name: string;
  description: string;
  customId?: string | null;
}

export interface Point {
  id: string;
  areaId: string;
  name: string;
  scanFrequency: number; // scans per hour
  customId?: string | null;
}

export interface ScanLog {
  id: string;
  pointId: string;
  pointName: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export enum PatrolStatus {
  InProgress = 'In Progress',
  Completed = 'Completed',
  MissedPoints = 'Missed Points',
}

export interface PatrolSession {
  id: string;
  officerName: string;
  companyId: string;
  siteId: string;
  areaId: string;
  startTime: string;
  endTime?: string;
  shift: 'Day' | 'Night';
  status: PatrolStatus;
  scans: ScanLog[];
  signatureDataUrl?: string;
}