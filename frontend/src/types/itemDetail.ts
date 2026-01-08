import itemDetail from '../store/services/item-details';
export type FormData={
  IndentNo?: string;
  VendorCode?: string;
  OrderDate?: string;  
  OrderLineNo?: number;
  ItemCode?: string;
  SectionHead?: string;
  ItemDesc?: string;
  CountryCode?: string;
  ItemDeno?: string;  
  MonthsShelfLife?: number;
  CRPCategory?: string;   
  VEDCCategory?: string; 
  ABCCategory?: string;  
  DateTimeApproved?: string ;  
  ApprovedBy?: string;
  ReviewSubSectionCode?: string;
  INCATYN?: string;  
}

interface Base{
    id?: number;
    status?: number;
    createdOn?: string;
    updatedOn?: string;
}
export interface itemDetail  extends Base{
  IndentNo?: string;
  VendorCode?: string;
  OrderDate?: string;  
  OrderLineNo?: number;
  ItemCode?: string;
  SectionHead?: string;
  ItemDesc?: string;
  CountryCode?: string;
  ItemDeno?: string;  
  MonthsShelfLife?: number;
  CRPCategory?: string;   
  VEDCCategory?: string; 
  ABCCategory?: string;  
  DateTimeApproved?: string ;  
  ApprovedBy?: string;
  ReviewSubSectionCode?: string;
  INCATYN?: string;  
}