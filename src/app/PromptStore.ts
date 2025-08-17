// @filename: PromptStore.ts

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

import {GetPromptRequest, GetPromptResult, Prompt} from "../core/Prompt";
import {RequestHandlerExtra} from "@modelcontextprotocol/sdk/shared/protocol.js";

/**
 * Abstraction for a registry of Prompts exposed by the MCP server.
 *
 * A PromptStore holds prompt definitions, lists them for capability
 * advertisement, and provides a handler to retrieve a specific prompt.
 */
export interface PromptStore {
    /**
     * Returns all prompts currently registered in the store.
     */
    list(): Prompt[]
    /**
     * Registers a new prompt.
     * @param prompt - The prompt to register.
     */
    register(prompt: Prompt): void;
    /**
     * Resolves a prompt for the provided GetPromptRequest.
     *
     * @param request - The request describing which prompt to fetch.
     * @param extra - Extra protocol-specific data passed by the server.
     * @returns The requested prompt and any dynamic content.
     */
    notify(request: GetPromptRequest, extra: RequestHandlerExtra<any, any>): Promise<GetPromptResult>;
}