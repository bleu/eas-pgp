/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true,
    reactCompiler: {
      compilationMode: "annotation",
    },
  },
};

module.exports = nextConfig;
