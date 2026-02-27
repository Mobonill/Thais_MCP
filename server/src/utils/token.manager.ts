/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   token.manager.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: morgane <morgane@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/27 10:07:01 by morgane           #+#    #+#             */
/*   Updated: 2026/02/27 10:47:50 by morgane          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { BASE_URL, USERNAME, PASSWORD } from "../config/config.js";

type TokenPayload = {
    exp: number;
};

class TokenManager {
    private cachedToken: string | null = null;
    private tokenExpiry: number | null = null;

    private isTokenValid(): boolean {
        if (!this.cachedToken) return false;
        if (!this.tokenExpiry) return false;
        if (Date.now() >= this.tokenExpiry - 60_000) return false; // if token expires in a minute
        return true;
    }

    private getExpiry(token: string): number {
        const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString()) as TokenPayload;
        return payload.exp * 1000;
    }

    async getToken(): Promise<string> {
        if (this.isTokenValid()) {
            return this.cachedToken!;
        }

        const response = await fetch(`${BASE_URL}/api/partner/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
        });

        const data = (await response.json()) as { token: string };
        const token = data.token;

        if (!token) throw new Error("Token not found");

        this.cachedToken = token;
        this.tokenExpiry = this.getExpiry(token);

        return token;
    }
}

export const tokenManager = new TokenManager();
