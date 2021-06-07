<?php
/**
 * Copyright (c) Enalean, 2021 - Present. All Rights Reserved.
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
use Tuleap\ProgramManagement\Domain\Program\Backlog\ProgramIncrement\Team\TeamProjectsCollectionBuilder;
use Tuleap\ProgramManagement\Domain\Program\Backlog\TrackerCollection;
use Tuleap\ProgramManagement\Domain\Program\Backlog\TrackerRetrievalException;
use Tuleap\ProgramManagement\Domain\Program\PlanningConfiguration\PlanningNotFoundException;
use Tuleap\ProgramManagement\Domain\Program\ProgramIdentifier;
use Tuleap\ProgramManagement\Domain\Team\MirroredTimebox\RetrievePlanningMilestoneTracker;

class IterationCreatorChecker
{
    private TeamProjectsCollectionBuilder $team_projects_collection_builder;
    private RetrievePlanningMilestoneTracker $root_milestone_retriever;
    private LoggerInterface $logger;

    public function __construct(
        TeamProjectsCollectionBuilder $team_projects_collection_builder,
        RetrievePlanningMilestoneTracker $root_milestone_retriever,
        LoggerInterface $logger
    ) {
        $this->team_projects_collection_builder = $team_projects_collection_builder;
        $this->root_milestone_retriever         = $root_milestone_retriever;
        $this->logger                           = $logger;
    }

    public function canCreateAnIteration(PFUser $user, ProgramIdentifier $program): bool
    {
        $this->logger->debug(
            sprintf(
                'Checking if Iteration can be created in second planning of project #%s by user %s (#%s)',
                $program->getId(),
                $user->getName(),
                $user->getId()
            )
        );

        $team_projects_collection = $this->team_projects_collection_builder->getTeamProjectForAGivenProgramProject(
            $program
        );
        if ($team_projects_collection->isEmpty()) {
            $this->logger->debug("No team project found.");
            return true;
        }
        try {
            TrackerCollection::buildSecondPlanningMilestoneTracker(
                $this->root_milestone_retriever,
                $team_projects_collection,
                $user
            );
        } catch (PlanningNotFoundException | TrackerRetrievalException $exception) {
            $this->logger->error("Cannot retrieve all milestones", ['exception' => $exception]);
        }

        return true;
    }
}