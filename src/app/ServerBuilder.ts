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

export class ServerBuilder {
    constructor(
        private server: Server,
        private factory: McpServerFactory
    ) {}
    private _setListPromptsMethod() {
        if (this.factory['promptStore'] && this.factory['promptStore'].list().length > 0) {
            this.server.setRequestHandler(ListPromptsRequestSchema, () => ({
                prompts: this.factory['promptStore']!.list().map(prompt => prompt.schema)
            }));
        }
    }
    private _setGetPromptMethod() {
        this.server.setRequestHandler(
            GetPromptRequestSchema,
            this.factory['promptStore']!.notify.bind(this.factory['promptStore'])
        );
    }
    private _registerPromptCapabilities(listChanged?: boolean) {
        const prompts = listChanged ? { listChanged: listChanged } : {}
        this.server.registerCapabilities({ prompts })
    }
    registerPrompts(): ServerBuilder {
        if (this.factory['promptStore'] && this.factory['promptStore'].list().length > 0) {
            this._registerPromptCapabilities(true);
            this._setListPromptsMethod();
            this._setGetPromptMethod();
        }
        return this;
    }
    private _setListResourcesMethod() {
        let availableResources = this.factory['resourceStore']!.list();
        this.server.setRequestHandler(ListResourcesRequestSchema, () => ({
            resources: availableResources
                .filter(resource => resource.input.hasOwnProperty("schema"))
                .map(resource => (resource.input as { schema: ResourceSchema }).schema)
        }));
    }
    private _setListResourceTemplatesMethod() {
        let availableResources = this.factory['resourceStore']!.list();
        this.server.setRequestHandler(ListResourceTemplatesRequestSchema, () => ({
            resourceTemplates: availableResources
                .filter(resource => resource.input.hasOwnProperty("template"))
                .map(resource => (resource.input as { template: ResourceTemplate }).template)
        }));
    }
    private _setReadResourceMethod() {
        this.server.setRequestHandler(
            ReadResourceRequestSchema,
            this.factory['resourceStore']!.notify(this.server).bind(this.factory['resourceStore'])
        );
    }
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
    private _setListToolsMethod() {
        this.server.setRequestHandler(ListToolsRequestSchema, () => ({
            tools: this.factory['toolStore']?.list().map(tool => tool.schema)
        }));
    }
    private _setCallToolMethod() {
        this.server.setRequestHandler(CallToolRequestSchema, this.factory['toolStore']!.notify(this.server).bind(this.factory['toolStore']));
    }
    private _registerToolCapabilities(listChanged?: boolean) {
        const tools = listChanged ? { listChanged: listChanged } : {}
        this.server.registerCapabilities({ tools })
    }
    registerTools(): ServerBuilder {
        if (this.factory['toolStore'] && this.factory['toolStore'].list().length > 0) {
            this._registerToolCapabilities(true);
            this._setListToolsMethod();
            this._setCallToolMethod();
        }
        return this;
    }
    private _createTransport(userId: UserId, sessionId: SessionId) {
        return new StreamableHTTPServerTransport({
            enableJsonResponse: false,
            eventStore: this.factory['eventStorage'],
            sessionIdGenerator: () => sessionId,
            onsessioninitialized(sessionId: string): void {
                console.log(`Session ${sessionId} created for the user ${userId}.`);
            }
        });
    }
    build(userId: UserId, sessionId: SessionId) {
        const transport = this._createTransport(userId, sessionId);
        return { server: this.server, transport };
    }
}
