/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Rates.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: morgane <morgane@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/26 10:12:40 by morgane           #+#    #+#             */
/*   Updated: 2026/02/26 10:12:52 by morgane          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export interface Rate {
    id: number;
    label: string;
    nb_persons_min: number;
    nb_persons_max: number;
    nb_adults_min: number;
    nb_adults_max: number;
    deleted: boolean;
    public: boolean;
    subject_to_pricing: boolean;
}
