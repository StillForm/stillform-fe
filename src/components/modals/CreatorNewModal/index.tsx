"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  useCreateCollection,
  useTransactionLogs,
  ProductType,
  REGISTRY_ADDRESS,
} from "@/lib/contracts";
import { useModalStore } from "@/lib/stores/modal-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { BaseModal } from "../base-modal";
import { CreateCollectionForm, createCollectionSchema } from "./utils";
import { useCreatorNewFormFields } from "./hooks";
import { createNormalStyle } from "@/lib/contracts/collection-factory/utils";
import { uploadJsonToIPFS } from "@/lib/ipfs/client";

const CreatorNewModal = () => {
  const { closeModal } = useModalStore();
  const { address } = useAccount();

  const {
    createCollection,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  } = useCreateCollection();

  const { receipt, logs, isSuccess } = useTransactionLogs(hash);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
    watch,
  } = useForm<CreateCollectionForm>({
    resolver: zodResolver(createCollectionSchema),
    mode: "onChange",
  });

  // 添加调试信息
  const formData = watch();
  console.log("Form state:", { isValid, formData, errors });

  const formFields = useCreatorNewFormFields({
    register,
    setValue,
    errors,
  });

  const onSubmit = async (data: CreateCollectionForm) => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      // 生成符合ERC-721标准的元数据JSON
      const metadata = {
        name: data.title,
        description: data.description,
        image: data.image || "",
        attributes: [
          {
            trait_type: "Artist",
            value: address.slice(0, 8) + "...",
          },
          {
            trait_type: "Collection",
            value: data.title,
          },
          {
            trait_type: "Supply",
            value: data.supply.toString(),
          },
        ],
      };

      // 上传元数据到IPFS（现在作为File对象上传）
      const metadataUri = await uploadJsonToIPFS(metadata);

      const collectionParams = {
        name: data.title,
        symbol: data.symbol,
        config: {
          ptype: ProductType.NORMAL,
          price: parseEther(data.price),
          maxSupply: data.supply,
          unrevealedUri: "",
          creator: address,
          registry: REGISTRY_ADDRESS,
        },
        styles: createNormalStyle(metadataUri, data.supply), // 使用元数据URI
      };

      await createCollection(collectionParams);
    } catch (err) {
      console.error("Failed to create collection:", err);
    }
  };

  useEffect(() => {
    if (isConfirmed && isSuccess) {
      console.log("work-creating logs:", logs);
      // TODO: 目前看了下好像没有业务 logs，后续可能得加一下
      closeModal();
    }
  }, [isConfirmed, isSuccess, receipt, logs, closeModal]);

  return (
    <BaseModal
      open
      onClose={closeModal}
      title="New work"
      description="Define edition supply, sale format, and redemption rules. You can save drafts and revisit from the studio dashboard."
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="tertiary"
            onClick={closeModal}
            disabled={isPending || isConfirming}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || isPending || isConfirming}
          >
            {isPending || isConfirming ? "Creating..." : "Create Collection"}
          </Button>
        </div>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-6 md:grid-cols-2"
      >
        {formFields.map((field, index) => {
          if (Array.isArray(field)) {
            return (
              <React.Fragment key={index}>
                {field.map((item, itemIndex) => (
                  <div key={`${index}-${itemIndex}`}>
                    {item.label}
                    {item.component}
                  </div>
                ))}
              </React.Fragment>
            );
          } else {
            return (
              <React.Fragment key={index}>
                <div className="md:col-span-2">
                  {field.label}
                  {field.component}
                </div>
              </React.Fragment>
            );
          }
        })}

        {error && (
          <div className="md:col-span-2 rounded-[14px] border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-400">
            Error: {error.message}
          </div>
        )}

        <div className="md:col-span-2 rounded-[14px] border border-[rgba(38,39,43,0.75)] bg-[rgba(12,12,14,0.78)] p-4 text-sm text-text-secondary">
          Redemption workflows connect to your selected fulfilment partner.
          Configure shipping cost handoff later.
        </div>
      </form>
    </BaseModal>
  );
};

export default CreatorNewModal;
