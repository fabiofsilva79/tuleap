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

namespace Tuleap\OnlyOffice\Administration;

use Tuleap\OnlyOffice\DocumentServer\DocumentServer;
use Tuleap\OnlyOffice\DocumentServer\RestrictedProject;

/**
 * @psalm-immutable
 */
final class OnlyOfficeServerPresenter
{
    public string $delete_url;
    public string $update_url;
    public int $nb_project_restrictions;

    /**
     * @param array<int, RestrictedProjectPresenter> $project_restrictions
     */
    private function __construct(
        public int $id,
        public string $server_url,
        public bool $has_existing_secret,
        public bool $is_project_restricted,
        public array $project_restrictions,
    ) {
        $this->delete_url = OnlyOfficeDeleteAdminSettingsController::URL . '/' . $id;
        $this->update_url = OnlyOfficeUpdateAdminSettingsController::URL . '/' . $id;

        $this->nb_project_restrictions = count($this->project_restrictions);
    }

    public static function fromServer(DocumentServer $server): self
    {
        return new self(
            $server->id,
            $server->url,
            $server->has_existing_secret,
            $server->is_project_restricted,
            array_map(
                static fn(RestrictedProject $project) => RestrictedProjectPresenter::fromRestrictedProject($project),
                $server->project_restrictions,
            ),
        );
    }
}
