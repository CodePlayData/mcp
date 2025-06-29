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

export class InMemoryEventStore implements EventStore {
    private events: { id: EventId, streamId: StreamId, message: JSONRPCMessage }[] = [];
    private lastStreamId: StreamId = '';

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
    async storeEvent(streamId: StreamId, message: JSONRPCMessage): Promise<EventId> {
        const id = randomUUID()
        this.events.push({ id, streamId, message });
        this.lastStreamId = streamId;
        return id
    };
}