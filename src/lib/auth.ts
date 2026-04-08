import { SignJWT, jwtVerify } from "jose";

const getSecret = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET environment variable is not set");
  return new TextEncoder().encode(secret);
};

export async function createToken(): Promise<string> {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  return token;
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}
