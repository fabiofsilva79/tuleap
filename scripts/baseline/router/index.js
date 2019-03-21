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

import Vue from "vue";
import VueRouter from "vue-router";
import NotFoundPage from "./NotFoundPage.vue";
import BaselinePage from "../components/baseline-page/BaselinePage.vue";
import BaselinesPage from "../components/BaselinesPage.vue";
import ComparisonPage from "../components/comparison/ComparisonPage.vue";

Vue.use(VueRouter);

const router = new VueRouter({
    mode: "history",
    routes: [
        {
            path: "*",
            component: NotFoundPage
        },

        {
            path: "/plugins/baseline/:project_name",
            name: "BaselinesPage",
            component: BaselinesPage
        },

        {
            path: "/plugins/baseline/:project_name/baselines/:baseline_id",
            name: "BaselinePage",
            component: BaselinePage,
            props: true
        },

        {
            path: "/plugins/baseline/:project_name/comparisons/:from_baseline_id/:to_baseline_id",
            name: "ComparisonPage",
            component: ComparisonPage,
            props: true
        }
    ],
    scrollBehavior: (to, from, savedPosition) => {
        if (savedPosition) {
            return savedPosition;
        }

        return { x: 0, y: 0 };
    }
});

export default router;
