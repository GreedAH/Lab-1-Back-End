import { Secret } from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET as Secret;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as Secret;
export const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
export const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";
