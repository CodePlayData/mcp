// @filename: InMemorySessionStorage.ts

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

import { randomUUID } from "node:crypto";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SessionStorage } from "../interface/SessionStorage";
import { Session } from "../core/Session";

export class InMemorySessionStorage implements SessionStorage {
    private sessions = new Map<string, Session>();

    generateSessionId() {
        return randomUUID()
    };
    createSession(sessionId: string, server: Server, userId: string, transport: StreamableHTTPServerTransport) {
        const storedSession = this.sessions.get(sessionId)
        if (storedSession) {
            return storedSession;
        }
        const session = {createdAt: new Date(), server, transport, sessionId, userId}
        this.sessions.set(sessionId, session);
        return session;
    };
    restoreSession(sessionId: string) {
        return this.sessions.get(sessionId);
    };
    deleteSession(sessionId: string) {
        this.sessions.delete(sessionId);
    };
}