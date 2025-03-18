import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import { processUploadedCourse } from "../../lib/courseUtils";

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Parse the incoming form data
    const form = new IncomingForm({
      uploadDir: uploadsDir,
      keepExtensions: true,
      maxFileSize: 500 * 1024 * 1024, // 500MB limit for individual files
      maxTotalFileSize: 500 * 1024 * 1024, // 500MB total limit
      maxFields: 10,
    });

    // Process the form
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve([fields, files]);
      });
    });

    // Get the uploaded file
    const fileField = files.courseFile?.[0];
    if (!fileField) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Check if it's a zip file
    if (!fileField.originalFilename.toLowerCase().endsWith(".zip")) {
      // Clean up the file
      await fs.promises.unlink(fileField.filepath);
      return res.status(400).json({ message: "Please upload a zip file" });
    }

    // Process the uploaded course
    const courseData = await processUploadedCourse(
      fileField.filepath,
      fileField.originalFilename
    );

    return res.status(200).json({
      message: "Course uploaded successfully",
      courseId: courseData.courseId,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Error processing upload" });
  }
}
