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

namespace Tuleap\Search;

use Tuleap\Glyph\Glyph;
use Tuleap\QuickLink\SwitchToQuickLink;

/**
 * @psalm-immutable
 */
final class SearchResultEntry
{
    /**
     * @param SwitchToQuickLink[]          $quick_links
     * @param list<SearchResultEntryBadge> $badges
     */
    public function __construct(
        public ?string $xref,
        public string $link,
        public string $title,
        public string $color,
        public string $type,
        public int $per_type_id,
        public ?Glyph $small_icon,
        public ?Glyph $normal_icon,
        public string $icon_name,
        public \Project $project,
        public array $quick_links,
        public ?string $cropped_content,
        public array $badges,
    ) {
    }
}
