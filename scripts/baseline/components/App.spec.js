/*
 * Copyright (c) Enalean, 2019. All Rights Reserved.
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
 *
 */

import { shallowMount } from "@vue/test-utils";
import localVue from "../support/local-vue.js";
import App from "./App.vue";
import router from "../router";
import { createStoreMock } from "../support/store-wrapper.spec-helper";
import store_options from "../store/options";
import { create } from "../support/factories";
import Notification from "./Notification.vue";

describe("App", () => {
    let $store;
    let wrapper;

    beforeEach(() => {
        $store = createStoreMock(store_options);

        wrapper = shallowMount(App, {
            localVue,
            router,
            mocks: {
                $store
            }
        });
    });

    describe("#changeTitle", () => {
        beforeEach(() => wrapper.vm.changeTitle("new title"));

        it('changes document title and suffix with "Tuleap"', () => {
            expect(document.title).toEqual("new title - Tuleap");
        });
    });

    describe("With notification", () => {
        beforeEach(() => ($store.state.notification = create("notification")));
        it("Show notification", () => {
            expect(wrapper.contains(Notification)).toBeTruthy();
        });
    });

    describe("Without notification", () => {
        beforeEach(() => ($store.state.notification = null));
        it("Show notification", () => {
            expect(wrapper.contains(Notification)).toBeFalsy();
        });
    });
});
