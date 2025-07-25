// @filename: GreeterTool.ts

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

import { CallToolRequest, CallToolResult, Tool } from "../core/Tool.js";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";

export class GreeterTool extends Tool {
    constructor() {
        super({
            name: "Greeter",
            description: "Greet the user once.",
            inputSchema: {
                type: "object",
                properties: {
                    name: {
                        type: "string" ,
                    }
                }
            }
        });
    };

    async handle(request: CallToolRequest, extra: RequestHandlerExtra<any, any>): Promise<CallToolResult> {
        console.log("tool request received: ", request)
        console.log("extra: ", extra)

        const args = request.params.arguments as Record<string, string>
        const name = args["name"]

        return {
            content: [
                {type: "text", text: `Hey ${name}! You made it!`}
            ]
        } as CallToolResult
    };
}