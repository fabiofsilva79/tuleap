<?php
/**
 * Copyright (c) Enalean, 2017-Present. All Rights Reserved.
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

namespace Tuleap\BotMattermostGit\SenderServices;

use GitRepository;
use PFUser;
use Project;
use Psr\Log\LoggerInterface;
use Tuleap\BotMattermost\Exception\BotNotFoundException;
use Tuleap\BotMattermost\SenderServices\Message;
use Tuleap\BotMattermost\SenderServices\Sender;
use Tuleap\BotMattermostGit\BotMattermostGitNotification\Factory;
use Tuleap\PullRequest\PullRequest;

class PullRequestNotificationSender
{
    private $sender;
    private $bot_git_factory;
    private $notification_builder;
    /**
     * @var LoggerInterface
     */
    private $logger;

    public function __construct(
        Sender $sender,
        Factory $bot_git_factory,
        PullRequestNotificationBuilder $notification_builder,
        LoggerInterface $logger,
    ) {
        $this->sender               = $sender;
        $this->bot_git_factory      = $bot_git_factory;
        $this->notification_builder = $notification_builder;
        $this->logger               = $logger;
    }

    public function send(
        PullRequest $pull_request,
        PFUser $user,
        Project $project,
        GitRepository $repository_destination,
    ) {
        try {
            if ($bot_assignment = $this->bot_git_factory->getBotNotification($pull_request->getRepositoryId())) {
                $message    = new Message();
                $attachment = $this->notification_builder->buildNotificationAttachment(
                    $pull_request,
                    $user,
                    $project,
                    $repository_destination
                );

                $message->addAttachment($attachment);
                $this->sender->pushNotification(
                    $bot_assignment->getBot(),
                    $message,
                    $bot_assignment->getChannels()
                );
            }
        } catch (BotNotFoundException $e) {
            $this->logger->error('', ['exception' => $e]);
        }
    }
}
