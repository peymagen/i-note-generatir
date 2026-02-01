import * as service from "./finalPage.service";
import { createResponse } from "../../common/helper/response.hepler";
import asyncHandler from "express-async-handler";
import { type Request, type Response } from "express";

export const createPage = asyncHandler(async (req: Request, res: Response) => {
  console.log(req.body)
    const result = await service.createPage(req.body);
    res.send(createResponse(result, "Page created sucssefully"));
});

export const getPageById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await service.getPageById(id);
    res.send(createResponse(result));
});

export const getPageInation = asyncHandler(async (req: Request, res: Response) => {
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
           res.status(200).json({ data: result });
        }
        else{
           res.status(404).json({ 
            success: false, 
            message: result.message || "No records found" 
          });
        }
      } 
      catch (error: any) {
        console.error("Controller error:", error);
    
         res.status(500).json({
          success: false,
          message: error.message || "Failed to fetch item details",
        });
      }
})


export const update = asyncHandler(async (req: Request, res: Response) => {
    console.log("reqbody",req.body)
    console.log("reqparams",req.params.id)
    const result = await service.updatePage(Number(req.params.id), req.body);
    res.send(createResponse(result, "Page updated sucssefully")); 
})

export const delteHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await service.deletePageById(Number(req.params.id));
    res.send(createResponse(result, "Page deleted sucssefully"));
})