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

use Cardwall_Semantic_CardFields;
use PFUser;
use Tracker_Artifact;
use Tracker_FormElement_Field_List_BindValue;
use Tuleap\Cardwall\BackgroundColor\BackgroundColorBuilder;
use Tuleap\Taskboard\Column\FieldValuesToColumnMapping\MappedFieldRetriever;
use Tuleap\Taskboard\Column\FieldValuesToColumnMapping\MappedFieldValueRetriever;
use Tuleap\Tracker\FormElement\Field\ListFields\Bind\BindDecoratorRetriever;
use Tuleap\User\REST\UserRepresentation;

class CardRepresentationBuilder
{
    /**
     * @var BackgroundColorBuilder
     */
    private $background_color_builder;
    /**
     * @var MappedFieldValueRetriever
     */
    private $mapped_field_value_retriever;

    public function __construct(
        BackgroundColorBuilder $background_color_builder,
        MappedFieldValueRetriever $mapped_field_value_retriever
    ) {
        $this->background_color_builder     = $background_color_builder;
        $this->mapped_field_value_retriever = $mapped_field_value_retriever;
    }

    public function build(
        \Planning_ArtifactMilestone $milestone,
        Tracker_Artifact $artifact,
        PFUser $user,
        int $rank
    ): CardRepresentation {
        $card_fields_semantic = Cardwall_Semantic_CardFields::load($artifact->getTracker());
        $background_color     = $this->background_color_builder->build($card_fields_semantic, $artifact, $user);
        $assignees            = $this->getAssignees($artifact, $user);
        $mapped_list_value    = $this->getMappedListValue($milestone, $artifact, $user);
        $initial_effort       = $this->getInitialEffort($artifact, $user);

        $representation = new CardRepresentation();
        $representation->build(
            $artifact,
            $background_color,
            $rank,
            $assignees,
            $mapped_list_value,
            $initial_effort
        );

        return $representation;
    }

    private function getMappedListValue(
        \Planning_ArtifactMilestone $milestone,
        Tracker_Artifact $artifact,
        PFUser $user
    ): ?MappedListValueRepresentation {
        $mapped_list_value = $this->mapped_field_value_retriever->getValueAtLastChangeset($milestone, $artifact, $user);
        if (! $mapped_list_value instanceof Tracker_FormElement_Field_List_BindValue) {
            return null;
        }

        $representation = new MappedListValueRepresentation();
        $representation->build($mapped_list_value);

        return $representation;
    }

    /**
     * @return UserRepresentation[]
     */
    private function getAssignees(Tracker_Artifact $artifact, PFUser $user): array
    {
        $assignees = $artifact->getAssignedTo($user);

        return array_map(
            function (PFUser $user): UserRepresentation {
                return (new UserRepresentation())->build($user);
            },
            $assignees
        );
    }

    private function getInitialEffort(Tracker_Artifact $artifact, PFUser $user)
    {
        $initial_effort_field = \AgileDashBoard_Semantic_InitialEffort::load($artifact->getTracker())->getField();

        if (! $initial_effort_field) {
            return null;
        }

        $last_changeset_value = $initial_effort_field->getLastChangesetValue($artifact);

        if (! $last_changeset_value) {
            return null;
        }

        if ($last_changeset_value instanceof \Tracker_Artifact_ChangesetValue_List) {
            return $this->getListFieldFirstValue($user, $last_changeset_value);
        }

        return $last_changeset_value->getValue();
    }

    private function getListFieldFirstValue(PFUser $user, \Tracker_Artifact_ChangesetValue_List $value_list)
    {
        $list_values = $value_list->getListValues();

        if (count($list_values) === 0) {
            return null;
        }

        return reset($list_values)->getLabel();
    }

    public static function buildSelf(): self
    {
        return new CardRepresentationBuilder(
            new BackgroundColorBuilder(new BindDecoratorRetriever()),
            new MappedFieldValueRetriever(
                new \Cardwall_OnTop_ConfigFactory(
                    \TrackerFactory::instance(),
                    \Tracker_FormElementFactory::instance()
                ),
                new MappedFieldRetriever(new \Cardwall_FieldProviders_SemanticStatusFieldRetriever()),
            )
        );
    }
}
