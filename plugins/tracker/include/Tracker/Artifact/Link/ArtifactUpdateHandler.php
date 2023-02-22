<?php
/**
 * Copyright (c) Enalean, 2023 - present. All Rights Reserved.
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
 *  along with Tuleap. If not, see <http://www.gnu.org/licenses/>.
 */

declare(strict_types=1);

namespace Tuleap\Tracker\Artifact\Link;

use PFUser;
use Psr\EventDispatcher\EventDispatcherInterface;
use Tracker_Exception;
use Tracker_FormElement_Field_ArtifactLink;
use Tracker_NoChangeException;
use Tuleap\NeverThrow\Err;
use Tuleap\NeverThrow\Fault;
use Tuleap\NeverThrow\Ok;
use Tuleap\NeverThrow\Result;
use Tuleap\Tracker\Artifact\Artifact;
use Tuleap\Tracker\Artifact\ArtifactDoesNotExistFault;
use Tuleap\Tracker\Artifact\Changeset\Comment\CommentFormatIdentifier;
use Tuleap\Tracker\Artifact\Changeset\CreateNewChangeset;
use Tuleap\Tracker\Artifact\Changeset\NewChangeset;
use Tuleap\Tracker\Artifact\Changeset\PostCreation\PostCreationContext;
use Tuleap\Tracker\Artifact\ChangesetValue\ArtifactLink\CollectionOfReverseLinks;
use Tuleap\Tracker\Artifact\ChangesetValue\ArtifactLink\NewArtifactLinkChangesetValue;
use Tuleap\Tracker\Artifact\ChangesetValue\ChangesetValuesContainer;
use Tuleap\Tracker\Artifact\Exception\FieldValidationException;
use Tuleap\Tracker\Artifact\RetrieveViewableArtifact;
use Tuleap\Tracker\FormElement\ArtifactLinkFieldDoesNotExistFault;
use Tuleap\Tracker\FormElement\Field\ArtifactLink\RetrieveUsedArtifactLinkFields;
use Tuleap\Tracker\FormElement\Field\ArtifactLink\ValidateArtifactLinkValueEvent;
use Tuleap\Tracker\FormElement\Field\File\CreatedFileURLMapping;
use Tuleap\Tracker\REST\Artifact\Changeset\Comment\NewChangesetCommentRepresentation;

final class ArtifactUpdateHandler implements HandleUpdateArtifact
{
    public function __construct(
        private CreateNewChangeset $changeset_creator,
        private RetrieveUsedArtifactLinkFields $form_element_factory,
        private RetrieveViewableArtifact $artifact_retriever,
        private EventDispatcherInterface $event,
    ) {
    }

    /**
     * @throws FieldValidationException
     * @throws Tracker_Exception
     * @throws Tracker_NoChangeException
     */
    private function updateArtifact(
        Artifact $artifact_to_update,
        PFUser $submitter,
        ChangesetValuesContainer $changeset_values_container,
        ?NewChangesetCommentRepresentation $comment = null,
    ): void {
        $comment_body   = '';
        $comment_format = \Tracker_Artifact_Changeset_Comment::COMMONMARK_COMMENT;
        if ($comment) {
            $comment_body   = $comment->body;
            $comment_format = $comment->format;
        }

        $new_changeset = NewChangeset::fromFieldsDataArray(
            $artifact_to_update,
            $changeset_values_container->getFieldsData(),
            $comment_body,
            CommentFormatIdentifier::fromFormatString($comment_format),
            [],
            $submitter,
            (new \DateTimeImmutable())->getTimestamp(),
            new CreatedFileURLMapping()
        );
        $this->changeset_creator->create($new_changeset, PostCreationContext::withNoConfig(true));
    }

    /**
     * @throws FieldValidationException
     * @throws Tracker_Exception
     * @throws Tracker_NoChangeException
     */
    private function updateArtifactTypeLink(
        Artifact $artifact_to_update,
        PFUser $submitter,
        array $formatted_value,
        ?NewChangesetCommentRepresentation $comment = null,
    ): void {
        $comment_body   = '';
        $comment_format = \Tracker_Artifact_Changeset_Comment::COMMONMARK_COMMENT;
        if ($comment) {
            $comment_body   = $comment->body;
            $comment_format = $comment->format;
        }

        $new_changeset = NewChangeset::fromFieldsDataArray(
            $artifact_to_update,
            $formatted_value,
            $comment_body,
            CommentFormatIdentifier::fromFormatString($comment_format),
            [],
            $submitter,
            (new \DateTimeImmutable())->getTimestamp(),
            new CreatedFileURLMapping()
        );
        $this->changeset_creator->create($new_changeset, PostCreationContext::withNoConfig(true));
    }

