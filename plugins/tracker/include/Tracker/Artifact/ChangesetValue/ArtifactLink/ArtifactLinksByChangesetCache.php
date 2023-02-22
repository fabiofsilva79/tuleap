<?php
/**
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

declare(strict_types=1);

namespace Tuleap\Tracker\Artifact\ChangesetValue\ArtifactLink;

use Tracker_Artifact_Changeset;

final class ArtifactLinksByChangesetCache
{
    /**
     * @psalm-var array<int, CollectionOfForwardLinks>
     */
    private array $artifact_links_by_changeset = [];

    public function hasCachedLinksInfoForChangeset(Tracker_Artifact_Changeset $changeset): bool
    {
        return isset($this->artifact_links_by_changeset[(int) $changeset->getId()]);
    }

    public function cacheLinksInfoForChangeset(Tracker_Artifact_Changeset $changeset, CollectionOfForwardLinks $links): void
    {
        $this->artifact_links_by_changeset[(int) $changeset->getId()] = $links;
    }

    public function getCachedLinksInfoForChangeset(Tracker_Artifact_Changeset $changeset): CollectionOfForwardLinks
    {
        return $this->artifact_links_by_changeset[(int) $changeset->getId()];
    }
}
