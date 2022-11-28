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

import type { Editor } from "codemirror";
import type { CreateFileDiffWidget } from "./side-by-side-code-mirror-widget-creator";
import type { IRelativeDateHelper } from "../../helpers/date-helpers";
import type { ControlPullRequestComment } from "../../comments/PullRequestCommentController";
import type { CurrentPullRequestUserPresenter } from "../../comments/PullRequestCurrentUserPresenter";
import type { PullRequestPresenter } from "../../comments/PullRequestPresenter";
import type { FileLineHandle } from "./types-codemirror-overriden";
import type {
    InlineCommentWidget,
    FileDiffPlaceholderWidget,
    NewInlineCommentFormWidget,
} from "./types";

import { PullRequestCommentPresenterStub } from "../../../../tests/stubs/PullRequestCommentPresenterStub";
import { RelativeDateHelperStub } from "../../../../tests/stubs/RelativeDateHelperStub";
import { PullRequestCommentControllerStub } from "../../../../tests/stubs/PullRequestCommentControllerStub";
import { CurrentPullRequestUserPresenterStub } from "../../../../tests/stubs/CurrentPullRequestUserPresenterStub";
import { CurrentPullRequestPresenterStub } from "../../../../tests/stubs/CurrentPullRequestPresenterStub";
import { SideBySideCodeMirrorWidgetCreator } from "./side-by-side-code-mirror-widget-creator";
import { InlineCommentContextStub } from "../../../../tests/stubs/InlineCommentContextStub";

import { TAG_NAME as NEW_COMMENT_FORM_TAG_NAME } from "../../comments/new-comment-form/NewInlineCommentForm";
import { TAG_NAME as COMMENT_TAG_NAME } from "../../comments/PullRequestComment";
import { TAG_NAME as PLACEHOLDER_TAG_NAME } from "../FileDiffPlaceholder";
import type { StorePullRequestCommentReplies } from "../../comments/PullRequestCommentRepliesStore";
import { PullRequestCommentRepliesStore } from "../../comments/PullRequestCommentRepliesStore";

type EditorThatCanHaveWidgets = Editor & {
    addLineWidget: jest.SpyInstance;
    getLineHandle: () => FileLineHandle;
};

