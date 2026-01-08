import * as service from "./vendor.service";
import { createResponse } from "../../common/helper/response.hepler";
import asyncHandler from "express-async-handler";
import { type Request, type Response } from "express";
import { promises } from "dns";

export const createRow = asyncHandler(async(req:Request,res:Response)=>{
    const userId = (req as any).user?.id;
    console.log(userId)
     if (!userId) {
       res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }
    try{
        const payload = req.body;
        if (!payload || Object.keys(payload).length === 0) {
            res.status(400).json({ 
                success: false, 
                message: "No data provided" 
            });
        }
        const record = await service.add(userId,payload);
        
            if (!record) {
              res.status(404).json({ 
                success: false, 
                message: "Record not found" });
            }
        
        res.send(createResponse(record,"Record added successfully"))
    }
    catch(error:any){
        res.status(500).json({ 
            success: false, 
            message:"Failed to add record",
            error: error.message
         });
    }
    
})

// vendor.controller.ts
export const updateRow = asyncHandler(async (req: Request, res: Response) => {
  console.log("Req",req.body)
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
       res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const payload = req.body;
    console.log(payload)
    const Id = Number(req.params.id);
    
    if (!Id || isNaN(Id)) {
       res.status(400).json({
        success: false, 
        message: "Invalid ID" 
      });
    } 

    if (!payload || Object.keys(payload).length === 0) {
       res.status(400).json({ 
        success: false, 
        message: "No update data provided" 
      });
    }

    // Add the userId to the payload for update tracking
    const record = await service.updateData(
      { ...payload, updateBy: userId }, 
      Id, 
      userId
    );
    
    if (!record) {
       res.status(404).json({ 
        success: false, 
        message: "Record not found" 
      });
    }

     res.send(createResponse(record,"Record updated successfully"))
  } catch (error: any) {
     res.status(500).json({ 
      success: false, 
      message: "Failed to update record",
      error: error.message
    });
  }
})

export const deleteById = asyncHandler(async(req:Request,res:Response)=>{
    try{
        const Id = Number(req.params.id);
        if(!Id || isNaN(Id)){
            res.status(400).json({
                success: false,
                message: "Invalid ID"
            })
        }
        const record = await service.deleteData(Id)
        if (!record) {
         res.status(404).json({ 
          success: false, 
          message: "Record not found" });
      }

       res.send(createResponse(record,"Record deleted successfully"));
    }
    catch(error:any){
        res.status(500).json({
            success:false,
            message:"Failed to delete record",
            error:error.message
        })
    }
})

// export const getAllData= async(req:Request, res:Response)=>{
//     try{
//         const data = await service.getAll()

//         // if()
//         res.status(200).json({
//             success:true,
//             data:data
//         })
//     }
//     catch{
//         res.status(500).json({
//             success:false,
//             message:"Failed to fetch data"
//         })
//     }
// }

export const getByVendorCode = async(req:Request,res:Response)=>{
  try{
    const vendorCode = (req.params.vendorCode  || req.query.vendorCode || "") as string;
    if (!vendorCode) {
       res.status(400).json({
        success: false,
        message: "Vendor code is required"
      });
    }
    const data = await service.getByVendorCode(vendorCode)
    
    if(data.success){
      res.send(createResponse(data,"Record fetched successfully"))
    }
    else{
      res.send(createResponse(data,"No record found with the given vendor code"))
    }

  }
  catch{
    res.status(500).json({
      success:false,
      message:"Failed to fetch data"
    })
  }
}




export const getItemPageSearch = async (req: Request, res: Response) => {
  try {
    
    const pageParam = req.query.page;
    const limitParam = req.query.limit;
    const search = req.query.search?.toString();

    
    const page =
      pageParam !== undefined ? Number(pageParam) : undefined;

    const limit =
      limitParam !== undefined ? Number(limitParam) : undefined;

    if (page !== undefined && page <= 0) {
       res.status(400).json({
        success: false,
        message: "Page must be greater than 0",
      });
    }

    if (limit !== undefined && limit <= 0) {
       res.status(400).json({
        success: false,
        message: "Limit must be greater than 0",
      });
    }

    const result = await service.getPaginatedDataWithGlobalSearch(
      page,
      limit,
      search
    );

    if(result.success){
       res.send(createResponse(result,"Data fetched successfully"))
    }
    else{
       res.send(createResponse(result,"No records found"))
    }
  } 
  catch (error: any) {
    console.error("Controller error:", error);  

     res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch item details",
    });
  }
};