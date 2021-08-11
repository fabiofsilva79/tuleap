<?php
/**
 * Copyright (c) Enalean, 2021-Present. All Rights Reserved.
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

namespace Tuleap\ProgramManagement\Tests\Builder;

use Tuleap\ProgramManagement\Adapter\Program\Backlog\ProgramIncrement\ReplicationDataAdapter;
use Tuleap\ProgramManagement\Domain\Program\Backlog\ProgramIncrement\Source\ReplicationData;
use Tuleap\Test\Builders\ProjectTestBuilder;
use Tuleap\Test\Builders\UserTestBuilder;
use Tuleap\Tracker\Test\Builders\ArtifactTestBuilder;
use Tuleap\Tracker\Test\Builders\TrackerTestBuilder;

final class ReplicationDataBuilder
{
    public static function buildWithArtifactId(int $artifact_id): ReplicationData
    {
        $program_project         = ProjectTestBuilder::aProject()->withId(578)
            ->build();
        $source_timebox_tracker  = TrackerTestBuilder::aTracker()->withId(1)
            ->withProject($program_project)
            ->build();
        $source_timebox_artifact = ArtifactTestBuilder::anArtifact($artifact_id)
            ->inTracker($source_timebox_tracker)
            ->inProject($program_project)
            ->build();
        $user                    = UserTestBuilder::aUser()->withId(101)->build();
        $changeset               = new \Tracker_Artifact_Changeset(
            2604,
            $source_timebox_artifact,
            $user->getId(),
            1234567890,
            null
        );
        return ReplicationDataAdapter::build($source_timebox_artifact, $user, $changeset);
    }

    public static function build(): ReplicationData
    {
        return self::buildWithArtifactId(311);
    }
}
