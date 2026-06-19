import type { NextConfig } from "next";
import path from "path";

const STUB = path.resolve(__dirname, "lib/stubs/empty.ts");

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
    resolveAlias: {
      "@letta-ai/letta-client": STUB,
      "@mastra/core": STUB,
      "@langchain/core": STUB,
      "@opencode-ai/sdk": STUB,
      "@opencode-ai/sdk/server": STUB,
      "@opencode-ai/sdk/v2/client": STUB,
      "@opencode-ai/sdk/v2/server": STUB,
      "@anthropic-ai/claude-agent-sdk": STUB,
      "@google/genai": STUB,
      "@a2a-js/sdk": STUB,
      "@a2a-js/sdk/server": STUB,
      "@a2a-js/sdk/server/express": STUB,
      "express": STUB,
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@letta-ai/letta-client": STUB,
      "@mastra/core": STUB,
      "@langchain/core": STUB,
      "@opencode-ai/sdk": STUB,
      "@opencode-ai/sdk/server": STUB,
      "@opencode-ai/sdk/v2/client": STUB,
      "@opencode-ai/sdk/v2/server": STUB,
      "@anthropic-ai/claude-agent-sdk": STUB,
      "@google/genai": STUB,
      "@a2a-js/sdk": STUB,
      "@a2a-js/sdk/server": STUB,
      "@a2a-js/sdk/server/express": STUB,
      "express": STUB,
    };
    return config;
  },
};

export default nextConfig;
