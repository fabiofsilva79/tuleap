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

namespace Tuleap\ProgramManagement\Adapter\Program\Backlog\ProgramIncrement\Source\Changeset\Values;

use Tuleap\ProgramManagement\Domain\Program\Backlog\ProgramIncrement\Source\Changeset\Values\ChangesetValueNotFoundException;
use Tuleap\ProgramManagement\Domain\Program\Backlog\ProgramIncrement\Source\Changeset\Values\RetrieveDescriptionValue;
use Tuleap\ProgramManagement\Domain\Program\Backlog\ProgramIncrement\Source\Changeset\Values\RetrieveStartDateValue;
use Tuleap\ProgramManagement\Domain\Program\Backlog\ProgramIncrement\Source\Changeset\Values\RetrieveTitleValue;
use Tuleap\ProgramManagement\Domain\Program\Backlog\ProgramIncrement\Source\Changeset\Values\TextFieldValue;
use Tuleap\ProgramManagement\Domain\Program\Backlog\ProgramIncrement\Source\Changeset\Values\UnsupportedTitleFieldException;
use Tuleap\ProgramManagement\Domain\Program\Backlog\ProgramIncrement\Source\Fields\SynchronizedFields;
use Tuleap\ProgramManagement\Domain\Program\Backlog\ProgramIncrement\Source\ReplicationData;

final class ArtifactFieldValuesRetriever implements RetrieveTitleValue, RetrieveDescriptionValue, RetrieveStartDateValue
{
    public function getTitleValue(ReplicationData $replication, SynchronizedFields $fields): string
    {
        $changeset   = $replication->getFullChangeset();
        $title_field = $fields->getTitleField();
        $title_value = $changeset->getValue($title_field->getFullField());
        if (! $title_value) {
            throw new ChangesetValueNotFoundException(
                (int) $changeset->getId(),
                $title_field->getId(),
                'title'
            );
        }
        if (! ($title_value instanceof \Tracker_Artifact_ChangesetValue_String)) {
            throw new UnsupportedTitleFieldException($title_field->getId());
        }
        return $title_value->getValue();
    }

    public function getDescriptionValue(ReplicationData $replication, SynchronizedFields $fields): TextFieldValue
    {
        $changeset         = $replication->getFullChangeset();
        $description_field = $fields->getDescriptionField();
        $description_value = $changeset->getValue($description_field->getFullField());
        if (! $description_value) {
            throw new ChangesetValueNotFoundException(
                (int) $changeset->getId(),
                $description_field->getId(),
                'description'
            );
        }
        assert($description_value instanceof \Tracker_Artifact_ChangesetValue_Text);
        return new TextFieldValueProxy($description_value->getValue(), $description_value->getFormat());
    }

    public function getStartDateValue(ReplicationData $replication, SynchronizedFields $fields): string
    {
        $changeset        = $replication->getFullChangeset();
        $start_date_field = $fields->getStartDateField();
        $start_date_value = $changeset->getValue($start_date_field->getFullField());
        if (! $start_date_value) {
            throw new ChangesetValueNotFoundException(
                (int) $changeset->getId(),
                $start_date_field->getId(),
                'timeframe start date'
            );
        }
        assert($start_date_value instanceof \Tracker_Artifact_ChangesetValue_Date);
        return $start_date_value->getDate();
    }
}