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

import {EventStore, StreamableHTTPServerTransport} from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
    CallToolRequestSchema,
    GetPromptRequestSchema,
    Implementation,
    ListPromptsRequestSchema,
    ListResourcesRequestSchema,
    ListResourceTemplatesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {Server} from "@modelcontextprotocol/sdk/server/index.js";
import {UserId} from "../core/UserId.js";
import {SessionId} from "../core/SessionId.js";
import {Prompt} from "../core/Prompt.js";
import {Resource, ResourceSchema, ResourceTemplate} from "../core/Resource.js";
import {Tool} from "../core/Tool.js";
import {InMemoryEventStore} from "../infra/InMemoryEventStore.js";
import {PromptStore} from "./PromptStore.js";
import {InMemoryPromptStore} from "../infra/InMemoryPromptStore.js";
import {ToolStore} from "./ToolStore.js";
import {InMemoryToolStore} from "../infra/InMemoryToolStore.js";
import {ResourceStore} from "./ResourceStore";
import {InMemoryResourceStore} from "../infra/InMemoryResourceStore.js";

export class McpServerFactory {
    private static instance: McpServerFactory | null = null;
    protected promptStore: PromptStore | undefined;
    protected toolStore: ToolStore | undefined;
    protected resourceStore: ResourceStore | undefined;

    public static instanceOf(
        eventStorage: EventStore = new InMemoryEventStore(),
        promptStore?: PromptStore,
        toolStore?: ToolStore,
        resourceStore?: ResourceStore,
        MCP_SERVER_VERSION?: string,
        MCP_SERVER_INSTRUCTIONS?: string
    ): McpServerFactory {
        if (!McpServerFactory.instance) {
            McpServerFactory.instance = new McpServerFactory(
                eventStorage,
                promptStore,
                toolStore,
                resourceStore,
                MCP_SERVER_VERSION,
                MCP_SERVER_INSTRUCTIONS
            );
        }
        return McpServerFactory.instance;
    }

    private constructor(
        readonly eventStorage: EventStore,
        promptStore?: PromptStore,
        toolStore?: ToolStore,
        resourceStore?: ResourceStore,
        readonly MCP_SERVER_VERSION: string = "0.1.0",
        readonly MCP_SERVER_INSTRUCTIONS: string = ""
    ) {};

    addTool(tool: Tool) {
        if(!this.toolStore) {
            this.toolStore = new InMemoryToolStore();
        }
        this.toolStore?.register(tool);
    };
    addPrompt(prompt: Prompt) {
        if(!this.promptStore) {
            this.promptStore = new InMemoryPromptStore();
        }
        this.promptStore?.register(prompt);
    };
    addResource(resource: Resource) {
        if(!this.resourceStore) {
            this.resourceStore = new InMemoryResourceStore();
        }
        this.resourceStore?.register(resource);
    };

    private _createServer(userId: UserId) {
        const serverInfo: Implementation = { name: `server-id-${userId}`, version: this.MCP_SERVER_VERSION };
        const serverOptions = { instructions: this.MCP_SERVER_INSTRUCTIONS };
        return new Server(serverInfo, serverOptions);
    }
    private _registerPrompts(server: Server) {
        if (this.promptStore && this.promptStore.list().length > 0) {
            server.registerCapabilities({
                prompts: {
                    listChanged: true
                }
            });
            server.setRequestHandler(ListPromptsRequestSchema, () => {
                return {
                    prompts: this.promptStore?.list().map(prompt => prompt.schema)
                }
            });
            server.setRequestHandler(GetPromptRequestSchema, this.promptStore.notify.bind(this.promptStore));
        }
        return server;
    }
    private _registerResources(server: Server) {
        if (this.resourceStore && this.resourceStore.list().length > 0) {
            server.registerCapabilities({
                resources: {
                    subscribe: true,
                    listChanged: true
                }
            })
            server.setRequestHandler(ListResourcesRequestSchema, () => ({
                resources: this.resourceStore?.list()
                    .filter(resource => resource.input.hasOwnProperty("schema"))
                    .map(resource => (resource.input as { schema: ResourceSchema }).schema)
            }));
            server.setRequestHandler(ListResourceTemplatesRequestSchema, () => ({
                resourceTemplates: this.resourceStore?.list()
                    .filter(resource => resource.input.hasOwnProperty("template"))
                    .map(resource => (resource.input as { template: ResourceTemplate }).template)
            }));
            server.setRequestHandler(ReadResourceRequestSchema, this.resourceStore.notify(server).bind(this.resourceStore));
        }
        return server;
    }
    private _registerTools(server: Server) {
        if (this.toolStore && this.toolStore.list().length > 0) {
            server.registerCapabilities({
                tools: {
                    listChanged: true
                }
            });
            server.setRequestHandler(ListToolsRequestSchema, () => ({
                tools: this.toolStore?.list().map(tool => tool.schema)
            }));
            server.setRequestHandler(CallToolRequestSchema, this.toolStore.notify(server).bind(this.toolStore));
        }
        return server;
    }
    private _createTransport(userId: UserId, sessionId: SessionId) {
        return new StreamableHTTPServerTransport({
            enableJsonResponse: false,
            eventStore: this.eventStorage,
            sessionIdGenerator: () => sessionId,
            onsessioninitialized(sessionId: string): void {
                console.log(`Session ${sessionId} created for the user ${userId}.`);
            }
        });
    }

    create(userId: UserId, sessionId: SessionId) {
        let server = this._createServer(userId);
        server = this._registerPrompts(server);
        server = this._registerResources(server);
        server = this._registerTools(server);
        const transport = this._createTransport(userId, sessionId);
        return { server, transport };
    };
}