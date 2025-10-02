import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UseFormRegister, UseFormSetValue, FieldErrors } from "react-hook-form";
import { CreateCollectionForm } from "./utils";
import { ImageUpload } from "@/components/ui/image-upload";

interface FieldItem {
  label: React.ReactNode;
  component: React.ReactNode;
}

type Fields = Array<FieldItem | Array<FieldItem>>;

interface UseCreatorNewFormFieldsProps {
  register: UseFormRegister<CreateCollectionForm>;
  setValue: UseFormSetValue<CreateCollectionForm>;
  errors: FieldErrors<CreateCollectionForm>;
}

const useCreatorNewFormFields = ({
  register,
  setValue,
  errors,
}: UseCreatorNewFormFieldsProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleImageUpload = (url: string) => {
    console.log("Image uploaded with URL:", url);
    setImageUrl(url);
    setValue("image", url, { shouldValidate: true });
  };

  const fields: Fields = [
    {
      label: null,
      component: (
        <div className="md:col-span-2">
          <ImageUpload
            value={imageFile || ""}
            onChange={setImageFile}
            onUploadComplete={handleImageUpload}
            label="Collection Image"
            className="w-full"
            required={false}
          />
        </div>
      ),
    },

    {
      label: <Label htmlFor="work-url">Image URL</Label>,
      component: (
        <div className="md:col-span-2">
          <Input
            id="work-url"
            placeholder="Image URL will be auto-filled after upload"
            value={imageUrl}
            disabled
            className="bg-muted cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            This field will be automatically filled when you upload an image
            above
          </p>
        </div>
      ),
    },

    [
      {
        label: <Label htmlFor="work-title">Title*</Label>,
        component: (
          <div>
            <Input
              id="work-title"
              placeholder="Enter work title"
              {...register("title")}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">
                {errors.title.message}
              </p>
            )}
          </div>
        ),
      },
      {
        label: <Label htmlFor="work-symbol">Symbol*</Label>,
        component: (
          <div>
            <Input
              id="work-symbol"
              placeholder="e.g. ART"
              {...register("symbol")}
            />
            {errors.symbol && (
              <p className="mt-1 text-sm text-red-400">
                {errors.symbol.message}
              </p>
            )}
          </div>
        ),
      },
    ],

    [
      {
        label: <Label htmlFor="work-supply">Edition Supply*</Label>,
        component: (
          <div>
            <Input
              id="work-supply"
              type="number"
              placeholder="50"
              {...register("supply", { valueAsNumber: true })}
            />
            {errors.supply && (
              <p className="mt-1 text-sm text-red-400">
                {errors.supply.message}
              </p>
            )}
          </div>
        ),
      },
      {
        label: <Label htmlFor="work-price">Price (ETH)*</Label>,
        component: (
          <div>
            <Input id="work-price" placeholder="0.1" {...register("price")} />
            {errors.price && (
              <p className="mt-1 text-sm text-red-400">
                {errors.price.message}
              </p>
            )}
          </div>
        ),
      },
    ],

    {
      label: <Label htmlFor="work-description">Description*</Label>,
      component: (
        <div className="md:col-span-2">
          <Textarea
            id="work-description"
            rows={4}
            placeholder="Describe the physical tie-in, materials, and story."
            {...register("description")}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-400">
              {errors.description.message}
            </p>
          )}
        </div>
      ),
    },
  ];

  return fields;
};

export { useCreatorNewFormFields, type FieldItem, type Fields };
