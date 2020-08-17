/*
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

import hotkeys from "hotkeys-js";

hotkeys("c", function (): void {
    const new_dropdown_trigger = document.querySelector("[data-shortcut-create]");
    if (new_dropdown_trigger instanceof HTMLElement) {
        new_dropdown_trigger.click();
        const option = document.querySelector("[data-shortcut-create-option]");
        if (option instanceof HTMLElement) {
            option.focus();
        }
    }
});

hotkeys("d", function (): void {
    const options = document.querySelectorAll("[data-shortcut-mydashboard-option]");
    if (options.length === 0) {
        return;
    }

    if (options.length === 1 && options[0] instanceof HTMLElement) {
        options[0].click();
        return;
    }

    const new_dropdown_trigger = document.querySelector("[data-shortcut-mydashboard]");
    if (new_dropdown_trigger instanceof HTMLElement) {
        new_dropdown_trigger.click();

        if (options[0] instanceof HTMLElement) {
            options[0].focus();
        }
    }
});

hotkeys("*", function (event): void {
    // Should be hotkeys("?", …),
    // however for unknown reason it does not work (maybe due to shift key?),
    // therefore we're using wildcard as a workaround
    if (event.key !== "?") {
        return;
    }

    const help_trigger = document.getElementById("help-dropdomn-shortcuts");
    if (help_trigger instanceof HTMLElement) {
        help_trigger.click();
    }
});
