/**
 * Copyright (c) Enalean, 2020 - present. All Rights Reserved.
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

import type { SpyInstance } from "vitest";
import { describe, beforeEach, afterEach, it, expect, vi } from "vitest";
import { DropdownManager } from "./DropdownManager";
import { BaseComponentRenderer } from "../renderers/BaseComponentRenderer";
import type { ScrollingManager } from "../events/ScrollingManager";
import type { FieldFocusManager } from "../navigation/FieldFocusManager";

describe("dropdown-manager", () => {
    let doc: Document,
        wrapper: HTMLElement,
        link_selector: Element,
        dropdown: HTMLElement,
        list: Element,
        selection_container: HTMLElement,
        dropdown_manager: DropdownManager,
        scroll_manager: ScrollingManager,
        field_focus_manager: FieldFocusManager,
        ResizeObserverSpy: SpyInstance,
        disconnect: SpyInstance;

    beforeEach(() => {
        disconnect = vi.fn();
        window.ResizeObserver = ResizeObserverSpy = vi.fn().mockImplementation(() => {
            return {
                observe: vi.fn(),
                disconnect,
            };
        });
        vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback): number => {
            callback(1);
            return 1;
        });

        doc = document.implementation.createHTMLDocument();
        const source_select_box = document.createElement("select");
        const {
            wrapper_element,
            link_selector_element,
            dropdown_element,
            dropdown_list_element,
            selection_element,
        } = new BaseComponentRenderer(doc, source_select_box, "", "").renderBaseComponent();

        scroll_manager = {
            lockScrolling: vi.fn(),
            unlockScrolling: vi.fn(),
        } as unknown as ScrollingManager;

        field_focus_manager = {
            applyFocusOnLinkSelector: vi.fn(),
            applyFocusOnSearchField: vi.fn(),
        } as unknown as FieldFocusManager;

        wrapper = wrapper_element;
        link_selector = link_selector_element;
        dropdown = dropdown_element;
        list = dropdown_list_element;
        selection_container = selection_element;

        dropdown_manager = new DropdownManager(
            doc,
            wrapper_element,
            link_selector,
            dropdown,
            list,
            selection_element,
            scroll_manager,
            field_focus_manager
        );
    });

    afterEach(() => {
        dropdown_manager.destroy();
    });

    it("opens the dropdown by appending a 'shown' class to the dropdown element, focuses the search input and moves it under the link selector", () => {
        expect(ResizeObserverSpy).toHaveBeenCalled();
        dropdown_manager.openLinkSelector();

        expect(link_selector.classList.contains("link-selector-with-open-dropdown")).toBe(true);
        expect(dropdown.classList.contains("link-selector-dropdown-shown")).toBe(true);
        expect(list.getAttribute("aria-expanded")).toBe("true");
        expect(field_focus_manager.applyFocusOnSearchField).toHaveBeenCalled();
        expect(scroll_manager.lockScrolling).toHaveBeenCalled();
        expect(dropdown.style.top.length).toBeGreaterThan(0);
        expect(dropdown.style.left.length).toBeGreaterThan(0);
        expect(dropdown.style.width.length).toBeGreaterThan(0);
    });

    it("closes the dropdown by removing the 'shown' class to the dropdown element", () => {
        expect(ResizeObserverSpy).toHaveBeenCalled();
        dropdown_manager.openLinkSelector();
        dropdown_manager.closeLinkSelector();

        expect(link_selector.classList.contains("link-selector-with-open-dropdown")).toBe(false);
        expect(dropdown.classList.contains("link-selector-dropdown-shown")).toBe(false);
        expect(list.getAttribute("aria-expanded")).toBe("false");
        expect(scroll_manager.unlockScrolling).toHaveBeenCalled();
        expect(field_focus_manager.applyFocusOnLinkSelector).toHaveBeenCalled();
    });

    it("should not open the link selector if it's already open", () => {
        expect(ResizeObserverSpy).toHaveBeenCalled();
        dropdown.classList.add("link-selector-dropdown-shown");

        vi.spyOn(dropdown.classList, "add");
        dropdown_manager.openLinkSelector();

        expect(dropdown.classList.add).not.toHaveBeenCalled();
        expect(scroll_manager.lockScrolling).not.toHaveBeenCalled();
    });

    it("should not close the link selector if it's already closed", () => {
        expect(ResizeObserverSpy).toHaveBeenCalled();
        vi.spyOn(dropdown.classList, "remove");
        dropdown_manager.closeLinkSelector();

        expect(dropdown.classList.remove).not.toHaveBeenCalled();
        expect(scroll_manager.unlockScrolling).not.toHaveBeenCalled();
    });

    it("sets the aria-expanded attribute on the selection element when needed", () => {
        expect(ResizeObserverSpy).toHaveBeenCalled();
        selection_container.setAttribute("aria-expanded", "false");
        dropdown_manager.openLinkSelector();
        expect(selection_container.getAttribute("aria-expanded")).toBe("true");
        dropdown_manager.closeLinkSelector();
        expect(selection_container.getAttribute("aria-expanded")).toBe("false");
    });

    it("should unlock scrolling and stop observing items resize", () => {
        expect(ResizeObserverSpy).toHaveBeenCalled();
        dropdown_manager.destroy();

        expect(disconnect).toHaveBeenCalled();
        expect(scroll_manager.unlockScrolling).toHaveBeenCalled();
    });

    describe("dropdown positioning", () => {
        function getDropdownManagerWithSizedElements(
            document_client_height: number
        ): DropdownManager {
            const mocked_doc = {
                documentElement: {
                    clientHeight: document_client_height,
                },
                body: document.createElement("body"),
            } as unknown as Document;

            return new DropdownManager(
                mocked_doc,
                wrapper,
                link_selector,
                dropdown,
                list,
                selection_container,
                scroll_manager,
                field_focus_manager
            );
        }

        beforeEach(() => {
            vi.spyOn(dropdown, "getBoundingClientRect").mockReturnValue({
                height: 250,
            } as DOMRect);
            vi.spyOn(wrapper, "getBoundingClientRect").mockReturnValue({
                left: 60,
                bottom: 900,
                width: 250,
                height: 40,
            } as DOMRect);
        });

        it("should place the dropdown below the link selector", () => {
            const dropdown_manager = getDropdownManagerWithSizedElements(1200);

            dropdown_manager.openLinkSelector();

            expect(link_selector.classList.contains("link-selector-with-dropdown-above")).toBe(
                false
            );
            expect(dropdown.classList.contains("link-selector-dropdown-above")).toBe(false);
            expect(dropdown.style.left).toBe("60px");
            expect(dropdown.style.width).toBe("250px");
            expect(dropdown.style.top).toBe("900px"); // Below the wrapper

            dropdown_manager.destroy();
        });

        it("should place the dropdown on top of the link selector when there is not enough room below it", () => {
            const dropdown_manager = getDropdownManagerWithSizedElements(1000);

            dropdown_manager.openLinkSelector();

            expect(link_selector.classList.contains("link-selector-with-dropdown-above")).toBe(
                true
            );
            expect(dropdown.classList.contains("link-selector-dropdown-above")).toBe(true);
            expect(dropdown.style.left).toBe("60px");
            expect(dropdown.style.width).toBe("250px");
            expect(dropdown.style.top).toBe("610px"); // Above the wrapper

            dropdown_manager.destroy();
        });
    });
});
