// @filename: UserIdResource.ts

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

import { ReadResourceRequest, ReadResourceResult, Resource } from "../core/Resource.js";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";

/**
 * Concrete Resource that returns user-identifying data for a specific URI.
 *
 * What it does:
 * - Defines a fixed ResourceSchema (data://pedro) with a text/plain mime type.
 * - Implements handle() to return a single text content item containing a JSON string
 *   with minimal user information (name and id). This is a demo/stub implementation.
 *
 * How to use:
 * - Register an instance in your ResourceStore so the MCP server can advertise and
 *   serve this resource when a client issues a read request for its URI.
 *
 * Extending this class:
 * - Replace the hardcoded schema.uri with your own user-specific URI.
 * - Replace the stub content with real data fetched from your domain (e.g., DB/API),
 *   possibly using AuthenticationGateway to resolve the current user id.
 */
const schema = {
    /** The concrete resource URI served by this instance. */
    uri: "data://pedro",
    /** Human-friendly name shown to clients. */
    name: "User data identification.",
    /** The content is returned as serialized text (JSON string). */
    mimeType: "text/plain"
};

/**
 * Minimal example of a readable user resource.
 */
export class UserIdResource extends Resource {
    constructor() {
        super({ schema });
    };

    /**
     * Handles a read request for this resource and returns one content item.
     *
     * @param request - The MCP read request; request.params.uri contains the requested URI.
     * @param extra - Additional protocol context injected by the MCP server (unused here).
     * @returns A promise resolving to a ReadResourceResult with a single text content item.
     */
    async handle(request: ReadResourceRequest, extra: RequestHandlerExtra<any, any>): Promise<ReadResourceResult> {
        const uri = request.params.uri; // kept for illustration; not used by this stub
        const content = { name: "Pedro Paulo", id: "1234" };
        const textResource = this.createTextResource(content);
        return Promise.resolve({ contents: [textResource] })
    };
}