export type FormData = {
    IndentNo?: string;
    VendorCode?: string;
    OrderDate?: string;  
    OrderLineNo?: number;
    ItemCode?: string;
    ConsigneeCode?: string;
    OrderLineDRB?: string;
    Specs?: string;
    Qty?: number;  
    UniCostCC?: number;
    PilotSampleDRb?: string ; 
    MIQPQty?: number; 
    PackType?: string;  
    StationCode?: string ;  
    ReReferencedItemCode?: string;
}

interface Base {
  id?: number;
  status?: number;
  createdOn?: string;
  updatedOn?: string;
}
export interface PoDetailItem extends Base {
    IndentNo?: string;
    VendorCode?: string;
    OrderDate?: string;  
    OrderLineNo?: number;
    ItemCode?: string;
    ConsigneeCode?: string;
    OrderLineDRB?: string;
    Specs?: string;
    Qty?: number;  
    UniCostCC?: number;
    PilotSampleDRb?: string ; 
    MIQPQty?: number; 
    PackType?: string;  
    StationCode?: string ;  
    ReReferencedItemCode?: string;
}
