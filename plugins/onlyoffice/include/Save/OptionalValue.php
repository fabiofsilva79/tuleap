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
 */

declare(strict_types=1);

namespace Tuleap\OnlyOffice\Save;

/**
 * @template Value
 */
final class OptionalValue
{
    /**
     * @psalm-param Value $value
     */
    private function __construct(
        private mixed $value,
        private bool $has_value,
    ) {
    }

    /**
     * @template T
     * @psalm-param T $value
     * @psalm-return self<T>
     */
    public static function fromValue(mixed $value): self
    {
        return new self($value, true);
    }

    /**
     * @template T
     * @psalm-param class-string<T> $type
     * @psalm-return self<T>
     */
    public static function nothing(string $type): self
    {
        /** @psalm-var self<T> $res */
        $res = new self(null, false);
        return $res;
    }

    /**
     * @psalm-param callable(Value): void $fn
     */
    public function apply(callable $fn): void
    {
        if (! $this->has_value) {
            return;
        }

        $fn($this->value);
    }

    /**
     * @template T
     * @psalm-param callable(Value): T $fn
     * @psalm-param T $default
     * @psalm-return T
     */
    public function mapOr(callable $fn, mixed $default): mixed
    {
        if (! $this->has_value) {
            return $default;
        }

        return $fn($this->value);
    }
}
