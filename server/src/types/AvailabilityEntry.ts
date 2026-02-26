/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   AvailabilityEntry.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: morgane <morgane@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/25 17:26:31 by morgane           #+#    #+#             */
/*   Updated: 2026/02/25 20:11:12 by morgane          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export interface AvailabilityEntry {
    id: number | null;
    created_at: string;
    date: string;
    room_type_id: number;
    availability: number;
    source: string;
    user: string;
    archived: boolean;
}
