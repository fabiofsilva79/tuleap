<?php
/**
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
 *
 */

declare(strict_types=1);

namespace Tuleap\MediawikiStandalone\Configuration;

use Tuleap\DB\DataAccessObject;
use Tuleap\MediawikiStandalone\Service\MediawikiStandaloneService;

class ProjectMediaWikiServiceDAO extends DataAccessObject
{
    /**
     * @return array{project_name: string}[]
     */
    public function searchAllProjectsWithMediaWikiStandaloneServiceEnabled(): array
    {
        return $this->getDB()->run(
            'SELECT unix_group_name AS project_name
                       FROM `groups`
                       JOIN service ON (service.group_id = `groups`.group_id)
                       AND status != "D"
                       WHERE service.is_used = 1 AND service.short_name = ?',
            MediawikiStandaloneService::SERVICE_SHORTNAME
        );
    }
}
