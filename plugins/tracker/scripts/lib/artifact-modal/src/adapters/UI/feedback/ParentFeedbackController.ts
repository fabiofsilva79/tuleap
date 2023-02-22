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

import { ParentFeedbackPresenter } from "./ParentFeedbackPresenter";
import type { ParentArtifactIdentifier } from "../../../domain/parent/ParentArtifactIdentifier";
import type { RetrieveParent } from "../../../domain/parent/RetrieveParent";
import type { DispatchEvents } from "../../../domain/DispatchEvents";
import { WillNotifyFault } from "../../../domain/WillNotifyFault";

export type ParentFeedbackControllerType = {
    displayParentFeedback(): PromiseLike<ParentFeedbackPresenter>;
};

export const ParentFeedbackController = (
    retriever: RetrieveParent,
    event_dispatcher: DispatchEvents,
    parent_identifier: ParentArtifactIdentifier | null
): ParentFeedbackControllerType => ({
    displayParentFeedback: (): Promise<ParentFeedbackPresenter> => {
        if (!parent_identifier) {
            return Promise.resolve(ParentFeedbackPresenter.buildEmpty());
        }
        return retriever.getParent(parent_identifier).match(
            (artifact) => ParentFeedbackPresenter.fromArtifact(artifact),
            (fault) => {
                event_dispatcher.dispatch(WillNotifyFault(fault));
                return ParentFeedbackPresenter.buildEmpty();
            }
        );
    },
});
