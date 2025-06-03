import { Response } from "express";
import { TypedRequest, UserCreateInput, UserUpdateInput } from "../types/index.js";
export declare const getAllUsers: (_req: any, res: Response) => Promise<void>;
export declare const getUserById: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createUser: (req: TypedRequest<UserCreateInput>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateUser: (req: TypedRequest<UserUpdateInput>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteUser: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
