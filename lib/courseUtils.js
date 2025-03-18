import fs from "fs-extra";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import extract from "extract-zip";

// Base directory for course storage
const COURSES_DIR = path.join(process.cwd(), "public", "courses");

// Ensure the courses directory exists
export const ensureCoursesDir = async () => {
  await fs.ensureDir(COURSES_DIR);
};

// Get a list of all courses
export const getAllCourses = async () => {
  await ensureCoursesDir();

  try {
    const courseDirs = await fs.readdir(COURSES_DIR);

    const courses = await Promise.all(
      courseDirs.map(async (dirName) => {
        if (dirName === ".gitkeep") return null;

        try {
          const metaPath = path.join(COURSES_DIR, dirName, "meta.json");
          if (await fs.pathExists(metaPath)) {
            const meta = await fs.readJson(metaPath);
            return {
              id: dirName,
              ...meta,
            };
          }

          // If no meta.json, create a basic entry
          return {
            id: dirName,
            name: `Course ${dirName.slice(0, 8)}`,
            uploadDate: new Date().toISOString(),
          };
        } catch (error) {
          console.error(`Error reading course ${dirName}:`, error);
          return null;
        }
      })
    );

    return courses.filter(Boolean);
  } catch (error) {
    console.error("Error getting courses:", error);
    return [];
  }
};

// Get a specific course by ID
export const getCourseById = async (courseId) => {
  await ensureCoursesDir();

  const coursePath = path.join(COURSES_DIR, courseId);

  if (!(await fs.pathExists(coursePath))) {
    return null;
  }

  try {
    const metaPath = path.join(coursePath, "meta.json");
    let meta = {};

    if (await fs.pathExists(metaPath)) {
      meta = await fs.readJson(metaPath);
    }

    return {
      id: courseId,
      path: `/courses/${courseId}`,
      ...meta,
    };
  } catch (error) {
    console.error(`Error getting course ${courseId}:`, error);
    return null;
  }
};

// Process uploaded course zip file
export const processUploadedCourse = async (filePath, originalFilename) => {
  await ensureCoursesDir();

  // Generate a unique ID for the course
  const courseId = uuidv4();
  const coursePath = path.join(COURSES_DIR, courseId);

  try {
    // Create the course directory
    await fs.ensureDir(coursePath);

    // Extract the zip file
    await extract(filePath, { dir: coursePath });

    // Find the index.html file in the extracted contents
    const findIndexHtml = async (dir) => {
      const files = await fs.readdir(dir, { withFileTypes: true });

      for (const file of files) {
        if (file.isFile() && file.name.toLowerCase() === "index.html") {
          return path.join(dir, file.name).replace(coursePath, "");
        }

        if (file.isDirectory()) {
          const result = await findIndexHtml(path.join(dir, file.name));
          if (result) return result;
        }
      }

      return null;
    };

    // Find the main index.html file
    const indexPath = await findIndexHtml(coursePath);

    // Create metadata file
    const meta = {
      name: originalFilename.replace(/\.[^/.]+$/, ""), // Remove extension
      uploadDate: new Date().toISOString(),
      indexPath: indexPath || "",
      originalFilename,
    };

    await fs.writeJson(path.join(coursePath, "meta.json"), meta);

    // Clean up the uploaded file
    await fs.remove(filePath);

    return {
      courseId,
      ...meta,
    };
  } catch (error) {
    // Clean up on error
    await fs.remove(coursePath);
    throw error;
  }
};
