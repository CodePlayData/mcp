// @filename: BasicRequest.ts

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

import { IncomingMessage } from "node:http";

/**
 * Minimal extension of Node's IncomingMessage used by the MCP HTTP controller layer.
 *
 * Adds optional body parsing, a normalized headers map, and allows additional
 * implementation-specific properties needed by transports or frameworks.
 */
export type BasicRequest = IncomingMessage & {
    /**
     * Parsed request body if present. Shape depends on upstream middleware (e.g., express.json()).
     */
    body?: any,
    /**
     * A case-insensitive map of request headers used by the controller.
     */
    headers: Record<string, any>
    /**
     * Permit arbitrary extra fields set by frameworks or middleware.
     */
    [key: string]: any
}