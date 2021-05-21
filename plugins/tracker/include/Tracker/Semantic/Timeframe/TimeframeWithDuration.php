<?php
/**
 * Copyright (c) Enalean, 2021 - present. All Rights Reserved.
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

namespace Tuleap\Tracker\Semantic\Timeframe;

use Tuleap\Tracker\REST\SemanticTimeframeWithDurationRepresentation;

class TimeframeWithDuration implements IComputeTimeframes
{
    private const NAME = 'timeframe-with-duration';

    public static function getName(): string
    {
        return self::NAME;
    }

    /**
     * @var \Tracker_FormElement_Field_Date
     */
    private $start_date_field;
    /**
     * @var \Tracker_FormElement_Field_Numeric
     */
    private $duration_field;

    public function __construct(
        \Tracker_FormElement_Field_Date $start_date_field,
        \Tracker_FormElement_Field_Numeric $duration_field
    ) {
        $this->start_date_field = $start_date_field;
        $this->duration_field   = $duration_field;
    }

    public function isFieldUsed(\Tracker_FormElement_Field $field): bool
    {
        $field_id = $field->getId();

        return $field_id === $this->start_date_field->getId() ||
            $field_id === $this->duration_field->getId();
    }

    public function getConfigDescription(): string
    {
        return \Codendi_HTMLPurifier::instance()
            ->purify(sprintf(
                dgettext('tuleap-tracker', 'Timeframe is based on start date field "%s" and duration field "%s".'),
                $this->start_date_field->getLabel(),
                $this->duration_field->getLabel()
            ));
    }

    public function isDefined(): bool
    {
        return true;
    }

    public function exportToXML(\SimpleXMLElement $root, array $xml_mapping): void
    {
        $start_date_field_id = $this->start_date_field->getId();
        $start_date_ref      = array_search($start_date_field_id, $xml_mapping);
        $duration_field_id   = $this->duration_field->getId();
        $duration_ref        = array_search($duration_field_id, $xml_mapping);

        if (! $start_date_ref || ! $duration_ref) {
            return;
        }

        $semantic = $root->addChild('semantic');
        $semantic->addAttribute('type', SemanticTimeframe::NAME);
        $semantic->addChild('start_date_field')->addAttribute('REF', $start_date_ref);
        $semantic->addChild('duration_field')->addAttribute('REF', $duration_ref);
    }

    public function exportToREST(\PFUser $user): ?IRepresentSemanticTimeframe
    {
        if (
            ! $this->start_date_field->userCanRead($user) ||
            ! $this->duration_field->userCanRead($user)
        ) {
            return null;
        }

        return new SemanticTimeframeWithDurationRepresentation(
            $this->start_date_field->getId(),
            $this->duration_field->getId()
        );
    }

    public function save(\Tracker $tracker, SemanticTimeframeDao $dao): bool
    {
        return $dao->save(
            $tracker->getId(),
            $this->start_date_field->getId(),
            $this->duration_field->getId(),
            null
        );
    }

    public function getStartDateField(): ?\Tracker_FormElement_Field_Date
    {
        return $this->start_date_field;
    }

    public function getDurationField(): \Tracker_FormElement_Field_Numeric
    {
        return $this->duration_field;
    }

    public function getEndDateField(): ?\Tracker_FormElement_Field_Date
    {
        return null;
    }
}