describe("side-by-side-code-mirror-widget-creator", () => {
    let doc: Document,
        createElement: jest.SpyInstance,
        code_mirror: EditorThatCanHaveWidgets,
        relative_date_helper: IRelativeDateHelper,
        controller: ControlPullRequestComment,
        comments_store: StorePullRequestCommentReplies,
        pull_request: PullRequestPresenter,
        current_user: CurrentPullRequestUserPresenter;

    const getWidgetCreator = (): CreateFileDiffWidget =>
        SideBySideCodeMirrorWidgetCreator(
            doc,
            relative_date_helper,
            controller,
            comments_store,
            pull_request,
            current_user
        );

    beforeEach(() => {
        doc = document.implementation.createHTMLDocument();
        createElement = jest.spyOn(doc, "createElement");

        code_mirror = {
            addLineWidget: jest.fn(),
            getLineHandle: () => ({ widgets: [] }),
        } as unknown as EditorThatCanHaveWidgets;

        relative_date_helper = RelativeDateHelperStub;
        controller = PullRequestCommentControllerStub();
        comments_store = PullRequestCommentRepliesStore([]);
        current_user = CurrentPullRequestUserPresenterStub.withDefault();
        pull_request = CurrentPullRequestPresenterStub.withDefault();
    });

    describe("displayPlaceholderWidget()", () => {
        it("should create a tuleap-pullrequest-placeholder and add it to the target codemirror", () => {
            const widget_creation_params = {
                code_mirror,
                handle: { line_number: 10 } as unknown as FileLineHandle,
                widget_height: 60,
                display_above_line: true,
                is_comment_placeholder: false,
            };

            const placeholder = document.createElement(
                PLACEHOLDER_TAG_NAME
            ) as FileDiffPlaceholderWidget;
            createElement.mockReturnValue(placeholder);

            getWidgetCreator().displayPlaceholderWidget(widget_creation_params);

            expect(placeholder.height).toStrictEqual(widget_creation_params.widget_height);
            expect(placeholder.isReplacingAComment).toBe(
                widget_creation_params.is_comment_placeholder
            );

            expect(code_mirror.addLineWidget).toHaveBeenCalledWith(
                widget_creation_params.handle,
                placeholder,
                {
                    coverGutter: true,
                    above: widget_creation_params.display_above_line,
                }
            );
        });
    });

    describe("displayInlineCommentWidget()", () => {
        it("should create a tuleap-pull-request-element and add it to the target codemirror", () => {
            const comment = PullRequestCommentPresenterStub.buildFileDiffCommentPresenter();
            const post_rendering_callback = (): void => {
                // Do nothing
            };

            const inline_comment_widget = document.createElement(
                COMMENT_TAG_NAME
            ) as InlineCommentWidget;
            createElement.mockReturnValue(inline_comment_widget);

            getWidgetCreator().displayInlineCommentWidget({
                code_mirror,
                comment,
                line_number: 12,
                post_rendering_callback,
            });

            expect(inline_comment_widget.comment).toStrictEqual(comment);
            expect(inline_comment_widget.relativeDateHelper).toStrictEqual(relative_date_helper);
            expect(inline_comment_widget.controller).toStrictEqual(controller);
            expect(inline_comment_widget.currentUser).toStrictEqual(current_user);
            expect(inline_comment_widget.currentPullRequest).toStrictEqual(pull_request);
            expect(inline_comment_widget.post_rendering_callback).toStrictEqual(
                post_rendering_callback
            );

            expect(code_mirror.addLineWidget).toHaveBeenCalledWith(12, inline_comment_widget, {
                coverGutter: true,
            });
        });
    });

    describe("displayNewInlineCommentFormWidget", () => {
        it(`should create a tuleap-pullrequest-new-comment-form that:
            - is added to the target codemirror
            - is removed when the new comment has been submitted
            - is replaced by a tuleap-pull-request-element afterwards`, () => {
            const context = InlineCommentContextStub.widthDefaultContext();
            const post_rendering_callback = (): void => {
                // Do nothing
            };

            const new_comment_form = document.createElement(
                NEW_COMMENT_FORM_TAG_NAME
            ) as NewInlineCommentFormWidget;
            const inline_comment_widget = document.createElement(
                COMMENT_TAG_NAME
            ) as InlineCommentWidget;
            createElement.mockReturnValueOnce(new_comment_form);
            createElement.mockReturnValueOnce(inline_comment_widget);

            const line_widget = {
                node: new_comment_form,
                clear: jest.fn(),
            };
            code_mirror.addLineWidget.mockReturnValueOnce(line_widget);

            getWidgetCreator().displayNewInlineCommentFormWidget({
                code_mirror,
                line_number: 15,
                context,
                post_rendering_callback,
            });

            expect(new_comment_form.comment_saver).toBeDefined();
            expect(new_comment_form.post_rendering_callback).toStrictEqual(post_rendering_callback);
            expect(new_comment_form.on_cancel_callback).toBeDefined();
            expect(new_comment_form.post_submit_callback).toBeDefined();

            expect(code_mirror.addLineWidget).toHaveBeenCalledWith(15, new_comment_form, {
                coverGutter: true,
            });

            const new_comment = PullRequestCommentPresenterStub.buildFileDiffCommentPresenter();
            new_comment_form.post_submit_callback(new_comment);

            expect(line_widget.clear).toHaveBeenCalledTimes(1);
            expect(comments_store.getAllRootComments()).toStrictEqual([new_comment]);

            expect(code_mirror.addLineWidget).toHaveBeenCalledWith(15, inline_comment_widget, {
                coverGutter: true,
            });
        });
    });
});
