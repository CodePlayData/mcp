// @filename: InMemoryPromptStore.ts

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

import {PromptStore} from "../app/PromptStore.js";
import {GetPromptRequest, GetPromptResult, Prompt} from "../core/Prompt.js";
import {RequestHandlerExtra} from "@modelcontextprotocol/sdk/shared/protocol.js";

export class InMemoryPromptStore implements PromptStore {
    private prompts: Prompt[] = [];

    list(): Prompt[] {
        return this.prompts;
    }

    notify = (request: GetPromptRequest, extra: RequestHandlerExtra<any, any>): Promise<GetPromptResult> => {
        const selectedPrompt = this.prompts.find(prompt => prompt.schema.name === request.params.name)

        if (!selectedPrompt) {
            throw new Error(`Prompt ${request.params.name} not found`);
        }

        return Promise.resolve(selectedPrompt.handle(request, extra));
    }

    register(prompt: Prompt): void {
        this.prompts.push(prompt);
    }
}