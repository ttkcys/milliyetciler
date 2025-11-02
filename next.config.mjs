/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Sunuculu dağıtım (Seçenek A) için:
  output: 'standalone',

  // Uyarıda dendiği gibi experimental'dan çıkarılıp köke taşındı
  typedRoutes: true,

  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: false,
      fs: false,
      path: false,
    };
    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "milliyetcidergiler.org",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
