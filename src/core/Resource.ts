// @filename: Resource.ts

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
import { ResourceStore } from "../app/ResourceStore.js";

/**
 * Represents a notification type for when a resource is updated.
 *
 * The `ResourceUpdatedNotification` type defines the structure of notification data that is emitted
 * when a specific resource is updated. It includes the HTTP method used for the notification, the
 * URI of the resource, and optional parameters that may contain metadata and additional information.
 *
 * Properties:
 * - `method`: Specifies the method type, which is always `notifications/resources/updated` for this notification.
 * - `uri`: A string representing the URI of the updated resource.
 * - `params`: Optional object containing additional data or context related to the resource.
 *   - `uri`: URI string identifying the specific sub-resource or related item.
 *   - `_meta`: Optional metadata object for storing additional information in a key-value format.
 *   - Additional dynamic properties can be included to capture resource-specific details.
 */
export type ResourceUpdatedNotification = {
    method: 'notifications/resources/updated';
    uri: string;
    params?: {
        uri: string;
        _meta?: Record<string, any>;
        [key: string]: any;
    };
};

/**
 * Represents the possible types of owners.
 *
 * This type can be one of the following:
 * - 'user': Indicates the owner is a user.
 * - 'assistant': Indicates the owner is an assistant.
 */
export type Owners = 'user' | 'assistant';

/**
 * Annotations object to describe metadata associated with an entity.
 *
 * @property [audience] - Specifies the target audience or owners to whom the annotation applies.
 * @property [priority] - Indicates the priority level associated with the annotation, where a lower number represents higher priority.
 * @property [lastModified] - ISO 8601 formatted timestamp indicating the last modification date of the annotation.
 */
export type Annotations = {
    audience?: Owners[],
    priority?: number,
    lastModified?: string
};

/**
 * Represents the schema definition for a resource in the MCP protocol.
 *
 * @property uri - The unique identifier/location of the resource
 * @property name - The name of the resource
 * @property [title] - Optional title of the resource
 * @property [description] - Optional description of the resource
 * @property [mimeType] - Optional MIME type of the resource content
 * @property [size] - Optional size of the resource in bytes
 * @property [annotations] - Optional metadata annotations for the resource
 * @property [key: string] - Additional custom properties that may be present
 */
export type ResourceSchema = {
    uri: string
    name: string
    title?: string
    description?: string
    mimeType?: string
    size?: number
    annotations?: Annotations
    [key: string]: unknown
};

/**
 * Represents a request to read a resource in a system.
 *
 * This type defines the structure of a request payload that specifies the
 * details required for reading a resource. It includes the method identifier,
 * parameters for the resource being read, and optional metadata.
 *
 * Properties:
 * - `method`: A fixed string indicating the type of request. For this request,
 *   the value is "resources/read".
 * - `params`: An object containing the parameters necessary for the resource read
 *   operation. It includes the following:
 *   - `uri`: A string representing the unique identifier or location of the resource
 *     to be read.
 *   - `_meta`: An optional object containing metadata related to the request.
 *     - `progressToken`: An optional token, represented as a string or number, which
 *       may be used to track the progress or identify the operation.
 *   - `[key: string]`: Permits additional unknown properties to be included in the
 *     parameter object.
 */
export type ReadResourceRequest = {
    method: "resources/read"
    params: {
        uri: string
        _meta?: {
            progressToken?: string | number
        }
        [key: string]: unknown
    }
};

/**
 * Represents the content of a resource, including its URI and optional MIME type.
 *
 * This type is commonly used for managing resources with identifiable URIs and
 * associated MIME type information when applicable.
 *
 * @property uri - The URI of the resource.
 * @property [mimeType] - The optional MIME type of the resource, indicating the data format.
 */
export type ResourceContent = {
    uri: string
    mimeType?: string
};

/**
 * Represents the content of a textual resource by extending the base ResourceContent type.
 * It includes additional metadata properties, such as name, URI template, description,
 * MIME type, annotations, and the actual text content.
 *
 * @property [name] - Optional. The name of the text resource.
 * @property [uriTemplate] - Optional. A URI template associated with the resource.
 * @property [description] - Optional. A brief description of the text resource.
 * @property [mimeType] - Optional. The MIME type of the resource's text content.
 * @property [annotations] - Optional. An object representing additional metadata or annotations.
 * @property text - The actual textual content of the resource.
 */
export type TextResourceContent = ResourceContent & {
    name?: string
    uriTemplate?: string
    description?: string
    mimeType?: string
    annotations?: Annotations
    text: string
};

/**
 * Represents blob resource content, extending the properties of the ResourceContent type
 * with additional attributes specifically relevant to blob data.
 *
 * @property [name] - An optional name for the resource.
 * @property [uriTemplate] - An optional URI template associated with the resource.
 * @property [description] - An optional description of the resource.
 * @property [mimeType] - An optional MIME type describing the format of the blob.
 * @property [annotations] - An optional set of annotations for metadata or additional information.
 * @property blob - The binary data of the resource in string format.
 */
export type BlobResourceContent = ResourceContent & {
    name?: string
    uriTemplate?: string
    description?: string
    mimeType?: string
    annotations?: Annotations
    blob: string
};

/**
 * Represents a resource content item that can either be textual or binary data.
 *
 * ResourceContentItem serves as a union type that can have one of the following
 * types:
 * - `TextResourceContent` for representing textual content.
 * - `BlobResourceContent` for representing binary content.
 *
 * This allows handling and storing of resource content in varying formats within
 * the same type.
 */
export type ResourceContentItem = TextResourceContent | BlobResourceContent;

