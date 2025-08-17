// @filename: FakeAuthenticationGateway.ts

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

import { AuthenticationGateway } from "../interface/AuthenticationGateway.js";

/**
 * Test/dummy implementation of AuthenticationGateway.
 *
 * Always resolves to a fixed user id, regardless of the provided token.
 * Useful in development and examples where real authentication is not needed.
 */
export class FakeAuthenticationGateway implements AuthenticationGateway {
    /**
     * Returns a hard-coded user id for any token.
     *
     * @param token - Ignored. Present to satisfy the interface contract.
     * @returns A promise resolving to a static user id.
     */
    getUserId(token: string): Promise<string> {
        return Promise.resolve("1234567890");
    };
}