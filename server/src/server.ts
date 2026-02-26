/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   server.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: morgane <morgane@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/25 17:26:45 by morgane           #+#    #+#             */
/*   Updated: 2026/02/26 08:30:21 by morgane          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { checkAvailability, checkRoomDetails } from "./controllers/mcp.controller.js";
import { getRoomTypes } from "./services/thais.service.js";
// import { RoomType } from "./types/RoomType.js";

export default function createMCPServer() {
    const server = new McpServer({
        name: "thais-hotel",
        version: "1.0.0",
    });

    server.registerTool(
        "thais_get_room_details",
        {
            description:
                "TOUJOURS appeler cet outil quand l'utilisateur demande des détails, informations, équipements, prix ou caractéristiques d'une chambre spécifique.",
            inputSchema: {
                checkIn: z.string().describe("Date d'arrivée YYYY-MM-DD"),
                checkOut: z.string().describe("Date de départ YYYY-MM-DD"),
                label: z.string().describe("Nom exact de la chambre, ex: 'Triple', 'Suite', 'Chambre double'"),
                adults: z.number().describe("Nombre total de personnes"),
            },
        },
        async ({ checkIn, checkOut, label, adults }) => {
            const result = await checkRoomDetails(checkIn, checkOut, label, adults);
            return { content: [{ type: "text", text: JSON.stringify(result) }] };
        },
    );

    server.registerTool(
        "thais_check_availability",
        {
            inputSchema: {
                checkIn: z.string().describe(
                    `Date d'arrivée au format YYYY-MM-DD. 
                    L'année courante est ${new Date().getFullYear()}. 
                    Convertis les formats naturels : "6 février" → "${new Date().getFullYear()}-02-06", 
                    "début février" → "${new Date().getFullYear()}-02-01"`,
                ),
                checkOut: z.string().describe(
                    `Date de départ au format YYYY-MM-DD.
                    L'année courante est ${new Date().getFullYear()}.
                    Convertis les formats naturels : "12 février" → "${new Date().getFullYear()}-02-12"`,
                ),
                adults: z.number().describe("Nombre total d'adultes ET enfants. '2 adultes + 1 enfant' → 3"),
            },
        },
        async ({ checkIn, checkOut, adults }) => {
            const result = await checkAvailability(checkIn, checkOut, adults);

            return {
                content: [{ type: "text", text: JSON.stringify(result) }],
            };
        },
    );

    server.registerTool("thais_list_room_types", { inputSchema: {} }, async () => {
        const rooms = await getRoomTypes();
        if (!rooms.length) {
            return { content: [{ type: "text", text: "Aucun type de chambre disponible." }] };
        }

        let result = "Types de chambres disponibles :\n\n";
        for (const room of rooms) {
            result += ` ${room.label}\n`;
            result += `  Capacité : ${room.nb_persons_min} à ${room.nb_persons_max} personnes\n`;
            result += `  Description : ${room.description}\n\n`;
        }

        return {
            content: [{ type: "text", text: result }],
        };
    });

    return server;
}
