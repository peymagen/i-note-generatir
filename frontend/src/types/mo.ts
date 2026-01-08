export type FormData = {
  MoCPRO: string;
  MoAddress: string;
};

interface Base {
  id?: number;
  status?: number;
  createdOn?: string;
  updatedOn?: string;
}

export interface MoItem extends Base {
  MoCPRO: string;
  MoAddress: string;
}