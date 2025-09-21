import { Request } from "express";

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  CLIENT = "CLIENT",
}

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

export enum EventStatus {
  OPEN = "OPEN",
  ONGOING = "ONGOING",
  CANCELLED = "CANCELLED",
  DONE = "DONE",
}

export interface EventCreateInput {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  venue: string;
  country: string;
  city: string;
  status?: EventStatus;
  maxCapacity: number;
  price: number;
}

export interface EventUpdateInput {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  venue?: string;
  country?: string;
  city?: string;
  status?: EventStatus;
  maxCapacity?: number;
  price?: number;
}

export interface EventResponse {
  id: number;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  venue: string;
  country: string;
  city: string;
  status: EventStatus;
  maxCapacity: number;
  price: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
