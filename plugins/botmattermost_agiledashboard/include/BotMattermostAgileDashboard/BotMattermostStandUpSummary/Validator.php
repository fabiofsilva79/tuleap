<?php
/**
 * Copyright (c) Enalean, 2017 - Present. All Rights Reserved.
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

namespace Tuleap\BotMattermostAgileDashboard\BotMattermostStandUpSummary;

use CSRFSynchronizerToken;
use Exception;
use Feedback;
use HTTPRequest;
use Valid_UInt;
use Tuleap\BotMattermost\Bot\BotFactory;

class Validator
{
    private $bot_factory;

    public function __construct(BotFactory $bot_factory)
    {
        $this->bot_factory = $bot_factory;
    }

    public function isValid(CSRFSynchronizerToken $csrf, HTTPRequest $request, $action)
    {
        $csrf->check();

        if ($request->existAndNonEmpty('group_id')) {
            if ($this->validId($request->get('group_id'))) {
                return match ($action) {
                    'add'    => $this->isValidAddAction($request),
                    'edit'   => $this->isValidEditAction($request),
                    'delete' => true,
                    default  => false,
                };
            }
        }

        return false;
    }

    private function isValidAddAction(HTTPRequest $request)
    {
        if (
            $request->exist('bot_id') &&
            $request->existAndNonEmpty('send_time') &&
            $request->exist('channels')
        ) {
            return $this->validBotId($request->get('bot_id'));
        }
        $GLOBALS['Response']->addFeedback(Feedback::ERROR, dgettext('tuleap-botmattermost_agiledashboard', 'Invalid post argument(s)'));

        return false;
    }

    private function isValidEditAction(HTTPRequest $request)
    {
        if (
            $request->existAndNonEmpty('send_time') &&
            $request->exist('channels')
        ) {
            return true;
        }
        $GLOBALS['Response']->addFeedback(Feedback::ERROR, dgettext('tuleap-botmattermost_agiledashboard', 'Invalid post argument(s)'));

        return false;
    }

    private function validBotId($bot_id)
    {
        try {
            $this->bot_factory->getBotById($bot_id);
        } catch (Exception $e) {
            return false;
        }

        return $this->validId($bot_id);
    }

    private function validId($id)
    {
        $valid_int = new Valid_UInt();

        return $valid_int->validate($id);
    }
}
