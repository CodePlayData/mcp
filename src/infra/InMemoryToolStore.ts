// @filanem: InMemoryToolStore.ts

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

export class InMemoryToolStore implements ToolStore {
    private tools: Tool[] = [];

    list(): Tool[] {
        return this.tools
    }

    notify(server: Server): (request: CallToolRequest, extra: RequestHandlerExtra<any, any>) => Promise<CallToolResult> {
        return async (request: CallToolRequest, extra: RequestHandlerExtra<any, any>): Promise<CallToolResult> => {
            const tool = this.tools.find(tool => tool.schema.name === request.params.name);
            if (!tool) {
                throw new Error(`Tool ${request.params.name} not found`);
            }
            return await tool.setServer(server).handle(request, extra);
        };
    }

    register(tool: Tool): void {
        this.tools.push(tool);
    }
}
