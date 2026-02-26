/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   RoomTypes.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: morgane <morgane@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/25 17:26:37 by morgane           #+#    #+#             */
/*   Updated: 2026/02/25 17:26:38 by morgane          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export interface RoomType {
    id: number;
    label: string;
    subject_to_pricing: boolean;
    nb_persons_min: number;
    nb_persons_max: number;
    public: boolean;
    color: string;
    description: string;
    rank: number;
    deleted: boolean;
    ical_url: string | null;
}
