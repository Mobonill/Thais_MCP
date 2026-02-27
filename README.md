# Thaïs MCP Server

A local MCP server built with Node.js that connects the Thaïs hotel management software to an AI agent (Claude Desktop or ChatGPT).

The goal is to be able to ask questions like:
> "Is there a room available for 2 people from February 6 to 12?"

---

## How it works

The server exposes MCP tools that the AI can call. Each tool hits the Thaïs REST API and returns a response the LLM can understand and explain to the user.
```
    ChatGPT
        ↓
   Fastify (HTTP)
        ↓
   MCP tools (server.ts)
        ↓
   Business logic (mcp.controller.ts)
        ↓
   Thaïs API calls (thais.service.ts)
```

---

## Setup
```bash
cd server
npm install
```

Create a `.env` file:
```env
THAIS_BASE_URL=xxxx
THAIS_USERNAME=xxxx
THAIS_PASSWORD=xxxx
```

Start the server:
```bash
npm run dev
```

To connect ChatGPT, expose the server with ngrok:
```bash
ngrok http 3000
```
Then add `Forwarding section` in ChatGPT's MCP settings.

---

## Available tools

| Tool | Description |
|------|-------------|
| `thais_check_availability` | Check room availability for given dates and number of guests |
| `thais_list_room_types` | List all room types with capacity and description |
| `thais_get_room_details` | Get full details for a specific room (price, tourist tax, restrictions) |
| `thais_create_e_reservation` | Create a pre-booking in the hotel's planning |

---

## Stack

- **Fastify** — HTTP server
- **@modelcontextprotocol/sdk** — MCP transport (Streamable HTTP)
- **Zod** — Tool parameter validation
- **TypeScript**
- **ngrok** — Expose local server to ChatGPT


____________________________________________________________________________________________________

# Agent bonus

A CLI conversational agent which connects GPT 4-o to the MCP server by LangChain

Start the agent:
```bash
npm run agent
```

### How it works:
1. Analyzes the question
2. Calls an MCP tool (`thais_check_availability`, etc.)
3. Reads the result
4. Decides if another call is needed
5. Formulates the final answer

### Stack

- **LangChain** — agent orchestration
- **@langchain/mcp-adapters** — MCP server connection
- **GPT-4o** — language model
- **LangSmith** — observability and call tracing