/**
 * Represents the result of a resource read operation.
 *
 * @property [_meta] - Optional metadata associated with the resource read result
 * @property contents - Array of resource content items that can be either text or blob-based
 */
export type ReadResourceResult = {
    _meta?: Record<string, any>
    contents: Array<ResourceContentItem>
};

/**
 * Represents a resource template with properties and metadata to describe it.
 *
 * @property name - The name of the resource template. **Will be used as tokens in prompt**.
 * @property uriTemplate - The URI template associated with the resource.
 * @property [description] - An optional description of the resource template. **Will be used as tokens in prompt**.
 * @property [mimeType] - An optional MIME type information for the resource.
 * @property [annotations] - Optional annotations providing additional metadata.
 * @property [p] - Additional unknown properties identified by string keys.
 */
export type ResourceTemplate = {
    [p: string]: unknown
    name: string
    uriTemplate: string
    description?: string
    mimeType?: string
    annotations?: Annotations
};

/**
 * Represents the input for a resource, which can be defined either by a schema
 * or a template.
 *
 * - When a schema is provided, it describes the structure and constraints of the resource.
 * - When a template is provided, it serves as a predefined configuration or blueprint for the resource.
 *
 * This type ensures that one and only one of the two options (schema or template) is supplied.
 *
 * Union Types:
 * - `schema`: Defines the resource using a `ResourceSchema`.
 * - `template`: Defines the resource using a `ResourceTemplate`.
 */
type ResourceInput = {
    schema: ResourceSchema
} | {
    template: ResourceTemplate
};

/**
 * Abstract class representing a generic resource. This class provides
 * shared functionalities for handling and storing resources, such as
 * creating text and blob content, managing base64 conversions, and
 * notifying updates.
 */
export abstract class Resource {
    /**
     * Represents the server instance that may be either a defined `Server` object or `undefined`.
     * This variable is typically used to store the instance of a server, which can later be initialized
     * or updated as needed within the application.
     */
    public server: Server | undefined = undefined;
    /**
     * Represents the store containing resource data.
     * It is an optional property that may or may not be present.
     */
    protected store?: ResourceStore;

    /**
     * Constructs a new instance of the class with the specified input.
     * The constructor is protected, which means it can only be called by the class itself
     * or its subclasses.
     *
     * @param input - The input resource required to initialize the instance.
     * @return Does not return a value.
     */
    protected constructor(readonly input: ResourceInput) {};

    /**
     * Creates a text-based resource by serializing the provided content and
     * integrating it with a predefined schema.
     *
     * @param content The content to be serialized into text format.
     * @return A TextResourceContent object containing the serialized text and
     *         associated schema information.
     */
    protected createTextResource(content: any): TextResourceContent {
        const text = JSON.stringify(content);
        return {
            ...(this.input as { schema: ResourceSchema }).schema,
            text
        }
    };

    /**
     * Converts the given content into a BlobResourceContent object containing a base64-encoded blob and resource schema.
     *
     * @param content - The content to be converted into a blob.
     * @return The constructed BlobResourceContent object with the base64-encoded blob and schema.
     */
    protected createBlobResource(content: any): BlobResourceContent {
        const blob = this.convertToBase64(content);
        return {
            ...(this.input as { schema: ResourceSchema }).schema,
            blob
        }
    };

    /**
     * Notifies the store about an update to a resource, if the store and input schema exist.
     *
     * @param [updates] - Optional updates to be passed to the store.
     * @return This method does not return a value.
     */
    protected notifyUpdate(updates?: any) {
        if (this.store && 'schema' in this.input) {
            this.store.notifyResourceUpdate(this.input.schema.uri, updates);
        }
    }

    /**
     * Checks whether the provided string is a valid Base64-encoded string.
     *
     * @param str - The string to validate as Base64-encoded.
     * @return Returns true if the string is a valid Base64-encoded string, otherwise false.
     */
    private isBase64(str: string): boolean {
        try {
            return Buffer.from(str, 'base64').toString('base64') === str;
        } catch (e) {
            return false;
        }
    };

    /**
     * Converts the provided content to a Base64-encoded string. If the content is already
     * a valid Base64 string, it is returned as is.
     *
     * @param content - The content to be converted into a Base64-encoded string. This can be a string, Buffer, or an object.
     * @return The Base64-encoded string representation of the provided content.
     */
    private convertToBase64(content: any): string {
        if (typeof content === 'string' && this.isBase64(content)) {
            return content;
        }
        if (typeof content === 'string') {
            return Buffer.from(content).toString('base64');
        }
        if (Buffer.isBuffer(content)) {
            return content.toString('base64');
        }
        if (typeof content === 'object') {
            return Buffer.from(JSON.stringify(content)).toString('base64');
        }
        return Buffer.from(String(content)).toString('base64');
    };

    /**
     * Sets the server instance to be used.
     *
     * @param server - The server instance to set.
     * @return Returns the current instance for method chaining.
     */
    setServer(server: Server) {
        this.server = server;
        return this;
    };

    /**
     * Sets the store property for the current instance.
     *
     * @param store - The resource store to be set.
     * @return The current instance for method chaining.
     */
    setStore(store: ResourceStore) {
        this.store = store;
        return this;
    }

    /**
     * Handles a read resource request and processes the given request data.
     *
     * @param request - The request object containing details for reading the resource.
     * @param extra - Additional handler-specific parameters or data.
     * @return A promise that resolves to the result of the read resource operation.
     */
    handle?(request: ReadResourceRequest, extra: RequestHandlerExtra<any, any>): Promise<ReadResourceResult>;
}
