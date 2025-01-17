/*
 * Copyright (c) Enalean, 2019 - Present. All Rights Reserved.
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

import type {
    FakeItem,
    Folder,
    State,
    ApprovableDocument,
    ItemFile,
    Link,
    Wiki,
    Embedded,
    Item,
} from "../type";
import { isFolder } from "../helpers/type-check-helper";
import Vue from "vue";

export {
    addFileInUploadsList,
    removeFileFromUploadsList,
    emptyFilesUploadsList,
    initializeFolderProperties,
    resetFolderIsUploading,
    toggleCollapsedFolderHasUploadingContent,
    updateFolderProgressbar,
    removeVersionUploadProgress,
    replaceFileWithNewVersion,
    replaceLinkWithNewVersion,
    replaceWikiWithNewVersion,
    replaceEmbeddedFilesWithNewVersion,
};

function addFileInUploadsList(state: State, file: FakeItem): void {
    removeFileFromUploadsList(state, file);
    state.files_uploads_list.unshift(file);
}

function removeVersionUploadProgress(state: State, uploaded_item: FakeItem): void {
    uploaded_item.progress = null;
    uploaded_item.is_uploading_new_version = false;
    removeFileFromUploadsList(state, uploaded_item);
}

function removeFileFromUploadsList(state: State, uploaded_file: FakeItem | Item): void {
    const file_index = state.files_uploads_list.findIndex((file) => file.id === uploaded_file.id);
    if (file_index === -1) {
        return;
    }

    state.files_uploads_list.splice(file_index, 1);

    if (state.files_uploads_list.length === 0) {
        const folder_index = state.folder_content.findIndex(
            (item) => item.id === uploaded_file.parent_id
        );
        if (folder_index === -1) {
            const folder_content_item = state.folder_content[folder_index];
            if (folder_content_item && isFolder(folder_content_item)) {
                toggleCollapsedFolderHasUploadingContent(state, {
                    collapsed_folder: folder_content_item,
                    toggle: false,
                });
            }
        }
    }
}

function emptyFilesUploadsList(state: State): void {
    state.files_uploads_list = [];
}

function initializeFolderProperties(state: State, folder: Folder): void {
    const folder_index = state.folder_content.findIndex((item) => item.id === folder.id);
    if (folder_index === -1) {
        return;
    }

    Vue.set(state.folder_content[folder_index], "is_uploading_in_collapsed_folder", false);
    Vue.set(state.folder_content[folder_index], "progress", null);
}

export interface CollapseFolderPayload {
    collapsed_folder: Folder;
    toggle: boolean;
}

function toggleCollapsedFolderHasUploadingContent(
    state: State,
    payload: CollapseFolderPayload
): void {
    const folder_index = state.folder_content.findIndex(
        (item) => item.id === payload.collapsed_folder.id
    );
    if (folder_index === -1) {
        return;
    }

    payload.collapsed_folder.is_uploading_in_collapsed_folder = payload.toggle;
    payload.collapsed_folder.progress = 0;

    state.folder_content.splice(folder_index, 1, payload.collapsed_folder);
}

function updateFolderProgressbar(state: State, collapsed_folder: Folder): void {
    const folder_index = state.folder_content.findIndex((item) => item.id === collapsed_folder.id);
    if (folder_index === -1) {
        return;
    }

    const children = state.files_uploads_list.reduce(function (progresses: Array<number>, item) {
        if (item.parent_id === collapsed_folder.id && item.progress) {
            progresses.push(item.progress);
        }
        return progresses;
    }, []);

    if (!children.length) {
        return;
    }

    const total = children.reduce((total, item_progress) => total + item_progress, 0);
    collapsed_folder.progress = Math.trunc(total / children.length);

    state.folder_content.splice(folder_index, 1, collapsed_folder);
}

function resetFolderIsUploading(state: State, folder: Folder): void {
    const folder_index = state.folder_content.findIndex((item) => item.id === folder.id);
    if (folder_index === -1) {
        return;
    }

    folder.is_uploading_in_collapsed_folder = false;
    folder.progress = 0;

    state.folder_content.splice(folder_index, 1, folder);
}

export interface ReplaceFilePayload {
    existing_item: ItemFile;
    new_version: ItemFile;
}

function replaceFileWithNewVersion(state: State, payload: ReplaceFilePayload): void {
    payload.existing_item.file_properties = payload.new_version.file_properties;
    payload.existing_item.lock_info = payload.new_version.lock_info;

    replaceApprovalTables(payload.existing_item, payload.new_version);
}

export interface ReplaceLinkPayload {
    existing_item: Link;
    new_version: Link;
}

function replaceLinkWithNewVersion(state: State, payload: ReplaceLinkPayload): void {
    payload.existing_item.link_properties = payload.new_version.link_properties;
    payload.existing_item.lock_info = payload.new_version.lock_info;

    replaceApprovalTables(payload.existing_item, payload.new_version);
}

export interface ReplaceWikiPayload {
    existing_item: Wiki;
    new_version: Wiki;
}

function replaceWikiWithNewVersion(state: State, payload: ReplaceWikiPayload): void {
    payload.existing_item.lock_info = payload.new_version.lock_info;
    payload.existing_item.wiki_properties = payload.new_version.wiki_properties;
}

export interface ReplaceEmbeddedPayload {
    existing_item: Embedded;
    new_version: Embedded;
}

function replaceEmbeddedFilesWithNewVersion(state: State, payload: ReplaceEmbeddedPayload): void {
    payload.existing_item.lock_info = payload.new_version.lock_info;
    replaceApprovalTables(payload.existing_item, payload.new_version);
}

function replaceApprovalTables(
    existing_item: ApprovableDocument,
    new_version: ApprovableDocument
): void {
    existing_item.has_approval_table = new_version.has_approval_table;
    existing_item.is_approval_table_enabled = new_version.is_approval_table_enabled;
    existing_item.approval_table = new_version.approval_table;
}
