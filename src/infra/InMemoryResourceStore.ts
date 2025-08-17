// @filename: InMemoryResourceStore.ts

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

import {ResourceStore} from "../app/ResourceStore.js";
import {Server} from "@modelcontextprotocol/sdk/server/index.js";
import {ReadResourceRequest, ReadResourceResult, ResourceSchema, ResourceUpdatedNotification} from "../core/Resource";
import {RequestHandlerExtra} from "@modelcontextprotocol/sdk/shared/protocol.js";
import {Resource} from "../core/Resource.js";

/**
 * In-memory implementation of the ResourceStore.
 *
 * Maintains registered Resource instances and simple URI-based subscriptions.
 * Provides a ReadResource handler that dispatches to the appropriate Resource.
 *
 * Note: This class includes a server field intended to send resource update
 * notifications. In this minimal implementation, the server is not assigned.
 * For push updates to work, ensure the instance captures the server reference
 * (e.g., when wiring the notify handler) before calling notifyResourceUpdate.
 */
export class InMemoryResourceStore implements ResourceStore {
    /** Backing collection of registered resources. */
    private resources: Resource[] = [];
    /** List of URIs for which clients subscribed to receive updates. */
    private subscriptions: string[] = [];
    /** MCP Server reference, used to send ResourceUpdated notifications. */
    private server?: Server;

    /**
     * Returns all registered resources.
     */
    list(): Resource[] {
        return this.resources;
    }

    /**
     * Attempts to send a resource update notification to subscribers of the URI.
     *
     * @param uri - The resource URI that changed.
     * @param updates - Implementation-defined payload describing the change.
     */
    async notifyResourceUpdate(uri: string, updates: any) {
        if (!this.server) return;
        if (this.subscriptions.includes(uri)) {
            const notification: ResourceUpdatedNotification = {
                method: 'notifications/resources/updated',
                uri,
                params: {
                    ...updates
                }
            };
            await this.server.sendResourceUpdated(notification);
        }
    }

    /**
     * Creates a handler to resolve ReadResource requests by matching the requested URI.
     *
     * @param server - The MCP Server instance, typically used to send events.
     * @returns An async function that finds the matching Resource and delegates to it.
     * @throws If the resource is not found or does not implement handle().
     */
    notify(server: Server): (request: ReadResourceRequest, extra: RequestHandlerExtra<any, any>) => Promise<ReadResourceResult> {
        return async (request: ReadResourceRequest, extra: RequestHandlerExtra<any, any>): Promise<ReadResourceResult> => {
            let resource: Resource | undefined;
            this.resources.map(r => {
                const hasProperty = r.input.hasOwnProperty("schema");
                if(hasProperty) {
                    const isTheSameName = (r.input as { schema: ResourceSchema }).schema.uri === request.params.uri;
                    if(isTheSameName) {
                        resource = r;
                    }
                }
            });

            if (!resource) throw new Error(`Resource ${request.params.uri} not found`);
            if (!resource.handle) throw new Error(`Resource ${request.params.uri} does not implement handle method`);

            return await resource.handle(request, extra);
        }
    }

    /**
     * Registers a new Resource instance.
     *
     * @param resource - The Resource to add to the store.
     */
    register(resource: Resource): void {
        this.resources.push(resource);
    }

    /**
     * Subscribes to updates for a specific resource URI.
     *
     * @param uri - The resource URI to subscribe to.
     */
    subscribe(uri: string): void {
        this.subscriptions.push(uri);
    }
}