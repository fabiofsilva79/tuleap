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

namespace Tuleap\TestManagement\Step\Definition\Field;

use Mockery;
use Mockery\Adapter\Phpunit\MockeryPHPUnitIntegration;
use PHPUnit\Framework\TestCase;
use Tracker_Artifact_Changeset;
use Tuleap\TestManagement\Step\Step;
use Tuleap\Tracker\Artifact\Artifact;

class StepDefinitionTest extends TestCase
{
    use MockeryPHPUnitIntegration;

    public function testGetFieldDataFromRESTValueReturnsNullSinceFieldCannotBeUpdatedViaREST(): void
    {
        $field = new StepDefinition(102, 111, 101, 'step_def', 'Steps', '', true, 'S', true, false, 1);

        self::assertNull($field->getFieldDataFromRESTValue([]));
    }

    public function testHasChangesReturnsFalseIfNewValuesIsNull(): void
    {
        $field = new StepDefinition(102, 111, 101, 'step_def', 'Steps', '', true, 'S', true, false, 1);

        self::assertFalse($field->hasChanges(
            Mockery::mock(Artifact::class),
            new StepDefinitionChangesetValue(
                1,
                Mockery::mock(Tracker_Artifact_Changeset::class),
                $field,
                false,
                []
            ),
            null
        ));
    }

    public function testHasChangesReturnsTrueIfNewValuesClearTheContent(): void
    {
        $field = new StepDefinition(102, 111, 101, 'step_def', 'Steps', '', true, 'S', true, false, 1);

        self::assertTrue($field->hasChanges(
            Mockery::mock(Artifact::class),
            new StepDefinitionChangesetValue(
                1,
                Mockery::mock(Tracker_Artifact_Changeset::class),
                $field,
                true,
                [
                    new Step(
                        1,
                        'step',
                        'html',
                        '',
                        'text',
                        1
                    )
                ]
            ),
            [
                'no_steps' => true
            ]
        ));
    }

    public function testHasChangesReturnsTrueIfContentChanged(): void
    {
        $field = new StepDefinition(102, 111, 101, 'step_def', 'Steps', '', true, 'S', true, false, 1);

        self::assertTrue($field->hasChanges(
            Mockery::mock(Artifact::class),
            new StepDefinitionChangesetValue(
                1,
                Mockery::mock(Tracker_Artifact_Changeset::class),
                $field,
                true,
                [
                    new Step(
                        1,
                        'step',
                        'html',
                        '',
                        'text',
                        1
                    )
                ]
            ),
            [
                'description' => [
                    'step updated'
                ],
                'description_format' => [
                    'html'
                ],
                'expected_results' => [
                    ''
                ],
                'expected_results_format' => [
                    'text'
                ],
                'id' => [
                    1
                ]
            ]
        ));
    }

    public function testHasChangesReturnsFalseIfContentDidNotChange(): void
    {
        $field = new StepDefinition(102, 111, 101, 'step_def', 'Steps', '', true, 'S', true, false, 1);

        self::assertFalse($field->hasChanges(
            Mockery::mock(Artifact::class),
            new StepDefinitionChangesetValue(
                1,
                Mockery::mock(Tracker_Artifact_Changeset::class),
                $field,
                true,
                [
                    new Step(
                        1,
                        'step',
                        'html',
                        '',
                        'text',
                        1
                    )
                ]
            ),
            [
                'description' => [
                    'step'
                ],
                'description_format' => [
                    'html'
                ],
                'expected_results' => [
                    ''
                ],
                'expected_results_format' => [
                    'text'
                ],
                'id' => [
                    1
                ]
            ]
        ));
    }
}