// @filename: ToolStore.ts

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

import {CallToolRequest, CallToolResult, Tool} from "../core/Tool.js";
import {RequestHandlerExtra} from "@modelcontextprotocol/sdk/shared/protocol.js";
import {Server} from "@modelcontextprotocol/sdk/server/index.js";

/**
 * Abstraction for a registry of Tools exposed by the MCP server.
 *
 * A ToolStore is responsible for holding tool instances, registering new tools,
 * listing them for capability advertisement, and producing a request handler
 * to execute a tool via the MCP CallTool endpoint.
 */
export interface ToolStore {
    /**
     * Returns all tools currently registered in the store.
     */
    list(): Tool[];
    /**
     * Registers a new tool in the store.
     * @param tool - The tool instance to add.
     */
    register(tool: Tool): void;
    /**
     * Produces a request handler bound to the provided Server that will
     * execute a tool according to the given CallToolRequest.
     *
     * @param server - The MCP Server instance used to send progress/events.
     * @returns An async function handling CallTool requests that resolves to a CallToolResult.
     */
    notify(server: Server): (request: CallToolRequest, extra: RequestHandlerExtra<any, any>) => Promise<CallToolResult>
}