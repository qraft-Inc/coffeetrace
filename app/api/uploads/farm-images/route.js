import { NextResponse } from 'next/server';
import { getCloudinary } from '../../../../lib/cloudinary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images');

    if (!files.length) {
      return NextResponse.json({ error: 'No images uploaded' }, { status: 400 });
    }

    const cloudinary = getCloudinary();
    const uploads = [];

    for (const file of files) {
      if (!file || typeof file.arrayBuffer !== 'function') continue;
      if (!file.type?.startsWith('image/')) continue;

      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      const dataUri = `data:${file.type};base64,${base64}`;

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'coffeetrace/farms',
        resource_type: 'image',
      });

      uploads.push(result.secure_url);
    }

    return NextResponse.json({ urls: uploads });
  } catch (error) {
    console.error('POST /api/uploads/farm-images error:', error);
    return NextResponse.json(
      { error: 'Image upload failed', details: error.message },
      { status: 500 }
    );
  }
}
