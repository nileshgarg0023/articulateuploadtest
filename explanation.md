# Articulate Course Uploader - Codebase Explanation

This document provides a comprehensive explanation of the Articulate Course Uploader application, detailing the purpose and functionality of each file in the codebase.

## Project Overview

The Articulate Course Uploader is a Next.js application that allows users to upload Articulate e-learning courses (exported as ZIP files), process them, and view them directly in the browser. The application handles file uploads, extraction, and presentation of the course content.

## Directory Structure

```
articulate-uploader/
├── components/           # React components
├── lib/                  # Utility functions
├── pages/                # Next.js pages and API routes
├── public/               # Static assets and uploaded courses
├── styles/               # CSS styles
├── uploads/              # Temporary storage for uploads
└── configuration files   # Various config files
```

## Core Files and Their Functions

### Components

#### `components/CourseUploader.js`

- Provides a drag-and-drop interface for uploading course ZIP files
- Uses react-dropzone for the file upload UI
- Validates file type (must be ZIP) and size (up to 500MB)
- Shows upload progress with a progress bar
- Handles form submission to the upload API endpoint
- Displays success/error messages using toast notifications
- Redirects to the course viewer page after successful upload

#### `components/CoursesList.js`

- Fetches and displays a list of all uploaded courses
- Shows a loading spinner while courses are being fetched
- Displays a message if no courses have been uploaded
- Renders a responsive grid of course cards
- Each card shows course name, upload date, and links to the course viewer

#### `components/Layout.js`

- Provides a consistent layout structure for all pages
- Includes header with navigation, main content area, and footer
- Sets up document head with title and meta tags
- Configures toast notifications container

### Library Functions

#### `lib/courseUtils.js`

- Contains utility functions for course handling:
  - `ensureCoursesDir()`: Creates the courses directory if it doesn't exist
  - `getAllCourses()`: Retrieves a list of all uploaded courses
  - `getCourseById()`: Gets a specific course by ID
  - `processUploadedCourse()`: Processes an uploaded ZIP file:
    - Creates a unique ID for the course
    - Extracts the ZIP contents
    - Finds the main index.html file
    - Creates metadata for the course
    - Cleans up temporary files

### Pages

#### `pages/index.js`

- Home page with course uploader and list of courses
- Includes welcome message and instructions
- Embeds the CourseUploader and CoursesList components

#### `pages/_app.js`

- Custom App component that wraps all pages
- Imports global styles

#### `pages/courses/[courseId].js`

- Dynamic route for viewing a specific course
- Fetches course data based on the courseId parameter
- Displays course metadata (name, upload date)
- Embeds the course content in an iframe
- Handles loading and error states

### API Routes

#### `pages/api/upload.js`

- Handles POST requests for course uploads
- Uses formidable to process multipart form data
- Validates that the uploaded file is a ZIP
- Configures file size limits (up to 500MB)
- Calls processUploadedCourse to handle the file
- Returns success/error responses

#### `pages/api/courses.js`

- Handles GET requests for course information
- Returns a list of all courses or a specific course by ID
- Uses the courseUtils functions to retrieve data

### Styles

#### `styles/globals.css`

- Global styles applied to the entire application
- Imports Tailwind CSS utilities

#### `styles/Home.module.css`

- CSS module with styles specific to the home page
- Includes responsive design adjustments

### Configuration Files

#### `next.config.js`

- Next.js configuration
- Sets up custom headers for the courses directory to allow Articulate content to run properly
- Configures Content Security Policy

#### `.env.local`

- Environment variables
- Sets maximum file size for uploads (500MB)
- Defines base URL for the application

#### `jsconfig.json`

- JavaScript configuration
- Sets up path aliases for easier imports

#### `tailwind.config.js` and `postcss.config.js`

- Configuration for Tailwind CSS and PostCSS

#### `package.json`

- Lists project dependencies:
  - extract-zip: For extracting ZIP files
  - formidable: For handling file uploads
  - fs-extra: Enhanced file system operations
  - react-dropzone: For drag-and-drop file uploads
  - react-toastify: For toast notifications
  - uuid: For generating unique course IDs

## How It All Works Together

1. **Upload Process**:

   - User uploads a ZIP file via the CourseUploader component
   - The file is sent to the upload API endpoint
   - The API validates the file and passes it to processUploadedCourse
   - The ZIP is extracted to the public/courses directory
   - A unique ID and metadata are generated for the course
   - The user is redirected to the course viewer page

2. **Course Viewing**:

   - The CoursesList component fetches and displays all courses
   - When a user clicks on a course, they're taken to the dynamic course page
   - The course page fetches specific course data and displays it
   - The course content is embedded in an iframe

