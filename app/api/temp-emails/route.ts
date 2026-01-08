import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const DATA_FILE = path.join(process.cwd(), "public", "data", "CloudflareTempEmail.json")

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
    const newEmail = await request.json()
    const data = await fs.readFile(DATA_FILE, "utf-8")
    const emails = JSON.parse(data)
    emails.push(newEmail)
    await fs.writeFile(DATA_FILE, JSON.stringify(emails, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add email" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { index, data: updatedEmail } = await request.json()
    const data = await fs.readFile(DATA_FILE, "utf-8")
    const emails = JSON.parse(data)
    emails[index] = updatedEmail
    await fs.writeFile(DATA_FILE, JSON.stringify(emails, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update email" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { index } = await request.json()
    const data = await fs.readFile(DATA_FILE, "utf-8")
    const emails = JSON.parse(data)
    emails.splice(index, 1)
    await fs.writeFile(DATA_FILE, JSON.stringify(emails, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete email" }, { status: 500 })
  }
}
