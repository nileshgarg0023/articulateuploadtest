import Layout from "../components/Layout";
import CourseUploader from "../components/CourseUploader";
import CoursesList from "../components/CoursesList";

export default function Home() {
  return (
    <Layout>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Articulate Course Uploader
        </h1>
        <p className="mt-3 text-xl text-gray-500 max-w-2xl mx-auto">
          Upload your Articulate courses and view them directly in your Next.js
          application.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900">
            Upload a New Course
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Drag and drop your Articulate course zip file or click to browse
            your files.
          </p>

          <CourseUploader />

          <div className="mt-4 text-sm text-gray-500">
            <p className="font-medium">Instructions:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>
                Export your Articulate (Storyline, Rise, etc.) course as a
                web/HTML package
              </li>
              <li>Compress the exported folder as a ZIP file</li>
              <li>Upload the ZIP file using the uploader above</li>
              <li>
                Wait for the upload to complete - your course will process
                automatically
              </li>
              <li>When complete, you'll be redirected to view your course</li>
            </ol>
          </div>
        </div>
      </div>

      <CoursesList />
    </Layout>
  );
}
