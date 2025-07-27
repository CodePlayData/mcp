// @filename: ResourceStore.ts

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

import {ReadResourceRequest, ReadResourceResult, Resource} from "../core/Resource.js";
import {RequestHandlerExtra} from "@modelcontextprotocol/sdk/shared/protocol.js";
import {Server} from "@modelcontextprotocol/sdk/server/index.js";

export interface ResourceStore {
    list(): Resource[];
    register(resource: Resource): void;
    subscribe(uri: string): void;
    notify(server: Server): (request: ReadResourceRequest, extra: RequestHandlerExtra<any, any>) => Promise<ReadResourceResult>
    notifyResourceUpdate(uri: string, updates: any): void;
}