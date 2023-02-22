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

namespace Tuleap\MediawikiStandalone\Service;

use Tuleap\MediawikiStandalone\Instance\CreateInstanceTask;
use Tuleap\MediawikiStandalone\Instance\SuspendInstanceTask;
use Tuleap\Queue\QueueTask;
use Tuleap\Test\Builders\ProjectTestBuilder;
use Tuleap\Test\PHPUnit\TestCase;
use Tuleap\Test\Stubs\EnqueueTaskStub;
use Tuleap\Test\Stubs\ProjectByIDFactoryStub;

final class ServiceActivationHandlerTest extends TestCase
{
    /**
     * @dataProvider getActivationData
     */
    public function testItSendsEvent(?QueueTask $expected_task, array $payload): void
    {
        $factory = ProjectByIDFactoryStub::buildWith(
            ProjectTestBuilder::aProject()->withId(112)->build(),
        );

        $enqueue_task = new EnqueueTaskStub();

        $handler = new ServiceActivationHandler($enqueue_task);
        $handler->handle(
            ServiceActivationEvent::fromServiceIsUsedEvent(
                $payload,
                $factory,
            )
        );

        self::assertEquals($expected_task, $enqueue_task->queue_task);
    }

    public static function getActivationData(): iterable
    {
        return [
            'It sends the activation is the service is mediawiki standalone' => [
                'expected_task' => new CreateInstanceTask(ProjectTestBuilder::aProject()->withId(112)->build()),
                'payload' => ['shortname' => MediawikiStandaloneService::SERVICE_SHORTNAME, 'is_used' => true, 'group_id' => '112'],
            ],
            'It sends the suspend event for mediawiki standalone' => [
                'expected_task' => new SuspendInstanceTask(ProjectTestBuilder::aProject()->withId(112)->build()),
                'payload' => ['shortname' => MediawikiStandaloneService::SERVICE_SHORTNAME, 'is_used' => false, 'group_id' => '112'],
            ],
            'It ignores events for other services' => [
                'expected_task' => null,
                'payload' => ['shortname' => 'foo', 'is_used' => true, 'group_id' => '112'],
            ],
            'It ignores events for invalid projects' => [
                'expected_task' => null,
                'payload' => ['shortname' => MediawikiStandaloneService::SERVICE_SHORTNAME, 'is_used' => true, 'group_id' => '66666'],
            ],
        ];
    }
}
