// @filename: InMemoryResourceStore.ts

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

import {ResourceStore} from "../app/ResourceStore.js";
import {Server} from "@modelcontextprotocol/sdk/server/index.js";
import {ReadResourceRequest, ReadResourceResult, ResourceSchema} from "../core/Resource";
import {RequestHandlerExtra} from "@modelcontextprotocol/sdk/shared/protocol.js";
import {Resource} from "../core/Resource.js";

export class InMemoryResourceStore implements ResourceStore {
    private resources: Resource[] = [];

    list(): Resource[] {
        return this.resources;
    }

    notify(server: Server): (request: ReadResourceRequest, extra: RequestHandlerExtra<any, any>) => Promise<ReadResourceResult> {
        return async (request: ReadResourceRequest, extra: RequestHandlerExtra<any, any>): Promise<ReadResourceResult> => {
            let resource: Resource | undefined;
            this.resources.map(r => {
                const hasProperty = r.input.hasOwnProperty("schema");
                if(hasProperty) {
                    const isTheSameName = (r.input as { schema: ResourceSchema }).schema.uri === request.params.uri;
                    if(isTheSameName) {
                        resource = r;
                    }
                }
            });

            if (!resource) {
                throw new Error(`Resource ${request.params.uri} not found`);
            }
            return await resource.setServer(server).handle(request, extra);
        }
    }

    register(resource: Resource): void {
        this.resources.push(resource);
    }

}