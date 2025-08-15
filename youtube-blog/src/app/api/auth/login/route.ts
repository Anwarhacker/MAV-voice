import { SignJWT } from "jose";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "a-very-secure-secret-that-is-long-enough"
);
const adminPassword = process.env.ADMIN_PASSWORD || "admin";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (password === adminPassword) {
    // Create a JWT
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("admin") // Subject can be used to identify the user
      .setIssuedAt()
      .setExpirationTime("2h") // Token expires in 2 hours
      .sign(secret);

    // Set the token in a cookie
    cookies().set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 2, // 2 hours
      path: "/",
    });

    return NextResponse.json({ message: "Login successful" });
  }

  return NextResponse.json(
    { message: "Invalid password" },
    { status: 401 }
  );
}
