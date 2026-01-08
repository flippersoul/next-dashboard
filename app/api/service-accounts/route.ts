import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const DATA_FILE = path.join(process.cwd(), "public", "data", "ServiceAccounts.json")

export async function GET() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8")
    return NextResponse.json(JSON.parse(data))
  } catch (error) {
    return NextResponse.json({ error: "Failed to read data" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const newAccount = await request.json()
    const data = await fs.readFile(DATA_FILE, "utf-8")
    const accounts = JSON.parse(data)
    accounts.push(newAccount)
    await fs.writeFile(DATA_FILE, JSON.stringify(accounts, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add account" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { index, data: updatedAccount } = await request.json()
    const data = await fs.readFile(DATA_FILE, "utf-8")
    const accounts = JSON.parse(data)
    accounts[index] = updatedAccount
    await fs.writeFile(DATA_FILE, JSON.stringify(accounts, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update account" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { index } = await request.json()
    const data = await fs.readFile(DATA_FILE, "utf-8")
    const accounts = JSON.parse(data)
    accounts.splice(index, 1)
    await fs.writeFile(DATA_FILE, JSON.stringify(accounts, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
