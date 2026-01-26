"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Camera, Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUploadImage } from "@/hooks/use-tenant";
import { Tenant } from "@/generated/prisma/client";

const LogoUpload = ({ tenant }: { tenant: Tenant }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const updateTenantLogo = useUploadImage();

  // Handle file selection
  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error(
          "Please select a valid image file (JPEG, PNG, GIF, or WebP)",
        );
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle image upload (you can integrate with your backend here)
  const handleUpload = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedImage);
      formData.append("upload_preset", "boutique");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        updateTenantLogo.mutateAsync(data.secure_url);
        // console.log(data);
        toast.success("Logo uploaded successfully!");
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Upload failed. Please try again.");
      setUploading(false);
    } finally {
      setUploading(false);
    }

    // Here you would typically upload to your server
    // Example: await uploadToServer(selectedImage);

    // console.log("Uploading image:", {
    //   name: selectedImage.name,
    //   type: selectedImage.type,
    //   size: selectedImage.size,
    //   preview: imagePreview,
    // });

    // Simulate upload
    // alert(`Image "${selectedImage.name}" is ready for upload!`);
  };

  // Get fallback initials from file name
  const getFallbackInitials = () => {
    if (selectedImage) {
      const nameWithoutExtension = selectedImage.name
        .split(".")
        .slice(0, -1)
        .join(".");
      return nameWithoutExtension.substring(0, 2).toUpperCase();
    }
    return "IMG";
  };
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Upload Logo
        </CardTitle>
        <CardDescription>
          Select an image to upload and preview it
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hidden file input */}
        <Input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          ref={fileInputRef}
          className="hidden"
          id="image-upload"
        />

        {/* Avatar Preview */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-gray-200">
              {imagePreview ? (
                <AvatarImage
                  src={imagePreview}
                  alt="Selected preview"
                  className="object-cover"
                />
              ) : tenant.logo ? (
                <AvatarImage
                  src={tenant.logo}
                  alt="Selected preview"
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="text-lg bg-gray-100">
                {selectedImage ? (
                  getFallbackInitials()
                ) : (
                  <Camera className="h-8 w-8" />
                )}
              </AvatarFallback>
            </Avatar>
            {/* Badge showing selected status */}
            {selectedImage && (
              <Badge className="absolute -top-2 -right-2 bg-green-500">
                Selected
              </Badge>
            )}
          </div>

          {/* File info */}
          {selectedImage && (
            <div className="text-center space-y-2">
              <p className="font-medium truncate max-w-62.5">
                {selectedImage.name}
              </p>
              <p className="text-sm text-gray-500">
                {(selectedImage.size / 1024).toFixed(2)} KB •{" "}
                {selectedImage.type.split("/")[1].toUpperCase()}
              </p>
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="space-y-4">
          {/* Select Button */}
          <div className="flex flex-col lg:flex-row gap-3">
            <Button
              type="button"
              onClick={handleButtonClick}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {selectedImage ? "Change Image" : "Select Image"}
            </Button>

            {/* Remove Button (only when image is selected) */}
            {selectedImage && (
              <Button
                type="button"
                onClick={handleRemoveImage}
                variant="ghost"
                className="flex-1 flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
                Remove
              </Button>
            )}
          </div>

          {/* Upload Button */}
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!selectedImage || uploading || updateTenantLogo.isPending}
            className="w-full"
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </Button>
        </div>

        {/* Help text */}
        <div className="text-sm text-gray-500 text-center">
          <p>Supported formats: JPEG, PNG, GIF, WebP</p>
          <p>Max file size: 5MB</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogoUpload;
