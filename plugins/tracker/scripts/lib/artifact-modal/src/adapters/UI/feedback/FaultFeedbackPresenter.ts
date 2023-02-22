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

import type { Fault } from "@tuleap/fault";
import { sprintf } from "sprintf-js";
import {
    getCommentsRetrievalErrorMessage,
    getLinkFieldFetchErrorMessage,
    getMatchingArtifactErrorMessage,
    getParentFetchErrorMessage,
    getPossibleParentErrorMessage,
    getSearchArtifactsErrorMessage,
    getUserHistoryErrorMessage,
} from "../../../gettext-catalog";

export type FaultFeedbackPresenter = {
    readonly message: string;
};

const isLinkRetrievalFault = (fault: Fault): boolean =>
    "isLinkRetrieval" in fault && fault.isLinkRetrieval() === true;
const isParentRetrievalFault = (fault: Fault): boolean =>
    "isParentRetrieval" in fault && fault.isParentRetrieval() === true;
const isMatchingArtifactRetrievalFault = (fault: Fault): boolean =>
    "isMatchingArtifactRetrieval" in fault && fault.isMatchingArtifactRetrieval() === true;
const isPossibleParentsRetrievalFault = (fault: Fault): boolean =>
    "isPossibleParentsRetrieval" in fault && fault.isPossibleParentsRetrieval() === true;
const isUserHistoryFault = (fault: Fault): boolean =>
    "isUserHistoryRetrieval" in fault && fault.isUserHistoryRetrieval() === true;
const isSearchArtifacts = (fault: Fault): boolean =>
    "isSearchArtifacts" in fault && fault.isSearchArtifacts() === true;
const isCommentsRetrieval = (fault: Fault): boolean =>
    "isCommentsRetrieval" in fault && fault.isCommentsRetrieval() === true;

export const FaultFeedbackPresenter = {
    buildEmpty: (): FaultFeedbackPresenter => ({ message: "" }),
    fromFault: (fault: Fault): FaultFeedbackPresenter => {
        if (isLinkRetrievalFault(fault)) {
            return { message: sprintf(getLinkFieldFetchErrorMessage(), fault) };
        }
        if (isParentRetrievalFault(fault)) {
            return { message: sprintf(getParentFetchErrorMessage(), fault) };
        }
        if (isMatchingArtifactRetrievalFault(fault)) {
            return { message: sprintf(getMatchingArtifactErrorMessage(), fault) };
        }
        if (isPossibleParentsRetrievalFault(fault)) {
            return { message: sprintf(getPossibleParentErrorMessage(), fault) };
        }
        if (isUserHistoryFault(fault)) {
            return { message: sprintf(getUserHistoryErrorMessage(), fault) };
        }
        if (isSearchArtifacts(fault)) {
            return { message: sprintf(getSearchArtifactsErrorMessage(), fault) };
        }
        if (isCommentsRetrieval(fault)) {
            return { message: sprintf(getCommentsRetrievalErrorMessage(), fault) };
        }
        return { message: String(fault) };
    },
};
