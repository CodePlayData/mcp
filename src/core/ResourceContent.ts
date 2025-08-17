// @filename: ResourceContent.ts

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
 * Describes the shape of an application's domain object used to materialize MCP resources.
 *
 * Important: This is not the same as the ResourceContent type declared in Resource.ts, which
 * represents the payload of a ReadResourceResult item. This interface models your source data
 * from which a ResourceSchema will be generated per item by ResourcesList.
 *
 * Conventions and localization:
 * - name can be either a plain string or an object with i18n variants for "pt-br" and "en-us".
 * - description is optional and can also be a string or an i18n map with the same keys.
 *
 * Extensibility:
 * - You may add arbitrary properties. One of those properties is typically used as the indexKey
 *   in ResourcesList.getResources(indexKey, language) and will be appended to the base URI to
 *   produce each resource's unique URI.
 */
export interface ResourceContent {
    /** Display name (plain or localized). */
    name: string | { "pt-br": string, "en-us": string }
    /** Optional description (plain or localized). */
    description?: string | { "pt-br"?: string, "en-us"?: string }
    /** Any extra fields from your domain model; one of them may be used as indexKey. */
    [key: string]: any
}