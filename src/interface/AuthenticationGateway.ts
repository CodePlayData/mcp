// @filename: AuthenticationGateway.ts

/*
    The MCP TypeScript wrapper.
    Copyright (C) 2025 Pedro Paulo Teixeira dos Santos

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * Abstraction for retrieving an application user identifier from an authorization token.
 *
 * Implementations can validate, decode, or look up the token to return a stable user id.
 */
export interface AuthenticationGateway {
    /**
     * Resolves the user id represented by the provided bearer token.
     *
     * @param token - The bearer token (without the "Bearer " prefix).
     * @returns A promise that resolves to the unique user id string.
     */
    getUserId(token: string): Promise<string>;
}