import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-development";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

// デバッグ用
if (!process.env.JWT_SECRET) {
  console.warn(
    "⚠️  JWT_SECRET not found in environment variables, using fallback"
  );
}

// JWTトークンを生成する
export const generateToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  } catch (error) {
    console.error("JWT generation error:", error);
    throw new Error("Failed to generate token");
  }
};

// JWTトークンを検証する
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("JWT verification error:", error);
    throw new Error("Invalid token");
  }
};
