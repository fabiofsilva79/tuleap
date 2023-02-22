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

import type { FileDiffWidget } from "../../src/app/file-diff/types";
import type {
    FileLineHandle,
    LineHandleWithWidgets,
} from "../../src/app/file-diff/types-codemirror-overriden";
import type { LineWidgetWithNode } from "../../src/app/file-diff/types-codemirror-overriden";

const noop = (): void => {
    // Do nothing
};

const line_handle_base = {
    text: "",
    on: noop,
    off: noop,
};

const line_widget_base = {
    clear: noop,
    changed: noop,
    on: noop,
    off: noop,
};

const buildCollectionOfLineWidgetsWithNode = (widgets: FileDiffWidget[]): LineWidgetWithNode[] =>
    widgets.map((widget) => ({ ...line_widget_base, node: widget }));

export const FileLineHandleStub = {
    buildLineHandleWithWidgets: (
        widgets: FileDiffWidget[],
        height = 20
    ): LineHandleWithWidgets => ({
        ...line_handle_base,
        widgets: buildCollectionOfLineWidgetsWithNode(widgets),
        height,
    }),
    buildLineHandleWithNoWidgets: (height = 20): FileLineHandle => ({
        ...line_handle_base,
        height,
    }),
};
