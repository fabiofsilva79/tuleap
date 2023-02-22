/*
 * Copyright (c) Enalean, 2018-Present. All Rights Reserved.
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

import { mockFetchSuccess } from "@tuleap/tlp-fetch/mocks/tlp-fetch-mock-helper";

import { getTrackedTimes, addTime, deleteTime } from "./rest-querier.js";

import * as tlp_fetch from "@tuleap/tlp-fetch";

describe("getTrackedTimes() -", () => {
    it("the REST API will be queried with ISO-8601 dates and the times returned", async () => {
        const limit = 1,
            offset = 0,
            user_id = 102;

        const times = [
            [
                {
                    artifact: {},
                    project: {},
                    minutes: 20,
                },
            ],
        ];

        const tlpGet = jest.spyOn(tlp_fetch, "get");
        mockFetchSuccess(tlpGet, {
            headers: {
                get: (header_name) => {
                    const headers = {
                        "X-PAGINATION-SIZE": 1,
                    };

                    return headers[header_name];
                },
            },
            return_json: times,
        });

        const result = await getTrackedTimes(user_id, "2018-03-08", "2018-03-15", limit, offset);
        expect(tlpGet).toHaveBeenCalledWith("/api/v1/users/" + user_id + "/timetracking", {
            params: {
                limit,
                offset,
                query: JSON.stringify({
                    start_date: "2018-03-08T00:00:00Z",
                    end_date: "2018-03-15T00:00:00Z",
                }),
            },
        });

        expect(result.times).toEqual(times);
        expect(result.total).toBe(1);
    });

    it("the REST API will add date and the new time should be returned", async () => {
        const time = {
            artifact: {},
            project: {},
            minutes: 20,
        };

        const tlpPost = jest.spyOn(tlp_fetch, "post");
        mockFetchSuccess(tlpPost, {
            return_json: time,
        });
        const result = await addTime("2018-03-08", 2, "11:11", "oui");
        const headers = {
            "content-type": "application/json",
        };
        const body = JSON.stringify({
            date_time: "2018-03-08",
            artifact_id: 2,
            time_value: "11:11",
            step: "oui",
        });
        expect(tlpPost).toHaveBeenCalledWith("/api/v1/timetracking", {
            headers,
            body,
        });
        expect(result).toEqual(time);
    });

    it("the REST API should delete the given time", async () => {
        const tlpDel = jest.spyOn(tlp_fetch, "del");
        mockFetchSuccess(tlpDel, {
            return_json: [],
        });
        const time_id = 2;
        await deleteTime(time_id);
        const headers = {
            "content-type": "application/json",
        };
        expect(tlpDel).toHaveBeenCalledWith("/api/v1/timetracking/" + time_id, {
            headers,
        });
    });
});
