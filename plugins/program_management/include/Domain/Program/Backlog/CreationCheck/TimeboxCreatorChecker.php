<?php
/**
 * Copyright (c) Enalean, 2020 - Present. All Rights Reserved.
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

declare(strict_types=1);

namespace Tuleap\ProgramManagement\Domain\Program\Backlog\CreationCheck;

use PFUser;
use Psr\Log\LoggerInterface;
use Tuleap\ProgramManagement\Domain\Program\Backlog\ProgramIncrement\Source\Fields\FieldSynchronizationException;
use Tuleap\ProgramManagement\Domain\Program\Backlog\ProgramIncrement\Source\Fields\SynchronizedFieldFromProgramAndTeamTrackersCollectionBuilder;
use Tuleap\ProgramManagement\Domain\Program\Backlog\ProgramIncrement\Team\TeamProjectsCollectionBuilder;
use Tuleap\ProgramManagement\Domain\Program\Backlog\TrackerCollection;
use Tuleap\ProgramManagement\Domain\Program\Backlog\TrackerCollectionFactory;
use Tuleap\ProgramManagement\Domain\Program\Backlog\TrackerRetrievalException;
use Tuleap\ProgramManagement\Domain\Program\PlanningConfiguration\PlanningNotFoundException;
use Tuleap\ProgramManagement\Domain\ProgramTracker;
use Tuleap\ProgramManagement\Domain\Project;
use Tuleap\ProgramManagement\Domain\Team\MirroredTimebox\RetrieveRootPlanningMilestoneTracker;

class TimeboxCreatorChecker
{
    /**
     * @var TeamProjectsCollectionBuilder
     */
    private $projects_builder;
    /**
     * @var TrackerCollectionFactory
     */
    private $scale_trackers_factory;
    /**
     * @var SynchronizedFieldFromProgramAndTeamTrackersCollectionBuilder
     */
    private $field_collection_builder;
    /**
     * @var CheckSemantic
     */
    private $semantic_checker;

    /**
     * @var CheckRequiredField
     */
    private $required_field_checker;
    /**
     * @var CheckWorkflow
     */
    private $workflow_checker;
    /**
     * @var LoggerInterface
     */
    private $logger;

    private RetrieveRootPlanningMilestoneTracker $root_milestone_retriever;

    public function __construct(
        TeamProjectsCollectionBuilder $team_projects_collection_builder,
        TrackerCollectionFactory $scale_tracker_factory,
        SynchronizedFieldFromProgramAndTeamTrackersCollectionBuilder $field_collection_builder,
        CheckSemantic $semantic_checker,
        CheckRequiredField $required_field_checker,
        CheckWorkflow $workflow_checker,
        LoggerInterface $logger,
        RetrieveRootPlanningMilestoneTracker $root_milestone_retriever
    ) {
        $this->projects_builder         = $team_projects_collection_builder;
        $this->scale_trackers_factory   = $scale_tracker_factory;
        $this->field_collection_builder = $field_collection_builder;
        $this->semantic_checker         = $semantic_checker;
        $this->required_field_checker   = $required_field_checker;
        $this->workflow_checker         = $workflow_checker;
        $this->logger                   = $logger;
        $this->root_milestone_retriever = $root_milestone_retriever;
    }

    public function canTimeboxBeCreated(ProgramTracker $tracker_data, Project $project_data, PFUser $user): bool
    {
        $program_project = $project_data;
        $this->logger->debug(
            "Checking if milestone can be created in planning of project " . $program_project->getName() .
            " by user " . $user->getName() . ' (#' . $user->getId() . ')'
        );

        $team_projects_collection = $this->projects_builder->getTeamProjectForAGivenProgramProject(
            $program_project
        );
        if ($team_projects_collection->isEmpty()) {
            $this->logger->debug("No team project found.");
            return true;
        }
        try {
            $program_and_milestone_trackers = $this->scale_trackers_factory->buildFromProgramProjectAndItsTeam(
                $program_project,
                $team_projects_collection,
                $user
            );
            $team_trackers                  = TrackerCollection::buildRootPlanningMilestoneTrackers(
                $this->root_milestone_retriever,
                $team_projects_collection,
                $user
            );
        } catch (PlanningNotFoundException | TrackerRetrievalException $exception) {
            $this->logger->error("Cannot retrieve all milestones", ['exception' => $exception]);
            return false;
        }
        if (! $this->semantic_checker->areTrackerSemanticsWellConfigured($tracker_data, $team_trackers)) {
            $this->logger->error("Semantics are not well configured.");

            return false;
        }
        if (! $team_trackers->canUserSubmitAnArtifactInAllTrackers($user)) {
            $this->logger->debug("User cannot submit an artifact in all team trackers.");

            return false;
        }

        try {
            $synchronized_fields_data_collection = $this->field_collection_builder->buildFromSourceTrackers($program_and_milestone_trackers);
        } catch (FieldSynchronizationException $exception) {
            $this->logger->error("Cannot retrieve all the synchronized fields", ['exception' => $exception]);
            return false;
        }
        if (! $synchronized_fields_data_collection->canUserSubmitAndUpdateAllFields($user)) {
            $this->logger->debug("User cannot submit and update all needed fields in all trackers.");
            return false;
        }

        if (
            ! $this->required_field_checker->areRequiredFieldsOfTeamTrackersLimitedToTheSynchronizedFields(
                $team_trackers,
                $synchronized_fields_data_collection
            )
        ) {
            $this->logger->debug("A team tracker has a required fields outside the synchronized fields.");
            return false;
        }

        if (
            ! $this->workflow_checker->areWorkflowsNotUsedWithSynchronizedFieldsInTeamTrackers(
                $team_trackers,
                $synchronized_fields_data_collection
            )
        ) {
            $this->logger->debug("A team tracker is using one of the synchronized fields in a workflow rule.");
            return false;
        }

        $this->logger->debug("User can create a milestone in the project.");
        return true;
    }
}