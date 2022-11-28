/*
 * Copyright (c) Enalean 2022 -  Present. All Rights Reserved.
 *
 *  This file is a part of Tuleap.
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
 *
 */

import mitt from "mitt";
import type { Empty, Item, ListValue } from "../type";
import type { ItemType } from "../type";
import type { NewItemAlternative } from "../type";

export interface DeleteItemEvent {
    item: Item;
}

export interface UpdatePermissionsEvent {
    detail: { current_item: Item };
}

export interface UpdatePropertiesEvent {
    detail: { current_item: Item };
}

export interface NewVersionEvent {
    detail: { current_item: Item };
}

export interface ArchiveSizeWarningModalEvent {
    detail: {
        current_folder_size: number;
        folder_href: string;
        should_warn_osx_user: boolean;
    };
}

export interface MaxArchiveSizeThresholdExceededEvent {
    detail: { current_folder_size: number };
}

export interface UpdateCustomEvent {
    readonly property_short_name: string;
    readonly value: string;
}

export interface ItemHasJustBeenUpdatedEvent {
    readonly item: Item;
}

export type Events = {
    "update-status-property": string;
    "update-status-recursion": boolean;
    "update-title-property": string;
    "update-version-title": string;
    "update-description-property": string;
    "update-owner-property": number;
    "update-changelog-property": string;
    "toggle-quick-look": { details: { item: Item } };
    "show-update-item-properties-modal": UpdatePropertiesEvent;
    "show-update-permissions-modal": UpdatePermissionsEvent;
    "show-create-new-item-version-modal": NewVersionEvent;
    "show-create-new-version-modal-for-empty": { item: Empty; type: ItemType };
    "set-dropdown-shown": { is_dropdown_shown: boolean };
    "show-max-archive-size-threshold-exceeded-modal": MaxArchiveSizeThresholdExceededEvent;
    "show-archive-size-warning-modal": ArchiveSizeWarningModalEvent;
    "show-new-folder-modal": { detail: { parent: Item } };
    "hide-action-menu": void;
    "update-multiple-properties-list-value": {
        detail: { value: number[] | [] | ListValue[] | null; id: string };
    };
    createItem: { item: Item; type: ItemType; from_alternative?: NewItemAlternative };
    deleteItem: DeleteItemEvent;
    "new-item-has-just-been-created": { id: number };
    "item-properties-have-just-been-updated": void;
    "item-permissions-have-just-been-updated": void;
    "item-has-just-been-deleted": void;
    "item-has-just-been-updated": ItemHasJustBeenUpdatedEvent;
    "item-is-being-uploaded": void;
    "update-lock": boolean;
    "update-custom-property": UpdateCustomEvent;
    "properties-recursion-option": { recursion_option: string };
    "update-obsolescence-date-property": string;
    "properties-recursion-list": { detail: { property_list: Array<string> } };
};

export default mitt<Events>();
