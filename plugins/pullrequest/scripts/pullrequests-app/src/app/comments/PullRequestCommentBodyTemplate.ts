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

import { sanitize } from "dompurify";
import { html } from "hybrids";
import type { UpdateFunction } from "hybrids";
import type { PullRequestCommentPresenter } from "./PullRequestCommentPresenter";
import type { PullRequestComment } from "./PullRequestComment";
import { getOutdatedCommentBadgeText } from "../gettext-catalog";

type MapOfClasses = Record<string, boolean>;

const displayFileNameIfNeeded = (
    comment: PullRequestCommentPresenter
): UpdateFunction<PullRequestComment> => {
    if (!comment.file || comment.parent_id !== 0) {
        return html``;
    }

    if (!comment.is_outdated) {
        return html`
            <div
                class="pull-request-comment-file-path"
                data-test="pullrequest-comment-with-link-to-file"
            >
                <a href="${comment.file.file_url}">
                    <i
                        class="pull-request-comment-file-path-icon fa-regular fa-file-alt"
                        aria-hidden="true"
                    ></i
                    >${comment.file.file_path}
                </a>
            </div>
        `;
    }

    return html`
        <div class="pull-request-comment-file-path" data-test="pullrequest-comment-only-file-name">
            <i
                class="pull-request-comment-file-path-icon fa-regular fa-file-alt"
                aria-hidden="true"
            ></i
            >${comment.file.file_path}
        </div>
    `;
};

const displayOutdatedBadgeIfNeeded = (
    host: PullRequestComment,
    comment: PullRequestCommentPresenter
): UpdateFunction<PullRequestComment> => {
    if (host.comment.id !== comment.id || !comment.is_outdated) {
        return html``;
    }

    return html`
        <span class="tlp-badge-secondary tlp-badge-outline" data-test="comment-outdated-badge">
            <i class="fa-solid fa-hourglass-end tlp-badge-icon" aria-hidden="true"></i>
            ${getOutdatedCommentBadgeText()}
        </span>
    `;
};

const getBodyClasses = (host: PullRequestComment): MapOfClasses => ({
    "pull-request-comment-outdated": host.comment.is_outdated,
});

export const buildBodyForComment = (
    host: PullRequestComment,
    comment: PullRequestCommentPresenter
): UpdateFunction<PullRequestComment> => html`
    <div class="${getBodyClasses(host)}" data-test="pull-request-comment-body">
        <div class="pull-request-comment-content-info">
            <div class="pull-request-comment-author-and-date">
                <a class="pull-request-comment-author-name" href="${comment.user.user_url}"
                    >${comment.user.display_name}</a
                >,
                <tlp-relative-date
                    class="pull-request-comment-date"
                    date="${comment.post_date}"
                    absolute-date="${host.relativeDateHelper.getFormatDateUsingPreferredUserFormat(
                        comment.post_date
                    )}"
                    preference="${host.relativeDateHelper.getRelativeDatePreference()}"
                    locale="${host.relativeDateHelper.getUserLocale()}"
                    placement="${host.relativeDateHelper.getRelativeDatePlacement()}"
                >
                    ${host.relativeDateHelper.getFormatDateUsingPreferredUserFormat(
                        comment.post_date
                    )}
                </tlp-relative-date>
            </div>
            ${displayOutdatedBadgeIfNeeded(host, comment)}
        </div>

        ${displayFileNameIfNeeded(comment)}

        <p class="pull-request-comment-text" innerHTML="${sanitize(comment.content)}"></p>
    </div>
`;

export const getCommentBody = (host: PullRequestComment): UpdateFunction<PullRequestComment> =>
    buildBodyForComment(host, host.comment);
