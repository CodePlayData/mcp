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

import {EventStore} from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {Implementation} from "@modelcontextprotocol/sdk/types.js";
import {Server} from "@modelcontextprotocol/sdk/server/index.js";
import {UserId} from "../core/UserId.js";
import {SessionId} from "../core/SessionId.js";
import {Prompt} from "../core/Prompt.js";
import {Resource} from "../core/Resource.js";
import {Tool} from "../core/Tool.js";
import {InMemoryEventStore} from "../infra/InMemoryEventStore.js";
import {PromptStore} from "./PromptStore.js";
import {InMemoryPromptStore} from "../infra/InMemoryPromptStore.js";
import {ToolStore} from "./ToolStore.js";
import {InMemoryToolStore} from "../infra/InMemoryToolStore.js";
import {ResourceStore} from "./ResourceStore.js";
import {InMemoryResourceStore} from "../infra/InMemoryResourceStore.js";
import {ServerBuilder} from "./ServerBuilder.js";

/**
 * Factory and registry for constructing configured MCP Server/Transport pairs.
 *
 * Maintains in-memory stores for prompts, tools, and resources, and exposes a
 * fluent builder to register capabilities and build a ready-to-use server.
 * Implements a simple singleton pattern via instanceOf() for reuse.
 */
export class McpServerFactory {
    private static instance: McpServerFactory | null = null;
    protected promptStore: PromptStore | undefined;
    protected toolStore: ToolStore | undefined;
    protected resourceStore: ResourceStore | undefined;

    /**
     * Returns the singleton instance of the factory, initializing it if needed.
     *
     * @param eventStorage - Storage for streamable HTTP events; defaults to in-memory.
     * @param promptStore - Optional prompt store; defaults to in-memory when first used.
     * @param toolStore - Optional tool store; defaults to in-memory when first used.
     * @param resourceStore - Optional resource store; defaults to in-memory when first used.
     * @param MCP_SERVER_VERSION - Semantic version string advertised by the server.
     * @param MCP_SERVER_INSTRUCTIONS - Human-readable instructions for the server.
     */
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

    /**
     * Creates a new factory. Prefer using instanceOf() to reuse a singleton.
     */
    private constructor(
        readonly eventStorage: EventStore,
        promptStore?: PromptStore,
        toolStore?: ToolStore,
        resourceStore?: ResourceStore,
        readonly MCP_SERVER_VERSION: string = "0.1.0",
        readonly MCP_SERVER_INSTRUCTIONS: string = "Some testing MCP server."
    ) {};

    /**
     * Registers a Tool into the tool store, creating an in-memory store on first use.
     * @param tool - The tool instance to register.
     */
    addTool(tool: Tool) {
        if(!this.toolStore) this.toolStore = new InMemoryToolStore();
        this.toolStore?.register(tool);
    };
    /**
     * Registers a Prompt into the prompt store, creating an in-memory store on first use.
     * @param prompt - The prompt instance to register.
     */
    addPrompt(prompt: Prompt) {
        if(!this.promptStore) this.promptStore = new InMemoryPromptStore();
        this.promptStore?.register(prompt);
    };
    /**
     * Registers a Resource into the resource store, creating an in-memory store on first use.
     * Also injects the store into the resource to enable notifications.
     * @param resource - The resource instance to register.
     */
    addResource(resource: Resource) {
        if(!this.resourceStore) this.resourceStore = new InMemoryResourceStore();
        resource.setStore(this.resourceStore);
        this.resourceStore.register(resource);
    };

    private _createServer(userId: UserId) {
        const serverInfo: Implementation = { name: `server-id-${userId}`, version: this.MCP_SERVER_VERSION };
        const serverOptions = { instructions: this.MCP_SERVER_INSTRUCTIONS };
        return new ServerBuilder(new Server(serverInfo, serverOptions), this);
    }
    /**
     * Builds and returns a ready-to-use MCP server and transport for the given user/session.
     *
     * @param userId - The application user id.
     * @param sessionId - The session id used to scope the transport/events.
     * @param transportKind
     */
    create(userId: UserId, sessionId: SessionId, transportKind: 'stream' | 'sse' | 'stdio' = 'stream') {
        return this._createServer(userId)
            .registerPrompts()
            .registerResources()
            .registerTools()
            .build(userId, sessionId, transportKind);
    };
}