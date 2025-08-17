// @filename: Session.ts

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

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SessionId } from "./SessionId.js";
import { UserId } from "./UserId.js";

/**
 * Represents a user session within a server environment.
 *
 * @property {Date} createdAt - The date and time when the session was created.
 * @property {Server} server - The server associated with the session.
 * @property {StreamableHTTPServerTransport} transport - The transport mechanism being used for this session.
 * @property {SessionId} sessionId - The unique identifier for this session.
 * @property {UserId} userId - The unique identifier of the user associated with this session.
 */
export type Session = {
    createdAt: Date,
    server: Server,
    transport: StreamableHTTPServerTransport,
    sessionId: SessionId,
    userId: UserId,
};