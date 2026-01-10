import * as detail from "./poDetail";
import * as header from "./poHeader";
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

export interface StepperState {
  user: formData;
  content: string;
  indentInfo: {
    header: header.FormData[];
    details: detail.FormData[];
  };
}

export interface ProductItem {
  id: number;
  name: string;
  availableQty: number;
  acceptedQty: number;
  selected: boolean;
}

export interface StepperState {
  user: formData;
  content: string;
  indentInfo: {
    header: header.FormData[];
    details: detail.FormData[];
  };
  products?: ProductItem[];
}
