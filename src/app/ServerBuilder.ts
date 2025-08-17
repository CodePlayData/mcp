// @filename: ServerBuilder.ts

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

import {Server} from "@modelcontextprotocol/sdk/server/index.js";
import {McpServerFactory} from "./McpServerFactory.js";
import {
    CallToolRequestSchema,
    GetPromptRequestSchema,
    ListPromptsRequestSchema,
    ListResourcesRequestSchema,
    ListResourceTemplatesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema, SubscribeRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {ResourceSchema, ResourceTemplate} from "../core/Resource.js";
import {SessionId} from "../core/SessionId.js";
import {UserId} from "../core/UserId.js";
import {StreamableHTTPServerTransport} from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";

/**
 * Fluent builder that wires MCP Server capabilities to the backing stores.
 *
 * Responsibilities:
 * - Advertises capabilities (prompts, resources, tools) based on available stores.
 * - Registers request handlers for listing and resolving prompts/resources/tools.
 * - Creates a transport bound to a user/session for streaming events.
 * - Produces the final { server, transport } pair via build().
 *
 * Usage:
 * Typically created indirectly by McpServerFactory, then chained with
 * .registerPrompts().registerResources().registerTools().build(userId, sessionId)
 * to obtain a configured server and transport.
 */
export class ServerBuilder {
    /**
     * Creates a new ServerBuilder.
     * @param server - The underlying MCP Server instance to configure.
     * @param factory - The factory providing stores and configuration.
     */
    constructor(
        private server: Server,
        private factory: McpServerFactory
    ) {}
    /**
     * Registers the ListPrompts handler if prompts are available.
     */
    private _setListPromptsMethod() {
        if (this.factory['promptStore'] && this.factory['promptStore'].list().length > 0) {
            this.server.setRequestHandler(ListPromptsRequestSchema, () => ({
                prompts: this.factory['promptStore']!.list().map(prompt => prompt.schema)
            }));
        }
    }
    /**
     * Registers the GetPrompt handler.
     */
    private _setGetPromptMethod() {
        this.server.setRequestHandler(
            GetPromptRequestSchema,
            this.factory['promptStore']!.notify.bind(this.factory['promptStore'])
        );
    }
    /**
     * Advertises prompt capabilities to the client.
     * @param listChanged - When true, indicates that the list of prompts may change.
     */
    private _registerPromptCapabilities(listChanged?: boolean) {
        const prompts = listChanged ? { listChanged: listChanged } : {}
        this.server.registerCapabilities({ prompts })
    }
    /**
     * Enables prompt capabilities and handlers if a prompt store is present.
     * @returns This builder instance for chaining.
     */
    registerPrompts(): ServerBuilder {
        if (this.factory['promptStore'] && this.factory['promptStore'].list().length > 0) {
            this._registerPromptCapabilities(true);
            this._setListPromptsMethod();
            this._setGetPromptMethod();
        }
        return this;
    }
    /**
     * Registers the ListResources handler using current store entries.
     */
    private _setListResourcesMethod() {
        let availableResources = this.factory['resourceStore']!.list();
        this.server.setRequestHandler(ListResourcesRequestSchema, () => ({
            resources: availableResources
                .filter(resource => resource.input.hasOwnProperty("schema"))
                .map(resource => (resource.input as { schema: ResourceSchema }).schema)
        }));
    }
    /**
     * Registers the ListResourceTemplates handler using current store entries.
     */
    private _setListResourceTemplatesMethod() {
        let availableResources = this.factory['resourceStore']!.list();
        this.server.setRequestHandler(ListResourceTemplatesRequestSchema, () => ({
            resourceTemplates: availableResources
                .filter(resource => resource.input.hasOwnProperty("template"))
                .map(resource => (resource.input as { template: ResourceTemplate }).template)
        }));
    }
    /**
     * Registers the ReadResource handler bound to the ResourceStore.
     */
    private _setReadResourceMethod() {
        this.server.setRequestHandler(
            ReadResourceRequestSchema,
            this.factory['resourceStore']!.notify(this.server).bind(this.factory['resourceStore'])
        );
    }
    /**
     * Registers the Resource subscribe handler to allow clients to subscribe
     * to push updates for a given resource URI.
     */
    private _setResourceSubscribeMethod() {
        this.server.setRequestHandler(SubscribeRequestSchema, async (request) => {
            const uri = request.params.uri;
            if (this.factory['resourceStore']) {
                this.factory['resourceStore'].subscribe(uri);
            }
            return {
                subscribe: true
            }
        });
    }
    /**
     * Advertises resource capabilities to the client.
     * @param subscribe - Whether the server supports subscriptions.
     * @param listChanged - Whether the list of resources may change.
     */
    private _registerResourceCapabilities(subscribe?: boolean, listChanged?: boolean) {
        const resources: { subscribe?: boolean; listChanged?: boolean } = {};
        if (subscribe !== undefined) {
            resources.subscribe = subscribe;
        }
        if (listChanged !== undefined) {
            resources.listChanged = listChanged;
        }
        this.server.registerCapabilities({ resources });
    }
    /**
     * Enables resource capabilities and handlers if a resource store is present.
     * @returns This builder instance for chaining.
     */
    registerResources(): ServerBuilder {
        if (this.factory['resourceStore'] && this.factory['resourceStore'].list().length > 0) {
            this._registerResourceCapabilities(true, true);
            this._setListResourcesMethod();
            this._setListResourceTemplatesMethod();
            this._setReadResourceMethod();
            this._setResourceSubscribeMethod();
        }
        return this;
    }
    /**
     * Registers the ListTools handler using the ToolStore entries.
     */
    private _setListToolsMethod() {
        this.server.setRequestHandler(ListToolsRequestSchema, () => ({
            tools: this.factory['toolStore']?.list().map(tool => tool.schema)
        }));
    }
    /**
     * Registers the CallTool handler bound to the ToolStore.
     */
    private _setCallToolMethod() {
        this.server.setRequestHandler(CallToolRequestSchema, this.factory['toolStore']!.notify(this.server).bind(this.factory['toolStore']));
    }
    /**
     * Advertises tool capabilities to the client.
     * @param listChanged - Whether the tool list may change over time.
     */
    private _registerToolCapabilities(listChanged?: boolean) {
        const tools = listChanged ? { listChanged: listChanged } : {}
        this.server.registerCapabilities({ tools })
    }
    /**
     * Enables tool capabilities and handlers if a tool store is present.
     * @returns This builder instance for chaining.
     */
    registerTools(): ServerBuilder {
        if (this.factory['toolStore'] && this.factory['toolStore'].list().length > 0) {
            this._registerToolCapabilities(true);
            this._setListToolsMethod();
            this._setCallToolMethod();
        }
        return this;
    }
    /**
     * Creates a transport bound to the provided user and session.
     * @param userId - The application user id.
     * @param sessionId - The session id used to scope the transport/events.
     */
    private _createTransport(userId: UserId, sessionId: SessionId, kind: 'stream' | 'sse' | 'stdio' = 'stream') {
        switch (kind) {
            case 'stdio':
                return this._createTransportSTDIO();
            case 'sse':
                return this._createTransportStream(userId, sessionId);
            case 'stream':
            default:
                return this._createTransportStream(userId, sessionId);
        }
    }

    /**
     * Creates a Streamable HTTP transport (default), supporting SSE streaming and resumability
     * when an event store is configured.
     */
    private _createTransportStream(userId: UserId, sessionId: SessionId) {
        return new StreamableHTTPServerTransport({
            enableJsonResponse: false,
            eventStore: this.factory['eventStorage'],
            sessionIdGenerator: () => sessionId,
            onsessioninitialized(sessionId: string): void {
                console.log(`Session ${sessionId} created for the user ${userId}.`);
            }
        });
    }

    /**
     * Creates a STDIO transport for CLI/stdio-based clients.
     */
    private _createTransportSTDIO() {
        return new StdioServerTransport();
    }
    /**
     * Finalizes the build and returns the configured server and transport.
     * @param userId - The application user id.
     * @param sessionId - The session id used to scope the transport/events.
     * @param transportKind - The kind of transport to create ('stream', 'sse', or 'stdio').
     * @returns An object containing the server and the transport.
     */
    build(userId: UserId, sessionId: SessionId, transportKind: 'stream' | 'sse' | 'stdio' = 'stream') {
        const transport = this._createTransport(userId, sessionId, transportKind);
        return { server: this.server, transport };
    }
}
