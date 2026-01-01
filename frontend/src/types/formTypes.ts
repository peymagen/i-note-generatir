export interface FormData {
  fileNo: string;  //by user
  InspectionDate:string; //by user
  InspectionEvalution :string; //by user
  TotalItem: string; //by user
  ItemDetail:string;//by user
  CurrentDate:string;

//   ConsigneeCode: string;  //from PO Detail

//   MoAddressWareHousing:string; //from Mo detail and po detail
//   MOAddressProcurement:string; //from Mo detail and po detail

//   OrderDate :string;  //from PO Header
//   VendorDetail:string;  //from PO Header
//   indentNo :string; //from po header
// //   i-note:string 


  [key: string]: string; // Index signature for dynamic property access
}

export interface FormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}
