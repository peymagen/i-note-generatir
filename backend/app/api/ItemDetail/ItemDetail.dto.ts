export interface ItemImportDTO {
  userId: number;  
  IndentNo: string;
  VendorCode: string;
  OrderDate: string;  // formatted as 'YYYY-MM-DD'
  OrderLineNo: number;
  ItemCode: string;
  SectionHead: string;
  ItemDesc: string;
  CountryCode: string;
  ItemDeno: string;  
  MonthsShelfLife: number;
  CRPCategory: string; 
  VEDCCategory: string; 
  ABCCategory: string;  
  DateTimeApproved?: string | null;  
  ApprovedBy: string;
  ReviewSubSectionCode: string;
  INCATYN: string;  
}