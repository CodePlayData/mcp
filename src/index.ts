// @filename: index.ts

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

import { MCPController } from "./interface/MCPController.js";
import { McpServerFactory } from "./app/McpServerFactory.js";
import { AuthenticationGateway } from "./interface/AuthenticationGateway.js";
import { SessionStorage } from "./interface/SessionStorage.js"
import { EventStore } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { Tool } from "./core/Tool.js";
import { Resource, ResourceSchema, ReadResourceRequest, ReadResourceResult, ResourceTemplate } from "./core/Resource.js";
import { Prompt } from "./core/Prompt.js";
import { InMemoryPromptStore } from "./infra/InMemoryPromptStore.js";
import { FakeAuthenticationGateway } from "./infra/FakeAuthenticationGateway.js";
import { GreeterTool } from "./infra/GreeterTool.js";
import { CallMePrompt } from "./infra/CallMePrompt.js";
import { UserIdResource } from "./infra/UserIdResource.js";
import { UserIdTemplate } from "./infra/UserIdTemplate.js";
import { InMemorySessionStorage } from "./infra/InMemorySessionStorage.js";
import { ResourceContent } from "./core/ResourceContent.js";
import { ResourcesList } from "./core/ResourceList.js"

export {
    InMemorySessionStorage,
    UserIdTemplate,
    UserIdResource,
    CallMePrompt,
    GreeterTool,
    FakeAuthenticationGateway,
    InMemoryPromptStore,
    MCPController,
    McpServerFactory,
    AuthenticationGateway,
    SessionStorage,
    EventStore,
    Tool,
    Resource,
    ResourceSchema,
    ReadResourceRequest,
    ReadResourceResult,
    ResourceTemplate,
    Prompt,
    ResourceContent,
    ResourcesList
}