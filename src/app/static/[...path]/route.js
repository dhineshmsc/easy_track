import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const filePathArray = resolvedParams.path;
    if (!filePathArray || filePathArray.length === 0) {
      return new NextResponse('Bad Request', { status: 400 });
    }

    const relativePath = filePathArray.join('/');
    
    // Resolve absolute path to the root static folder
    const absolutePath = path.join(process.cwd(), 'static', relativePath);
    
    // Ensure safety: prevent directory traversal attacks by verifying the resolved path starts with the static directory
    const staticBaseDir = path.join(process.cwd(), 'static');
    if (!absolutePath.startsWith(staticBaseDir)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (!fs.existsSync(absolutePath)) {
      return new NextResponse('File not found', { status: 404 });
    }
    
    const fileStats = fs.statSync(absolutePath);
    if (fileStats.isDirectory()) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(absolutePath);
    
    // Determine content type based on extension
    let contentType = 'application/octet-stream';
    const ext = path.extname(absolutePath).toLowerCase();
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.webp') contentType = 'image/webp';
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    console.error('Static file serving error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
