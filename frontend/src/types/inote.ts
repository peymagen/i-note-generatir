import * as detail from "./poDetail";
import * as header from "./poHeader";
import * as vendor from "./vendor";
import * as mo from "./mo";

export type formData = {
  // Step 1
  IndentNo: string;
  OrderDate: string;
  template: string;
  // Step 2
  sequenceNo?: number;
  date: string;
  InspectionOfferedDate: string;
  InspectedOn: string;
};

export type formOne = Pick<
  formData,
  "IndentNo" | "OrderDate" | "template" | "sequenceNo"
>;
export type formTwo = Pick<
  formData,
  "sequenceNo" | "date" | "InspectionOfferedDate" | "InspectedOn"
>;

export type MoFormData = mo.FormData;
export type VendorFormData = vendor.FormData;
export type iNote = {
  iNote: number;
  id?: number;
};

export interface StepperState {
  user: formData;
  content: string;
  indentInfo: {
    header: header.FormData[];
    details: detail.FormData[];
  };
  info?: {
    vendor: VendorFormData[];
    mo: MoFormData[];
    iNote?: iNote;
  };
}

export interface ProductItem {
  id: number;
  name: string;
  ol: number;
  availableQty: number;
  acceptedQty: number;
  selected: boolean;
  QtyFullFill: number;
  incrementQty: number;
}

export interface StepperState {
  user: formData;
  content: string;
  indentInfo: {
    header: header.FormData[];
    details: detail.FormData[];
  };
  info?: {
    vendor: VendorFormData[];
    mo: MoFormData[];
    iNote?: iNote;
  };

  products?: ProductItem[];
}
