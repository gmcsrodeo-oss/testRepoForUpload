import { Milestone } from "./milestone";

export interface Initiative {
  id: string;
  title: string;
  description?: string;
  ownerId?: string;
  func?: string;
  status?: number;
  confidential?: boolean;
  health?: string | null;
  healthNote?: string;
  milestones?: Milestone[];
}