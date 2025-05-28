import { Role } from "@prisma/client/wasm";
import { Request } from "express";

export interface TypedRequest<T> extends Request {
  body: T;
}

export interface UserCreateInput {
  firstName: string;
  lastName: string;
  email: string;
  birthday: Date;
  password: string;
  role?: Role;
}

export interface UserUpdateInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  birthday?: Date;
  password?: string;
  role?: Role;
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  birthday: Date;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}
