export interface DistrictInfo {
  name: string;
  avgMonthlyRent: number;
  avgJeonse: number;
  population: number;
  schools: number;
  hospitals: number;
  subwayLines: string[];
  character: string;
  pros: string[];
  cons: string[];
}

export interface RelocationStep {
  step: number;
  title: string;
  desc: string;
  deadline: string;
  required: string[];
  link?: string;
}
