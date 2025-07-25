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

type ResourceInput = {
    schema: ResourceSchema
} | {
    template: ResourceTemplate
};

export abstract class Resource {
    public server: Server | undefined = undefined;

    protected constructor(readonly input: ResourceInput) {};

    setServer(server: Server) {
        this.server = server;
        return this;
    };
    abstract handle(request: ReadResourceRequest, extra: RequestHandlerExtra<any, any>): Promise<ReadResourceResult>;

    protected createTextResource(uri: string, content: any, mimeType?: string): TextResourceContent {
        const text = JSON.stringify(content);
        return {
            uri,
            text,
            mimeType
        };
    };
    private isBase64(str: string): boolean {
        try {
            return Buffer.from(str, 'base64').toString('base64') === str;
        } catch (e) {
            return false;
        }
    };
    private convertToBase64(content: any): string {
        if (typeof content === 'string' && this.isBase64(content)) {
            return content;
        }
        if (typeof content === 'string') {
            return Buffer.from(content).toString('base64');
        }
        if (Buffer.isBuffer(content)) {
            return content.toString('base64');
        }
        if (typeof content === 'object') {
            return Buffer.from(JSON.stringify(content)).toString('base64');
        }
        return Buffer.from(String(content)).toString('base64');
    };

    protected createBlobResource(uri: string, content: any, mimeType?: string): BlobResourceContent {
        const blob = this.convertToBase64(content);
        return {
            uri,
            blob,
            mimeType
        };
    };
}
