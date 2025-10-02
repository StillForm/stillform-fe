"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Image as ImageIcon } from "lucide-react";
import { uploadImageToIPFS } from "@/lib/ipfs";

interface ImageUploadProps {
  value?: File | string;
  onChange: (file: File | null) => void;
  onUploadComplete?: (ipfsHash: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  onUploadComplete,
  label = "Image",
  required = false,
  disabled = false,
  className = "",
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToIPFS = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setUploadError(null);

      try {
        const url = await uploadImageToIPFS(file);
        onUploadComplete?.(url);
      } catch (error) {
        console.error("IPFS upload error:", error);
        setUploadError(
          error instanceof Error ? error.message : "Failed to upload image"
        );
      } finally {
        setIsUploading(false);
      }
    },
    [onUploadComplete]
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setUploadError("Please select an image file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("File size must be less than 10MB");
        return;
      }

      setUploadError(null);
      onChange(file);

      // Auto-upload to IPFS if callback is provided
      if (onUploadComplete) {
        uploadToIPFS(file);
      }
    },
    [onChange, onUploadComplete, uploadToIPFS]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = () => {
    onChange(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getPreviewUrl = () => {
    if (typeof value === "string") {
      return value;
    }
    if (value instanceof File) {
      return URL.createObjectURL(value);
    }
    return null;
  };

  const previewUrl = getPreviewUrl();

  return (
    <div className={className}>
      <Label htmlFor="image-upload">
        {label}
        {required && "*"}
      </Label>

      <div className="mt-2">
        {previewUrl ? (
          <div className="relative">
            <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-lg border border-border">
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-cover"
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-sm text-white">Uploading...</div>
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="absolute -right-2 -top-2 h-8 w-8 rounded-full p-0"
              onClick={handleRemove}
              disabled={disabled || isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileSelect(file);
                }
              }}
              className="hidden"
              disabled={disabled}
            />

            <div className="flex flex-col items-center gap-2">
              <div className="rounded-full bg-muted p-3">
                {isUploading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {isUploading
                    ? "Uploading..."
                    : "Drop image here or click to browse"}
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          </div>
        )}

        {uploadError && (
          <p className="mt-2 text-sm text-red-400">{uploadError}</p>
        )}
      </div>
    </div>
  );
}
