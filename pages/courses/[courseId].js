import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import Link from "next/link";

export default function CoursePage() {
  const router = useRouter();
  const { courseId } = router.query;
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCourse() {
      if (!courseId) return;

      try {
        const response = await fetch(`/api/courses?id=${courseId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch course");
        }

        const data = await response.json();
        setCourse(data.course);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCourse();
  }, [courseId]);

  if (isLoading) {
    return (
      <Layout title="Loading Course...">
        <div className="flex justify-center items-center h-64">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="ml-4">Loading course...</p>
        </div>
      </Layout>
    );
  }

  if (error || !course) {
    return (
      <Layout title="Error">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 my-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error ||
                  "Course not found. It may have been deleted or the ID is invalid."}
              </p>
              <div className="mt-4">
                <Link
                  href="/"
                  className="text-sm font-medium text-red-700 hover:text-red-600"
                >
                  Return to home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Determine the course path
  const baseCoursePath = `/courses/${courseId}`;
  const courseIndexPath = course.indexPath || "/index.html";
  const fullCoursePath = `${baseCoursePath}${courseIndexPath}`;

  return (
    <Layout title={course.name || "View Course"}>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {course.name || "Unnamed Course"}
          </h1>
          <p className="text-sm text-gray-500">
            Uploaded: {new Date(course.uploadDate).toLocaleString()}
          </p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Courses
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <iframe
          src={fullCoursePath}
          className="w-full h-screen border-0"
          title={course.name}
          allowFullScreen
        ></iframe>
      </div>
    </Layout>
  );
}
