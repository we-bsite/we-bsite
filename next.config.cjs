/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
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

module.exports = nextConfig;
