import { NextRequest, NextResponse } from "next/server";
import { uploadToPinata } from "@/lib/ipfs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    console.log("Received file:", {
      name: file?.name,
      type: file?.type,
      size: file?.size,
    });

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // // Validate file type - accept both images and JSON
    // if (!file.type.startsWith("image/") && file.type !== "application/json") {
    //   return NextResponse.json(
    //     { error: "File must be an image or JSON file" },
    //     { status: 400 }
    //   );
    // }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Upload to Pinata IPFS
    const { url } = await uploadToPinata(file);

    return NextResponse.json({
      success: true,
      url,
    });
  } catch (error) {
    console.error("IPFS upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload to IPFS",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
