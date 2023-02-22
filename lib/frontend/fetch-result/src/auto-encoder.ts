/*
 * Copyright (c) Enalean, 2022-Present. All Rights Reserved.
 *
 * This file is a part of Tuleap.
 *
 * Tuleap is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Tuleap is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Tuleap. If not, see <http://www.gnu.org/licenses/>.
 */

import type { EncodedURI } from "./uri-string-template";
import { uri, rawUri } from "./uri-string-template";

export interface AutoEncodedParameters {
    readonly [key: string]: string | number | boolean;
}

const getSearchParams = (params: AutoEncodedParameters): string => {
    const entries = Object.entries(params);
    if (entries.length === 0) {
        return "";
    }
    const search_params = entries.reduce((accumulator, [key, value]) => {
        accumulator.append(key, String(value));
        return accumulator;
    }, new URLSearchParams());

    return "?" + String(search_params);
};

export const getURI = (base_uri: EncodedURI, params: AutoEncodedParameters = {}): EncodedURI =>
    uri`${base_uri}${rawUri(getSearchParams(params))}`;
