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

/**
 * In-memory implementation of SessionStorage for managing MCP sessions.
 *
 * Stores Session objects keyed by sessionId for the life of the process.
 * Each session records its creation timestamp, the associated MCP Server,
 * the Streamable HTTP transport, the sessionId, and the userId.
 *
 * Notes:
 * - If createSession is called with an existing sessionId, the existing
 *   Session is returned (idempotent creation).
 * - This storage is volatile and intended for development/testing, not
 *   for production persistence across restarts.
 */
export class InMemorySessionStorage implements SessionStorage {
    /** In-memory map of sessionId to Session. */
    private sessions = new Map<string, Session>();

    /**
     * Generates a new unique session id.
     *
     * Uses crypto.randomUUID() to create a v4 UUID suitable for scoping
     * transports and associating server-side session data.
     * @returns A newly generated session id string.
     */
    generateSessionId() {
        return randomUUID()
    };
    /**
     * Creates or returns an existing Session for the given sessionId.
     *
     * Idempotent: if a session with sessionId already exists, that session is
     * returned unchanged. Otherwise, a new Session is created, stored, and returned.
     *
     * @param sessionId - The unique id for the session to create or fetch.
     * @param server - The MCP Server associated with this session.
     * @param userId - The application user id owning this session.
     * @param transport - The Streamable HTTP transport bound to this session.
     * @returns The existing or newly created Session.
     */
    createSession(sessionId: string, server: Server, userId: string, transport: StreamableHTTPServerTransport) {
        const storedSession = this.sessions.get(sessionId)
        if (storedSession) {
            return storedSession;
        }
        const session = {createdAt: new Date(), server, transport, sessionId, userId}
        this.sessions.set(sessionId, session);
        return session;
    };
    /**
     * Retrieves a stored Session by its sessionId.
     *
     * @param sessionId - The id of the session to look up.
     * @returns The Session if found; otherwise undefined.
     */
    restoreSession(sessionId: string) {
        return this.sessions.get(sessionId);
    };
    /**
     * Deletes a stored Session by its sessionId.
     *
     * No-op if the sessionId does not exist.
     * @param sessionId - The id of the session to delete.
     */
    deleteSession(sessionId: string) {
        this.sessions.delete(sessionId);
    };
}