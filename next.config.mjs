// ABOUTME: Configures Next.js build and image handling behavior.
// ABOUTME: Keeps remote image optimization disabled until explicit hosts are approved.

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // {
      //   protocol: "https",
      //   hostname: "cdn-images-1.medium.com",
      //   port: "",
      //   pathname: "/**",
      // },
    ],
  },
};

export default nextConfig;
