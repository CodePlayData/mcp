// @filename: InMemoryToolStore.ts

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
import {ToolStore} from "../app/ToolStore";
import {CallToolRequest, CallToolResult, Tool} from "../core/Tool";
import {RequestHandlerExtra} from "@modelcontextprotocol/sdk/shared/protocol.js";

/**
 * Simple in-memory ToolStore used for demos/tests.
 *
 * Keeps Tool instances in memory, lists them for capability advertisement,
 * and dispatches CallTool requests to the appropriate tool by name.
 */
export class InMemoryToolStore implements ToolStore {
    /** Backing collection of registered tools. */
    private tools: Tool[] = [];

    /**
     * Returns all registered tools.
     */
    list(): Tool[] {
        return this.tools
    }

    /**
     * Creates a handler that locates a Tool by name and invokes it.
     *
     * @param server - The MCP Server instance so tools can send progress or events.
     * @returns An async function that handles CallTool requests.
     * @throws If the requested tool name is not found.
     */
    notify(server: Server): (request: CallToolRequest, extra: RequestHandlerExtra<any, any>) => Promise<CallToolResult> {
        return async (request: CallToolRequest, extra: RequestHandlerExtra<any, any>): Promise<CallToolResult> => {
            const tool = this.tools.find(tool => tool.schema.name === request.params.name);
            if (!tool) {
                throw new Error(`Tool ${request.params.name} not found`);
            }
            return await tool.setServer(server).handle(request, extra);
        };
    }

    /**
     * Registers a new Tool instance.
     *
     * @param tool - The Tool to add to the store.
     */
    register(tool: Tool): void {
        this.tools.push(tool);
    }
}
