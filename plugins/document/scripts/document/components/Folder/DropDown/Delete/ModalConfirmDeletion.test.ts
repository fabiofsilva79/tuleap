/*
 * Copyright (c) Enalean 2019 -  Present. All Rights Reserved.
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

import type { Wrapper } from "@vue/test-utils";
import { shallowMount } from "@vue/test-utils";
import localVue from "../../../../helpers/local-vue";
import { USER_CANNOT_PROPAGATE_DELETION_TO_WIKI_SERVICE } from "../../../../constants";
import VueRouter from "vue-router";
import type { Folder, Item, ItemFile, State, Wiki } from "../../../../type";
import ModalConfirmDeletion from "./ModalConfirmDeletion.vue";
import { createStoreMock } from "@tuleap/vuex-store-wrapper-jest";
import type { ErrorState } from "../../../../store/error/module";
import * as tlp_modal from "@tuleap/tlp-modal";
import type { Modal } from "@tuleap/tlp-modal";

describe("ModalConfirmDeletion", () => {
    let store = {
        dispatch: jest.fn(),
        commit: jest.fn(),
    };

    beforeEach(() => {
        const fake_modal = {
            addEventListener: jest.fn(),
            show: jest.fn(),
            hide: jest.fn(),
        } as unknown as Modal;
        jest.spyOn(tlp_modal, "createModal").mockReturnValue(fake_modal);
    });

    function createWrapper(
        item: Item,
        currently_previewed_item: Item | null,
        wiki_referencing_same_page: Array<Wiki> | null
    ): Wrapper<ModalConfirmDeletion> {
        store = createStoreMock({
            state: {
                error: { has_modal_error: false } as ErrorState,
                currently_previewed_item,
                current_folder: { id: 42 },
            } as unknown as State,
        });

        store.dispatch.mockImplementation((actionName) => {
            if (actionName === "getWikisReferencingSameWikiPage") {
                return wiki_referencing_same_page;
            }
            return [];
        });

        return shallowMount(ModalConfirmDeletion, {
            mocks: {
                $store: store,
            },
            localVue: localVue,
            propsData: { item },
            router: new VueRouter({
                routes: [
                    {
                        path: "folder/42",
                        name: "folder",
                    },
                ],
            }),
        });
    }

    describe("When the item is a wiki", () => {
        let item: Wiki;

        beforeEach(() => {
            item = {
                id: 42,
                title: "my wiki",
                wiki_properties: {
                    page_name: "my wiki",
                    page_id: 123,
                },
                type: "wiki",
            } as Wiki;
        });

        it(`When some docman wikis reference the same wiki page, then it should add a checkbox`, async () => {
            const wikis = [
                {
                    id: 43,
                    title: "my other wiki",
                    wiki_properties: {
                        page_name: "my wiki",
                        page_id: 123,
                    },
                    type: "wiki",
                } as Wiki,
            ];
            const deletion_modal = await createWrapper(item, null, wikis);
            await deletion_modal.vm.$nextTick();

            expect(store.dispatch).toHaveBeenCalledWith("getWikisReferencingSameWikiPage", item);
            expect(deletion_modal.find("[data-test=delete-wiki-checkbox]").exists()).toBeTruthy();
        });

        it(`When there is a problem retrieving the wiki page referencers (either not found or either unreadable), then it should not add a checkbox`, async () => {
            const deletion_modal = await createWrapper(
                item,
                null,
                USER_CANNOT_PROPAGATE_DELETION_TO_WIKI_SERVICE
            );

            expect(store.dispatch).toHaveBeenCalledWith("getWikisReferencingSameWikiPage", item);
            expect(deletion_modal.find("[data-test=checkbox]").exists()).toBeFalsy();
        });

        it(`when it does not reference an existing wiki page, then it should not add a checkbox`, () => {
            item.wiki_properties.page_id = null;

            const deletion_modal = createWrapper(item, null, null);

            expect(store.dispatch).not.toHaveBeenCalled();
            expect(deletion_modal.find("[data-test=checkbox]").exists()).toBeFalsy();
        });
    });

    it("When the item is a folder, then it should display a special warning and the checkbox should not be shown", () => {
        const item = {
            id: 42,
            title: "my folder",
            type: "folder",
        } as Folder;

        const deletion_modal = createWrapper(item, null, null);

        expect(store.dispatch).not.toHaveBeenCalled();
        expect(deletion_modal.find("[data-test=delete-folder-warning]").exists()).toBeTruthy();
        expect(deletion_modal.find("[data-test=checkbox]").exists()).toBeFalsy();
    });

    it(`when I click on the delete button, it deletes the item`, () => {
        const item = {
            id: 42,
            title: "my folder",
            type: "folder",
        } as Folder;

        const deletion_modal = createWrapper(item, null, null);
        deletion_modal.get("[data-test=document-confirm-deletion-button]").trigger("click");

        expect(store.dispatch).toHaveBeenCalledWith("deleteItem", [item, {}]);
    });

    describe("Redirection after deletion", () => {
        it("Closes the quick look pane when the item to be deleted is currently previewed", async () => {
            const item = {
                id: 50,
                title: "my file",
                type: "file",
                parent_id: 42,
            } as ItemFile;

            const deletion_modal = createWrapper(item, item, null);
            jest.spyOn(deletion_modal.vm.$router, "replace");

            await deletion_modal.vm.$router.push("preview/50");
            deletion_modal.get("[data-test=document-confirm-deletion-button]").trigger("click");
            await deletion_modal.vm.$nextTick();

            expect(store.dispatch).toHaveBeenCalledWith("deleteItem", [item, {}]);
            expect(deletion_modal.vm.$store.commit).toHaveBeenCalledWith(
                "showPostDeletionNotification"
            );
            expect(store.commit).toHaveBeenCalledWith("updateCurrentlyPreviewedItem", null);
            expect(deletion_modal.vm.$router.replace).toHaveBeenCalledWith({
                name: "folder",
                params: { item_id: "42" },
            });
        });

        it("redirects to the parent folder when the item to be deleted is the current folder", async () => {
            const item = {
                id: 42,
                title: "my folder",
                type: "folder",
                parent_id: 41,
            } as Folder;

            const deletion_modal = createWrapper(item, null, null);

            jest.spyOn(deletion_modal.vm.$router, "replace");

            deletion_modal.get("[data-test=document-confirm-deletion-button]").trigger("click");
            await deletion_modal.vm.$nextTick();

            expect(store.dispatch).toHaveBeenCalledWith("deleteItem", [item, {}]);
            expect(store.commit).toHaveBeenCalledWith("showPostDeletionNotification");
            expect(store.commit).toHaveBeenCalledWith("updateCurrentlyPreviewedItem", null);
            expect(deletion_modal.vm.$router.replace).toHaveBeenCalledWith({
                name: "folder",
                params: { item_id: "41" },
            });
        });
    });
});
