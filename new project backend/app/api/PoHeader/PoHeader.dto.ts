export interface PoHeader{
    userId: number;  
    IndentNo: string;
    VendorCode: string;
    OrderDate: string;  // formatted as 'YYYY-MM-DD'
    ValueRs: string;
    InspectingAgencyType: string;
    InspectorCode: string;
    InspectionSiteCode: string;
    Remarks: string;
    QuoteKey: number;  
    SelectedQuoteDate: string;
    DateTimeApproved: string ; 
    ApprovedBy: string; 
    TypeClosing?: string;  
    DateCloded?: string ;  
    ClosedBy?: string ; 
    PackingInstruction:string;
    DespatchInstruction:string;
    InspectionInstruction:StaticRangeInit;
    StationCode:string;
    Remarks1:string;
    Name:string;
    City:string;
    State:string;
}