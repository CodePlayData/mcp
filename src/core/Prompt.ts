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

export type PromptMessage = {
    role: string,
    content: {
        type: string,
        text: string
    }
};

export type GetPromptResult = {
    description: string
    messages: PromptMessage[]
}

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

export abstract class Prompt {
    protected constructor(readonly schema: PromptSchema) {};

    abstract handle(request: GetPromptRequest, extra: RequestHandlerExtra<any, any>): Promise<GetPromptResult>;

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