    /**
     * @return Ok<null>|Err<Fault>
     * @throws Tracker_NoChangeException
     * @throws Tracker_Exception
     * @throws FieldValidationException
     */
    public function removeReverseLinks(
        Artifact $current_artifact,
        PFUser $submitter,
        CollectionOfReverseLinks $removed_reverse_links,
        ?NewChangesetCommentRepresentation $comment = null,
    ): Ok|Err {
        $result = Result::ok(null);
        foreach ($removed_reverse_links->links as $reverse_link) {
            $result = $this->getArtifactById($submitter, $reverse_link->getSourceArtifactId())->andThen(
                fn(Artifact $source_artifact) => $this->getArtifactLinkField($source_artifact)->map(
                    function (Tracker_FormElement_Field_ArtifactLink $artifact_link_field) use ($current_artifact, $reverse_link, $submitter, $comment, $source_artifact) {
                        $source_artifact_link_to_be_removed = $reverse_link->convertIntoForwardLinkCollection($current_artifact);

                        $new_changeset_value = NewArtifactLinkChangesetValue::fromRemovedValues(
                            $artifact_link_field->getId(),
                            $source_artifact_link_to_be_removed
                        );

                        $container           = new ChangesetValuesContainer([], $new_changeset_value);
                        $validate_link_event = $this->event->dispatch(
                            ValidateArtifactLinkValueEvent::buildFromSubmittedValues($source_artifact, $container->getFieldsData()[$artifact_link_field->getId()])
                        );
                        if ($validate_link_event->isValid() === false) {
                            return null;
                        }
                        $this->updateArtifact($source_artifact, $submitter, $container, $comment);
                        return null;
                    },
                )
            );
            if (Result::isErr($result)) {
                break;
            }
        }
        return $result;
    }

    /**
     * @return Ok<null>|Err<Fault>
     * @throws Tracker_NoChangeException
     * @throws Tracker_Exception
     * @throws FieldValidationException
     */
    public function updateTypeAndAddReverseLinks(
        Artifact $current_artifact,
        PFUser $submitter,
        CollectionOfReverseLinks $added_reverse_link,
        CollectionOfReverseLinks $updated_reverse_link_type,
        ?NewChangesetCommentRepresentation $comment = null,
    ): Ok|Err {
        $result               = Result::ok(null);
        $reverse_links_update = array_merge($added_reverse_link->links, $updated_reverse_link_type->links);
        foreach ($reverse_links_update as $reverse_link) {
            $result = $this->getArtifactById($submitter, $reverse_link->getSourceArtifactId())->andThen(
                fn(Artifact $source_artifact) => $this->getArtifactLinkField($source_artifact)->map(
                    function (Tracker_FormElement_Field_ArtifactLink $artifact_link_field) use ($current_artifact, $reverse_link, $submitter, $comment, $source_artifact) {
                        $source_artifact_link_to_be_added = $reverse_link->convertIntoForwardLinkCollection($current_artifact);

                        $new_changeset_value = NewArtifactLinkChangesetValue::fromAddedAndUpdatedTypeValues(
                            $artifact_link_field->getId(),
                            $source_artifact_link_to_be_added
                        );
                        $container           = new ChangesetValuesContainer([], $new_changeset_value);
                        $this->updateArtifact($source_artifact, $submitter, $container, $comment);
                        return null;
                    },
                )
            );
            if (Result::isErr($result)) {
                break;
            }
        }
        return $result;
    }

    /**
     * @throws FieldValidationException
     * @throws Tracker_NoChangeException
     * @throws Tracker_Exception
     */
    public function updateForwardLinks(
        Artifact $current_artifact,
        PFUser $submitter,
        ChangesetValuesContainer $changeset_values_container,
        ?NewChangesetCommentRepresentation $comment = null,
    ): void {
        $this->updateArtifact($current_artifact, $submitter, $changeset_values_container, $comment);
    }

    /**
     * @return Ok<Artifact>|Err<Fault>
     */
    private function getArtifactById(PFUser $submitter, int $artifact_id): Ok|Err
    {
        $artifact = $this->artifact_retriever->getArtifactByIdUserCanView($submitter, $artifact_id);
        if (! $artifact) {
            return Result::err(ArtifactDoesNotExistFault::build($artifact_id));
        }
        return Result::ok($artifact);
    }

    /**
     * @return Ok<Tracker_FormElement_Field_ArtifactLink>|Err<Fault>
     */
    private function getArtifactLinkField(Artifact $artifact): Ok|Err
    {
        $artlink_fields = $this->form_element_factory->getUsedArtifactLinkFields($artifact->getTracker());
        if (empty($artlink_fields)) {
            return Result::err(ArtifactLinkFieldDoesNotExistFault::build($artifact->getId()));
        }
        return Result::ok($artlink_fields[0]);
    }
}
