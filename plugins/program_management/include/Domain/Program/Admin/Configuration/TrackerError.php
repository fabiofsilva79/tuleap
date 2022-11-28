<?php
/**
 * Copyright (c) Enalean 2022 - Present. All Rights Reserved.
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
 *
 *
 */

declare(strict_types=1);

namespace Tuleap\ProgramManagement\Domain\Program\Admin\Configuration;

use Tuleap\ProgramManagement\Domain\Program\Backlog\CreationCheck\ConfigurationErrorsGatherer;
use Tuleap\ProgramManagement\Domain\Program\Plan\RetrievePlannableTrackers;
use Tuleap\ProgramManagement\Domain\Program\ProgramIdentifier;
use Tuleap\ProgramManagement\Domain\TrackerReference;
use Tuleap\ProgramManagement\Domain\Workspace\Tracker\VerifyTrackerSemantics;
use Tuleap\ProgramManagement\Domain\Workspace\UserReference;

/**
 * @psalm-immutable
 */
final class TrackerError
{
    public bool $has_presenter_errors;
    public bool $has_status_field_not_defined;
    public bool $has_status_missing_in_teams;
    public bool $has_status_missing_values;
    /**
     * @var int[]
     */
    public array $teams_with_error = [];

    private function __construct(public ?ConfigurationErrorsCollector $collector)
    {
        $has_semantic_errors       = $collector && count($collector->getSemanticErrors()) > 0;
        $has_required_field_errors = $collector && count($collector->getRequiredFieldsErrors()) > 0;
        $has_workflow_error        = $collector && (count($collector->getTransitionRuleError()) > 0
                || count($collector->getTransitionRuleDateError()) > 0
                || count($collector->getFieldDependencyError()) > 0);

        $has_field_permission_errors = $collector && (count($collector->getNonSubmittableFields()) > 0
                || count($collector->getNonUpdatableFields()) > 0);

        $user_can_not_submit_in_team = $collector && count($collector->getTeamsWithError()) > 0;

        $this->has_status_field_not_defined = $collector && count($collector->getSemanticStatusNoField()) > 0;
        $this->has_status_missing_in_teams  = $collector && count($collector->getStatusMissingInTeams()) > 0;
        $this->has_status_missing_values    = $collector && count($collector->getSemanticStatusMissingValues()) > 0;
        $has_semantic_status_errors         = $collector && (count($collector->getStatusMissingInTeams()) > 0
                || count($collector->getSemanticStatusNoField()) > 0
                || count($collector->getSemanticStatusMissingValues()) > 0);

        $has_synchronization_errors = $collector && (count($collector->getTitleHasIncorrectTypeError()) > 0 ||
                count($collector->getMissingArtifactLinkErrors()) > 0);

        $has_planning_error = $collector && (count($collector->getNoMilestonePlanning()) > 0 || count($collector->getNoSprintPlanning()) > 0);

        if ($collector) {
            $this->teams_with_error = $collector->getTeamsWithError();
        }

        $this->has_presenter_errors = $has_semantic_errors
            || $has_required_field_errors
            || $has_workflow_error
            || $has_field_permission_errors
            || $user_can_not_submit_in_team
            || $has_semantic_status_errors
            || $has_synchronization_errors
            || $has_planning_error;
    }

    public static function fromTracker(
        ConfigurationErrorsGatherer $errors_gatherer,
        TrackerReference $tracker,
        UserReference $user_identifier,
        ConfigurationErrorsCollector $errors_collector,
    ): self {
        $errors_gatherer->gatherConfigurationErrors($tracker, $user_identifier, $errors_collector);

        return self::fromAlreadyCollectedErrors($errors_collector);
    }

    public static function buildProgramIncrementError(
        ConfigurationErrorsGatherer $errors_gatherer,
        TrackerReference $program_increment_tracker,
        ?ProgramIdentifier $program,
        UserReference $user_identifier,
        ConfigurationErrorsCollector $errors_collector,
    ): ?TrackerError {
        if (! $program) {
            return null;
        }

        $errors_gatherer->gatherConfigurationErrors($program_increment_tracker, $user_identifier, $errors_collector);

        return self::fromAlreadyCollectedErrors($errors_collector);
    }

    public static function buildIterationError(
        ConfigurationErrorsGatherer $errors_gatherer,
        ?TrackerReference $iteration_tracker,
        UserReference $user_identifier,
        ConfigurationErrorsCollector $errors_collector,
    ): ?TrackerError {
        if (! $iteration_tracker) {
            return null;
        }

        $errors_gatherer->gatherConfigurationErrors($iteration_tracker, $user_identifier, $errors_collector);

        return self::fromAlreadyCollectedErrors($errors_collector);
    }

    public static function buildPlannableError(
        RetrievePlannableTrackers $plannable_trackers_retriever,
        VerifyTrackerSemantics $verify_tracker_semantics,
        ProgramIdentifier $program,
        ConfigurationErrorsCollector $plannable_error_collector,
    ): ?TrackerError {
        $plannable_tracker = $plannable_trackers_retriever->getPlannableTrackersOfProgram($program->getId());
        foreach ($plannable_tracker as $tracker_reference) {
            if (! $verify_tracker_semantics->hasTitleSemantic($tracker_reference->getId())) {
                $plannable_error_collector->addSemanticError('Title', 'title', [$tracker_reference]);
            }

            if (! $verify_tracker_semantics->hasStatusSemantic($tracker_reference->getId())) {
                $plannable_error_collector->addSemanticError('Status', 'status', [$tracker_reference]);
            }
        }

        return self::fromAlreadyCollectedErrors($plannable_error_collector);
    }

    public static function fromAlreadyCollectedErrors(ConfigurationErrorsCollector $errors_collector): self
    {
        return new self($errors_collector);
    }
}
