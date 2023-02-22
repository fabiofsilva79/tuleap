/*
 * Copyright (c) Enalean, 2014-Present. All Rights Reserved.
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

export default function SharedPropertiesService() {
    var property = {
        user_id: undefined,
        view_mode: undefined,
        project_id: undefined,
        milestone_id: undefined,
        is_in_explicit_top_backlog: undefined,
        allowed_additional_panes_to_display: [],
    };

    return {
        getUserId,
        setUserId,
        getViewMode,
        setViewMode,
        getProjectId,
        setProjectId,
        getMilestoneId,
        setMilestoneId,
        isInExplicitTopBacklogManagement,
        setIsInExplicitTopBacklogManagement,
        setAllowedAdditionalPanesToDisplay,
        getAllowedAdditionalPanesToDisplay,
    };

    function getUserId() {
        return property.user_id;
    }

    function setUserId(user_id) {
        property.user_id = user_id;
    }

    function getViewMode() {
        return property.view_mode;
    }

    function setViewMode(view_mode) {
        property.view_mode = view_mode;
    }

    function getProjectId() {
        return property.project_id;
    }

    function setProjectId(project_id) {
        property.project_id = project_id;
    }

    function getMilestoneId() {
        return property.milestone_id;
    }

    function setMilestoneId(milestone_id) {
        property.milestone_id = milestone_id;
    }

    function isInExplicitTopBacklogManagement() {
        return property.is_in_explicit_top_backlog;
    }

    function setIsInExplicitTopBacklogManagement(is_in_explicit_top_backlog) {
        property.is_in_explicit_top_backlog = is_in_explicit_top_backlog;
    }

    function setAllowedAdditionalPanesToDisplay(allowed_additional_panes_to_display) {
        property.allowed_additional_panes_to_display = allowed_additional_panes_to_display;
    }

    function getAllowedAdditionalPanesToDisplay() {
        return property.allowed_additional_panes_to_display;
    }
}
