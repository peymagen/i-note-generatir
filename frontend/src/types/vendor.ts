export type FormData = {
  FirmName: string;
  FirmAddress: string;
  vendorCode: string;
  FirmEmailId?: string | null;
  ContactNumber?: string | null;
};

interface Base {
  Id?: number;
  status?: number;
  createdOn?: string;
  updatedOn?: string;
}
export interface VendorItem extends Base {
  FirmName: string;
  FirmAddress: string;
  vendorCode: string;
  FirmEmailId?: string | null;
  ContactNumber?: string | null;
}