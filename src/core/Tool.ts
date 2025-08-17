// @filename: Tools.ts

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

import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { Server }  from "@modelcontextprotocol/sdk/server/index.js";

/**
 * Represents the schema definition for a tool including its input and output structures,
 * along with optional metadata and annotations identifying its characteristics and behavior.
 *
 * @property {string} name - The name of the tool.
 * @property {string} [description] - An optional description of the tool.
 * @property {Object} [inputSchema] - An optional structure defining the expected input for the tool.
 * @property {("object")} inputSchema.type - Indicates the type of the input schema, which must be "object".
 * @property {Record<string, any>} [inputSchema.properties] - A record defining the input properties and their respective types.
 * @property {string[]} [inputSchema.required] - An optional array of property names that are required input.
 * @property {Object} [outputSchema] - An optional structure defining the expected output for the tool.
 * @property {("object")} outputSchema.type - Indicates the type of the output schema, which must be "object".
 * @property {Record<string, any>} [outputSchema.properties] - A record defining the output properties and their respective types.
 * @property {string[]} [outputSchema.required] - An optional array of property names required in the output.
 * @property {Object} [annotations] - Optional annotations providing hints about the tool's characteristics and behavior.
 * @property {string} [annotations.title] - An optional title providing context about the tool.
 * @property {boolean} [annotations.readOnlyHint] - Optional hint indicating if the tool operates in a read-only context.
 * @property {boolean} [annotations.destructiveHint] - Optional hint indicating if the tool performs destructive actions.
 * @property {boolean} [annotations.idempotentHint] - Optional hint indicating if the tool's operations are idempotent.
 * @property {boolean} [annotations.openWorldHint] - Optional hint indicating if the tool considers open-world assumptions in its actions.
 */
export type ToolSchema = {
    name: string
    description?: string
    inputSchema?: {
        type: "object"
        properties?: Record<string, any>;
        required?: string[];
    };
    outputSchema?: {
        type: "object";
        properties?: Record<string, any>;
        required?: string[];
    };
    annotations?: {
        title?: string;
        readOnlyHint?: boolean;
        destructiveHint?: boolean;
        idempotentHint?: boolean;
        openWorldHint?: boolean;
    };
};

/**
 * Type definition for CallToolRequest, which represents a request to call a tool
 * in a system. It contains the method type, parameters, and optional metadata
 * for progress tracking.
 *
 * @property {"tools/call"} method - The method used to call the tool.
 * @property {Object} params - An object containing the parameters for the tool call.
 * @property {string} params.name - The name of the tool to be invoked.
 * @property {Object} [params.arguments] - Optional object containing additional arguments
 *   for the tool. Values must be of type `unknown`.
 * @property {Object} [params._meta] - Optional metadata for the tool call.
 * @property {string|number} [params._meta.progressToken] - Optional token used for
 *   tracking progress during the tool call.
 */
export type CallToolRequest = {
    method: "tools/call"
    params: Record<string, unknown> & {
        name: string
        arguments?: Record<string, unknown>
        _meta?: {
            progressToken?: string | number
        }
    }
};

/**
 * Represents the base structure for a resource.
 *
 * This type is used to define the essential properties of a resource including
 * its unique identifier and optional metadata.
 *
 * @property {string} uri - The unique identifier or locator for the resource, typically in the form of a URL.
 * @property {string} [mimeType] - An optional field specifying the MIME type of the resource, providing information about its format or encoding.
 */
export type ResourceBase = {
    uri: string
    mimeType?: string
};

/**
 * Represents a text-based resource that extends from the base resource type.
 *
 * This type includes a text property for content storage, in addition to all the
 * properties and functionality inherited from ResourceBase.
 *
 * @property {string} text - The text content of the resource.
 * @extends ResourceBase
 */
export type TextResource = ResourceBase & {
    text: string
};

/**
 * Represents a resource that includes a binary Large Object (Blob) and extends the base resource structure.
 *
 * @property {string} blob - The binary large object data associated with this resource.
 * @augments ResourceBase
 */
export type BlobResource = ResourceBase & {
    blob: string;
};

/**
 * Represents a resource which can either be a TextResource or a BlobResource.
 *
 * This is a union type that allows the representation of resources in either text or binary blob format.
 *
 * Usage:
 * Use this type to define a resource in your application that can be one of the two types supported.
 */
export type Resource = TextResource | BlobResource;

/**
 * Represents a content item, which can be one of the following types: text, image, audio, or resource.
 *
 * @property {string} type
 *   The type of content. Can be one of the following values:
 *   - "text": Represents a text content item.
 *   - "image": Represents an image content item.
 *   - "audio": Represents an audio content item.
 *   - "resource": Represents a resource content item.
 *
 * @property {string} [text]
 *   The text string associated with the "text" type. Only present when `type` is "text".
 *
 * @property {string} [data]
 *   Base64-encoded data for the "image" or "audio" type. Only present when `type` is "image" or "audio".
 *
 * @property {string} [mimeType]
 *   The MIME type of the "image" or "audio" content. Only present when `type` is "image" or "audio".
 *
 * @property {Resource} [resource]
 *   The resource object associated with the "resource" type. Only present when `type` is "resource".
 */
export type ContentItem = |
    { type: "text"; text: string; }                         |
    { type: "image"; data: string; mimeType: string; }      |
    { type: "audio"; data: string; mimeType: string; }      |
    { type: "resource"; resource: Resource; };

/**
 * Represents the result of invoking a tool that provides content and metadata.
 *
 * @property {Record<string, any>} [_meta] - Optional metadata associated with the result.
 * @property {ContentItem[] | []} content - The main content returned by the tool, represented as an array of `ContentItem` objects.
 * @property {Record<string, any>} [structuredContent] - Optional structured content in a key-value format, providing additional context or data.
 * @property {boolean} [isError] - Indicates whether the result signifies an error state.
 */
export type CallToolResult = {
    _meta?: Record<string, any>
    content: ContentItem[] | []
    structuredContent?: Record<string, any>
    isError?: boolean
};

/**
 * Represents an abstract tool class that provides a structure for creating tools
 * with a schema and the ability to handle requests. This class is intended to be
 * extended by specific tool implementations.
 */
export abstract class Tool {
    /**
     * Represents the server instance or remains undefined if not yet initialized.
     *
     * This variable can hold the reference to the server instance created during
     * the application's lifecycle. It is set to `undefined` by default, and its
     * value should typically be assigned when starting or managing the server.
     *
     * Type:
     * - `Server`: Indicates an initialized server instance.
     */
    public server: Server | undefined = undefined;

    /**
     * Constructs an instance of the class with a given schema.
     *
     * @param schema - The schema object that defines the tool's structure and behavior.
     */
    protected constructor(readonly schema: ToolSchema) {};

    /**
     * Sets the server instance for the current object.
     *
     * @param server - The server instance to be assigned.
     * @return The current object with the updated server.
     */
    setServer(server: Server) {
        this.server = server;
        return this;
    };

    /**
     * Handles the processing of a call tool request and executes the necessary operations.
     *
     * @param request - The input request containing the data to be processed by the call tool.
     * @param extra - An additional parameter containing supplementary data and utilities for handling the request.
     * @return A promise resolving to the result of the call tool operation.
     */
    abstract handle(request: CallToolRequest, extra: RequestHandlerExtra<any, any>): Promise<CallToolResult>;
}
