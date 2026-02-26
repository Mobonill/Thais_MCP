/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   server.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: morgane <morgane@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/25 17:26:45 by morgane           #+#    #+#             */
/*   Updated: 2026/02/26 16:47:35 by morgane          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { checkAvailability, checkRoomDetails, createEReservation } from "./controllers/mcp.controller.js";
import { getRoomTypes } from "./services/thais.service.js";

export default function createMCPServer() {
    const server = new McpServer({
        name: "thais-hotel",
        version: "1.0.0",
        description: `Tu es un assistant de réservation pour l'hôtel Thaïs.
            - Toujours demander le nombre de personnes et les dates de séjour pour thais_check_availability.
            - Après avoir listé les chambres disponibles, demander 'Souhaitez-vous plus de détails sur l'une de ces chambres?'.
            - Toujours appeler thais_get_room_details avant de créer une réservation.
            - Toujours demander la civilité (M., Mme., M. ou Mme, Sté) avant de créer une réservation. Ne jamais la deviner.`,
    });

    server.registerTool(
        "thais_check_availability",
        {
            description:
                "Vérifie les disponibilités et les prix des chambres pour une période et un nombre de personnes donnés.\
                Après avoir affiché les résultats, proposer systématiquement à l'utilisateur de voir les détails d'une chambre.",
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
                adults: z
                    .number()
                    .describe("Nombre total d'adultes UNIQUEMENT. '2 adultes + 1 enfant' = 2 adultes + 1 children"),
                children: z.number().describe("Nombre total d'enfants"),
                infants: z.number().describe("Nombre total de bébés"),
            },
        },
        async ({ checkIn, checkOut, adults, children, infants }) => {
            const result = await checkAvailability(checkIn, checkOut, adults, children, infants);

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

    server.registerTool(
        "thais_get_room_details",
        {
            description:
                "Récupère les détails complets d'une chambre : prix exact, taxe de séjour, capacité, restrictions de séjour, etc.\
                Appeler automatiquement dès que l'utilisateur mentionne une chambre spécifique ou demande à en savoir plus.",
            inputSchema: {
                checkIn: z.string().describe("Date d'arrivée YYYY-MM-DD"),
                checkOut: z.string().describe("Date de départ YYYY-MM-DD"),
                label: z.string().describe("Nom exact de la chambre, ex: 'Triple', 'Suite', 'Chambre double'"),
                adults: z.number().describe("Nombre d'adultes uniquement"),
                children: z.number().default(0).describe("Nombre d'enfants (par défaut: 0)"),
            },
        },
        async ({ checkIn, checkOut, label, adults, children }) => {
            const result = await checkRoomDetails(checkIn, checkOut, label, adults, children);
            return { content: [{ type: "text", text: JSON.stringify(result) }] };
        },
    );

    server.registerTool(
        "thais_create_e_reservation",
        {
            description:
                "Crée une e-réservation dans le planning de l'hôtel. À utiliser uniquement quand l'utilisateur confirme explicitement qu'il veut réserver.",
            inputSchema: {
                checkIn: z.string().describe("Date d'arrivée YYYY-MM-DD"),
                checkOut: z.string().describe("Date de départ YYYY-MM-DD"),
                room_label: z.string().describe("Nom exact de la chambre, ex: 'Triple', 'Suite'"),
                adults: z.number().describe("Nombre d'adultes uniquement"),
                children: z.number().default(0).describe("Nombre d'enfants (par défaut: 0)"),
                civility: z.enum(["M.", "Mme.", "M. ou Mme", "Sté"]).describe("Civilité du client"),
                customer_firstname: z.string().describe("Prénom du client"),
                customer_lastname: z.string().describe("Nom du client"),
                customer_email: z.string().describe("Email du client"),
            },
        },
        async ({
            checkIn,
            checkOut,
            room_label,
            adults,
            children,
            civility,
            customer_firstname,
            customer_lastname,
            customer_email,
        }: {
            checkIn: string;
            checkOut: string;
            room_label: string;
            adults: number;
            children: number;
            civility: "M." | "Mme." | "M. ou Mme" | "Sté";
            customer_firstname: string;
            customer_lastname: string;
            customer_email: string;
        }) => {
            const result: string = await createEReservation(
                checkIn,
                checkOut,
                room_label,
                adults,
                children,
                civility,
                customer_firstname,
                customer_lastname,
                customer_email,
            );
            return { content: [{ type: "text", text: result }] };
        },
    );

    return server;
}
