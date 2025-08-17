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

/**
 * Simple in-memory PromptStore used by the factory for local setups.
 *
 * Holds Prompt instances, supports listing for capability advertisement,
 * and resolves a prompt by name when notified via GetPrompt requests.
 */
export class InMemoryPromptStore implements PromptStore {
    /** Backing collection of registered prompts. */
    private prompts: Prompt[] = [];

    /**
     * Returns all registered prompts.
     */
    list(): Prompt[] {
        return this.prompts;
    }

    /**
     * Resolves and delegates a GetPrompt request to the selected Prompt instance.
     *
     * @param request - The request specifying the prompt name and arguments.
     * @param extra - Protocol-specific metadata passed by the server.
     * @throws If a prompt with the given name is not found.
     * @returns The result produced by the selected prompt.
     */
    notify = (request: GetPromptRequest, extra: RequestHandlerExtra<any, any>): Promise<GetPromptResult> => {
        const selectedPrompt = this.prompts.find(prompt => prompt.schema.name === request.params.name)

        if (!selectedPrompt) {
            throw new Error(`Prompt ${request.params.name} not found`);
        }

        return Promise.resolve(selectedPrompt.handle(request, extra));
    }

    /**
     * Registers a new prompt.
     *
     * @param prompt - The Prompt instance to add to the store.
     */
    register(prompt: Prompt): void {
        this.prompts.push(prompt);
    }
}