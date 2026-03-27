"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

interface FileUploadProps {
  onUpload: (url: string, file: File) => void;
  uploadedUrl?: string;
  className?: string;
}

export function FileUpload({ onUpload, uploadedUrl, className = "" }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("请上传图片文件 (JPG, PNG, GIF, WebP)");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error("文件大小不超过 20MB");
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const resp = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await resp.json();

        if (!resp.ok) {
          throw new Error(data.error || "Upload failed");
        }

        onUpload(data.url, file);
        toast.success("图片上传成功");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "上传失败，请重试");
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  return (
    <div
      className={`upload-zone ${isDragging ? "dragging" : ""} ${className}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-zinc-400">上传中...</span>
        </div>
      ) : uploadedUrl ? (
        <div className="flex flex-col items-center gap-2 w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={uploadedUrl}
            alt="Uploaded"
            className="w-full h-36 object-contain rounded-lg"
          />
          <span className="text-xs text-zinc-400">点击重新上传</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 opacity-60 hover:opacity-80 transition-opacity">
          <div className="text-3xl">📷</div>
          <div className="text-sm text-zinc-300 font-medium">
            {isDragging ? "松开以上传" : "拖放或点击上传"}
          </div>
          <div className="text-xs text-zinc-500 text-center">
            PNG、JPG 最大 20MB
          </div>
        </div>
      )}
    </div>
  );
}
