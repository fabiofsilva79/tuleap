/*
 * Copyright (c) Enalean, 2023 - present. All Rights Reserved.
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

import { describe, it, expect } from "vitest";
import { shallowMount, RouterLinkStub } from "@vue/test-utils";
import OverviewTabs from "./OverviewTabs.vue";
import { getGlobalTestOptions } from "../tests-helpers/global-options-for-tests";
import { OVERVIEW_APP_BASE_URL_KEY, PULL_REQUEST_ID_KEY, VIEW_OVERVIEW_NAME } from "../constants";

describe("OverviewTabs", () => {
    it("should build the tabs with proper urls", () => {
        const APP_BASE_URL = "https://example.com/";
        const PULLREQUEST_ID = 15;
        const wrapper = shallowMount(OverviewTabs, {
            global: {
                provide: {
                    [OVERVIEW_APP_BASE_URL_KEY as symbol]: APP_BASE_URL,
                    [PULL_REQUEST_ID_KEY as symbol]: PULLREQUEST_ID,
                },
                stubs: {
                    RouterLink: RouterLinkStub,
                },
                ...getGlobalTestOptions(),
            },
        });

        expect(
            wrapper.findComponent<typeof RouterLinkStub>("[data-test=tab-overview]").props().to
        ).toStrictEqual({
            name: VIEW_OVERVIEW_NAME,
        });
        expect(wrapper.find("[data-test=tab-commits]").attributes("href")).toBe(
            `${APP_BASE_URL}#/pull-requests/${PULLREQUEST_ID}/commits`
        );
        expect(wrapper.find("[data-test=tab-changes]").attributes("href")).toBe(
            `${APP_BASE_URL}#/pull-requests/${PULLREQUEST_ID}/files`
        );
    });
});
