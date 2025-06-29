// @filename: UserIdResource.ts

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

import { ReadResourceRequest, ReadResourceResult, Resource } from "../core/Resource.js";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";

const schema = {
    uri: "file:///pedro.txt",
    name: "User data identification.",
    mimeType: "text/plain"
};

const template = {
    name: "User data identification.",
    uriTemplate: "file:///{ userFirstName }.txt"
};

export class UserIdResource extends Resource {
    constructor() {
        super(schema, template);
    };

    protected async handle(request: ReadResourceRequest, extra: RequestHandlerExtra<any, any>): Promise<ReadResourceResult> {
        const uri = request.params.uri;
        const content = "Hi, Dr. Pedro Paulo."
        const textResource = this.createTextResource(uri, content);
        return Promise.resolve({ contents: [textResource] })
    };
}