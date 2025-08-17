// @filename: Prompt.ts

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

import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";

/**
 * Represents a schema definition for a prompt. This schema allows defining
 * the structure and properties of a prompt, including its name, optional
 * description, arguments, and any additional custom properties.
 *
 * @property {string} name - The name of the prompt.
 * @property {string} [description] - An optional description of the prompt.
 * @property {Array<Object>} [arguments] - An optional array of argument definitions for the prompt.
 * @property {string} arguments.name - The name of the argument.
 * @property {string} [arguments.description] - An optional description of the argument.
 * @property {boolean} [arguments.required] - Indicates whether the argument is mandatory. Defaults to `false` if not provided.
 * @property {Object} [key: string] - Allows additional custom properties within the schema.
 */
export type PromptSchema = {
    name: string
    description?: string
    arguments?: {
        name: string
        description?: string
        required?: boolean
        [key: string]: unknown
    }[]
    [key: string]: unknown
};

/**
 * Represents a message in a conversational prompt.
 *
 * This type is used to structure a message consisting of a role and its associated content.
 *
 * @property {string} role - The role of the sender of the message (e.g., "user", "system").
 * @property {Object} content - The content of the message.
 * @property {string} content.type - The type of the content (e.g., "text", "image").
 * @property {string} content.text - The textual data of the message.
 */
export type PromptMessage = {
    role: string,
    content: {
        type: string,
        text: string
    }
};

/**
 * Represents the result of a get prompt request, including its description
 * and an array of prompt messages.
 *
 * @property {string} description - A textual description of the prompt result.
 * @property {PromptMessage[]} messages - An array containing messages related to the prompt.
 */
export type GetPromptResult = {
    description: string
    messages: PromptMessage[]
}

/**
 * Represents a request object for fetching a specific prompt with optional arguments and metadata.
 *
 * @property {"prompts/get"} method - Specifies the method type for retrieving the prompt.
 * @property {Object} params - Contains the parameters required for the request.
 * @property {string} params.name - The unique name or identifier of the prompt to fetch.
 * @property {Object<string, string>} [params.arguments] - Optional key-value pairs specifying additional arguments for the prompt.
 * @property {Object} [params._meta] - Optional metadata for internal use.
 * @property {string | number} [params._meta.progressToken] - Token used to track the progress of operations, if applicable.
 * @property {unknown} [params[key: string]] - Additional dynamic properties within the parameters object.
 */
export type GetPromptRequest = {
    method: "prompts/get"
    params: {
        name: string
        arguments?: Record<string, string>
        _meta?: {
            progressToken?: string | number
        }
        [key: string]: unknown
    }
};

/**
 * Abstract class representing a prompt with a defined schema and operations.
 */
export abstract class Prompt {
    /**
     * Protected constructor for initializing an instance with the provided schema.
     *
     * @param schema - The schema to initialize this instance with.
     */
    protected constructor(readonly schema: PromptSchema) {};

    /**
     * Handles the incoming request to retrieve a prompt.
     *
     * @param {GetPromptRequest} request - The request containing the information required to get the prompt.
     * @param {RequestHandlerExtra<any, any>} extra - Additional context or parameters required for processing the request.
     * @return {Promise<GetPromptResult>} A promise that resolves to the result containing the prompt data.
     */
    abstract handle(request: GetPromptRequest, extra: RequestHandlerExtra<any, any>): Promise<GetPromptResult>;

    /**
     * Creates a message object with the given role and text content.
     *
     * @param {string} role - The role associated with the message (e.g., sender or recipient identifier).
     * @param {string} text - The text content of the message.
     * @return {PromptMessage} Returns a message object containing the role and text details.
     */
    protected createMessage(role: string, text: string): PromptMessage {
        return {
            role,
            content: {
                type: "text",
                text
            }
        };
    };
}

