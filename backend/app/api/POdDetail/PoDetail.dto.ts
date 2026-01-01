export interface PoDto {
  userId: number;  
  IndentNo: string;
  VendorCode: string;
  OrderDate: string;  
  OrderLineNo: number;
  ItemCode: string;
  ConsigneeCode: string;
  OrderLineDRB: string;
  Specs: string;
  Qty: number;  
  UniCostCC: number;
  PilotSampleDRb: string | null | number; 
  MIQPQty: number; 
  PackType: string;  
  StationCode: string ;  
  ReReferencedItemCode?: string | null; 
}