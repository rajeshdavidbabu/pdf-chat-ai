/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@douyinfe/semi-ui', '@douyinfe/semi-icons', '@douyinfe/semi-illustrations'],
  webpack(config) {
    // config.experiments = { ...config.experiments, topLevelAwait: true };
    config.externals.push({ sharp: 'commonjs sharp', canvas: 'commonjs canvas' });
    return config;
  },
};

export default nextConfig;