3. **Data Flow**:
   - Course files are stored in public/courses/{courseId}
   - Course metadata is stored in meta.json files within each course directory
   - API endpoints provide data to the frontend components
   - React components render the UI based on the data

## Articulate Course Rendering Process

### Behind-the-Scenes: How Articulate Courses Work in Next.js

Articulate courses (from Storyline, Rise, etc.) are web-based content packages that consist of HTML, JavaScript, CSS, and media files. Integrating these courses into a Next.js application requires special handling due to their unique requirements. Here's a detailed explanation of how the rendering process works:

1. **Course Structure Analysis**:

   - When an Articulate course ZIP is uploaded, the `processUploadedCourse` function in `courseUtils.js` extracts it to the public directory
   - The function recursively searches for the main `index.html` file, which is the entry point for the course
   - The path to this index file is stored in the course metadata for later use

2. **Static File Serving**:

   - Next.js serves files in the `public` directory as static assets
   - The extracted course files (HTML, JS, CSS, images, etc.) are accessible via URLs like `/courses/{courseId}/...`
   - This allows the course to load its resources without any server-side processing

3. **Content Security Policy Configuration**:

   - Articulate courses use various JavaScript features that are restricted by default browser security policies
   - The `next.config.js` file configures custom headers with a Content Security Policy that allows:
     - Inline scripts (`'unsafe-inline'`)
     - Eval-based code execution (`'unsafe-eval'`)
     - Loading resources from the same origin (`'self'`)
     - Data URIs for images (`data:`)
   - These settings are crucial for Articulate courses to function properly

4. **Iframe Isolation**:

   - The course is rendered within an iframe in the `pages/courses/[courseId].js` component
   - This isolation is important because:
     - It prevents the course's JavaScript from interfering with the Next.js application
     - It allows the course to have its own window/document context
     - It enables proper rendering of legacy code that might not be compatible with React

5. **Dynamic Path Construction**:

   - When a user views a course, the application:
     - Fetches the course metadata using the `getCourseById` function
     - Constructs the path to the course's index.html file
     - Sets this path as the `src` attribute of the iframe
   - The code that handles this is in `pages/courses/[courseId].js`:

     ```javascript
     const baseCoursePath = `/courses/${courseId}`;
     const courseIndexPath = course.indexPath || "/index.html";
     const fullCoursePath = `${baseCoursePath}${courseIndexPath}`;

     // Later used in the iframe
     <iframe
       src={fullCoursePath}
       className="w-full h-screen border-0"
       title={course.name}
       allowFullScreen
     ></iframe>;
     ```

6. **Course Initialization and Execution**:

   - When the iframe loads, the browser:
     - Requests the index.html file from the server
     - Parses the HTML and loads all referenced resources (JS, CSS, media)
     - Executes the Articulate course's JavaScript
   - The course initializes within the iframe, setting up its own:
     - Event listeners
     - Navigation controls
     - Media players
     - Interactive elements
     - Progress tracking

7. **Responsive Handling**:

   - The iframe is styled to be responsive (full width, appropriate height)
   - Articulate courses typically have their own responsive design logic
   - The combination allows the course to adapt to different screen sizes

8. **Performance Considerations**:

   - Courses are loaded on-demand when a user navigates to the course page
   - Static file serving is efficient as Next.js can leverage browser caching
   - The iframe isolation prevents performance issues in the main application

9. **Technical Challenges and Solutions**:

   - **Cross-Origin Issues**: Solved by serving content from the same origin and setting appropriate CSP headers
   - **Script Execution**: Enabled by allowing unsafe-inline and unsafe-eval in the CSP
   - **Resource Loading**: Facilitated by the static file serving from the public directory
   - **State Isolation**: Achieved through iframe encapsulation

10. **Articulate-Specific Behaviors**:
    - Articulate courses use a player framework that handles:
      - Slide navigation
      - Progress tracking
      - Interactive elements
      - Media playback
    - This player is self-contained within the course files and runs independently within the iframe
    - The player typically initializes when the course loads and manages the entire user experience

This architecture allows Articulate courses to run in their native form without modification, while still being integrated into the Next.js application's UI and navigation flow.

## Security Considerations

- Custom Content Security Policy headers allow Articulate content to run properly
- File validation ensures only ZIP files are accepted
- File size limits prevent server overload
- Error handling throughout the application

## Deployment Considerations

- The application stores uploaded courses in the public directory
- For production, consider using external storage (S3, etc.)
- The .gitignore file excludes uploaded courses from version control
