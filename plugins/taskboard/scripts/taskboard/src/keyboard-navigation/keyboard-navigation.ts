/**
 * Copyright (c) Enalean, 2021-Present. All Rights Reserved.
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

import type { Shortcut, ShortcutsGroup } from "@tuleap/keyboard-shortcuts";
import { addShortcutsGroup } from "@tuleap/keyboard-shortcuts";

import type { ArrowKey, GettextProvider } from "../type";
import { DOWN, UP, RIGHT, LEFT } from "../type";
import { moveFocus } from "./move-focus";

export class KeyboardShortcuts {
    private navigation_shortcuts_group: ShortcutsGroup | null = null;
    private moving_shortcuts_group: ShortcutsGroup | null = null;
    private readonly gettextCatalog: GettextProvider;
    private readonly doc: Document;

    constructor(doc: Document, gettextCatalog: GettextProvider) {
        this.doc = doc;
        this.gettextCatalog = gettextCatalog;
    }

    setNavigation(): void {
        this.navigation_shortcuts_group = createNavigationShortcutsGroup(
            this.doc,
            this.gettextCatalog
        );
        addShortcutsGroup(this.doc, this.navigation_shortcuts_group);
    }

    setCardsShifting(handler: (event: KeyboardEvent, direction: ArrowKey) => void): void {
        this.moving_shortcuts_group = createMovingShortcutsGroup(
            this.doc,
            this.gettextCatalog,
            handler
        );
        addShortcutsGroup(this.doc, this.moving_shortcuts_group);
    }
}

export function createNavigationShortcutsGroup(
    doc: Document,
    gettext_provider: GettextProvider
): ShortcutsGroup {
    const next: Shortcut = {
        keyboard_inputs: "k,down",
        displayed_inputs: "k,↓",
        description: gettext_provider.$gettext("Move from one swimlane or card to the next one"),
        handle: (): void => {
            moveFocus(doc, DOWN);
        },
    };

    const previous: Shortcut = {
        keyboard_inputs: "j,up",
        displayed_inputs: "j,↑",
        description: gettext_provider.$gettext(
            "Move from one swimlane or card to the previous one"
        ),
        handle: (): void => {
            moveFocus(doc, UP);
        },
    };

    const right: Shortcut = {
        keyboard_inputs: "l,right",
        displayed_inputs: "l,→",
        description: gettext_provider.$gettext("Move to the first card of right cell"),
        handle: (): void => {
            moveFocus(doc, RIGHT);
        },
    };

    const left: Shortcut = {
        keyboard_inputs: "h,left",
        displayed_inputs: "h,←",
        description: gettext_provider.$gettext("Move to the first card of left cell"),
        handle: (): void => {
            moveFocus(doc, LEFT);
        },
    };

    return {
        title: gettext_provider.$gettext("Navigation"),
        shortcuts: [next, previous, right, left],
    };
}

export function createMovingShortcutsGroup(
    doc: Document,
    gettext_provider: GettextProvider,
    handler: (event: KeyboardEvent, direction: ArrowKey) => void
): ShortcutsGroup {
    const move_right: Shortcut = {
        keyboard_inputs: "shift+right,shift+l",
        displayed_inputs: "Shift+l,Shift+→",
        description: gettext_provider.$gettext("Move card to the right cell"),
        handle: (event): void => {
            handler(event, RIGHT);
        },
    };

    const move_left: Shortcut = {
        keyboard_inputs: "shift+left,shift+h",
        displayed_inputs: "Shift+h,Shift+←",
        description: gettext_provider.$gettext("Move card to the left cell"),
        handle: (event): void => {
            handler(event, LEFT);
        },
    };

    return {
        title: gettext_provider.$gettext("Moving cards"),
        shortcuts: [move_right, move_left],
    };
}