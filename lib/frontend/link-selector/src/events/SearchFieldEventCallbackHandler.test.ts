/*
 * Copyright (c) Enalean, 2022 - present. All Rights Reserved.
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

import { describe, it, expect, beforeEach, vi } from "vitest";
import { SearchFieldEventCallbackHandler } from "./SearchFieldEventCallbackHandler";
import type { LinkSelectorSearchFieldCallback } from "../type";

describe("SearchFieldEventCallbackHandler", () => {
    let search_field_element: HTMLInputElement, callback: LinkSelectorSearchFieldCallback;

    const init = (callback: LinkSelectorSearchFieldCallback): void => {
        const handler = SearchFieldEventCallbackHandler(search_field_element, callback);
        return handler.init();
    };

    beforeEach(() => {
        const doc = document.implementation.createHTMLDocument();
        search_field_element = doc.createElement("input");

        callback = vi.fn();
        vi.useFakeTimers();

        init(callback);
    });

    it("should execute the callback after 250ms after the users has stopped typing in the search_field_element", () => {
        search_field_element.value = "a query";
        search_field_element.dispatchEvent(new Event("input"));

        vi.advanceTimersByTime(249); // 249 ms elapsed

        expect(callback).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1); // 250 ms elapsed

        expect(callback).toHaveBeenCalledWith("a query");
    });

    it("should not execute the callback when the user it still typing", () => {
        ["nana ", "nana ", "nana ", "BATMAN"].forEach((query) => {
            search_field_element.value += query;
            search_field_element.dispatchEvent(new Event("input"));
        });

        vi.advanceTimersByTime(250);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith("nana nana nana BATMAN");
    });

    it("When the query has been cleared, then it should trigger the callback immediately", () => {
        search_field_element.value = "";
        search_field_element.dispatchEvent(new Event("input"));

        vi.advanceTimersByTime(0); // 0 ms elapsed

        expect(callback).toHaveBeenCalledWith("");
    });
});
