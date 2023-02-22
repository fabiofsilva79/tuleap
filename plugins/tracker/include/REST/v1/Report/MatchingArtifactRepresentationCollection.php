<?php
/**
 * Copyright (c) Enalean, 2022 — Present. All Rights Reserved.
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

namespace Tuleap\Tracker\REST\v1\Report;

use Tuleap\Tracker\REST\Artifact\ArtifactRepresentation;

/**
 * @psalm-immutable
 */
class MatchingArtifactRepresentationCollection
{
    /**
     * @psalm-param list<ArtifactRepresentation> $artifact_representations
     */
    public function __construct(
        private array $artifact_representations,
        private int $total_size,
    ) {
    }

    /**
     * @psalm-return list<ArtifactRepresentation>
     */
    public function getArtifactRepresentations(): array
    {
        return $this->artifact_representations;
    }

    public function getTotalSize(): int
    {
        return $this->total_size;
    }
}
