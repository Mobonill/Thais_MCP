/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   EReservationPayload.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: morgane <morgane@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/26 11:16:35 by morgane           #+#    #+#             */
/*   Updated: 2026/02/26 12:00:03 by morgane          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export interface EReservationPayload {
    checkin: string;
    checkout: string;
    comment?: string;
    customer_civility_id: number;
    customer_firstname: string;
    customer_lastname: string;
    customer_email: string;
    customer_phone?: string;
    customer_mobile?: string;
    customer_zipcode?: string;
    customer_city?: string;
    customer_address?: string;
    customer_country?: string;
    channel_name?: string;
    payment_type?: string;
    payment_amount: number;
    insurance_amount: number;
    booking_rooms: {
        room_type_id: number;
        rate_id: number;
        price?: number;
        nb_persons: {
            adults: number;
            children: number;
        };
        extras?: object[];
    }[];
}
