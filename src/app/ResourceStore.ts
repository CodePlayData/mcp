// @filename: ResourceStore.ts

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

import {ReadResourceRequest, ReadResourceResult, Resource} from "../core/Resource.js";
import {RequestHandlerExtra} from "@modelcontextprotocol/sdk/shared/protocol.js";
import {Server} from "@modelcontextprotocol/sdk/server/index.js";

/**
 * Abstraction for a registry and notifier of server Resources.
 *
 * A ResourceStore tracks resources, allows subscriptions for updates, and
 * produces a handler for the MCP ReadResource endpoint.
 */
export interface ResourceStore {
    /**
     * Returns all resources currently registered in the store.
     */
    list(): Resource[];
    /**
     * Registers a new resource.
     * @param resource - The resource to register.
     */
    register(resource: Resource): void;
    /**
     * Subscribes to updates for a resource identified by its URI.
     * @param uri - The resource URI to subscribe to.
     */
    subscribe(uri: string): void;
    /**
     * Produces a request handler bound to the provided Server that will
     * resolve ReadResource requests for the resources in this store.
     *
     * @param server - The MCP Server instance used to send progress/events.
     * @returns An async function handling ReadResource requests that resolves to a ReadResourceResult.
     */
    notify(server: Server): (request: ReadResourceRequest, extra: RequestHandlerExtra<any, any>) => Promise<ReadResourceResult>
    /**
     * Notifies subscribers that a resource has been updated.
     * @param uri - The resource URI that changed.
     * @param updates - A payload describing the change (implementation-defined).
     */
    notifyResourceUpdate(uri: string, updates: any): void;
}