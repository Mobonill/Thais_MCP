/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   mcp.controller.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: morgane <morgane@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/25 17:26:10 by morgane           #+#    #+#             */
/*   Updated: 2026/02/26 12:26:04 by morgane          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
    getAvailabilities,
    getPrices,
    getPricesCurrents,
    getRoomTypes,
    getRates,
    createReservation,
} from "../services/thais.service.js";
import { AvailabilityEntry } from "../types/AvailabilityEntry.js";
import { CurrentPrices } from "../types/CurrentPrices.js";
import { RoomType } from "../types/RoomType.js";
import { Prices } from "../types/Prices.js";

type RoomDetailsResponse = {
    room: RoomType;
    prices: Prices;
    from: string;
    to: string;
    adults: number;
    label: string;
    room_type_id: number;
    tourist_tax: number | string;
};

function calculStayDuration(from: string, to: string): number {
    return Math.round((new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24));
}

function buildAvailabilityByRoom(availability: AvailabilityEntry[]): Record<number, AvailabilityEntry[]> {
    const map: Record<number, AvailabilityEntry[]> = {};
    for (const entry of availability) {
        if (!map[entry.room_type_id]) map[entry.room_type_id] = [];
        map[entry.room_type_id].push(entry);
    }
    return map;
}

function isAvailableEveryDay(days: AvailabilityEntry[] | undefined, to: string): boolean {
    return (
        days !== undefined &&
        days.length > 0 &&
        days.filter(entry => entry.date < to).every(entry => entry.availability > 0)
    );
}

function checkStayDuration(pricesByRoom: CurrentPrices[], stayDuration: number): { ok: boolean; minNights: number } {
    let minNights = 0;
    let maxNights = Infinity;

    for (const price of pricesByRoom) {
        if (price.min_stay !== null && price.min_stay > minNights) {
            minNights = price.min_stay;
        }
        if (price.max_stay !== null && price.max_stay < maxNights) {
            maxNights = price.max_stay;
        }
    }

    const ok = stayDuration >= minNights && stayDuration <= maxNights;
    return { ok, minNights };
}

function calcTotalPrice(pricesByRoom: CurrentPrices[]): number {
    let total = 0;
    for (const price of pricesByRoom) {
        total += price.price;
    }
    return total;
}

function formatRoomAvailability(
    room: RoomType,
    days: AvailabilityEntry[] | undefined,
    pricesByRoom: CurrentPrices[],
    stayDuration: number,
    to: string,
): string {
    const available = isAvailableEveryDay(days, to);
    if (!available) return `NO ${room.label}\n`;

    const { ok, minNights } = checkStayDuration(pricesByRoom, stayDuration);
    if (!ok) return `NO ${room.label} (durée de séjour non compatible : minimum ${minNights} nuits)\n`;

    const priceTotal = calcTotalPrice(pricesByRoom);
    return `YES ${room.label} — tarif moyen ${priceTotal}€. Offre standard (petit-déjeuner inclus, taxe de séjour disponible sur demande — tarif et disponibilité à confirmer selon le nombre de personnes)\n`;
}

export async function checkAvailability(from: string, to: string, adults: number): Promise<string | undefined> {
    try {
        const availability = await getAvailabilities(from, to);
        if (!availability) return undefined;

        const roomTypes = await getRoomTypes();
        if (!roomTypes) return undefined;

        const allPrices = await getPricesCurrents(from, to);
        if (!allPrices) return undefined;

        const stayDuration = calculStayDuration(from, to);
        const availabilityByRoom = buildAvailabilityByRoom(availability);

        const roomTypeMap: Record<number, RoomType> = {};
        for (const room of roomTypes) {
            roomTypeMap[room.id] = room;
        }

        let result = `\n\nDisponibilités du ${from} au ${to} pour ${adults} adultes :\n\n`;

        for (const roomId in roomTypeMap) {
            const room = roomTypeMap[roomId];
            if (room.nb_persons_max >= adults && room.nb_persons_min <= adults) {
                const pricesByRoom = allPrices.filter(p => p.room_type_id === room.id && p.date >= from && p.date < to);
                result += formatRoomAvailability(room, availabilityByRoom[room.id], pricesByRoom, stayDuration, to);
            }
        }

        return result;
    } catch (error) {
        console.error(error);
        return "Error: could not recover availabilities";
    }
}

export async function checkRoomDetails(
    from: string,
    to: string,
    label: string,
    adults: number,
): Promise<RoomDetailsResponse | string> {
    try {
        const roomTypes = await getRoomTypes();
        const room = roomTypes.find(r => r.label === label);
        if (!room) throw new Error(`Room "${label}" not found`);

        const allRates = await getRates();
        const rate = allRates.find(r => r.nb_adults_min <= adults && r.nb_adults_max >= adults);
        if (!rate) return `Aucun tarif disponible pour ${adults} adultes.`;

        const stayDuration = calculStayDuration(from, to);
        const prices = await getPrices(from, to, room.id, adults, rate.id);

        if (!prices.status) return `Chambre "${label}" non disponible : ${JSON.stringify(prices.messages)}`;

        if (prices.min_stay > stayDuration)
            return `Chambre "${label}" non disponible : durée minimum ${prices.min_stay} nuits.`;

        return {
            from,
            to,
            adults,
            room_type_id: room.id,
            room,
            prices,
            label: room.label,
            tourist_tax: `${prices.tourist_tax}€ par personne par nuit`,
        };
    } catch (error) {
        console.error(error);
        return "Error: could not recover room details";
    }
}

const CIVILITIES: Record<string, number> = {
    "M.": 2,
    "M. ou Mme": 1,
    "Mme.": 3,
    "Sté": 4,
};

export async function createEReservation(
    from: string,
    to: string,
    room_label: string,
    adults: number,
    civility: string,
    customer_firstname: string,
    customer_lastname: string,
    customer_email: string,
): Promise<string> {
    try {
        const roomTypes = await getRoomTypes();
        const room = roomTypes.find(r => r.label === room_label);
        if (!room) return `Chambre "${room_label}" introuvable.`;

        const allRates = await getRates();
        const rate = allRates.find(r => r.nb_adults_min <= adults && r.nb_adults_max >= adults);
        if (!rate) return `Aucun tarif disponible pour ${adults} adultes.`;

        const result = await createReservation({
            checkin: from,
            checkout: to,
            customer_civility_id: CIVILITIES[civility] ?? 1,
            customer_firstname,
            customer_lastname,
            customer_email,
            channel_name: "Partner",
            payment_amount: 0,
            insurance_amount: 0,
            booking_rooms: [
                {
                    room_type_id: room.id,
                    rate_id: rate.id,
                    nb_persons: {
                        adults: adults,
                        children: 0,
                    },
                },
            ],
        });

        return `Réservation créée avec succès : ${JSON.stringify(result)}`;
    } catch (error) {
        console.error(error);
        return "Erreur lors de la création de la réservation.";
    }
}
