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

namespace Tuleap\MediawikiStandalone\Permissions;

use Tuleap\DB\DataAccessObject;

final class MediawikiPermissionsDao extends DataAccessObject implements ISearchByProject, ISaveProjectPermissions, IUpdatePermissionsFollowingSiteAccessChange
{
    /**
     * @return list<array{ ugroup_id: int, permission: string }>
     */
    public function searchByProject(\Project $project): array
    {
        return $this->getDB()->run(
            'SELECT ugroup_id, permission
            FROM plugin_mediawiki_standalone_permissions
            WHERE project_id = ?',
            $project->getID()
        );
    }

    /**
     * @param \ProjectUGroup[] $readers
     * @param \ProjectUGroup[] $writers
     * @param \ProjectUGroup[] $admins
     */
    public function saveProjectPermissions(\Project $project, array $readers, array $writers, array $admins): void
    {
        $insertions = [];
        foreach ($readers as $user_group) {
            $insertions[] = [
                'project_id' => $project->getID(),
                'permission' => PermissionRead::NAME,
                'ugroup_id'  => $user_group->getId(),
            ];
        }
        foreach ($writers as $user_group) {
            $insertions[] = [
                'project_id' => $project->getID(),
                'permission' => PermissionWrite::NAME,
                'ugroup_id'  => $user_group->getId(),
            ];
        }
        foreach ($admins as $user_group) {
            $insertions[] = [
                'project_id' => $project->getID(),
                'permission' => PermissionAdmin::NAME,
                'ugroup_id'  => $user_group->getId(),
            ];
        }

        $this->getDB()->tryFlatTransaction(
            function () use ($project, $insertions) {
                $this->getDB()->delete('plugin_mediawiki_standalone_permissions', ['project_id' => $project->getID()]);
                if (! empty($insertions)) {
                    $this->getDB()->insertMany('plugin_mediawiki_standalone_permissions', $insertions);
                }
            }
        );
    }

    public function duplicateProjectPermissions(\Project $from_project, \Project $to_project, array $ugroup_mapping): void
    {
        $this->getDB()->tryFlatTransaction(
            function () use ($from_project, $to_project, $ugroup_mapping) {
                // Dynamic ugroups
                $this->getDB()->run(
                    <<<EOS
                        INSERT INTO plugin_mediawiki_standalone_permissions(project_id, permission, ugroup_id)
                        SELECT ?, permission, ugroup_id
                        FROM plugin_mediawiki_standalone_permissions
                        WHERE project_id = ?
                          AND ugroup_id < 100
                    EOS,
                    $to_project->getID(),
                    $from_project->getID(),
                );

                // Static ugroups
                foreach ($ugroup_mapping as $from_ugroup_id => $to_ugroup_id) {
                    $this->getDB()->run(
                        <<<EOS
                            INSERT INTO plugin_mediawiki_standalone_permissions(project_id, permission, ugroup_id)
                            SELECT ?, permission, ?
                            FROM plugin_mediawiki_standalone_permissions
                            WHERE project_id = ?
                              AND ugroup_id = ?
                        EOS,
                        $to_project->getID(),
                        $to_ugroup_id,
                        $from_project->getID(),
                        $from_ugroup_id
                    );
                }
            }
        );
    }

    public function updateAllAnonymousAccessToRegistered(): void
    {
        $this->getDB()->update(
            'plugin_mediawiki_standalone_permissions',
            ['ugroup_id' => \ProjectUGroup::REGISTERED],
            ['ugroup_id' => \ProjectUGroup::ANONYMOUS]
        );
    }

    public function updateAllAuthenticatedAccessToRegistered(): void
    {
        $this->getDB()->update(
            'plugin_mediawiki_standalone_permissions',
            ['ugroup_id' => \ProjectUGroup::REGISTERED],
            ['ugroup_id' => \ProjectUGroup::AUTHENTICATED]
        );
    }
}
