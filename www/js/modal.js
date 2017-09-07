/**
 * Copyright (c) Enalean, 2017. All rights reserved
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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Tuleap. If not, see <http://www.gnu.org/licenses/
 */

var tuleap  = tuleap || { };

tuleap.contact_support_modal_shown = function contactSupportModalShown() {
    var contact_support_modal_form            = document.getElementById('contact-support-modal-form'),
        contact_support_modal_submit          = document.getElementById('contact-support-modal-submit'),
        contact_support_modal_success_message = document.getElementById('contact-support-modal-success-message'),
        contact_support_modal_error_message   = document.getElementById('contact-support-modal-error-message');

    contact_support_modal_form.addEventListener('submit', function(event) {
        event.preventDefault();

        switchSubmitButtonToSendingState();

        jQuery.post(
            contact_support_modal_form.getAttribute('action'),
            jQuery(contact_support_modal_form).serialize()

        ).success(function(data) {
            hideErrorMessage();
            switchSubmitButtonToThankYouState();
            showSuccessMessage();

            setTimeout(function() {
                contact_support_modal_form.reset();
                switchSubmitButtonToNormalState();
                hideSuccessMessage();
            }, 5000);

        }).error(function(data) {
            switchSubmitButtonToNormalState();
            showErrorMessage();
        });
    });

    function switchSubmitButtonToSendingState() {
        contact_support_modal_submit.disabled = true;
        contact_support_modal_submit.classList.remove('thank-you');
        contact_support_modal_submit.classList.add('sending');
    }

    function switchSubmitButtonToThankYouState() {
        contact_support_modal_submit.disabled = true;
        contact_support_modal_submit.classList.remove('sending');
        contact_support_modal_submit.classList.add('thank-you');
    }

    function switchSubmitButtonToNormalState() {
        contact_support_modal_submit.disabled = false;
        contact_support_modal_submit.classList.remove('sending', 'thank-you');
    }

    function showErrorMessage() {
        contact_support_modal_error_message.classList.add('shown');
    }

    function hideErrorMessage() {
        contact_support_modal_error_message.classList.remove('shown');
    }

    function showSuccessMessage() {
        contact_support_modal_success_message.classList.add('shown');
    }

    function hideSuccessMessage() {
        contact_support_modal_success_message.classList.remove('shown');
    }
}
