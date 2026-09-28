// controllers/auth.controller.js
import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import config from "../config/config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Centralized cookie configuration
const cookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        const isAlreadyExist = await userModel.findOne({
            $or: [{ username }, { email }]
        });

        if (isAlreadyExist) {
            return res.status(409).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userModel.create({ username, email, password: hashedPassword });

        // Create empty session first to get the Session ID
        const session = new sessionModel({
            user: user._id,
            ip: req.ip,
            userAgent: req.headers["user-agent"] || "Unknown"
        });

        const refreshToken = jwt.sign({ id: user._id, sessionId: session._id }, config.JWT_SECRET, { expiresIn: "7d" });
        
        session.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
        await session.save();

        const accessToken = jwt.sign({ id: user._id, sessionId: session._id }, config.JWT_SECRET, { expiresIn: "15m" });

        res.cookie("refreshToken", refreshToken, cookieOptions);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: { id: user._id, username: user.username, email: user.email },
            accessToken
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const session = new sessionModel({
            user: user._id,
            ip: req.ip,
            userAgent: req.headers["user-agent"] || "Unknown"
        });

        const refreshToken = jwt.sign({ id: user._id, sessionId: session._id }, config.JWT_SECRET, { expiresIn: "7d" });
        
        session.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
        await session.save();

        const accessToken = jwt.sign({ id: user._id, sessionId: session._id }, config.JWT_SECRET, { expiresIn: "15m" });

        res.cookie("refreshToken", refreshToken, cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: { id: user._id, username: user.username, email: user.email },
            accessToken
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export async function logout(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            try {
                // Decode token to find the exact session ID
                const decoded = jwt.verify(refreshToken, config.JWT_SECRET);
                await sessionModel.findByIdAndUpdate(decoded.sessionId, { revoke: true });
            } catch (err) {
                // Token is invalid or expired, but we still want to clear the cookie
                console.error("Logout decode error:", err.message);
            }
        }

        // Clear the cookie by setting maxAge to 0
        res.clearCookie("refreshToken", { ...cookieOptions, maxAge: 0 });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export async function getMe(req, res) {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select("-password"); // Exclude password

        if (!user) {
             return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            user
        });
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
}

export async function refreshToken(req, res) {
    try {
        const currentRefreshToken = req.cookies.refreshToken;

        if (!currentRefreshToken) {
            return res.status(401).json({ success: false, message: "No refresh token provided" });
        }

        const decoded = jwt.verify(currentRefreshToken, config.JWT_SECRET);
        
        // SECURITY FIX: Check if the session was revoked in the database
        const session = await sessionModel.findById(decoded.sessionId);
        if (!session || session.revoke) {
            res.clearCookie("refreshToken");
            return res.status(401).json({ success: false, message: "Session revoked or invalid. Please log in again." });
        }

        const user = await userModel.findById(decoded.id);

        const newAccessToken = jwt.sign({ id: user._id, sessionId: session._id }, config.JWT_SECRET, { expiresIn: "15m" });
        const newRefreshToken = jwt.sign({ id: user._id, sessionId: session._id }, config.JWT_SECRET, { expiresIn: "7d" });

        session.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
        await session.save();

        res.cookie("refreshToken", newRefreshToken, cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Tokens refreshed successfully",
            accessToken: newAccessToken
        });
    } catch (error) {
        res.clearCookie("refreshToken");
        return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }
}