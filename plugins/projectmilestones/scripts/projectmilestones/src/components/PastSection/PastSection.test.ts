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
 * along with Tuleap. If not, see <http://www.gnu.org/licenses/>.
 */

import { shallowMount, Wrapper } from "@vue/test-utils";
import PastSection from "./PastSection.vue";
import { createStoreMock } from "../../../../../../../src/www/scripts/vue-components/store-wrapper-jest";
import Vue from "vue";
import { StoreOptions } from "../../type";
import { initVueGettext } from "../../../../../../../src/www/scripts/tuleap/gettext/vue-gettext-init";

const project_id = 102;
async function getPersonalWidgetInstance(
    store_options: StoreOptions
): Promise<Wrapper<PastSection>> {
    const store = createStoreMock(store_options);
    const component_options = {
        mocks: { $store: store }
    };

    await initVueGettext(Vue, () => {
        throw new Error("Fallback to default");
    });

    return shallowMount(PastSection, component_options);
}

describe("PastSection", () => {
    let store_options: StoreOptions;
    beforeEach(() => {
        store_options = {
            state: {
                is_loading: false,
                current_milestones: [],
                project_id: project_id
            },
            getters: {
                has_rest_error: false
            }
        };

        getPersonalWidgetInstance(store_options);
    });

    it("Given user display widget, Then a good link to done releases of the project is rendered", async () => {
        const wrapper = await getPersonalWidgetInstance(store_options);

        expect(wrapper.find("[data-test=past-releases-link]").attributes("href")).toContain(
            "/plugins/agiledashboard/?group_id=" + encodeURIComponent(project_id) + "&period=past"
        );
    });
});
