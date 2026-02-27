/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   config.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: morgane <morgane@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/27 10:42:27 by morgane           #+#    #+#             */
/*   Updated: 2026/02/27 10:46:59 by morgane          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import "dotenv/config";

export const BASE_URL = process.env.THAIS_BASE_URL;
export const USERNAME = process.env.THAIS_USERNAME;
export const PASSWORD = process.env.THAIS_PASSWORD;
