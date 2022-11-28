/*
 * Copyright (c) Enalean, 2019 - present. All Rights Reserved.
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
 * along with Tuleap. If not, see http://www.gnu.org/licenses/.
 *
 */

import { shallowMount } from "@vue/test-utils";
import localVue from "../../../../helpers/local-vue";
import emitter from "../../../../helpers/emitter";

import UpdatePropertiesModal from "./UpdatePropertiesModal.vue";
import { createStoreMock } from "@tuleap/vuex-store-wrapper-jest";
import * as tlp_modal from "@tuleap/tlp-modal";

describe("UpdatePropertiesModal", () => {
    let factory, store;

    beforeEach(() => {
        const general_store = {
            state: {
                current_folder: {
                    id: 42,
                    title: "My current folder",
                    properties: [
                        {
                            short_name: "title",
                            name: "title",
                            list_value: "My current folder",
                            is_multiple_value_allowed: false,
                            type: "text",
                            is_required: false,
                        },
                        {
                            short_name: "custom property",
                            name: "custom",
                            value: "value",
                            is_multiple_value_allowed: false,
                            type: "text",
                            is_required: false,
                        },
                    ],
                },
                configuration: { project_id: 102, is_status_property_used: true },
            },
        };

        store = createStoreMock(general_store, { error: { has_modal_error: false } });

        factory = (props = {}) => {
            return shallowMount(UpdatePropertiesModal, {
                localVue,
                mocks: { $store: store },
                propsData: { ...props },
            });
        };

        jest.spyOn(tlp_modal, "createModal").mockReturnValue({
            addEventListener: () => {},
            show: () => {},
            hide: () => {},
        });
    });

    it("Updates owner", () => {
        const item = {
            id: 7,
            type: "folder",
            description: "A custom description",
            owner: {
                id: 101,
            },
            properties: [
                {
                    short_name: "status",
                    list_value: [
                        {
                            id: 103,
                        },
                    ],
                },
            ],
        };

        const wrapper = factory({ item });

        expect(wrapper.vm.item_to_update.owner.id).toBe(101);

        emitter.emit("update-owner-property", 200);
        expect(wrapper.vm.item_to_update.owner.id).toBe(200);
    });

    it("Transform item property rest representation", () => {
        store.state.properties = {
            has_loaded_properties: false,
        };

        const properties_to_update = {
            short_name: "field_1234",
            list_value: [
                {
                    id: 103,
                    value: "my custom displayed value",
                },
            ],
            type: "list",
            is_multiple_value_allowed: false,
        };

        const item = {
            id: 7,
            type: "folder",
            properties: [
                {
                    short_name: "status",
                    list_value: [
                        {
                            id: 103,
                        },
                    ],
                },
                properties_to_update,
            ],
        };

        const properties_in_rest_format = {
            short_name: "field_1234",
            list_value: null,
            type: "list",
            is_multiple_value_allowed: false,
            value: 103,
        };

        const wrapper = factory({ item });

        expect(wrapper.vm.formatted_item_properties).toEqual([properties_in_rest_format]);
    });

    it("Updates status", () => {
        const item = {
            id: 7,
            type: "folder",
            properties: [
                {
                    short_name: "status",
                    list_value: [
                        {
                            id: 103,
                        },
                    ],
                },
            ],
        };

        const wrapper = factory({ item });

        expect(wrapper.vm.item_to_update.status).toBe("rejected");

        emitter.emit("update-status-property", "draft");
        expect(wrapper.vm.item_to_update.status).toBe("draft");
    });

    it("Updates title", () => {
        const item = {
            id: 7,
            type: "folder",
            title: "A folder",
            properties: [
                {
                    short_name: "status",
                    list_value: [
                        {
                            id: 103,
                        },
                    ],
                },
            ],
        };

        const wrapper = factory({ item });

        expect(wrapper.vm.item_to_update.title).toBe("A folder");

        emitter.emit("update-title-property", "A folder updated");
        expect(wrapper.vm.item_to_update.title).toBe("A folder updated");
    });

    it("Updates description", () => {
        const item = {
            id: 7,
            type: "folder",
            description: "A custom description",
            properties: [
                {
                    short_name: "status",
                    list_value: [
                        {
                            id: 103,
                        },
                    ],
                },
            ],
        };

        const wrapper = factory({ item });

        expect(wrapper.vm.item_to_update.description).toBe("A custom description");

        emitter.emit("update-description-property", "A description");
        expect(wrapper.vm.item_to_update.description).toBe("A description");
    });
});
