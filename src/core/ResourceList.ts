// @filename: ResourceList.ts

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


import {ReadResourceRequest, ReadResourceResult, Resource, ResourceSchema} from "./Resource.js";
import { ResourceContent } from "./ResourceContent.js";

export type MinimalResourceSchema = {
    uri: string;
    mimeType?: string;
};

class BaseResource extends Resource {
    constructor(protected resourceData: ResourceContent, readonly resourceSchema: ResourceSchema) {
        super({ schema: resourceSchema });
    }

    async handle(request: ReadResourceRequest): Promise<ReadResourceResult> {
        if(this.resourceSchema.mimeType === "application/json" || this.resourceSchema.mimeType === "application/xml" || this.resourceSchema.mimeType === "text/plain") {
            return Promise.resolve({
                contents: [
                    this.createTextResource(this.resourceData)
                ]
            });
        }

        return Promise.resolve({
            contents: [
                this.createBlobResource(this.resourceData)
            ]
        });
    }
}

class ResourceImpl<C extends ResourceContent, S extends ResourceSchema> extends BaseResource {
    constructor(resourceContent: C, resourceSchema: S) {
        super(resourceContent, resourceSchema);
    }
}

export class ResourcesList<C extends ResourceContent[], S extends MinimalResourceSchema = MinimalResourceSchema> {
    protected constructor(protected resourceContents: C, protected defaultResourceSchema: S) {}

    getResources(indexKey: keyof ResourceContent, language: 'pt-br' | 'en-us' = 'en-us'): Resource[] {
        return this.resourceContents.map(content => {
            const name = typeof content.name === 'string' ? content.name : content.name[language as keyof typeof content.name];
            const description = typeof content.description === 'string' ? content.description :
                typeof content.description === 'object' ? content.description[language as keyof typeof content.description] : undefined;
            const title = typeof content.title === 'string' ? content.title : undefined
            const baseUri = this.defaultResourceSchema.uri.endsWith('/') ? this.defaultResourceSchema.uri : this.defaultResourceSchema.uri + '/';
            const uri = `${baseUri}${content[indexKey]}`;
            const mimeType = this.defaultResourceSchema.mimeType || undefined;

            const schema = { uri, name, description, title, mimeType};

            return new ResourceImpl<ResourceContent, ResourceSchema>(content, schema);
        });
    }
}