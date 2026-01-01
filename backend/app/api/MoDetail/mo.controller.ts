import { Request, Response } from "express";
import * as service from "./mo.service";

export const uploadExcel = async (req: Request, res: Response) => {
  try {
    // 1) Check file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required",
      });
    }

    console.log("Uploaded file:", {
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size
    });

    // 2) Check user authentication
    const userId = (req as any).user?.id;
    if (!userId) {
       res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    // 3) Process Excel File
    console.log("Starting Excel processing...");
    
    const result = await service.importExcel(
      req.file.buffer,
      userId
    );

    console.log("Excel processing finished.");

    // 4) Send Successful Response
     res.status(200).json({
      success: true,
      ...result,
    });

  } catch (error: any) {
    console.error("Excel Upload Error:", error);
     res.status(500).json({
      success: false,
      message: "Excel processing failed",
      error: error?.message || "Unexpected error",
    });
  }
};

export const getAllPOData =  async(req:Request,res:Response)=>{
  try {
      const data = await service.getAllData();
       res.status(200).json({ success: true, data });
    } 
    catch (error: any) {
       res.status(500).json({ success: false, error: error.message });
    }
}
export const getPODataById = async(req:Request,res:Response)=>{
  try {
      const id = Number(req.params.id);

      if (!id) {
         res.status(400).json({ success: false, message: "Invalid ID" });
      }

      const record = await service.getDataById(id);

      if (!record) {
         res.status(404).json({ success: false, message: "Record not found" });
      }

       res.status(200).json({ success: true, data: record });
    } 
    catch (error: any) {
       res.status(500).json({ success: false, error: error.message });
    }
}

export const update = async(req:Request, res:Response)=>{
  try{
    const id = Number(req.params.id);
    const payload = req.body
    if (!id || isNaN(id)) {
         res.status(400).json({
           success: false, 
           message: "Invalid ID" });
      } 

      if (!payload || Object.keys(payload).length === 0) {
       res.status(400).json({ 
        success: false, 
        message: "No update data provided" 
      });
    }

      const record = await service.updateDataById(id,payload)
      if (!record) {
         res.status(404).json({ 
          success: false, 
          message: "Record not found" });
      }

       res.status(200).json({ success: true, data: record });
  }
  catch (error: any) {
       res.status(500).json({ 
        success: false, 
        message:"Failed to update record",
        error: error.message });
    }
}



export const deleteDataById = async(req:Request,res:Response)=>{
  try{
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
         res.status(400).json({
           success: false, 
           message: "Invalid ID" });
      } 

      const record = await service.deleteDataById(id)
      if (!record) {
         res.status(404).json({ 
          success: false, 
          message: "Record not found" });
      }

       res.status(200).json({ success: true, data: record });
  }
  catch (error: any) {
       res.status(500).json({ 
        success: false, 
        message:"Failed to delete record",
        error: error.message });
    }
}

export const addData = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    
    if (!userId) {
         res.status(401).json({
            success: false,
            message: "Unauthorized user",
        });
    }

    try {
        const payload = req.body;
        console.log('Received payload:', payload); // Debug log
        
        if (!payload) {
             res.status(400).json({ 
                success: false, 
                message: "No data provided in the request body" 
            });
        }

        // Validate required fields
        const requiredFields = ['IndentNo', 'VendorCode', 'OrderDate', 'ItemCode']; // Add other required fields
        const missingFields = requiredFields.filter(field => !(field in payload));
        
        if (missingFields.length > 0) {
             res.status(400).json({ 
                success: false, 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }

        const record = await service.addData(userId, payload);
         res.status(201).json({ 
            success: true, 
            data: record 
        });
    } catch (error: any) {
        console.error('Error in addData controller:', error);
         res.status(500).json({ 
            success: false, 
            message: "Failed to add record",
            error: error.message 
        });
    }
}

export const getDatabyCon  = async(req:Request,res:Response)=>{
  
  try{
    const code = (req.params.code || req.query.code ||" ")as string
    console.log("Received code",code)
    if (!code || code === " ") {
      console.log("Empty code detected");
       res.status(400).json({
        success: false,
        message: "consignee code is required"
      });
    }
    const data = await service.getDatabyCon(code)
    console.log("Service response:", data);
    if(data.success){
      res.status(200).json({
        success:true,
        data:data
      })
    }
    else{
      res.status(404).json({
        success:false,
        message:"No record found with the given consignee code"
      })
    }
  }

  catch{
    res.status(500).json({
      success:false,
      message:"Failed to fetch data"
    })
  }
}