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

import { describe, it, expect } from "vitest";
import type { GroupOfItems } from "../items/GroupCollection";
import { getGroupId } from "./group-id-helper";

describe(`group-id-helper`, () => {
    it(`builds a group ID from a group label`, () => {
        const group: GroupOfItems = {
            label: "Matching Items",
            icon: "",
            empty_message: "irrelevant",
            items: [],
            is_loading: false,
        };
        expect(getGroupId(group)).toBe("matchingitems");
    });
});
