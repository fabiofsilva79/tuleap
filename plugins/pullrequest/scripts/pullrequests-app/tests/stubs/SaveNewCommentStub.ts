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

import { okAsync } from "neverthrow";
import type { ResultAsync } from "neverthrow";
import type { Fault } from "@tuleap/fault";
import type { SaveNewComment } from "../../src/app/comments/PullRequestCommentReplySaver";
import type { ReplyCommentFormPresenter } from "../../src/app/comments/ReplyCommentFormPresenter";
import type {
    CommentReplyPayload,
    PullRequestCommentPresenter,
} from "../../src/app/comments/PullRequestCommentPresenter";

export type SaveNewCommentStub = SaveNewComment & {
    getNbCalls: () => number;
    getLastCallParams: () => ReplyCommentFormPresenter | undefined;
};

export const SaveNewCommentStub = {
    withResponsePayload: (payload: CommentReplyPayload): SaveNewCommentStub => {
        let nb_calls = 0;
        let last_call_params: ReplyCommentFormPresenter | undefined = undefined;

        return {
            getNbCalls: () => nb_calls,
            getLastCallParams: () => last_call_params,
            saveReply: (
                comment: PullRequestCommentPresenter,
                new_reply: ReplyCommentFormPresenter
            ): ResultAsync<CommentReplyPayload, Fault> => {
                nb_calls++;
                last_call_params = new_reply;

                return okAsync(payload);
            },
        };
    },
};
