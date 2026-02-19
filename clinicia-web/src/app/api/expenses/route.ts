
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-server';

// GET /api/expenses
export async function GET(request: Request) {
    try {
        const decodedToken = await verifyAuth();
        if (!decodedToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { uid } = decodedToken;
        const user = await prisma.user.findUnique({
            where: { firebaseUid: uid }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const expenses = await prisma.expense.findMany({
            where: {
                clinicId: user.clinicId,
            },
            orderBy: {
                date: 'desc',
            },
        });

        return NextResponse.json(expenses);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST /api/expenses
export async function POST(request: Request) {
    try {
        const decodedToken = await verifyAuth();
        if (!decodedToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { uid } = decodedToken;
        const user = await prisma.user.findUnique({
            where: { firebaseUid: uid }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const json = await request.json();
        const { category, amount, date, note } = json;

        const expense = await prisma.expense.create({
            data: {
                clinicId: user.clinicId,
                category,
                amount: parseFloat(amount),
                date: new Date(date),
                note,
            },
        });

        return NextResponse.json(expense);
    } catch (error) {
        console.error("Error creating expense:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
