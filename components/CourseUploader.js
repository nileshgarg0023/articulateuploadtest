import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

// Maximum file size (500MB in bytes)
const MAX_FILE_SIZE = 500 * 1024 * 1024;

export default function CourseUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();

  const onDrop = useCallback(
    async (acceptedFiles) => {
      // Only accept zip files
      const file = acceptedFiles[0];
      if (!file || !file.name.endsWith(".zip")) {
        toast.error(
          "Please upload a zip file containing your Articulate course"
        );
        return;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(
          `File is too large. Maximum size is ${
            MAX_FILE_SIZE / (1024 * 1024)
          }MB`
        );
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      // Create a FormData instance
      const formData = new FormData();
      formData.append("courseFile", file);

      try {
        // Simulate progress (in a real app, you might use an upload progress event)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const newValue = prev + 5;
            return newValue > 90 ? 90 : newValue;
          });
        }, 300);

        // Upload the file
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to upload course");
        }

        setUploadProgress(100);
        const data = await response.json();

        toast.success("Course uploaded successfully!");

        // Redirect to the course page after a short delay
        setTimeout(() => {
          router.push(`/courses/${data.courseId}`);
        }, 1500);
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(error.message || "Error uploading course");
      } finally {
        setIsUploading(false);
      }
    },
    [router]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/zip": [".zip"],
    },
    disabled: isUploading,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE, // Add maxSize to dropzone config
  });

  return (
    <div className="max-w-xl mx-auto my-8">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400"
        } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
            />
          </svg>
        </div>

        {isUploading ? (
          <div>
            <p className="mb-2 text-sm text-gray-500">
              Uploading and processing your course...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <>
            <p className="text-lg font-medium text-gray-700">
              {isDragActive
                ? "Drop your course file here"
                : "Drag and drop your Articulate course zip file here"}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              or click to browse files
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Upload a zip file that was exported from Articulate (Storyline,
              Rise, etc.)
            </p>
          </>
        )}
      </div>
    </div>
  );
}
