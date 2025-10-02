"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/ui/image-upload";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { getIPFSUrl } from "@/lib/ipfs/client";

export default function TestUploadPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [ipfsHash, setIpfsHash] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const handleImageUpload = (hash: string) => {
    setIpfsHash(hash);
    setUploadStatus(`Upload successful! IPFS Hash: ${hash}`);
  };

  const handleImageChange = (file: File | null) => {
    setSelectedImage(file);
    if (!file) {
      setIpfsHash("");
      setUploadStatus("");
    }
  };

  return (
    <Container className="py-16">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            IPFS 图片上传测试
          </h1>
          <p className="mt-2 text-text-secondary">
            测试图片上传到 Pinata IPFS 的完整流程
          </p>
        </div>

        <div className="space-y-6">
          <ImageUpload
            value={selectedImage}
            onChange={handleImageChange}
            onUploadComplete={handleImageUpload}
            label="测试图片上传"
            required={false}
          />

          {uploadStatus && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">{uploadStatus}</p>
            </div>
          )}

          {ipfsHash && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-text-primary mb-2">
                  IPFS 信息
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Hash:</span>{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      {ipfsHash}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium">Gateway URL:</span>{" "}
                    <a
                      href={getIPFSUrl(ipfsHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {getIPFSUrl(ipfsHash)}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => window.open(getIPFSUrl(ipfsHash), "_blank")}
                  variant="secondary"
                >
                  在新窗口中查看图片
                </Button>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(ipfsHash);
                    alert("IPFS Hash 已复制到剪贴板");
                  }}
                  variant="outline"
                >
                  复制 Hash
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">测试说明</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• 选择或拖拽图片文件到上传区域</li>
            <li>• 图片会自动上传到 Pinata IPFS</li>
            <li>• 上传成功后会显示 IPFS hash 和访问链接</li>
            <li>• 点击链接可以验证图片是否正确上传</li>
          </ul>
        </div>
      </div>
    </Container>
  );
}
