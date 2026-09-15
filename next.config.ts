import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  images: {
      remotePatterns: [
          {
              protocol: "https",
              hostname: "picsum.photos",
              port: "",
              pathname: "/**",
          },
          {
              protocol: "https",
              hostname: "fastly.picsum.photos", 
              port: "",
              pathname: "/**",
          },
          {
              protocol: "https",
              hostname: "oda.vertb.com.br",
              port: "",
              pathname: "/**",
          },
          {
              protocol: "https",
              hostname: "oda.vertb.com.brnull",
              port: "",
              pathname: "/**",
          },
      ]
  }
};

export default nextConfig;
