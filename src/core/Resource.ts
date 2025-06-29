// @filename: Resource.ts

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

export type ResourceSchema = {
    uri: string
    name: string
    description?: string
    mimeType?: string
    [key: string]: unknown
};

export type ReadResourceRequest = {
    method: "resources/read"
    params: {
        uri: string
        _meta?: {
            progressToken?: string | number
        }
        [key: string]: unknown
    }
};

export type ResourceContent = {
    uri: string
    mimeType?: string
};

export type TextResourceContent = ResourceContent & {
    text: string
};

export type BlobResourceContent = ResourceContent & {
    blob: string
};

export type ResourceContentItem = TextResourceContent | BlobResourceContent;

export type ReadResourceResult = {
    _meta?: Record<string, any>
    contents: Array<ResourceContentItem>
};

export type ResourceTemplate = {
    [p: string]: unknown
    name: string
    uriTemplate: string
    description?: string
    mimeType?: string
};

export abstract class Resource {
    public server: Server | undefined = undefined;

    protected constructor(readonly schema?: ResourceSchema, readonly template?: ResourceTemplate) {
        if (!schema && !template) {
            throw new Error("Resource must have either a schema or a template, but not both.");
        }
    };

    setServer(server: Server) {
        this.server = server;
        return this;
    };
    protected abstract handle(request: ReadResourceRequest, extra: RequestHandlerExtra<any, any>): Promise<ReadResourceResult>;
    get requestHandler() {
        return this.handle.bind(this);
    };
    protected createTextResource(uri: string, text: string, mimeType?: string): TextResourceContent {
        return {
            uri,
            text,
            mimeType
        };
    };
    protected createBlobResource(uri: string, blob: string, mimeType?: string): BlobResourceContent {
        return {
            uri,
            blob,
            mimeType
        };
    };
}
