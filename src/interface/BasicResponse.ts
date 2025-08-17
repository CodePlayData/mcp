// @filename: BasicResponse.ts

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

import { ServerResponse } from "node:http";

/**
 * Extension of Node's ServerResponse used by the MCP HTTP controller layer.
 *
 * It augments the native response with a flexible `json` field to carry
 * arbitrary payloads produced by the MCP transport while keeping compatibility
 * with standard Node HTTP response handling.
 */
export type BasicResponse = ServerResponse & {
    /**
     * Arbitrary JSON-serializable payload to be returned to the client.
     * Implementations may assign any structure depending on the request.
     */
    json: any
};