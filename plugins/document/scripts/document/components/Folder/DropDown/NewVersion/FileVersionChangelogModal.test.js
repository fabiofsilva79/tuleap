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

import { shallowMount } from "@vue/test-utils";
import localVue from "../../../../helpers/local-vue";
import FileVersionChangelogModal from "./FileVersionChangelogModal.vue";
import ItemUpdateProperties from "./PropertiesForUpdate/ItemUpdateProperties.vue";
import { createStoreMock } from "@tuleap/vuex-store-wrapper-jest";
import * as tlp_modal from "@tuleap/tlp-modal";
import emitter from "../../../../helpers/emitter";

describe("FileVersionChangelogModal", () => {
    let store;

    function getWrapper() {
        return shallowMount(FileVersionChangelogModal, {
            localVue,
            propsData: {
                updatedFile: { id: 12, title: "How to.pdf", properties: [] },
                droppedFile: new File([], "How to (updated).pdf"),
            },
            mocks: { $store: store },
        });
    }

    beforeEach(() => {
        store = createStoreMock({}, { error: {} });

        jest.spyOn(tlp_modal, "createModal").mockReturnValue({
            addEventListener: () => {},
            show: () => {},
            hide: () => {},
        });
    });

    it("Create a new version of the document with the provided changelog and titles if any.", () => {
        const wrapper = getWrapper();
        wrapper.setData({
            version: {
                title: "Added the [contributions] section",
                changelog: "Now, it mentions how to contribute to the project.",
            },
        });

        wrapper.get("form").trigger("submit");

        expect(wrapper.vm.$store.dispatch).toHaveBeenCalledWith("createNewFileVersionFromModal", [
            { id: 12, title: "How to.pdf", properties: [] },
            expect.any(File),
            "Added the [contributions] section",
            "Now, it mentions how to contribute to the project.",
            false,
            null,
        ]);
    });

    it("Create a new version of the document with the new approval table.", () => {
        const wrapper = getWrapper();
        wrapper.setData({
            version: {
                title: "Added the [contributions] section",
                changelog: "Now, it mentions how to contribute to the project.",
            },
        });

        wrapper
            .findComponent(ItemUpdateProperties)
            .vm.$emit("approval-table-action-change", "reset");
        wrapper.get("form").trigger("submit");

        expect(wrapper.vm.$store.dispatch).toHaveBeenCalledWith("createNewFileVersionFromModal", [
            { id: 12, title: "How to.pdf", properties: [] },
            expect.any(File),
            "Added the [contributions] section",
            "Now, it mentions how to contribute to the project.",
            false,
            "reset",
        ]);
    });

    it("Updates the version title", async () => {
        const wrapper = getWrapper();

        expect(wrapper.vm.$data.version.title).toBe("");
        emitter.emit("update-version-title", "A title");

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.$data.version.title).toBe("A title");
    });

    it("Updates the changelog", async () => {
        const wrapper = getWrapper();

        expect(wrapper.vm.$data.version.changelog).toBe("");
        emitter.emit("update-changelog-property", "A changelog");

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.$data.version.changelog).toBe("A changelog");
    });

    it("Updates the lock", async () => {
        const wrapper = getWrapper();

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.$data.version.is_file_locked).toBeUndefined();
        emitter.emit("update-lock", true);

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.$data.version.is_file_locked).toBe(true);
    });
});
