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
 */

import { rewire$get, rewire$post } from "tlp-fetch";
import { mockFetchSuccess } from "tlp-mocks";
import { getOpenMilestones, getBaselines, createBaseline } from "./rest-querier";

describe("Rest queries:", () => {
    let result;

    describe("getOpenMilestones()", () => {
        let get;

        const simplified_milestone = [
            {
                id: 3,
                label: "milestone Label"
            }
        ];

        beforeEach(async () => {
            get = jasmine.createSpy("get");
            mockFetchSuccess(get, { return_json: simplified_milestone });
            rewire$get(get);
            result = await getOpenMilestones(1);
        });

        it("calls projects API to get opened milestones", () =>
            expect(get).toHaveBeenCalledWith('/api/projects/1/milestones?query={"status":"open"}'));

        it("returns open milestones", () => expect(result).toEqual(simplified_milestone));
    });

    describe("getBaselines()", () => {
        let get;

        const baseline = {
            id: 3,
            name: "Baseline V1",
            snapshot_date: "10/02/2019",
            author: "Alban Jidibus"
        };

        beforeEach(async () => {
            get = jasmine.createSpy("get");
            mockFetchSuccess(get, { return_json: { baselines: [baseline] } });
            rewire$get(get);
            result = await getBaselines(1);
        });

        it("calls projects API to get baselines", () =>
            expect(get).toHaveBeenCalledWith("/api/projects/1/baselines?limit=1000&offset=0"));

        it("returns baselines", () => expect(result).toEqual([baseline]));
    });

    describe("saveBaseline()", () => {
        let post;

        const simplified_baseline = {
            id: 1,
            name: "My first baseline",
            milestone_id: 3,
            author_id: 2,
            creation_date: 12344567
        };

        const headers = {
            "content-type": "application/json"
        };
        const body = JSON.stringify({
            name: "My first baseline",
            milestone_id: 3
        });

        beforeEach(async () => {
            post = jasmine.createSpy("post");
            mockFetchSuccess(post, { return_json: simplified_baseline });
            rewire$post(post);

            result = await createBaseline("My first baseline", {
                id: 3,
                label: "milestone Label"
            });
        });

        it("calls baselines API to create baseline", () =>
            expect(post).toHaveBeenCalledWith("/api/baselines/", { headers, body }));

        it("returns created baseline", () => expect(result).toEqual(simplified_baseline));
    });
});
