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

import Vue from "vue";
import { shallowMount, ShallowMountOptions, Wrapper } from "@vue/test-utils";
import ReleaseHeaderRemainingPoints from "./ReleaseHeaderRemainingPoints.vue";
import { createStoreMock } from "@tuleap-vue-components/store-wrapper-jest";
import { MilestoneData, StoreOptions } from "../../../type";
import { initVueGettext } from "../../../../../../../../src/www/scripts/tuleap/gettext/vue-gettext-init";

let releaseData: MilestoneData;
const component_options: ShallowMountOptions<ReleaseHeaderRemainingPoints> = {};

describe("ReleaseHeaderRemainingEffort", () => {
    let store_options: StoreOptions;
    let store;

    async function getPersonalWidgetInstance(
        store_options: StoreOptions
    ): Promise<Wrapper<ReleaseHeaderRemainingPoints>> {
        store = createStoreMock(store_options);

        component_options.mocks = { $store: store };

        await initVueGettext(Vue, () => {
            throw new Error("Fallback to default");
        });

        return shallowMount(ReleaseHeaderRemainingPoints, component_options);
    }

    beforeEach(() => {
        store_options = {
            state: {}
        };

        releaseData = {
            label: "mile",
            id: 2,
            start_date: new Date("2017-01-22T13:42:08+02:00").toDateString(),
            capacity: 10,
            number_of_artifact_by_trackers: []
        };

        component_options.propsData = {
            releaseData
        };
    });

    describe("Display remaining points", () => {
        it("When there is negative remaining points, Then it displays and percent in tooltip", async () => {
            releaseData = {
                label: "mile",
                id: 2,
                planning: {
                    id: "100"
                },
                start_date: null,
                remaining_effort: -1,
                initial_effort: 10,
                number_of_artifact_by_trackers: []
            };

            component_options.propsData = {
                releaseData
            };

            const wrapper = await getPersonalWidgetInstance(store_options);
            expect(wrapper.element).toMatchSnapshot();
        });

        it("When there isn't remaining effort points, Then 0 is displayed and message in tooltip", async () => {
            releaseData = {
                label: "mile",
                id: 2,
                planning: {
                    id: "100"
                },
                start_date: null,
                initial_effort: 10,
                number_of_artifact_by_trackers: []
            };

            component_options.propsData = {
                releaseData
            };

            const wrapper = await getPersonalWidgetInstance(store_options);
            expect(wrapper.element).toMatchSnapshot();
        });

        it("When there is remaining effort point and is null, Then 0 is displayed and message in tooltip", async () => {
            releaseData = {
                label: "mile",
                id: 2,
                planning: {
                    id: "100"
                },
                start_date: null,
                remaining_effort: null,
                initial_effort: 10,
                number_of_artifact_by_trackers: []
            };

            component_options.propsData = {
                releaseData
            };

            const wrapper = await getPersonalWidgetInstance(store_options);
            expect(wrapper.element).toMatchSnapshot();
        });

        it("When there is remaining effort point, not null and greater than 0, Then it's displayed and percent in tooltip", async () => {
            releaseData = {
                label: "mile",
                id: 2,
                planning: {
                    id: "100"
                },
                start_date: null,
                remaining_effort: 5,
                initial_effort: 10,
                number_of_artifact_by_trackers: []
            };

            component_options.propsData = {
                releaseData
            };

            const wrapper = await getPersonalWidgetInstance(store_options);
            expect(wrapper.element).toMatchSnapshot();
        });

        it("When there is remaining effort point, equal at 0, Then it's displayed and percent in tooltip", async () => {
            releaseData = {
                label: "mile",
                id: 2,
                planning: {
                    id: "100"
                },
                start_date: null,
                remaining_effort: 0,
                initial_effort: 5,
                number_of_artifact_by_trackers: []
            };

            component_options.propsData = {
                releaseData
            };

            const wrapper = await getPersonalWidgetInstance(store_options);
            expect(wrapper.element).toMatchSnapshot();
        });

        it("When there isn't initial effort point, Then remaining effort is displayed and message in tooltip", async () => {
            releaseData = {
                label: "mile",
                id: 2,
                planning: {
                    id: "100"
                },
                start_date: null,
                remaining_effort: 5,
                number_of_artifact_by_trackers: []
            };

            component_options.propsData = {
                releaseData
            };

            const wrapper = await getPersonalWidgetInstance(store_options);
            expect(wrapper.element).toMatchSnapshot();
        });

        it("When there is initial effort point but null, Then remaining effort is displayed and message in tooltip", async () => {
            releaseData = {
                label: "mile",
                id: 2,
                planning: {
                    id: "100"
                },
                start_date: null,
                remaining_effort: 5,
                initial_effort: null,
                number_of_artifact_by_trackers: []
            };

            component_options.propsData = {
                releaseData
            };

            const wrapper = await getPersonalWidgetInstance(store_options);
            expect(wrapper.element).toMatchSnapshot();
        });

        it("When there is initial effort point but equal at 0, Then remaining effort is displayed and message in tooltip", async () => {
            releaseData = {
                label: "mile",
                id: 2,
                planning: {
                    id: "100"
                },
                start_date: null,
                remaining_effort: 5,
                initial_effort: 0,
                number_of_artifact_by_trackers: []
            };

            component_options.propsData = {
                releaseData
            };

            const wrapper = await getPersonalWidgetInstance(store_options);
            expect(wrapper.element).toMatchSnapshot();
        });

        it("When remaining effort > initial effort, Then remaining effort is displayed and message in tooltip", async () => {
            releaseData = {
                label: "mile",
                id: 2,
                planning: {
                    id: "100"
                },
                start_date: null,
                remaining_effort: 100,
                initial_effort: 10,
                number_of_artifact_by_trackers: []
            };

            component_options.propsData = {
                releaseData
            };

            const wrapper = await getPersonalWidgetInstance(store_options);
            expect(wrapper.element).toMatchSnapshot();
        });
    });
});
