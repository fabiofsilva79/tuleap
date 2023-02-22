<?php
/*
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

namespace Tuleap\MediawikiStandalone\Permissions;

/**
 * @psalm-immutable
 */
final class UserPermissions
{
    public bool $is_bot = false;
    private function __construct(public bool $is_reader, public bool $is_writer, public bool $is_admin)
    {
    }

    public static function noAccess(): self
    {
        return new self(false, false, false);
    }

    public static function fullAccess(): self
    {
        return new self(true, true, true);
    }

    public static function writer(): self
    {
        return new self(true, true, false);
    }

    public static function reader(): self
    {
        return new self(true, false, false);
    }
}
