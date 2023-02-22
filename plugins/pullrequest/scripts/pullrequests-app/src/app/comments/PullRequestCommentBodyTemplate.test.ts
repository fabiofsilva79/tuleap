/*
 * Copyright (c) Enalean, 2022 - present. All Rights Reserved.
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

import { selectOrThrow } from "@tuleap/dom";
import { getCommentBody } from "./PullRequestCommentBodyTemplate";
import type { HostElement } from "./PullRequestComment";
import { PullRequestCommentPresenterStub } from "../../../tests/stubs/PullRequestCommentPresenterStub";
import { setCatalog } from "../gettext-catalog";
import "@tuleap/tlp-relative-date";
import { RelativeDateHelperStub } from "../../../tests/stubs/RelativeDateHelperStub";
import { TYPE_INLINE_COMMENT } from "./PullRequestCommentPresenter";

describe("PullRequestCommentBodyTemplate", () => {
    let target: ShadowRoot;

    beforeEach(() => {
        setCatalog({ getString: (msgid) => msgid, getPlural: (nb, msgid) => msgid });

        target = document.implementation
            .createHTMLDocument()
            .createElement("div") as unknown as ShadowRoot;
    });

    it(`Given a not outdated inline comment,
        Then it should display the file name on which the comment has been written with a link to it.`, () => {
        const host = {
            comment: PullRequestCommentPresenterStub.buildInlineComment(),
            relativeDateHelper: RelativeDateHelperStub,
        } as unknown as HostElement;
        const render = getCommentBody(host);

        render(host, target);

        const displayed_file = selectOrThrow(
            target,
            "[data-test=pullrequest-comment-with-link-to-file]"
        );
        const link_to_file = selectOrThrow(displayed_file, "a", HTMLAnchorElement);

        expect(link_to_file.href).toBe("url/to/readme.md");
        expect(link_to_file.textContent?.trim()).toBe("README.md");
    });

    it(`Given an outdated inline comment,
        Then it should display only the file name on which the comment has been written with no link to it
        And a badge flagging it as outdated`, () => {
        const host = {
            comment: PullRequestCommentPresenterStub.buildInlineCommentOutdated(),
            relativeDateHelper: RelativeDateHelperStub,
        } as unknown as HostElement;
        const render = getCommentBody(host);

        render(host, target);

        const displayed_file = selectOrThrow(
            target,
            "[data-test=pullrequest-comment-only-file-name]"
        );

        const body = selectOrThrow(target, "[data-test=pull-request-comment-body]");
        const outdated_badge = selectOrThrow(target, "[data-test=comment-outdated-badge]");

        expect(displayed_file.querySelector("a")).toBeNull();
        expect(displayed_file.textContent?.trim()).toBe("README.md");
        expect(body.classList).toContain("pull-request-comment-outdated");
        expect(outdated_badge).not.toBeNull();
    });

    it.each([
        ["a global comment", PullRequestCommentPresenterStub.buildGlobalComment()],
        [
            "a pull-request event comment",
            PullRequestCommentPresenterStub.buildPullRequestEventComment(),
        ],
        [
            "an inline-comment which is a reply to another inline-comment",
            PullRequestCommentPresenterStub.buildWithData({
                parent_id: 12,
                is_inline_comment: true,
                type: TYPE_INLINE_COMMENT,
                file: {
                    file_url: "an/url/to/README.md",
                    file_path: "README.md",
                    unidiff_offset: 8,
                    position: "right",
                },
            }),
        ],
    ])(`Given %s, Then it should not display a file name`, (expectation, comment) => {
        const host = {
            comment,
            relativeDateHelper: RelativeDateHelperStub,
        } as unknown as HostElement;
        const render = getCommentBody(host);

        render(host, target);

        expect(
            target.querySelector("[data-test=pullrequest-comment-with-link-to-file]")
        ).toBeNull();
        expect(target.querySelector("[data-test=pullrequest-comment-only-file-name]")).toBeNull();
    });
});
