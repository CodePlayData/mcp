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

/**
 * GreeterTool is a simple example Tool that returns a greeting message for the provided name.
 *
 * This tool showcases how to implement a Tool by defining an input JSON schema and
 * handling the CallToolRequest to produce a CallToolResult consumable by an MCP client.
 */
export class GreeterTool extends Tool {
    /**
     * Creates a new Greeter tool with a single string input argument "name".
     * The tool responds with a text content greeting.
     */
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

    /**
     * Handles an MCP CallToolRequest by reading the "name" argument and returning a greeting.
     *
     * @param request - The tool invocation request containing the input arguments.
     * @param extra - Extra request metadata supplied by the MCP framework.
     * @returns A CallToolResult with a single text content greeting the provided name.
     */
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