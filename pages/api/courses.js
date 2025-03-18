import { getAllCourses, getCourseById } from "../../lib/courseUtils";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      // Check if a specific course ID is requested
      const { id } = req.query;

      if (id) {
        const course = await getCourseById(id);

        if (!course) {
          return res.status(404).json({ message: "Course not found" });
        }

        return res.status(200).json({ course });
      }

      // Otherwise, return all courses
      const courses = await getAllCourses();
      return res.status(200).json({ courses });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
