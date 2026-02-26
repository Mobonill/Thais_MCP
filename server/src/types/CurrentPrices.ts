/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   CurrentPrices.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: morgane <morgane@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/25 17:26:34 by morgane           #+#    #+#             */
/*   Updated: 2026/02/26 09:43:03 by morgane          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export interface CurrentPrices {
    id: number;
    room_type_id: number;
    date: string;
    rate_id: number;
    price: number;
    children_price: null;
    infants_price: null;
    min_stay: number;
    max_stay: null;
    stop_sell: boolean;
    archived: boolean;
}
