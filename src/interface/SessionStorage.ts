// @filename: SessionStorage.ts

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
import { Session } from "../core/Session.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";

/**
 * Abstraction for storing and retrieving MCP sessions.
 *
 * A SessionStorage implementation is responsible for generating unique session IDs,
 * creating and persisting Session objects bound to an MCP Server and a
 * Streamable HTTP transport, restoring previously created sessions, and deleting
 * sessions when they are no longer needed.
 *
 * Notes:
 * - Implementations may be ephemeral (in-memory) or persistent (database, cache).
 * - createSession should be idempotent: if a sessionId already exists, it should
 *   return the existing Session rather than creating a new one.
 */
export interface SessionStorage {
    /**
     * Generates a new unique session identifier.
     *
     * Implementations commonly return a UUID v4 string. The template literal type
     * hints at a canonical UUID-like format but does not enforce a specific
     * generator strategy.
     * @returns A newly generated session id string.
     */
    generateSessionId(): `${string}-${string}-${string}-${string}-${string}`;
    /**
     * Creates a new Session or returns an existing one for the provided sessionId.
     *
     * @param sessionId - The unique id under which the session is stored.
     * @param server - The MCP Server associated with this session.
     * @param userId - The application user id who owns the session.
     * @param transport - The Streamable HTTP transport bound to this session.
     * @returns The existing or newly created Session instance.
     */
    createSession(sessionId: string, server: Server, userId: string, transport: StreamableHTTPServerTransport | StdioServerTransport): Session;
    /**
     * Restores a previously stored Session by its identifier.
     *
     * @param sessionId - The session id to look up.
     * @returns The Session if found; otherwise undefined.
     */
    restoreSession(sessionId: string): Session | undefined;
    /**
     * Deletes a Session from storage.
     *
     * Implementations should be tolerant of missing ids and treat them as no-ops.
     * @param sessionId - The session id to delete.
     */
    deleteSession(sessionId: string): void;
}