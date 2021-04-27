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
 * along with Tuleap. If not, see http://www.gnu.org/licenses/.
 */

declare(strict_types=1);

namespace Tuleap\Tracker\Artifact\Changeset\Comment\PrivateComment;

use PHPUnit\Framework\TestCase;
use Tracker;
use Tuleap\Tracker\Test\Builders\TrackerTestBuilder;

final class CachingTrackerPrivateCommentInformationRetrieverTest extends TestCase
{
    public function testRetrievesInformationFromCache(): void
    {
        $retriever = new class implements RetrieveTrackerPrivateCommentInformation
        {
            /**
             * @var int
             */
            private $nb_calls = 0;

            public function doesTrackerAllowPrivateComments(Tracker $tracker): bool
            {
                $this->nb_calls++;
                if ($this->nb_calls > 1) {
                    throw new \RuntimeException("Did not expect to retrieve information multiple times");
                }
                return true;
            }
        };

        $caching_retriever = new CachingTrackerPrivateCommentInformationRetriever($retriever);

        $tracker = TrackerTestBuilder::aTracker()->build();
        self::assertTrue($caching_retriever->doesTrackerAllowPrivateComments($tracker));
        self::assertTrue($caching_retriever->doesTrackerAllowPrivateComments($tracker));
    }
}