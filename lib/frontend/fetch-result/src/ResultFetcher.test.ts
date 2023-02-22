/*
 * Copyright (c) Enalean, 2022-Present. All Rights Reserved.
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

import { describe, it, expect, beforeEach } from "vitest";
import type { Fault } from "@tuleap/fault";
import type { ResultAsync } from "neverthrow";
import type { FetchResult } from "./ResultFetcher";
import { ResultFetcher } from "./ResultFetcher";
import { FetchInterfaceStub } from "../tests/stubs/FetchInterfaceStub";
import { ResponseRetriever } from "./ResponseRetriever";
import {
    DELETE_METHOD,
    GET_METHOD,
    HEAD_METHOD,
    OPTIONS_METHOD,
    PATCH_METHOD,
    POST_METHOD,
    PUT_METHOD,
} from "./constants";
import { RestlerErrorHandler } from "./RestlerErrorHandler";
import { uri as uriTag } from "./uri-string-template";

type JSONResponsePayload = {
    readonly id: number;
    readonly value: string;
};
type JSONRequestPayload = {
    readonly request_id: number;
    readonly request_value: string;
};
type Parameters = {
    readonly [key: string]: string | number | boolean;
};
type ResponseResult = ResultAsync<Response, Fault>;
type JSONResult = ResultAsync<JSONResponsePayload, Fault>;

const ID = 521;
const REQUEST_ID = 196;

describe(`ResultFetcher`, () => {
    let success_response: Response,
        fetcher: FetchInterfaceStub,
        json_response_payload: JSONResponsePayload,
        json_request_payload: JSONRequestPayload,
        params: Parameters;
    const uri = uriTag`https://example.com/result-fetcher-test/${"démo"}`;

    beforeEach(() => {
        success_response = { ok: true } as unknown as Response;
        fetcher = FetchInterfaceStub.withSuccessiveResponses(success_response);
        json_response_payload = { id: ID, value: "headmaster" };
        json_request_payload = { request_id: REQUEST_ID, request_value: "Sphindus" };
        params = {
            quinonyl: "mem",
            "R&D": 91,
            Jwahar: false,
        };
    });

    const getFetcher = (): FetchResult => {
        const response_retriever = ResponseRetriever(fetcher, RestlerErrorHandler());
        return ResultFetcher(response_retriever);
    };

    describe(`methods returning a JSON payload`, () => {
        beforeEach(() => {
            const success_response_with_payload = {
                ok: true,
                json: () => Promise.resolve(json_response_payload),
            } as unknown as Response;
            fetcher = FetchInterfaceStub.withSuccessiveResponses(success_response_with_payload);
        });

        describe(`getJSON()`, () => {
            it(`will encode the given URI with the given parameters
                and will return a ResultAsync with the decoded JSON from the Response body`, async () => {
                const result = await getFetcher().getJSON<JSONResponsePayload>(uri, { params });
                if (!result.isOk()) {
                    throw new Error("Expected an Ok");
                }

                expect(result.value).toBe(json_response_payload);
                expect(result.value.id).toBe(ID);
                expect(fetcher.getRequestInfo(0)).toBe(
                    "https://example.com/result-fetcher-test/d%C3%A9mo?quinonyl=mem&R%26D=91&Jwahar=false"
                );

                const request_init = fetcher.getRequestInit(0);
                if (request_init === undefined) {
                    throw new Error("Expected request init to be defined");
                }
                expect(request_init.method).toBe(GET_METHOD);
                expect(request_init.credentials).toBe("same-origin");
            });

            it(`options are not mandatory`, async () => {
                await getFetcher().getJSON(uri);

                expect(fetcher.getRequestInfo(0)).toBe(
                    "https://example.com/result-fetcher-test/d%C3%A9mo"
                );
            });
        });

        it.each([
            [
                "patchJSON()",
                (): JSONResult => getFetcher().patchJSON(uri, json_request_payload),
                PATCH_METHOD,
            ],
            [
                "postJSON()",
                (): JSONResult => getFetcher().postJSON(uri, json_request_payload),
                POST_METHOD,
            ],
            [
                "putJSON()",
                (): JSONResult => getFetcher().putJSON(uri, json_request_payload),
                PUT_METHOD,
            ],
        ])(
            `%s will encode the given URI and stringify the given JSON payload and add the JSON Content-Type header
            and will return a ResultAsync with the decoded JSON from the Response body`,
            async (
                _method_name: string,
                method_under_test: () => JSONResult,
                expected_http_method: string
            ) => {
                const result = await method_under_test();
                if (!result.isOk()) {
                    throw Error("Expected an Ok");
                }

                expect(result.value).toBe(json_response_payload);
                expect(result.value.id).toBe(ID);
                expect(fetcher.getRequestInfo(0)).toBe(
                    "https://example.com/result-fetcher-test/d%C3%A9mo"
                );

                const request_init = fetcher.getRequestInit(0);
                if (request_init === undefined) {
                    throw Error("Expected request init to be defined");
                }

                expect(request_init.method).toBe(expected_http_method);
                expect(request_init.credentials).toBe("same-origin");

                if (!(request_init.headers instanceof Headers)) {
                    throw new Error("Expected headers to be set");
                }
                expect(request_init.headers.get("Content-Type")).toBe("application/json");
                expect(request_init.body).toBe(`{"request_id":196,"request_value":"Sphindus"}`);
            }
        );
    });

    describe(`methods returning a Response`, () => {
        describe(`head()`, () => {
            it(`will encode the given URI with the given parameters
                and will return a ResultAsync with the Response`, async () => {
                const result = await getFetcher().head(uri, { params });
                if (!result.isOk()) {
                    throw new Error("Expected an Ok");
                }

                expect(result.value).toBe(success_response);
                expect(fetcher.getRequestInfo(0)).toBe(
                    "https://example.com/result-fetcher-test/d%C3%A9mo?quinonyl=mem&R%26D=91&Jwahar=false"
                );

                const request_init = fetcher.getRequestInit(0);
                if (request_init === undefined) {
                    throw new Error("Expected request init to be defined");
                }
                expect(request_init.method).toBe(HEAD_METHOD);
                expect(request_init.credentials).toBe("same-origin");
            });

            it(`options are not mandatory`, async () => {
                await getFetcher().head(uri);

                expect(fetcher.getRequestInfo(0)).toBe(
                    "https://example.com/result-fetcher-test/d%C3%A9mo"
                );
            });
        });

        it.each([
            [
                "post()",
                (): ResponseResult => getFetcher().post(uri, { params }, json_request_payload),
                "https://example.com/result-fetcher-test/d%C3%A9mo?quinonyl=mem&R%26D=91&Jwahar=false",
                POST_METHOD,
            ],
        ])(
            `%s will encode the given URI and stringify the given JSON payload
            and add the JSON Content-Type header and will return a ResultAsync with the Response`,
            async (
                _method_name: string,
                method_under_test: () => ResponseResult,
                expected_url: string,
                expected_http_method: string
            ) => {
                const result = await method_under_test();
                if (!result.isOk()) {
                    throw new Error("Expected an Ok");
                }

                expect(result.value).toBe(success_response);
                expect(fetcher.getRequestInfo(0)).toBe(expected_url);

                const request_init = fetcher.getRequestInit(0);
                if (request_init === undefined) {
                    throw new Error("Expected request init to be defined");
                }
                expect(request_init.method).toBe(expected_http_method);
                expect(request_init.credentials).toBe("same-origin");

                if (!(request_init.headers instanceof Headers)) {
                    throw new Error("Expected headers to be set");
                }
                expect(request_init.headers.get("Content-Type")).toBe("application/json");
                expect(request_init.body).toBe(`{"request_id":196,"request_value":"Sphindus"}`);
            }
        );

        it.each([
            ["options()", (): ResponseResult => getFetcher().options(uri), OPTIONS_METHOD],
            ["del()", (): ResponseResult => getFetcher().del(uri), DELETE_METHOD],
        ])(
            `%s will encode the given URI and will return a ResultAsync with the Response`,
            async (
                _method_name: string,
                method_under_test: () => ResponseResult,
                expected_http_method: string
            ) => {
                const result = await method_under_test();
                if (!result.isOk()) {
                    throw new Error("Expected an Ok");
                }

                expect(result.value).toBe(success_response);
                expect(fetcher.getRequestInfo(0)).toBe(
                    "https://example.com/result-fetcher-test/d%C3%A9mo"
                );
                const request_init = fetcher.getRequestInit(0);
                if (request_init === undefined) {
                    throw new Error("Expected request init to be defined");
                }
                expect(request_init.method).toBe(expected_http_method);
                expect(request_init.credentials).toBe("same-origin");
            }
        );
    });
});
