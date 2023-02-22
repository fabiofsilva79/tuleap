<?php
/**
 * Copyright (c) Enalean 2023 - Present. All Rights Reserved.
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

namespace Tuleap\Tracker\REST\Artifact\ChangesetValue\ArtifactLink;

use Tuleap\Tracker\FormElement\Field\ArtifactLink\Direction\ReverseLinksFeatureFlag;
use Tuleap\Tracker\REST\v1\ArtifactValuesRepresentation;

/**
 * @psalm-immutable
 */
final class ValidArtifactLinkPayloadBuilder
{
    private function __construct(private bool $payload_has_all_links_key, private bool $payload_has_links_key, private bool $payload_has_parent_key, private bool $is_all_links_supported)
    {
    }

    public static function buildPayloadAndCheckValidity(ArtifactValuesRepresentation $payload): self
    {
        $payload_has_all_links_key = is_array($payload->all_links);
        $payload_has_links_key     = is_array($payload->links);
        $payload_has_parent_key    = is_array($payload->parent);

        if ($payload_has_all_links_key && $payload_has_links_key) {
            throw new \Tracker_FormElement_InvalidFieldValueException(
                '"all_links" key and "links" key cannot be used at the same time'
            );
        }

        if ($payload_has_all_links_key && $payload_has_parent_key) {
            throw new \Tracker_FormElement_InvalidFieldValueException(
                '"all_links" key and "parent" key cannot be used at the same time'
            );
        }

        if (! $payload_has_all_links_key && (! $payload_has_parent_key && ! $payload_has_links_key)) {
            throw new \Tracker_FormElement_InvalidFieldValueException(
                '"links" and/or "parent" or "all_links" key must be defined'
            );
        }

        $is_all_links_supported = (int) \ForgeConfig::getFeatureFlag(ReverseLinksFeatureFlag::FEATURE_FLAG_KEY) === 1;

        return new self($payload_has_all_links_key, $payload_has_links_key, $payload_has_parent_key, $is_all_links_supported);
    }

    public function hasNotDefinedLinksOrParent(): bool
    {
        return ! $this->payload_has_parent_key && ! $this->payload_has_links_key;
    }

    public function isAllLinksPayload(): bool
    {
        return $this->payload_has_all_links_key && $this->is_all_links_supported;
    }
}
