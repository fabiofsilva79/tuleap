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

namespace Tuleap\ProgramManagement\Stub;

use Tuleap\ProgramManagement\Adapter\Program\Plan\ProjectIsNotAProgramException;
use Tuleap\ProgramManagement\Domain\Program\Plan\BuildProgram;
use Tuleap\ProgramManagement\Domain\Program\ProgramForManagement;
use Tuleap\ProgramManagement\Domain\Program\ProgramIdentifier;
use Tuleap\ProgramManagement\Domain\Program\ToBeCreatedProgram;

class BuildProgramStub implements BuildProgram
{
    /** @var bool */
    private $is_allowed;
    /**
     * @var bool
     */
    private $is_existing_program;

    private function __construct(bool $is_allowed = true, bool $is_existing_program = false)
    {
        $this->is_allowed          = $is_allowed;
        $this->is_existing_program = $is_existing_program;
    }

    public function ensureProgramIsAProject(int $program_increment_id): void
    {
        if (! $this->is_allowed) {
            throw new ProjectIsNotAProgramException(1);
        }
    }

    public static function stubValidProgram(): self
    {
        return new self(true, false);
    }

    public static function stubExistingProgram(): self
    {
        return new self(true, true);
    }


    public function buildExistingProgramProject(int $id, \PFUser $user): ProgramIdentifier
    {
        if ($this->is_existing_program) {
            return ProgramIdentifier::fromId(self::stubValidProgram(), $id);
        }

        throw new \LogicException("Not implemented");
    }

    public function buildExistingProgramProjectForManagement(int $id, \PFUser $user): ProgramForManagement
    {
        throw new \LogicException("Not implemented");
    }

    public function buildNewProgramProject(int $id, \PFUser $user): ToBeCreatedProgram
    {
        throw new \LogicException("Not implemented");
    }
}