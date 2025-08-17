// @filename: InMemoryEventStore.ts

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
import { EventId, EventStore, StreamId } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";

/**
 * In-memory implementation of the MCP EventStore.
 *
 * Stores JSON-RPC messages in a local array and supports replaying events
 * after a given event id. Intended for development/testing scenarios.
 * Not suitable for production persistence.
 */
export class InMemoryEventStore implements EventStore {
    /** Collected events for the current process lifetime. */
    private events: { id: EventId, streamId: StreamId, message: JSONRPCMessage }[] = [];
    /** The last stream id observed when storing events. */
    private lastStreamId: StreamId = '';

    /**
     * Replays all events that occurred after the provided lastEventId.
     *
     * @param lastEventId - The id of the last event the client processed.
     * @param send - Callback used to deliver events to the transport/client.
     * @returns The last known stream id, allowing the caller to resubscribe.
     */
    async replayEventsAfter(lastEventId: EventId, {send}: {
        send: (eventId: EventId, message: JSONRPCMessage) => Promise<void>
    }): Promise<StreamId> {
        const lastEventIndex = this.events.findIndex(event => event.id === lastEventId);
        if (lastEventIndex !== -1) {
            const eventsToReplay = this.events.slice(lastEventIndex + 1);
            for (const event of eventsToReplay) {
                await send(event.id, event.message);
            }
        }
        return this.lastStreamId;
    };

    /**
     * Stores an event and updates the last stream id.
     *
     * @param streamId - Identifier of the stream to which the event belongs.
     * @param message - The JSON-RPC message to persist.
     * @returns The generated unique EventId for the stored message.
     */
    async storeEvent(streamId: StreamId, message: JSONRPCMessage): Promise<EventId> {
        const id = randomUUID()
        this.events.push({ id, streamId, message });
        this.lastStreamId = streamId;
        return id
    };
}