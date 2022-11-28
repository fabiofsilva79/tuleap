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
 *  along with Tuleap. If not, see <http://www.gnu.org/licenses/>.
 */

import type { Wrapper } from "@vue/test-utils";
import { shallowMount } from "@vue/test-utils";
import localVue from "../../../../helpers/local-vue";
import { createStoreMock } from "@tuleap/vuex-store-wrapper-jest";
import type { Modal } from "@tuleap/tlp-modal";
import * as tlp_modal from "@tuleap/tlp-modal";
import FileCreationModal from "./FileCreationModal.vue";
import { TYPE_FILE } from "../../../../constants";
import type { State } from "../../../../type";

describe("FileCreationModal", () => {
    const add_event_listener = jest.fn();
    const modal_show = jest.fn();
    const remove_backdrop = jest.fn();

    function getWrapper(dropped_file: File, has_modal_error: boolean): Wrapper<FileCreationModal> {
        const state = {
            current_folder: { id: 13, title: "Limited Edition" },
            error: { has_modal_error },
            configuration: { is_status_property_used: false, filename_pattern: "" },
        } as unknown as State;
        const store_option = { state };
        const store = createStoreMock(store_option);

        return shallowMount(FileCreationModal, {
            localVue,
            propsData: {
                parent: { id: 12, title: "Dacia" },
                droppedFile: dropped_file,
            },
            mocks: { $store: store },
        });
    }

    beforeEach(() => {
        jest.spyOn(tlp_modal, "createModal").mockImplementation(() => {
            return {
                addEventListener: add_event_listener,
                show: modal_show,
                removeBackdrop: remove_backdrop,
            } as unknown as Modal;
        });
    });

    it("does not close the modal if there is an error during the creation", async () => {
        const dropped_file = new File([], "Duster Pikes Peak.lol");
        const wrapper = getWrapper(dropped_file, true);
        await wrapper.setData({
            item: {
                title: "Faaaast",
                description: "It's fast",
                type: TYPE_FILE,
                file_properties: {
                    file: dropped_file,
                },
                status: "Approved",
            },
        });

        const expected_item = {
            title: "Faaaast",
            description: "It's fast",
            type: TYPE_FILE,
            file_properties: {
                file: dropped_file,
            },
            status: "Approved",
        };
        wrapper.get("form").trigger("submit");

        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$store.dispatch).toHaveBeenCalledWith("createNewItem", [
            expected_item,
            { id: 12, title: "Dacia" },
            { id: 13, title: "Limited Edition" },
        ]);

        expect(remove_backdrop).not.toHaveBeenCalled();
        expect(wrapper.emitted()).not.toHaveProperty("close-file-creation-modal");
    });

    it("Creates a new file document without error and hide the modal after creation", async () => {
        const dropped_file = new File([], "Duster Pikes Peak.lol");
        const wrapper = getWrapper(dropped_file, false);
        await wrapper.setData({
            item: {
                title: "Faaaast",
                description: "It's fast",
                type: TYPE_FILE,
                file_properties: {
                    file: dropped_file,
                },
                status: "Approved",
            },
        });

        const expected_item = {
            title: "Faaaast",
            description: "It's fast",
            type: TYPE_FILE,
            file_properties: {
                file: dropped_file,
            },
            status: "Approved",
        };
        wrapper.get("form").trigger("submit");

        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$store.dispatch).toHaveBeenCalledWith("createNewItem", [
            expected_item,
            { id: 12, title: "Dacia" },
            { id: 13, title: "Limited Edition" },
        ]);
        expect(wrapper.emitted()).toHaveProperty("close-file-creation-modal");
    });
});
