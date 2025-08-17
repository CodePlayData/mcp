// @filename: UserIdTemplate.ts

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

import { Resource } from "../core/Resource.js";

/**
 * Simple Resource template that advertises how to address a user-specific resource by URI.
 *
 * What it is:
 * - A lightweight Resource that carries only a ResourceTemplate (no concrete schema).
 * - Exposes a uriTemplate of the form:
 *   data://{ user }
 *   where the placeholder "user" should be replaced with an application user identifier.
 *
 * When to use:
 * - Register this class in your ResourceStore when you want clients to discover the pattern
 *   they can use to request a particular user's data (without enumerating all users).
 *
 * Notes:
 * - This class does not implement handle(); it is meant to be discoverable documentation for
 *   the URI structure. A concrete Resource (like UserIdResource) should implement read logic.
 *
 * Example:
 *   const template = new UserIdTemplate();
 *   // Exposed to clients, they can later request e.g. data://alice or data://42
 */
const template = {
    /** A friendly name for the template, shown to clients. */
    name: "User data identification.",
    /**
     * URI template indicating how to address a specific user resource.
     * Replace { user } with the actual user id or username, e.g., data://john-doe
     */
    uriTemplate: "data://{ user }"
};

/**
 * Resource that only exposes a URI template for user identification.
 *
 * This subclass of Resource leverages the template-only input so that MCP servers/clients
 * can list the pattern without a concrete instance.
 */
export class UserIdTemplate extends Resource {
    constructor() {
        super({ template });
    };
}