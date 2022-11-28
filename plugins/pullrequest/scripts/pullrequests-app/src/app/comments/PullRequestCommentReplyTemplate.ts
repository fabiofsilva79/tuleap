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

import { html } from "hybrids";
import type { UpdateFunction } from "hybrids";
import type { PullRequestComment } from "./PullRequestComment";
import { buildBodyForComment } from "./PullRequestCommentBodyTemplate";
import { buildFooterForComment } from "./PullRequestCommentFooterTemplate";
import type { PullRequestCommentPresenter } from "./PullRequestCommentPresenter";

type MapOfClasses = Record<string, boolean>;

const getCommentContentClasses = (host: PullRequestComment): MapOfClasses => {
    const classes: MapOfClasses = {
        "pull-request-comment-content": true,
    };

    if (host.comment.color) {
        classes[`pull-request-comment-content-color`] = true;
        classes[`tlp-swatch-${host.comment.color}`] = true;
    }

    return classes;
};

const getFollowUpClasses = (host: PullRequestComment): MapOfClasses => {
    const classes: MapOfClasses = {
        "pull-request-comment-follow-up": true,
    };

    if (host.comment.color) {
        classes[`pull-request-comment-follow-up-color`] = true;
        classes[`tlp-swatch-${host.comment.color}`] = true;
    }

    return classes;
};

export const getCommentReplyTemplate = (
    host: PullRequestComment,
    reply: PullRequestCommentPresenter
): UpdateFunction<PullRequestComment> => html`
    <div class="${getFollowUpClasses(host)}">
        <div class="pull-request-comment pull-request-comment-follow-up-content">
            <div class="tlp-avatar-medium">
                <img src="${reply.user.avatar_url}" class="media-object" aria-hidden="true" />
            </div>
            <div class="${getCommentContentClasses(host)}">
                ${buildBodyForComment(host, reply)} ${buildFooterForComment(host, reply)}
            </div>
        </div>
    </div>
`;
