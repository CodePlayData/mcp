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

/**
 * HTTP controller that bridges incoming requests to an MCP server instance per session.
 *
 * It restores or creates sessions, initializes transports, and forwards the
 * raw HTTP request/response handling to the MCP Streamable HTTP transport.
 *
 * @typeParam Request - Concrete request type (e.g., Express Request) extending BasicRequest.
 * @typeParam Response - Concrete response type (e.g., Express Response) extending BasicResponse.
 */
export class MCPController<Request extends BasicRequest, Response extends BasicResponse> {
    /**
         * Creates a new MCPController.
         *
         * @param sessionStorage - Storage used to generate, persist, restore and delete sessions.
         * @param authenticationGateway - Gateway used to resolve a user id from an Authorization token.
         * @param serverFactory - Factory that builds MCP Server/Transport pairs for a given user/session id.
         */
        constructor(readonly sessionStorage: SessionStorage, readonly authenticationGateway: AuthenticationGateway, readonly serverFactory: McpServerFactory) {}

    /**
         * Main entry point to process an HTTP request for the MCP endpoint.
         *
         * If a session id is provided and known, it forwards the request to the
         * existing transport. Otherwise it authenticates the user, creates a new
         * session and transport, connects the server and then processes the request.
         *
         * @param request - Incoming HTTP request.
         * @param response - Outgoing HTTP response.
         */
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
        await session.transport.handleRequest(request, response, request.body);
        return
    };
    /**
         * Retrieves the session id from the request headers, if present.
         *
         * @param request - The incoming request holding headers.
         * @param response - The outgoing response (unused here).
         * @returns The session id string or undefined.
         */
        private getSessionId(request: Request, response: Response) {
        return request.headers['mcp-session-id'];
    };
    /**
         * Extracts the Authorization bearer token and resolves it to a user id via the gateway.
         *
         * @param request - Incoming request possibly containing an Authorization header.
         * @param response - Outgoing response (unused here).
         * @returns The resolved user id string.
         */
        private async getUserId(request: Request, response: Response) {
        const rawToken = request.headers['Authorization'] as string;
        const userToken = rawToken?.replace("Bearer ", "");
        return await this.authenticationGateway.getUserId(userToken);
    };
}