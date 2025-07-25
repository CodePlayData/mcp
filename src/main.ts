// @filename: main.ts

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

import express, { Request, Response } from "express";
import { InMemorySessionStorage } from "./infra/InMemorySessionStorage.js";
import { MCPController } from "./interface/MCPController.js";
import { FakeAuthenticationGateway } from "./infra/FakeAuthenticationGateway.js";
import { McpServerFactory } from "./app/McpServerFactory.js";
import { GreeterTool } from "./infra/GreeterTool.js";
import { CallMePrompt } from "./infra/CallMePrompt.js";
import { UserIdResource } from "./infra/UserIdResource.js";
import { UserIdTemplate } from "./infra/UserIdTemplate.js";

const app = express();
app.use(express.json());

const sessionStorage = new InMemorySessionStorage();
const authenticationGateway = new FakeAuthenticationGateway();

const tool = new GreeterTool();
const prompt = new CallMePrompt();
const resource = new UserIdResource();
const resourceTemplate = new UserIdTemplate();

const mcpServerFactory = McpServerFactory.instanceOf();

mcpServerFactory.addTool(tool);
mcpServerFactory.addPrompt(prompt);
mcpServerFactory.addResource(resource);
mcpServerFactory.addResource(resourceTemplate);

const mcpController = new MCPController<Request, Response>(sessionStorage, authenticationGateway, mcpServerFactory);

app.all('/mcp', async (req, res) => await mcpController.handleRequest(req, res))

app.listen(3000)
