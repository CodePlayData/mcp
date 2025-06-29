// @filename: Tools.ts

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
import { Server }  from "@modelcontextprotocol/sdk/server/index.js";

export type ToolSchema = {
    name: string
    description?: string
    inputSchema?: {
        type: "object"
        properties?: Record<string, any>;
        required?: string[];
    };
    outputSchema?: {
        type: "object";
        properties?: Record<string, any>;
        required?: string[];
    };
    annotations?: {
        title?: string;
        readOnlyHint?: boolean;
        destructiveHint?: boolean;
        idempotentHint?: boolean;
        openWorldHint?: boolean;
    };
};

export type CallToolRequest = {
    method: "tools/call"
    params: Record<string, unknown> & {
        name: string
        arguments?: Record<string, unknown>
        _meta?: {
            progressToken?: string | number
        }
    }
};

export type ResourceBase = {
    uri: string
    mimeType?: string
};

export type TextResource = ResourceBase & {
    text: string
};

export type BlobResource = ResourceBase & {
    blob: string;
};

export type Resource = TextResource | BlobResource;

export type ContentItem = |
    { type: "text"; text: string; }                         |
    { type: "image"; data: string; mimeType: string; }      |
    { type: "audio"; data: string; mimeType: string; }      |
    { type: "resource"; resource: Resource; }

export type CallToolResult = {
    _meta?: Record<string, any>
    content: ContentItem[] | []
    structuredContent?: Record<string, any>
    isError?: boolean
};

export abstract class Tool {
    public server: Server | undefined = undefined;

    protected constructor(readonly schema: ToolSchema) {};

    setServer(server: Server) {
        this.server = server;
        return this;
    };
    protected abstract handle(request: CallToolRequest, extra: RequestHandlerExtra<any, any>): Promise<CallToolResult>;
    // O requestHandler agora é um getter que retorna uma função bound ao this
    get requestHandler() {
        return this.handle.bind(this);
    };
}
