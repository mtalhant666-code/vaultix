import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "7d"; // adjust if needed

// 🔒 What we store inside the token
export type AccessTokenPayload = JwtPayload & {
  userId: string;
  email: string;
};

// ✅ SIGN
export function signToken(payload: {
  userId: string;
  email: string;
}): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

// ✅ VERIFY
export function verifyToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }

  return decoded as AccessTokenPayload;
}
