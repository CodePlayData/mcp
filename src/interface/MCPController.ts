// @filename: MCPController.ts

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

import { SessionStorage } from "./SessionStorage.js";
import { AuthenticationGateway } from "./AuthenticationGateway.js";
import { Session } from "../core/Session.js";
import { McpServerFactory } from "../app/McpServerFactory.js";
import { BasicRequest } from "./BasicRequest.js";
import { BasicResponse } from "./BasicResponse.js";
import { SessionId } from "../core/SessionId.js";

export class MCPController<Request extends BasicRequest, Response extends BasicResponse> {
    constructor(readonly sessionStorage: SessionStorage, readonly authenticationGateway: AuthenticationGateway, readonly serverFactory: McpServerFactory) {}

    async handleRequest(request: Request, response: Response) {
        let session: Session | undefined;
        let sessionId: SessionId | undefined;
        sessionId = this.getSessionId(request, response);
        session = this.sessionStorage.restoreSession(sessionId || "");
        if(session) {
            await session.transport.handleRequest(request, response, request.body);
            return
        }
        const userId = await this.getUserId(request, response);
        sessionId = this.sessionStorage.generateSessionId();
        const { server, transport } = this.serverFactory.create(userId, sessionId);
        transport.onclose = () => {
            this.sessionStorage.deleteSession(sessionId);
        };
        session =  this.sessionStorage.createSession(sessionId, server, userId, transport)
        await session.server.connect(session.transport);
        await session.transport.handleRequest(request, response, request.body).then(() => console.log("Request handled by transport."));
        return
    };
    private getSessionId(request: Request, response: Response) {
        return request.headers['mcp-session-id'];
    };
    private async getUserId(request: Request, response: Response) {
        const rawToken = request.headers['Authorization'] as string;
        const userToken = rawToken?.replace("Bearer ", "");
        return await this.authenticationGateway.getUserId(userToken);
    };
}