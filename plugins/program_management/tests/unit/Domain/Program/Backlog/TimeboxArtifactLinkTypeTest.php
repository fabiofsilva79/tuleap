<?php
/**
 * Copyright (c) Enalean, 2021 - Present. All Rights Reserved.
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

namespace Tuleap\ProgramManagement\Domain\Program\Backlog;


final class TimeboxArtifactLinkTypeTest extends \Tuleap\Test\PHPUnit\TestCase
{
    public function testHasAMirroredMilestoneArtifactLinkType(): void
    {
        $art_link_type = new TimeboxArtifactLinkType();

        self::assertEquals(TimeboxArtifactLinkType::ART_LINK_SHORT_NAME, $art_link_type->shortname);
        self::assertTrue($art_link_type->is_system);
        self::assertFalse($art_link_type->is_visible);
    }
}