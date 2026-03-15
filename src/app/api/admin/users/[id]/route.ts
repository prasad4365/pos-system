import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

type Params = { params: Promise<{ id: string }> };

// PUT /api/admin/users/[id] — update user
export async function PUT(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const { name, email, password, role } = await req.json();

    // Prevent admin from removing their own admin role
    if (id === session.id && role && role !== "ADMIN") {
      return NextResponse.json({ error: "You cannot change your own role." }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (name)     data.name  = name;
    if (email)    data.email = email.toLowerCase();
    if (role)     data.role  = role === "ADMIN" ? "ADMIN" : "CASHIER";
    if (password) data.password = await bcrypt.hash(password, 12);

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json(user);
  } catch (err) {
    console.error("[UPDATE USER]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] — delete user
export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  if (id === session.id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE USER]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
