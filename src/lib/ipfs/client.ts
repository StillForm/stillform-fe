/**
 * Client-side IPFS utilities for image handling
 */

export interface IPFSUploadResponse {
  success: boolean;
  // ipfsHash: string;
  url: string;
  // cid: string;
}

export interface IPFSUploadError {
  error: string;
  details?: string;
}

/**
 * Upload an image file to IPFS via our API endpoint
 */
export async function uploadImageToIPFS(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/ipfs/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData: IPFSUploadError = await response.json();
    throw new Error(errorData.error || "Failed to upload image");
  }

  const data: IPFSUploadResponse = await response.json();
  return data.url;
}

/**
 * Get the full IPFS URL for a given hash
 */
export function getIPFSUrl(hash: string, gateway?: string): string {
  const baseGateway = gateway || process.env.NEXT_PUBLIC_PINATA_GATEWAY;
  if (!baseGateway) {
    throw new Error("Missing IPFS gateway");
  }
  return `${baseGateway}/ipfs/${hash}`;
}

/**
 * Extract IPFS hash from a full IPFS URL
 */
export function extractIPFSHash(url: string): string | null {
  const ipfsMatch = url.match(/\/ipfs\/([a-zA-Z0-9]+)/);
  return ipfsMatch ? ipfsMatch[1] : null;
}

/**
 * Validate if a string is a valid IPFS hash
 */
export function isValidIPFSHash(hash: string): boolean {
  // Basic validation for IPFS hash format
  return /^[a-zA-Z0-9]{46,59}$/.test(hash);
}
