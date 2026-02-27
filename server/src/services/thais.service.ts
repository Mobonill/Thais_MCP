/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   thais.service.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: morgane <morgane@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/25 17:26:22 by morgane           #+#    #+#             */
/*   Updated: 2026/02/27 10:43:40 by morgane          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { RoomType } from "../types/RoomType.js";
import { AvailabilityEntry } from "../types/AvailabilityEntry.js";
import { CurrentPrices } from "../types/CurrentPrices.js";
import { Prices } from "../types/Prices.js";
import { Rate } from "../types/Rate.js";
import { EReservationPayload } from "../types/EReservationPayload.js";
import { tokenManager } from "../utils/token.manager.js";
import { BASE_URL } from "../config/config.js";

export async function getAvailabilities(from: string, to: string): Promise<AvailabilityEntry[]> {
    try {
        const token = await tokenManager.getToken();
        const response = await fetch(
            `${BASE_URL}/api/partner/hotel/apr/availabilities/currents?from=${from}&to=${to}`,
            {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` },
            },
        );

        const data = (await response.json()) as AvailabilityEntry[];
        if (!data) throw new Error("Availabilities not found in json response");

        return data;
    } catch (error) {
        console.error("Availability error: ", error);
        throw error;
    }
}

export async function getRoomTypes(): Promise<RoomType[]> {
    try {
        const token = await tokenManager.getToken();
        const response = await fetch(`${BASE_URL}/api/partner/hotel/room-types`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
        });
        const data = (await response.json()) as RoomType[];
        if (!data) throw new Error("Room types nod found in json response");

        const rooms = data.filter(
            (room: RoomType) => room.deleted === false && room.public === true && room.subject_to_pricing === true,
        );

        return rooms;
    } catch (error) {
        console.error("Room type error ", error);
        throw error;
    }
}

export async function getPrices(
    from: string,
    to: string,
    room_type_id: number,
    adults: number,
    rate_id: number,
): Promise<Prices> {
    try {
        const token = await tokenManager.getToken();
        const response = await fetch(
            `${BASE_URL}/api/partner/hotel/pricing?from=${from}&to=${to}&room_type_id=${room_type_id}&adults=${adults}&rate_id=${rate_id}`,
            {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` },
            },
        );
        const data = (await response.json()) as Prices;
        if (!data) throw new Error("Prices not found in json response");
        return data;
    } catch (err) {
        console.error("Prices error:", err);
        throw err;
    }
}

export async function getPricesCurrents(from: string, to: string): Promise<CurrentPrices[]> {
    try {
        const token = await tokenManager.getToken();
        const response = await fetch(`${BASE_URL}/api/partner/hotel/apr/prices/currents?from=${from}&to=${to}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
        });
        const data = (await response.json()) as CurrentPrices[];
        if (!data) throw new Error("Current prices nod found in json response");

        const standardOffer = data.filter((entry: CurrentPrices) => entry.rate_id === 1);

        return standardOffer;
    } catch (error) {
        console.error("Prices error: ", error);
        throw error;
    }
}

export async function getRates(): Promise<Rate[]> {
    try {
        const token = await tokenManager.getToken();
        const response = await fetch(`${BASE_URL}/api/partner/hotel/rates`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = (await response.json()) as Rate[];

        if (!data) throw new Error("Rates not found in json response");
        const allRates = data.filter(r => !r.deleted && r.public && r.subject_to_pricing);

        return allRates;
    } catch (err) {
        console.error("Rates error:", err);
        throw err;
    }
}

export async function createReservation(payload: EReservationPayload): Promise<unknown> {
    try {
        const token = await tokenManager.getToken();
        const response = await fetch(`${BASE_URL}/api/partner/hotel/ebookings`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.text();
        if (!data) throw new Error("EReservation response empty");
        return data;
    } catch (err) {
        console.error("EReservation error:", err);
        throw err;
    }
}
