import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), "public", "data")
    const files = fs.readdirSync(dataDir)
    const jsonFiles = files
      .filter((file) => file.endsWith(".json") && file !== "CloudflareTempEmail.json")
      .map((file) => file.replace(".json", ""))

    return NextResponse.json({ services: ["ServiceAccounts", ...jsonFiles] })
  } catch (error) {
    console.error("Error reading services:", error)
    return NextResponse.json({ services: ["ServiceAccounts"] })
  }
}

export async function POST(request: Request) {
  try {
    const { serviceName } = await request.json()

    if (!serviceName) {
      return NextResponse.json({ error: "Service name is required" }, { status: 400 })
    }

    const dataDir = path.join(process.cwd(), "public", "data")
    const filePath = path.join(dataDir, `${serviceName}.json`)

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Service already exists" }, { status: 400 })
    }

    // Create new JSON file with empty array
    fs.writeFileSync(filePath, JSON.stringify([], null, 2))

    return NextResponse.json({ success: true, serviceName })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
}
