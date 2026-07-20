import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const company = formData.get('company') || 'default';

    if (!file) {
      return NextResponse.json({ detail: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique identifier
    const uniqueNumber = Date.now() + '_' + Math.floor(Math.random() * 100000);
    const originalName = file.name || 'image.png';
    const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${uniqueNumber}_${cleanName}`;

    // Define storage path in root static folder
    const staticDir = path.join(process.cwd(), 'static', company);
    if (!fs.existsSync(staticDir)) {
      fs.mkdirSync(staticDir, { recursive: true });
    }

    const filePath = path.join(staticDir, filename);
    fs.writeFileSync(filePath, buffer);

    // Return the relative URL path
    const imagePath = `/static/${company}/${filename}`;
    return NextResponse.json({ image_path: imagePath });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}
