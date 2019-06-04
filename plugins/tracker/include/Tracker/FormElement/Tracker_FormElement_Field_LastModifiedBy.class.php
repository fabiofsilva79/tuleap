<?php
/**
 * Copyright (c) Enalean, 2015-2018. All Rights Reserved.
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

class Tracker_FormElement_Field_LastModifiedBy extends Tracker_FormElement_Field_List implements Tracker_FormElement_Field_ReadOnly {

    public $default_properties = array();

    /**
     * Dynamic value does not really get deleted
     */
    public function delete() {
        return true;
    }

    public function getCriteriaFrom($criteria) {
        return '';
    }

    public function afterCreate(array $form_element_data, $tracker_is_empty) {
        $form_element_data['bind-type'] = 'users';
        $form_element_data['bind'] = array(
            'value_function' => array(
                'artifact_modifiers',
            )
        );
        parent::afterCreate($form_element_data, $tracker_is_empty);
    }

    public function getCriteriaWhere($criteria) {
        if ($criteria_value= $this->getCriteriaValue($criteria)) {
            $a = 'A_'. $this->id;
            $b = 'B_'. $this->id;
            $ids_to_search = array_intersect(
                               array_values($criteria_value),
                               array_merge(array(100),array_keys($this->getBind()->getAllValues())));
            if (count($ids_to_search) > 1) {
                return " c.submitted_by IN(". $this->getCriteriaDao()->getDa()->escapeIntImplode($ids_to_search) .") ";
            } else if (count($ids_to_search)) {
                return " c.submitted_by = ". $this->getCriteriaDao()->getDa()->escapeInt($ids_to_search[0]) ." ";
            }
        }
        return '';
    }

    public function getQuerySelect() {
        return "c.submitted_by AS `". $this->name ."`";
    }

    public function getQueryFrom() {
        return '';
    }

    public function getQueryFromAggregate() {
        $R1 = 'R1_'. $this->id;
        $R2 = 'R2_'. $this->id;
        return " LEFT JOIN  user AS $R2 ON ($R2.user_id = c.submitted_by ) ";
    }

    public function getQueryGroupby() {
        return '';
    }

    public function getQueryOrderby() {
        return '';
    }

    public static function getFactoryLabel() {
        return $GLOBALS['Language']->getText('plugin_tracker_formelement_admin', 'lastmodifiedby_label');
    }

    public static function getFactoryDescription() {
        return $GLOBALS['Language']->getText('plugin_tracker_formelement_admin', 'lastmodifiedby_description');
    }

    public static function getFactoryIconUseIt() {
        return $GLOBALS['HTML']->getImagePath('ic/user-female.png');
    }

    public static function getFactoryIconCreate() {
        return $GLOBALS['HTML']->getImagePath('ic/user-female--plus.png');
    }

    protected function saveValue($artifact, $changeset_value_id, $value, ?Tracker_Artifact_ChangesetValue $previous_changesetvalue = null) {
        return null;
    }

    protected function keepValue($artifact, $changeset_value_id, Tracker_Artifact_ChangesetValue $previous_changesetvalue) {
        return null;
    }

    public function fetchSubmit(array $submitted_values) {
        return '';
    }

    public function fetchSubmitMasschange()
    {
        return '';
    }

    public function getFullRESTValue(PFUser $user, Tracker_Artifact_Changeset $changeset)
    {
        $last_modified_by = $changeset->getArtifact()->getLastModifiedBy();
        $value            = new Tracker_FormElement_Field_List_Bind_UsersValue($last_modified_by);
        if ($changeset->getArtifact()->wasLastModifiedByAnonymous()) {
            $submitted_by_value = $value->getFullRESTValueForAnonymous($changeset);
        } else {
            $submitted_by_value = $value->getFullRESTValue($this);
        }

        $artifact_field_value_full_representation = new Tuleap\Tracker\REST\Artifact\ArtifactFieldValueFullRepresentation();
        $artifact_field_value_full_representation->build(
            $this->getId(),
            Tracker_FormElementFactory::instance()->getType($this),
            $this->getLabel(),
            $submitted_by_value
        );

        return $artifact_field_value_full_representation;
    }

    /**
     * Fetch the html code to display the field value in artifact
     *
     * @param Tracker_Artifact                $artifact         The artifact
     * @param Tracker_Artifact_ChangesetValue $value            The actual value of the field
     * @param array                           $submitted_values The value already submitted by the user
     *
     * @return string
     */
    protected function fetchArtifactValue(
        Tracker_Artifact $artifact,
        ?Tracker_Artifact_ChangesetValue $value,
        array $submitted_values
    ) {
        return $this->fetchArtifactValueWithEditionFormIfEditable($artifact, $value, $submitted_values);
    }

    /**
     * Fetch the html code to display the field value in artifact in read only mode
     *
     * @param Tracker_Artifact                $artifact The artifact
     * @param Tracker_Artifact_ChangesetValue $value    The actual value of the field
     *
     * @return string
     */
    public function fetchArtifactValueReadOnly(Tracker_Artifact $artifact, ?Tracker_Artifact_ChangesetValue $value = null) {
        $purifier = Codendi_HTMLPurifier::instance();

        if ($artifact->wasLastModifiedByAnonymous()) {
            $label = $purifier->purify($artifact->getLastModifiedBy());
        } else {
            $value = new Tracker_FormElement_Field_List_Bind_UsersValue($artifact->getLastModifiedBy());
            $label = $purifier->purify($value->getLabel());
        }

        return $label;
    }

    public function fetchArtifactCopyMode(Tracker_Artifact $artifact, array $submitted_values)
    {
        return '';
    }

    public function fetchArtifactValueWithEditionFormIfEditable(
        Tracker_Artifact $artifact,
        ?Tracker_Artifact_ChangesetValue $value,
        array $submitted_values
    ) {
        return $this->fetchArtifactValueReadOnly($artifact, $value);
    }

     /**
     * Fetch the field value in artifact to be displayed in mail
     *
     * @param Tracker_Artifact                $artifact         The artifact
     * @param PFUser                          $user             The user who will receive the email
     * @param bool $ignore_perms
     * @param Tracker_Artifact_ChangesetValue $value            The actual value of the field
     * @param string                          $format           mail format
     *
     * @return string
     */
    public function fetchMailArtifactValue(
        Tracker_Artifact $artifact,
        PFUser $user,
        $ignore_perms,
        ?Tracker_Artifact_ChangesetValue $value = null,
        $format = 'text'
    ) {
        $value = new Tracker_FormElement_Field_List_Bind_UsersValue($artifact->getLastModifiedBy());

        switch($format) {
            case 'html':
                $output = $this->fetchArtifactValueReadOnly($artifact);
                break;
            default:
                $output = $this->getBind()->formatMailArtifactValue($value->getId());
                break;
        }
        return $output;
    }

    public function isValid(Tracker_Artifact $artifact, $value) {
        return true;
    }

    public function validateFieldWithPermissionsAndRequiredStatus(
        Tracker_Artifact $artifact,
        $submitted_value,
        ?Tracker_Artifact_ChangesetValue $last_changeset_value = null,
        $is_submission = null
    ) {
        if ($submitted_value !== null) {
            $GLOBALS['Response']->addFeedback('warning', $GLOBALS['Language']->getText('plugin_tracker_admin_import', 'field_not_taken_account', array($this->getName())));
        }

        return true;
    }

    protected function fetchAdminFormElement() {
        $purifier   = Codendi_HTMLPurifier::instance();
        $html       = '';
        $fake_value = new Tracker_FormElement_Field_List_Bind_UsersValue(UserManager::instance()->getCurrentUser()->getId());
        $html      .= $purifier->purify($fake_value->getLabel()) . '<br />';
        $html      .= '<span class="tracker-admin-form-element-help">';
        $html      .= $GLOBALS['Language']->getText('plugin_tracker_formelement_admin', 'lastmodifiedby_help');
        $html      .= '</span>';
        return $html;
    }

    /**
     * Display the field as a Changeset value.
     * Used in report table
     *
     * @param int $artifact_id the corresponding artifact id
     * @param int $changeset_id the corresponding changeset
     * @param mixed $value the value of the field
     *
     * @return string
     */
    public function fetchChangesetValue($artifact_id, $changeset_id, $value, $report=null, $from_aid = null) {
        if (! $value) {
            $artifact_factory  = Tracker_ArtifactFactory::instance();
            $builder           = new Tracker_Artifact_ChangesetFactoryBuilder();
            $changeset_factory = $builder->build();

            $changeset = $changeset_factory->getChangeset(
                $artifact_factory->getArtifactById($artifact_id),
                $changeset_id
            );

            return $changeset->getEmail();
        }

        return $this->getBind()->formatChangesetValue(new Tracker_FormElement_Field_List_Bind_UsersValue($value));
    }

    /**
     * @see Tracker_FormElement_Field::fetchTooltipValue()
     */
    protected function fetchTooltipValue(Tracker_Artifact $artifact, ?Tracker_Artifact_ChangesetValue $value = null) {
        return $this->fetchArtifactValueReadOnly($artifact, $value);
    }

    /**
     * @see Tracker_FormElement_Field::fetchCardValue()
     */
    public function fetchCardValue(Tracker_Artifact $artifact, ?Tracker_CardDisplayPreferences $display_preferences = null)
    {
        $value = new Tracker_FormElement_Field_List_Bind_UsersValue($artifact->getLastModifiedBy());
        return $value->fetchCard($display_preferences);
    }

    /**
     * Display the field for CSV
     * Used in CSV data export
     *
     * @param int $artifact_id the corresponding artifact id
     * @param int $changeset_id the corresponding changeset
     * @param mixed $value the value of the field
     *
     * @return string
     */
    public function fetchCSVChangesetValue($artifact_id, $changeset_id, $value, $report) {
        return $this->getBind()->formatChangesetValueForCSV(new Tracker_FormElement_Field_List_Bind_UsersValue($value));
    }

    /**
     * Say if this fields suport notifications
     *
     * @return bool
     */
    public function isNotificationsSupported() {
        return true;
    }

    /**
     * Say if we export the bind in the XML
     *
     * @return bool
     */
    public function shouldBeBindXML() {
        return false;
    }

    public function getUserManager() {
        return UserManager::instance();
    }

     /**
     * Get the field data for artifact submission
     * Check if the user name exists in the platform
     *
     * @param string the user name
     *
     * @return int the user id
     */
    public function getFieldData($value) {
        $um = $this->getUserManager();
        $u = $um->getUserByUserName($value);
        if ($u) {
            return $u->getId();
        } else {
            return null;
        }
    }

    public function isNone($value) {
        return false;
    }

    public function accept(Tracker_FormElement_FieldVisitor $visitor) {
        return $visitor->visitLastModifiedBy($this);
    }

    public function getDefaultValue() {
        return Tracker_FormElement_Field_List_Bind::NONE_VALUE;
    }

    public function getFieldDataFromRESTValue(array $value, ?Tracker_Artifact $artifact = null) {
         return null;
    }
}
