// @filename: ResourceList.ts

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


/**
 * Utilities to transform a list of domain items into MCP Resource instances.
 *
 * This module bridges between your application data (typed by core/ResourceContent.ts)
 * and the MCP Resource abstraction (core/Resource.ts). Given a base URI and a list of
 * items, it computes a ResourceSchema per item and returns Resource objects that can be
 * handled by the MCP server.
 */
import {ReadResourceRequest, ReadResourceResult, Resource, ResourceSchema} from "./Resource.js";
import { ResourceContent } from "./ResourceContent.js";

/**
 * Minimal schema information required to build per-item ResourceSchema entries.
 *
 * - uri: Base URI prefix for all items. If it doesn't end with '/', a slash will be added.
 * - mimeType: Optional default MIME type inherited by each generated schema.
 */
export type MinimalResourceSchema = {
    uri: string;
    mimeType?: string;
};

/**
 * Base class that adapts a Resource to serve a given content object with a specific schema.
 *
 * Behavior:
 * - Delegates to Resource.createTextResource when the schema's mimeType is one of
 *   application/json, application/xml, or text/plain; otherwise uses createBlobResource.
 * - Returns a ReadResourceResult with a single content item.
 *
 * Note: The actual serialization is performed by Resource helpers; here we only choose which
 * representation to produce based on mimeType.
 */
class BaseResource extends Resource {
    constructor(protected resourceData: ResourceContent, readonly resourceSchema: ResourceSchema) {
        super({ schema: resourceSchema });
    }

    async handle(request: ReadResourceRequest): Promise<ReadResourceResult> {
        if(this.resourceSchema.mimeType === "application/json" || this.resourceSchema.mimeType === "application/xml" || this.resourceSchema.mimeType === "text/plain") {
            return Promise.resolve({
                contents: [
                    this.createTextResource(this.resourceData)
                ]
            });
        }

        return Promise.resolve({
            contents: [
                this.createBlobResource(this.resourceData)
            ]
        });
    }
}

/**
 * Concrete Resource implementation parametrized by:
 * - C: the source content type (your domain object).
 * - S: the concrete ResourceSchema used for this instance.
 */
class ResourceImpl<C extends ResourceContent, S extends ResourceSchema> extends BaseResource {
    constructor(resourceContent: C, resourceSchema: S) {
        super(resourceContent, resourceSchema);
    }
}

/**
 * Helper to derive Resource instances from a list of domain content objects.
 *
 * Generics:
 * - C: Array of ResourceContent items describing your domain data.
 * - S: MinimalResourceSchema (or extension) that supplies baseUri and optional default mimeType.
 *
 * Instantiation:
 * - Constructor is protected on purpose. Subclass this and expose a factory, or create a
 *   subclass that hardcodes base settings for your use case.
 *
 * How getResources works:
 * - indexKey selects the property from each content item whose value will be appended to the
 *   base URI to form the unique resource URI (e.g., base uri "mcp://items/" + content[id]).
 * - language selects which localized text to use when name/description are provided as maps.
 * - title is taken only if present as a plain string in the item.
 * - mimeType is copied from defaultResourceSchema (if present) to each item schema.
 * - The resulting Resource list can be registered in the ResourceStore.
 *
 * Edge cases and notes:
 * - If base URI does not end with '/', one is inserted to avoid malformed URIs.
 * - If description is an object but missing the selected language, it falls back to undefined.
 * - name must exist; when localized, the chosen language must be present or a runtime undefined
 *   access may occur. Provide both "pt-br" and "en-us" keys when using localized names.
 */
export class ResourcesList<C extends ResourceContent[], S extends MinimalResourceSchema = MinimalResourceSchema> {
    protected constructor(protected resourceContents: C, protected defaultResourceSchema: S) {}

    /**
     * Builds Resource instances for all items in resourceContents.
     *
     * @param indexKey - Property name whose value is appended to the base URI.
     * @param language - Preferred language when content has localized fields. Defaults to 'en-us'.
     * @returns Array of Resource ready to be advertised and read by the MCP server.
     */
    getResources(indexKey: keyof ResourceContent, language: 'pt-br' | 'en-us' = 'en-us'): Resource[] {
        return this.resourceContents.map(content => {
            const name = typeof content.name === 'string' ? content.name : content.name[language as keyof typeof content.name];
            const description = typeof content.description === 'string' ? content.description :
                typeof content.description === 'object' ? content.description[language as keyof typeof content.description] : undefined;
            const title = typeof content.title === 'string' ? content.title : undefined
            const baseUri = this.defaultResourceSchema.uri.endsWith('/') ? this.defaultResourceSchema.uri : this.defaultResourceSchema.uri + '/';
            const uri = `${baseUri}${content[indexKey]}`;
            const mimeType = this.defaultResourceSchema.mimeType || undefined;

            const schema = { uri, name, description, title, mimeType};

            return new ResourceImpl<ResourceContent, ResourceSchema>(content, schema);
        });
    }
}