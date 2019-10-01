<?php
/**
 * Copyright (c) Enalean, 2019 - Present. All Rights Reserved.
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

namespace Tuleap\Taskboard\REST\v1;

use Tracker_Artifact;
use Tuleap\Cardwall\BackgroundColor\BackgroundColor;
use Tuleap\REST\JsonCast;
use Tuleap\User\REST\UserRepresentation;

class CardRepresentation
{
    /**
     * @var int
     */
    public $id;
    /**
     * @var int
     */
    public $tracker_id;
    /**
     * @var string
     */
    public $label;
    /**
     * @var string
     */
    public $xref;
    /**
     * @var int
     */
    public $rank;
    /**
     * @var string
     */
    public $color;
    /**
     * @var string
     */
    public $background_color;
    /**
     * @var string
     */
    public $artifact_html_uri;
    /**
     * @var bool
     */
    public $has_children;
    /**
     * @var UserRepresentation[]
     */
    public $assignees;
    /**
     * @var MappedListValueRepresentation|null
     */
    public $mapped_list_value;
    /**
     * @var int|float|null
     */
    public $initial_effort;

    /**
     * @params UserRepresentation[] $assignees
     */
    public function build(
        Tracker_Artifact $artifact,
        BackgroundColor $background_color,
        int $rank,
        array $assignees,
        ?MappedListValueRepresentation $mapped_list_value,
        $initial_effort
    ): void {
        $this->id                = JsonCast::toInt($artifact->getId());
        $this->tracker_id        = JsonCast::toInt($artifact->getTrackerId());
        $this->label             = $artifact->getTitle();
        $this->xref              = $artifact->getXRef();
        $this->rank              = $rank;
        $this->color             = $artifact->getTracker()->getColor()->getName();
        $this->artifact_html_uri = $artifact->getUri();
        $this->background_color  = (string) $background_color->getBackgroundColorName();
        $this->assignees         = $assignees;
        $this->has_children      = JsonCast::toBoolean($artifact->hasChildren());
        $this->mapped_list_value = $mapped_list_value;
        $this->initial_effort    = $initial_effort;
    }
}
