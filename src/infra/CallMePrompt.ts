// @filename: CallMePrompt.ts

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

import { GetPromptRequest, GetPromptResult, Prompt } from "../core/Prompt.js";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";

export class CallMePrompt extends Prompt {
    constructor() {
        super({
            name: "Call me prompt",
            description: "Configure the way the LLM will call you.",
            arguments: [{
                name: "honorifics",
                description: "The way you want to be called by the LLM.",
                required: true
            }]
        });
    };

    handle(request: GetPromptRequest, extra: RequestHandlerExtra<any, any>): Promise<GetPromptResult> {
        console.log("a prompt was consulted: ", request)
        console.log("extra: ", extra)

        const args = request.params.arguments as Record<string, string>;
        const honorifics = args["honorifics"];
        const prompt = {
            description: "Configuring the way the LLM will call you.",
            messages: [ this.createMessage("user", "Please call me " + honorifics + ".")]
        } as GetPromptResult
        return Promise.resolve(prompt)
    };
}