/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Custom headers for allowing Articulate content to run properly
  async headers() {
    return [
      {
        source: "/courses/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'self';",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
