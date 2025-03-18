# Articulate Course Uploader for Next.js

This is a Next.js application that allows you to upload and view Articulate (Storyline, Rise, etc.) courses directly within your web application.

## Features

- Upload Articulate courses from ZIP files
- Automatic extraction and processing
- Convenient course browsing interface
- View courses directly in your application
- API endpoints for retrieving course information

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn

### Installation

1. Clone the repository or download the source code.

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create required directories:

```bash
mkdir -p public/courses
mkdir -p uploads
touch public/courses/.gitkeep
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Export your course from Articulate (Storyline, Rise, etc.) as a web/HTML package.
2. Compress the exported folder as a ZIP file.
3. Use the uploader on the home page to upload your course ZIP file.
4. Wait for the processing to complete - you'll be redirected to view your course automatically.
5. All uploaded courses will appear in the list on the home page for later access.

## API Routes

- `GET /api/courses` - Retrieve a list of all uploaded courses
- `GET /api/courses?id=[courseId]` - Get details for a specific course
- `POST /api/upload` - Upload a new course (multipart/form-data with a `courseFile` field)

## Deployment

This application can be deployed to any hosting platform that supports Next.js, such as Vercel or Netlify.

Make sure to set up proper permissions for file uploading and storage in your production environment.

## Limitations

- Only ZIP files are supported for upload
- Maximum file size is 100MB by default (configurable in `pages/api/upload.js`)
- Courses with dependencies on external servers may not function as expected

## License

This project is licensed under the MIT License.
