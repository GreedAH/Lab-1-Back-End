import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();
// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        // Create token payload
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        // Generate tokens
        const accessToken = jwt.sign(payload, JWT_SECRET, {
            expiresIn: ACCESS_TOKEN_EXPIRY,
        });
        const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
            expiresIn: REFRESH_TOKEN_EXPIRY,
        });
        // Store refresh token in database
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });
        // Remove sensitive data
        const { password: _, ...userWithoutPassword } = user;
        return res.status(200).json({
            user: userWithoutPassword,
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token is required" });
        }
        // Verify refresh token exists and is valid
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });
        if (!storedToken || new Date() > storedToken.expiresAt) {
            return res
                .status(401)
                .json({ message: "Invalid or expired refresh token" });
        }
        // Verify JWT
        const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        // Generate new access token
        const newAccessToken = jwt.sign({
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
        }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
        return res.status(200).json({
            accessToken: newAccessToken,
        });
    }
    catch (error) {
        console.error("Refresh token error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        // Delete refresh token from database
        await prisma.refreshToken.delete({
            where: { token: refreshToken },
        });
        return res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
//# sourceMappingURL=authController.js.map