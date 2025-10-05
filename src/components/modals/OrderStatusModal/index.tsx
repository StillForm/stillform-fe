"use client";

import { BaseModal } from "../base-modal";
import { useModalStore } from "@/lib/stores/modal-store";
import { Badge } from "@/components/ui/badge";
import { PhysStatus } from "@/lib/contracts";
import { Clock, Truck, CheckCircle, Package } from "lucide-react";
import { truncateAddress } from "@/lib/utils";
import type { Address } from "viem";

interface OrderStatusModalProps {
  collectionAddress: Address;
  tokenId: bigint;
  owner: Address;
  status: PhysStatus;
}

export function OrderStatusModal({
  collectionAddress,
  tokenId,
  owner,
  status,
}: OrderStatusModalProps) {
  const { closeModal } = useModalStore();

  const getStatusText = (status: PhysStatus) => {
    switch (status) {
      case PhysStatus.REQUESTED:
        return "Pending";
      case PhysStatus.PROCESSING:
        return "Processing";
      case PhysStatus.COMPLETED:
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const getStatusIcon = (status: PhysStatus) => {
    switch (status) {
      case PhysStatus.REQUESTED:
        return <Clock className="h-8 w-8" />;
      case PhysStatus.PROCESSING:
        return <Truck className="h-8 w-8" />;
      case PhysStatus.COMPLETED:
        return <CheckCircle className="h-8 w-8" />;
      default:
        return <Package className="h-8 w-8" />;
    }
  };

  const getStatusColor = (status: PhysStatus) => {
    switch (status) {
      case PhysStatus.REQUESTED:
        return "bg-yellow-500/20 text-yellow-500";
      case PhysStatus.PROCESSING:
        return "bg-blue-500/20 text-blue-500";
      case PhysStatus.COMPLETED:
        return "bg-green-500/20 text-green-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  const getStatusDescription = (status: PhysStatus) => {
    switch (status) {
      case PhysStatus.REQUESTED:
        return "Your physicalization request has been received. The creator will process it soon.";
      case PhysStatus.PROCESSING:
        return "Your order is being processed. The creator is preparing your physical item.";
      case PhysStatus.COMPLETED:
        return "Your order has been completed! The physical item has been delivered. This NFT is now locked and cannot be transferred.";
      default:
        return "Unknown status";
    }
  };

  return (
    <BaseModal open onClose={closeModal} title="Order Status">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="font-display text-2xl text-text-primary mb-2">
            Order Status
          </h2>
          <p className="text-sm text-text-secondary">
            Track your physicalization request
          </p>
        </div>

        {/* Status Icon */}
        <div className="flex justify-center">
          <div className={`p-6 rounded-full ${getStatusColor(status)}`}>
            {getStatusIcon(status)}
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge className={`${getStatusColor(status)} text-lg px-4 py-2`}>
            {getStatusText(status)}
          </Badge>
        </div>

        {/* Status Description */}
        <div className="bg-[rgba(38,39,43,0.5)] rounded-lg p-4">
          <p className="text-sm text-text-secondary text-center">
            {getStatusDescription(status)}
          </p>
        </div>

        {/* Order Details */}
        <div className="space-y-3 bg-[rgba(38,39,43,0.5)] rounded-lg p-4">
          <h3 className="font-semibold text-text-primary mb-3">
            Order Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Token ID:</span>
              <span className="text-text-primary font-mono">
                #{tokenId.toString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Collection:</span>
              <span className="text-text-primary font-mono">
                {truncateAddress(collectionAddress, 6)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Owner:</span>
              <span className="text-text-primary font-mono">
                {truncateAddress(owner, 6)}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          <h3 className="font-semibold text-text-primary">Progress</h3>
          <div className="space-y-3">
            {/* Requested */}
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  status >= PhysStatus.REQUESTED
                    ? "bg-green-500"
                    : "bg-gray-500"
                }`}
              />
              <span
                className={
                  status >= PhysStatus.REQUESTED
                    ? "text-text-primary"
                    : "text-text-secondary"
                }
              >
                Request Submitted
              </span>
            </div>

            {/* Processing */}
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  status >= PhysStatus.PROCESSING
                    ? "bg-green-500"
                    : "bg-gray-500"
                }`}
              />
              <span
                className={
                  status >= PhysStatus.PROCESSING
                    ? "text-text-primary"
                    : "text-text-secondary"
                }
              >
                Processing
              </span>
            </div>

            {/* Completed */}
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  status >= PhysStatus.COMPLETED
                    ? "bg-green-500"
                    : "bg-gray-500"
                }`}
              />
              <span
                className={
                  status >= PhysStatus.COMPLETED
                    ? "text-text-primary"
                    : "text-text-secondary"
                }
              >
                Completed & Delivered
              </span>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
