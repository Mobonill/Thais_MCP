/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   agent.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: morgane <morgane@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/26 22:15:23 by morgane           #+#    #+#             */
/*   Updated: 2026/02/27 10:24:41 by morgane          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import * as readline from "readline";
import dotenv from "dotenv";
dotenv.config();

async function main() {
    const client = new MultiServerMCPClient({
        thais: {
            transport: "http",
            url: "http://localhost:3000/mcp",
        },
    });

    const tools = await client.getTools();

    const llm = new ChatOpenAI({
        model: "gpt-4o",
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0,
    });

    const agent = createAgent({
        model: llm,
        tools,
        systemPrompt: `Tu es un assistant de réservation pour l'hôtel Thaïs.
        - Réponds toujours en français.
        - Ne jamais inventer des informations — utilise TOUJOURS les tools MCP pour répondre.
        - Si une chambre est non disponible, ne pas dire qu'elle est disponible ensuite sans rappeler les tools.
        - Toujours demander la civilité (M., Mme., M. ou Mme, Sté) avant de créer une réservation.
        - Ne jamais appeler thais_get_room_details sans que l'utilisateur ait mentionné une chambre spécifique.`,
    });

    const history: { role: "user" | "assistant"; content: string }[] = [];

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log("\nAssistant Thaïs — tapez 'exit' pour quitter\n");

    const ask = (): void => {
        rl.question("Vous : ", (input: string): void => {
            void (async () => {
                if (input.toLowerCase() === "exit") {
                    console.log("Au revoir !");
                    await client.close();
                    rl.close();
                    return;
                }

                try {
                    const messages = history.slice(); // copy history without modifiying it
                    messages.push({ role: "user", content: input });

                    const response = await agent.invoke({ messages });

                    const lastMessage = response.messages[response.messages.length - 1];
                    const answer =
                        typeof lastMessage.content === "string"
                            ? lastMessage.content
                            : JSON.stringify(lastMessage.content);

                    console.log(`\nAssistant thaïs: ${answer}\n`);

                    history.push({ role: "user", content: input });
                    history.push({ role: "assistant", content: answer });
                } catch (err) {
                    console.error("Erreur :", err);
                }

                ask();
            })();
        });
    };

    ask();
}

main().catch(console.error);
