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

import type {
    PullRequestCommentPresenter,
    PullRequestInlineCommentPresenter,
} from "../../comments/PullRequestCommentPresenter";
import type { IRelativeDateHelper } from "../../helpers/date-helpers";
import type { ControlPullRequestComment } from "../../comments/PullRequestCommentController";
import type { CurrentPullRequestUserPresenter } from "../../comments/PullRequestCurrentUserPresenter";
import type { PullRequestPresenter } from "../../comments/PullRequestPresenter";
import type { SaveNewInlineComment } from "../../comments/new-comment-form/NewInlineCommentSaver";

export type GroupType = "unmoved" | "deleted" | "added";
export const UNMOVED_GROUP: GroupType = "unmoved";
export const DELETED_GROUP: GroupType = "deleted";
export const ADDED_GROUP: GroupType = "added";

export interface GroupOfLines {
    readonly type: GroupType;
    unidiff_offsets: number[];
}

export interface UnidiffFileLine {
    readonly unidiff_offset: number;
    readonly content: string;
}

export interface UnMovedFileLine extends UnidiffFileLine {
    readonly old_offset: number;
    readonly new_offset: number;
}

export interface AddedFileLine extends UnidiffFileLine {
    readonly new_offset: number;
    readonly old_offset: null;
}

export interface RemovedFileLine extends UnidiffFileLine {
    readonly new_offset: null;
    readonly old_offset: number;
}

export type FileLine = UnMovedFileLine | AddedFileLine | RemovedFileLine;
export type LeftLine = UnMovedFileLine | RemovedFileLine;
export type RightLine = UnMovedFileLine | AddedFileLine;

export type FileDiffWidgetType =
    | "tuleap-pullrequest-new-comment-form"
    | "tuleap-pullrequest-comment"
    | "tuleap-pullrequest-placeholder";

interface WidgetElement extends HTMLElement {
    localName: FileDiffWidgetType;
}

export interface InlineCommentWidget extends WidgetElement {
    localName: "tuleap-pullrequest-comment";
    comment: PullRequestCommentPresenter;
    relativeDateHelper: IRelativeDateHelper;
    controller: ControlPullRequestComment;
    currentUser: CurrentPullRequestUserPresenter;
    currentPullRequest: PullRequestPresenter;
    post_rendering_callback: () => void;
}

export interface NewInlineCommentFormWidget extends WidgetElement {
    localName: "tuleap-pullrequest-new-comment-form";
    comment_saver: SaveNewInlineComment;
    post_rendering_callback: () => void;
    post_submit_callback: (new_inline_comment: PullRequestInlineCommentPresenter) => void;
    on_cancel_callback: () => void;
}

export interface FileDiffPlaceholderWidget extends WidgetElement {
    localName: "tuleap-pullrequest-placeholder";
    isReplacingAComment: boolean;
    height: number;
}

export type FileDiffCommentWidget = InlineCommentWidget | NewInlineCommentFormWidget;
export type FileDiffWidget = FileDiffCommentWidget | FileDiffPlaceholderWidget;
