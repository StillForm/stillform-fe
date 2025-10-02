import { PinataSDK } from "pinata";

// 仅在服务端使用
const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
});

console.log(
  "Pinata config:",
  "JWT exists:",
  !!process.env.PINATA_JWT,
  "JWT length:",
  process.env.PINATA_JWT?.length,
  "Gateway:",
  process.env.NEXT_PUBLIC_PINATA_GATEWAY
);

export const uploadToPinata = async (
  file: File
): Promise<{ cid: string; url: string }> => {
  if (typeof window !== "undefined") {
    throw new Error("This function can only be called on the server side");
  }
  try {
    const uploadRes = await pinata.upload.public.file(file);
    const url = await pinata.gateways.public.convert(uploadRes.cid);
    console.log("Upload result:", uploadRes);
    return { cid: uploadRes.cid, url };
  } catch (error) {
    console.error("Pinata upload error:", error);
    throw new Error("Failed to upload file to Pinata");
  }
};

export const getFileFromPinata = async (cid: string) => {
  if (typeof window !== "undefined") {
    throw new Error("This function can only be called on the server side");
  }
  const data = await pinata.gateways.public.get(cid);
  // 文档写错了：
  const url = await pinata.gateways.public.convert(cid);
  return { data, url };
};
