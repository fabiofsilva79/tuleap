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
 */

CREATE TABLE IF NOT EXISTS plugin_mediawiki_standalone_permissions (
    project_id INT NOT NULL,
    permission VARCHAR(10),
    ugroup_id INT NOT NULL,
    INDEX idx_project(project_id, permission(10)),
    INDEX idx_ugroup(ugroup_id)
);

INSERT INTO service(`group_id`, `label`, `description`, `short_name`, `link`, `is_active`, `is_used`, `scope`, `rank`)
SELECT DISTINCT service.group_id,'label','','plugin_mediawiki_standalone',NULL,1,0,'system',161
FROM service
WHERE short_name != 'plugin_mediawiki_standalone';
