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
    ReadResourceRequestSchema,
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

    registerPrompts(): ServerBuilder {
        if (this.factory['promptStore'] && this.factory['promptStore'].list().length > 0) {
            this.server.registerCapabilities({
                prompts: {
                    listChanged: true
                }
            });
            this.server.setRequestHandler(ListPromptsRequestSchema, () => ({
                prompts: this.factory['promptStore']?.list().map(prompt => prompt.schema)
            }));
            this.server.setRequestHandler(
                GetPromptRequestSchema,
                this.factory['promptStore'].notify.bind(this.factory['promptStore'])
            );
        }
        return this;
    }
    registerResources(): ServerBuilder {
        if (this.factory['resourceStore'] && this.factory['resourceStore'].list().length > 0) {
            let availableResources = this.factory['resourceStore'].list();
            if (availableResources.length > 0) {
                this.server.registerCapabilities({
                    resources: {
                        subscribe: true,
                        listChanged: true
                    }
                });

                this.server.setRequestHandler(ListResourcesRequestSchema, () => ({
                    resources: availableResources
                        .filter(resource => resource.input.hasOwnProperty("schema"))
                        .map(resource => (resource.input as { schema: ResourceSchema }).schema)
                }));

                this.server.setRequestHandler(ListResourceTemplatesRequestSchema, () => ({
                    resourceTemplates: availableResources
                        .filter(resource => resource.input.hasOwnProperty("template"))
                        .map(resource => (resource.input as { template: ResourceTemplate }).template)
                }));

                this.server.setRequestHandler(
                    ReadResourceRequestSchema,
                    this.factory['resourceStore'].notify(this.server).bind(this.factory['resourceStore'])
                );
            }
        }
        return this;
    }
    registerTools(): ServerBuilder {
        if (this.factory['toolStore'] && this.factory['toolStore'].list().length > 0) {
            this.server.registerCapabilities({
                tools: {
                    listChanged: true
                }
            });
            this.server.setRequestHandler(ListToolsRequestSchema, () => ({
                tools: this.factory['toolStore']?.list().map(tool => tool.schema)
            }));
            this.server.setRequestHandler(CallToolRequestSchema, this.factory['toolStore'].notify(this.server).bind(this.factory['toolStore']));
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
