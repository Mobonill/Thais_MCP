/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: morgane <morgane@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/25 17:26:42 by morgane           #+#    #+#             */
/*   Updated: 2026/02/26 10:00:40 by morgane          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Fastify from "fastify";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import createMCPServer from "./server.js";

const app = Fastify({ logger: true });

app.get("/", () => ({ status: "ok" }));
app.get("/mcp", () => ({ status: "mcp endpoint up (POST only)" }));

app.post("/mcp", async (req, reply) => {
    const server = createMCPServer();
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
    });

    try {
        await server.connect(transport);
        await transport.handleRequest(req.raw, reply.raw, req.body);
    } finally {
        await server.close();
    }
});

app.listen({ port: 3000, host: "0.0.0.0" }, () => {
    console.log("Serveur démarré sur http://localhost:3000");
});
