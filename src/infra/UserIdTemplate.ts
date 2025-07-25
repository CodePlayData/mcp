// @filename: UserIdTemplate.ts

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

import { Resource } from "../core/Resource.js";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";

const template = {
    name: "User data identification.",
    uriTemplate: "data://{ user }"
};

export class UserIdTemplate extends Resource {
    constructor() {
        super({ template });
    };

    async handle(request: any, extra: RequestHandlerExtra<any, any>): Promise<any> {
        const uri = request.params.uriTemplate;
        const userRegex = /data\/\/:(.+)/;
        const match = uri.match(userRegex);
        const userName = match ? match[1] : "unknown";

        console.log(userName)

        const content = `Hi, ${ userName }!`
        return this.createTextResource(uri, content);
    };
}