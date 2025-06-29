// @filename: McpServerFactory.ts

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

import { EventStore } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
    CallToolRequestSchema,
    GetPromptRequestSchema,
    Implementation,
    ListPromptsRequestSchema,
    ListResourcesRequestSchema, ListResourceTemplatesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Server }  from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { UserId } from "../core/UserId.js";
import { SessionId } from "../core/SessionId.js";
import { Prompt } from "../core/Prompt.js";
import { Resource } from "../core/Resource.js";
import { Tool } from "../core/Tool.js";

export class McpServerFactory {
    private tools: Tool[] = [];
    private prompts: Prompt[] = [];
    private resources: Resource[] = [];

    constructor(readonly eventStorage: EventStore, readonly MCP_SERVER_VERSION = "0.1.0", readonly MCP_SERVER_INSTRUCTIONS = "") {};

    addTool(tool: Tool) {
        this.tools.push(tool);
    };
    addPrompt(prompt: Prompt) {
        this.prompts.push(prompt);
    };
    addResource(resource: Resource) {
        this.resources.push(resource);
    };
    create(userId: UserId, sessionId: SessionId) {
        const serverInfo: Implementation = {
            name: `server-id-${userId}`,
            version: this.MCP_SERVER_VERSION
        };
        const serverOptions = { instructions: this.MCP_SERVER_INSTRUCTIONS };
        const server = new Server(serverInfo, serverOptions);
        if (this.prompts.length > 0) {
            server.registerCapabilities({
                prompts: {
                    listChanged: true
                }
            });
            server.setRequestHandler(ListPromptsRequestSchema, () => {
                return {
                    prompts: this.prompts.map(prompt => prompt.schema)
                }
            });
            this.prompts.forEach(prompt => {
                server.setRequestHandler(GetPromptRequestSchema, prompt.requestHandler)
            });
        }
        if (this.resources.length > 0) {
            server.registerCapabilities({
                resources: {
                    subscribe: true,
                    listChanged: true
                }
            })
            server.setRequestHandler(ListResourcesRequestSchema, () => ({
                resources: this.resources.map(resource => resource.schema)
            }));
            server.setRequestHandler(ListResourceTemplatesRequestSchema, () => ({
                resourceTemplates: this.resources.map(resource => resource.template)
            }));
            this.resources.forEach(resource => {
                server.setRequestHandler(ReadResourceRequestSchema, resource.setServer(server).requestHandler)
            });
        }
        if (this.tools.length > 0) {
            server.registerCapabilities({
                tools: {
                    listChanged: true
                }
            });
            server.setRequestHandler(ListToolsRequestSchema, () => ({
                tools: this.tools.map(tool => tool.schema)
            }));
            this.tools.forEach(tool => {
                server.setRequestHandler(CallToolRequestSchema, tool.setServer(server).requestHandler)
            });
        }
        const transport = new StreamableHTTPServerTransport({
            enableJsonResponse: false,
            eventStore: this.eventStorage,
            sessionIdGenerator: () => sessionId,
            onsessioninitialized(sessionId: string): void {
                console.log(`Session ${sessionId} created for the user ${userId}.`);
            }
        });
        return { server, transport };
    };
}