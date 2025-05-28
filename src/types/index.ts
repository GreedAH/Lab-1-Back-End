import { Request } from "express";

export interface TypedRequest<T> extends Request {
  body: T;
}

export interface ExampleCreateInput {
  name: string;
  email: string;
}

export interface ExampleUpdateInput {
  name?: string;
  email?: string;
}
