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
        readonly MCP_SERVER_INSTRUCTIONS: string = "Some testing MCP server."
    ) {};

    addTool(tool: Tool) {
        if(!this.toolStore) this.toolStore = new InMemoryToolStore();
        this.toolStore?.register(tool);
    };
    addPrompt(prompt: Prompt) {
        if(!this.promptStore) this.promptStore = new InMemoryPromptStore();
        this.promptStore?.register(prompt);
    };
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
    create(userId: UserId, sessionId: SessionId) {
        return this._createServer(userId)
            .registerPrompts()
            .registerResources()
            .registerTools()
            .build(userId, sessionId);
    };
}