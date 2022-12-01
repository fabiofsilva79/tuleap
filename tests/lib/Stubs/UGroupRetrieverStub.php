<?php
/**
 * Copyright (c) Enalean, 2022 - Present. All Rights Reserved.
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


namespace Tuleap\Test\Stubs;

use Project;
use ProjectUGroup;

class UGroupRetrieverStub implements \Tuleap\Project\UGroupRetriever
{
    private function __construct(private array $ugroups)
    {
    }

    public static function buildWithUserGroups(ProjectUGroup ...$user_groups): self
    {
        $ugroups = [];
        foreach ($user_groups as $user_group) {
            $ugroups[$user_group->getId()] = $user_group;
        }

        return new self($ugroups);
    }

    /**
     * @inheritDoc
     */
    public function getUGroup(Project $project, $ugroup_id): ?ProjectUGroup
    {
        return $this->ugroups[$ugroup_id] ?? null;
    }
}
