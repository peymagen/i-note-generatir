import * as service from "./iNote.service";
import { createResponse } from "../../common/helper/response.hepler";
import asyncHandler from "express-async-handler";
import { type Request, type Response } from "express";


export const getInote = asyncHandler(async (req: Request, res: Response) => {
    try{
        console.log("calling INote")
        const result = await service.getlastRow();
        res.send(createResponse(result));
    }
    catch(err){
        console.log(err);
        res.status(500).send(createResponse(err));
    }
});