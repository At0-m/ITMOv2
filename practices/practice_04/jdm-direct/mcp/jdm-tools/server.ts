import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
// Use Zod v4 API explicitly via subpath to avoid accidental v3 import
import * as z from 'zod/v4';
import { estimateImportCost } from './estimateImportCost.js';

function createServer(): McpServer {
  const server = new McpServer({ name: 'jdm-tools', version: '0.1.0' });

  server.registerTool(
    'estimate_import_cost',
    {
      description:
        'Demo calculation: estimate purchase and shipping cost for a JDM car. Not a real customs calculation.',
      inputSchema: z
        .object({
          carPriceJpy: z
            .number()
            .finite()
            .gt(0, { message: 'carPriceJpy must be > 0' })
            .lte(100_000_000, { message: 'carPriceJpy must be <= 100000000' })
            .describe('Car price in JPY (0 < price <= 100000000).'),
        })
        .strict(),
      // Structured output schema for clients that support it
      outputSchema: z
        .object({
          carPriceJpy: z.number(),
          auctionFeeJpy: z.number(),
          shippingJpy: z.number(),
          totalJpy: z.number(),
          summary: z.string(),
          demo: z.literal(true),
        })
        .strict(),
    },
    async ({ carPriceJpy }) => {
      try {
        const result = estimateImportCost(carPriceJpy);
        const text = `${result.summary} This is a demo calculation.`;
        return {
          content: [{ type: 'text', text }],
          structuredContent: result,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return {
          content: [
            {
              type: 'text',
              text: `Input error: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  return server;
}

// Start serving over stdio; do not write to stdout manually to avoid corrupting the protocol stream.
void serveStdio(createServer);
